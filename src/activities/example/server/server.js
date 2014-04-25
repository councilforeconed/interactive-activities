// @file Example multi user server.

'use strict';

// Third party libs.
var _debug = require('debug')('cee:example');
var cloak = require('cloak');
require('express-resource');
var socketio = require('../../../server/socketio.monkey');

// Locally defined libs.
var common = require('../../../server/common');
var CRUDManager = require('../../../server/crudmanager');
var DataAggregator = require('./dataaggregator');
var MemoryStore = require('../../../server/storememory');
var RoomDataCollector = require('../../../server/roomdatacollector');
var GameManager = require('../../../server/game-manager');
var ChatGame = require('./chat-game');

// In order to consume AMD modules, server scripts should use a `requirejs`
// function created by `common.createRequireJS`. This can be configured with an
// AMD-compliant `paths` hash if the activity has any commonly-used scripts or
// directories.
var requirejs = common.createRequireJS({
  shared: __dirname + '/../shared'
});
var sharedObject = requirejs('shared/object');
sharedObject.random();

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

  var app = common.createExpressServer(options);
  var server = app.listen(options.port || 0);

  // Setup room and group managers that will mirror the contents set by the
  // top server.
  common.createListeningCRUDManager('room');
  var groupManager = common.createListeningCRUDManager('group');

  var dataCollector = new RoomDataCollector(new CRUDManager({
    name: 'data',
    store : new MemoryStore()
  }));

  // Serve reports from /report/:room/(download|email)
  common.addReportResource({
    app: app,
    DataAggregator: DataAggregator,
    dataCollector: dataCollector,
    debug: debug,
    templatePath:
      __dirname + '/../../../client/components/reportjson/index.jade'
  });

  var gameManager = new GameManager({
    dataCollector: dataCollector,
    groupManager: groupManager,
    GameCtor: ChatGame
  });

  // Configure cloak. We'll start it later after server binds to a port.
  cloak.configure({
    express: server,

    room: gameManager.cloakRoomMsgHandlers(),
    messages: gameManager.cloakMsgsMsgHandlers()
  });

  return common.whenListening(server, debug)
    .then(function(server) {
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
