/**
 * Module dependencies.
 */

var express = require('express');

module.exports = function (app, config) {

  app.set('showStackError', true);

  app.use(express.static(config.root + '/build'));

  // set views path, template engine and default layout
  app.set('views', config.root + '/app/views');
  app.set('view engine', 'jade');

};
