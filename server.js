/*jshint laxcomma:true*/

var http = require('http')
  , express = require('express')
  , fs = require('fs')
  , port = process.env.PORT || 5000
  , ratingServer = require('./config/rating-server')
  , env = process.env.NODE_ENV || 'development'
  , config = require('./config/environments')[env];

var app = express();

// express settings
require('./config/express')(app, config);

// Express server
var server = http.createServer(app).listen(port);
ratingServer.listen(server);
console.log('Express app started on port '+port);

app.get('/', function(req, res) {
  res.render('ratings');
});
