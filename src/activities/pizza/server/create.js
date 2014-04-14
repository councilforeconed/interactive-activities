'use strict';

// Third party libs.
var cloak = require('cloak');
var socketio = require('../../../server/socketio.monkey');

var common = require('../../../server/common');

var CloakRoomManager = require('../../../server/cloakroommanager');
var GameManager = require('./gamemanager');

/**
 * Create an express server
 *
 * @param {Object} options
 *    - port port to listen to. Defaults to 0.
 *    - hostname hostname to bind to. Defaults to 0.0.0.0.
 *
 * @returns {Promise} Promise that resolves with the value of the server
 *                    process when it is listening.
 */
module.exports = function(options, debug) {
  options = options || {};

  var app = common.createExpressServer(options);
  var server = app.listen(options.port || 0);

  // Setup room and group managers that will mirror the contents set by the
  // top server.
  common.createListeningCRUDManager('room');
  var groupManager = common.createListeningCRUDManager('group');

  // Manage cloak rooms based off of group management instructed by
  // top server.
  var cloakRoomManager = new CloakRoomManager();
  cloakRoomManager.listenTo(groupManager);

  var gameManager = new GameManager();
  gameManager.listenTo(cloakRoomManager);

  // Configure cloak. We'll start it later after server binds to a port.
  cloak.configure({
    express: server,

    messages: gameManager.cloakMessages(),
    serverEvents: gameManager.cloakEvents()
  });

  return common.whenListening(server, debug)
    .then(function(server) {
      // TODO: Worthy of common functionality.
      // With a monkey patch, get some socket.io options to listen.
      socketio.listen.options = {
        // In production, silence all socket.io debug messages.
        'log-level': process.env.NODE_ENV === 'production' ? -1 : 5,
      };
      // Start cloak.
      cloak.run();

      return server;
    });
};
