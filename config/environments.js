/*jshint laxcomma:true*/

var path = require('path')
  , rootPath = path.normalize(__dirname + '/..');

module.exports = {
  development: {
    root: rootPath,
    app: {
      name: 'Rate Talk - Development'
    }
  },
  test: {
    root: rootPath,
    app: {
      name: 'Rate Talk - Test'
    }
  },
  production: {
    root: rootPath,
    app: {
      name: 'Rate Talk - Production'
    }
  }
};
