/*jshint laxcomma:true*/

var sockjs = require('sockjs')
    , redis = require('heroku-redis-client'); // Redis pubsub using heroku wrapper

exports.listen = function(server) {
  var publisher = redis.createClient();

  // initial cache
  publisher.set('dataCache', JSON.stringify([]));

  // Sockjs server
  var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};
  var sockjs_chat = sockjs.createServer(sockjs_opts);
  sockjs_chat.installHandlers(server, { prefix:'/ratings' });

  sockjs_chat.on('connection', function(socket) {
    var browser = redis.createClient();
    browser.subscribe('rating');
    browser.user = 'user-' + parseInt(Math.random() * 10000);

    initializeConnection(socket, publisher);
    handleMessageBroadcast(browser, socket);
    handleMessageReceipt(socket, publisher, browser);
  });
};

function initializeConnection(socket, publisher) {
  // send initialize payload with any cached ratings
  publisher.get('dataCache', function(error, buffer) {
    var cache = JSON.parse(buffer);

    var message = {
      name: 'load',
      data: cache
    };

    socket.write(JSON.stringify(message));
  });
}

function handleMessageBroadcast(browser, socket) {
  // When we see a message in the channel, send it to the browser
  browser.on("message", function(channel, message){
    var data = JSON.parse(message);

    socket.write(JSON.stringify(data));
  });
}

function handleMessageReceipt(socket, publisher, browser) {
  socket.on('data', function(message) {
    var data = JSON.parse(message);

    data.data.date = new Date();
    data.data.user = browser.user; // send with user

    // push new messages to the publisher metadata as well
    cacheInBuffer(publisher, data.data);

    console.log(data);
    // finally publish on the 'rating' channel
    publisher.publish('rating', JSON.stringify(data));
  });
}

function cacheInBuffer(publisher, data) {
  // send initialize payload with any cached ratings
  publisher.get('dataCache', function(error, buffer) {
    if (error) return;

    var cache = JSON.parse(buffer);

    cache.push(data);

    // push new data onto cachedRatings
    publisher.set('dataCache', JSON.stringify(cache));
  });
}
