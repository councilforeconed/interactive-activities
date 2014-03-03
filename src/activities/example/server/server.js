// @file Example server. This demonstrates how to create a sub server that can
//    handle normal http traffic and websockets with socket.io. `process.send`
//    and `process.on('message')` are used to communicate with the parent node
//    process, such as telling the parent the port it is listening on.

'use strict';

// Third party libs.
var _debug = require('debug')('cee:example');
var express = require('express');
var socketio = require('socket.io');

// Locally defined libs.
var common = require('../../../server/common');

// Create an express server.
// @param {object} options
//    - port port to listen to. Defaults to 0.
//    - hostname hostname to bind to. Defaults to 0.0.0.0.
// @param debug debug module instance to use
// @returns {Promise} Promise that resolves to the created server.
module.exports.createServer = function(options, debug) {
  options = options || {};
  // debug instances iterate the color value even if they share the name of
  // another instance, so passing an instance around is the only way to
  // maintain that color value.
  debug = debug || _debug;

  var app = express();

  app.get('/', function(req, res, next) {
    res.send('hello');
  });

  app.get('/status', function(req, res, next) {
    res.send(200, 'ok');
  });

  var server = app.listen(options.port || 0);
  server.on('listening', function() {
    // Let the parent know what port we are listening on.
    process.send({name: 'listening-on', port: server.address().port});
  });

  // Start the socketio websocket listener.
  var io = socketio.listen(server, {
    // In production, silence all socket.io debug messages.
    'log level': process.env.NODE_ENV === 'production' ? -1 : 5
  });

  io.sockets.on('connection', function(socket) {
    socket.emit('good bye');
    socket.disconnect();
  });

  // Let the parent know we are ok.
  process.send('ok');

  return common.whenListening(server, debug);
};
