// @file Example server command line support.

'use strict';

// Third party libs.
var debug = require('debug')('cee:example');

// Locally defined libs.
var common = require('../../server/common');
var createServer = require('./server/server').createServer;

var argv = require('commander')
  .option('-p, --port', 'Port to listen to.')
  .option('-b, --hostname', 'Hostname to bind to.')
  .parse(process.argv);

createServer(argv, debug)
  .then(function(server) {
    common.atTermination(server.close.bind(server), debug);
  });
