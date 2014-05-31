var socket = function(namespace) {
  // Store events list
  this._events    = {};
  // The base url
  this._url       = "//"+window.location.hostname;
  // The base port (if there is)
  this._port      = window.location.port;
  // Store the SockJS instance
  this._socket    = null;
  // Store the namespace
  this._namespace = namespace || "";
  // Should reconnect or not
  this.reconnect = true;
};

socket.prototype.on = function(name, func, scope) {
  var fn = func;
  if (scope) {
    fn = function() { func.apply(scope, arguments); };
  }
  if (!this._events[name]) {
    this._events[name] = [];
  }
  this._events[name].push(func);
};

socket.prototype.emit = function(name, data) {
  this._socket.send(
    JSON.stringify({
      name: name,
      data: data
    })
  );
};

/**
 * Connect to server
*/
socket.prototype.connect = function() {
  // Disconnect previous instance
  if(this._socket) {
    // Get auto-reconnect and re-setup
    var p = this.reconnect;
    this.disconnect();
    this.reconnect = p;
  }

  // Start new instance
  var base = (this._port != 80) ? this._url + ":" + this._port : this._url;
  var sckt = new SockJS("/" + this._namespace);

  var _this = this;

  /**
   * Parse event from server side, and dispatch it
   *
   * @param response {Object} The data from server side
  */
  function _catchEvent(response) {
    response = (typeof(response.data) === "object") ? response : JSON.parse(response.data);
    var name = response.name,
        data = response.data;
    var events = _this._events[name];
    if(events) {
      var parsed = (typeof(data) === "object" && data !== null) ? data : JSON.parse(data);
      for(var i=0, l=events.length; i<l; ++i) {
        var fct = events[i];
        if(typeof(fct) === "function") {
          // Defer call on setTimeout
          (function(f) {
            setTimeout(function() {f(parsed);}, 0);
          })(fct);
        }
      }
    }
  }

  // Catch open
  sckt.onopen = function() {
    _catchEvent({
      name: "open",
      data : {}
    });
    _catchEvent({
      name: "connect",
      data: {}
    });
  };

  sckt.onmessage = function(data) {
    _catchEvent(data);
  };

  // Catch close, and reconnect
  sckt.onclose = function() {
    _catchEvent({
      name: "close",
      data : {}
    });
    _catchEvent({
      name: "disconnect",
      data: {}
    });
    if(_this.reconnect) {
      _this.connect();
    }
  };

  // Link to server
  this._socket = sckt;
};

/**
 * Disconnect from server
*/
socket.prototype.disconnect = function() {
  this.reconnect = false;

  if(!this._socket) {
    return;
  }

  this._socket.close();
  this._socket = null;
};
