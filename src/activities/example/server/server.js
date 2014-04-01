// @file Example multi user server.

'use strict';

// Third party libs.
var _debug = require('debug')('cee:example');
var cloak = require('cloak');
var socketio = require('../../../server/socketio.monkey');

// Locally defined libs.
var common = require('../../../server/common');
var CRUDManager = require('../../../server/crudmanager');
var CRUDReplicator = require('../../../server/crudreplicator');
var MemoryStore = require('../../../server/storememory');

// The `shared/` directory is available for scripts that should be available on
// both the client and the server. In order to consume AMD modules, server
// scripts should use AMDefine's "intercept" module.
// https://github.com/jrburke/amdefine
require('amdefine/intercept');
var sharedObject = require('../shared/object');
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
  var roomManager = new CRUDManager({ name: 'room', store: new MemoryStore() });
  var groupManager = new CRUDManager({
    name: 'group',
    store: new MemoryStore()
  });
  roomManager.listenTo(new CRUDReplicator.EndPoint({
    emitter: process,
    type: 'room'
  }));
  groupManager.listenTo(new CRUDReplicator.EndPoint({
    emitter: process,
    type: 'group'
  }));

  var roomNameToId = {};

  // Configure cloak. We'll start it later after server binds to a port.
  cloak.configure({
    express: server,

    messages: {
      'join-room': function(roomName, user) {
        var room = cloak.getRoom(roomNameToId[roomName]);
        if (room) {
          room.addMember(user);
        }
      },

      'chat': function(obj, user) {
        user.getRoom().messageMembers('chat', obj);
      }
    }
  });

  // Manage cloak rooms based off of group management instructed by
  // top server.
  groupManager.on('create', function(name) {
    var room = cloak.createRoom(name);
    roomNameToId[name] = room.id;
  });
  groupManager.on('delete', function(name) {
    cloak.getRoom(name).delete();
    delete roomNameToId[name];
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
