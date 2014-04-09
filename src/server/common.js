// @file common server code

'use strict';

var express = require('express');
var _ = require('lodash');
var _debug = require('debug')('cee:common');
var when = require('when');
var whenParallel = require('when/parallel');
var whenTimeout = require('when/timeout');

var CRUDManager = require('./crudmanager');
var CRUDReplicator = require('./crudreplicator');
var MemoryStore = require('./storememory');

// List of function handles to execute in parallel when a TERMINATE-like signal
// is received.
var _atTermination = [];

// Attach handler to TERMINATE-like signals once.
var attachSigInt = _.once(function(debug) {
  var atexit = _.once(function() {
    debug('exiting ...');
    // Execute handles in parallel. Reject in 5 seconds.
    whenTimeout(whenParallel(_atTermination), 5000)
      // Exit once all termination handles have resolved their promises.
      .then(process.exit.bind(process, 0), process.exit.bind(process, 1));
  });

  process.on('SIGHUP', atexit);
  process.on('SIGINT', atexit);
  process.on('SIGTERM', atexit);
});

// Add a termination handle.
module.exports.atTermination = function(fn, debug) {
  _atTermination.push(fn);
  attachSigInt(debug);
};

/**
 * Create an express.js application that will serve files for an activity.
 *
 * @returns {Object} HTTP application object as created by
 *          [express](http://expressjs.com/)
 */
module.exports.createExpressServer = function() {
  var app = express();

  app.get('/', function(req, res) {
    res.send('hello');
  });

  app.use('/client', express.static('client'));
  app.use('/shared', express.static('shared'));
  app.get('/config.json', function(req, res) {
    res.sendfile('./config.json');
  });

  app.get('/status', function(req, res) {
    res.send(200, 'ok');
  });

  return app;
};

// Return a promise that resolves when the server begins listening or rejects
// if it errors before that.
//
// @param server Server object to attach listening handler to
// @param debug debug module instance for more straight forward debug messages
// @returns {Promise} Promise that resolves when server is listening
module.exports.whenListening = function(server, debug) {
  debug = debug || _debug;
  return when.promise(function(resolve, reject) {
    server.on('listening', function() {
      debug('listening on %d', server.address().port);

      // Child processes will implement `process.send` and should use it to
      // inform their parent that they are ready and what port they are
      // listening on.
      if (process.send) {
        process.send({ name: 'listening-on', port: server.address().port });
      }

      resolve(server);
    });

    server.on('error', function(e) {
      reject(e);
    });
  });
};

/**
 * Create a RequireJS function that can load application JavaScript files,
 * respecting current path/shim/packages configuration.
 *
 * @argument {Object} [paths] AMD `paths` configuration for any
 *           activity-specific code.
 *
 * @returns {Function} Implements the AMD `define` signature.
 */
module.exports.createRequireJS = function(paths) {
  var requirejs = require('requirejs');
  var vm = require('vm');
  var fs = require('fs');

  // Stub out the application `main` file (which the application configuration
  // lists as a dependency)
  requirejs.define('scripts/main', function() {});
  // Stub out jQuery (which Backbone.js lists as a hard dependency in
  // AMD-enabled contexts)
  requirejs.define('jquery', function() {});

  // Configure the RequireJS function to resolve module names according to the
  // settings in the browser.
  vm.runInNewContext(
    String(fs.readFileSync(__dirname + '/../client/scripts/amd-config.js')),
    {
      require: requirejs
    }
  );

  // Override browser configuration with server-specific details
  requirejs.config({
    baseUrl: __dirname + '/../../bower_components',
    paths: paths
  });

  return requirejs;
};

module.exports.createListeningCRUDManager = function(name) {
  var manager = new CRUDManager({
    name: name,
    store: new MemoryStore()
  });
  manager.listenTo(new CRUDReplicator.EndPoint({
    emitter: process,
    type: name
  }));
  return manager;
};
