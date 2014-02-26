// @file Example server command line support.

'use strict';

// Third party libs.
var argv = require('optimist').argv;
var debug = require('debug')('cee:example');

// Locally defined libs.
var common = require('../../server/common');
var createServer = require('./server/server').createServer;

createServer(argv, debug)
  .then(function(server) {
    common.atTermination(server.close.bind(server), debug);
  });
