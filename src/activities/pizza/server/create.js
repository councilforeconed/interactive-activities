'use strict';

// Third party libs.
var cloak = require('cloak');
var socketio = require('../../../server/socketio.monkey');
require('express-resource');

var common = require('../../../server/common');

var CRUDManager = require('../../../server/crudmanager');
var DataAggregator = require('./dataaggregator');
var MemoryStore = require('../../../server/storememory');
var RoomDataCollector = require('../../../server/roomdatacollector');
var GameManager = require('../../../server/game-manager');
var PizzaGame = require('./pizza-game');

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

  var dataCollector = new RoomDataCollector(new CRUDManager({
    name: 'data',
    store: new MemoryStore()
  }));

  var gameManager = new GameManager({
    dataCollector: dataCollector,
    groupManager: groupManager,
    GameCtor: PizzaGame
  });

  // Serve reports from /report/:room/(download|email)
  common.addReportResource({
    app: app,
    DataAggregator: DataAggregator,
    dataCollector: dataCollector,
    debug: debug,
    templatePath:
      __dirname + '/../../../client/components/reporthistogram/index.jade'
  });

  // Configure cloak. We'll start it later after server binds to a port.
  cloak.configure({
    express: server,
    room: gameManager.cloakRoomMsgHandlers(),
    messages: gameManager.cloakMsgsMsgHandlers()
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
