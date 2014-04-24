'use strict';

var debug = require('debug')('activity:pizza');

var common = require('../../server/common');
var createServer = require('./server/create');

var argv = require('commander')
  .option('-p, --port', 'Port to listen to.')
  .option('-b, --hostname', 'Hostname to bind to.')
  .parse(process.argv);

createServer(argv, debug)
  .then(function(server) {
    common.atTermination(server.close.bind(server), debug);
  });
