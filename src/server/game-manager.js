'use strict';

var cloak = require('cloak');

module.exports = GameManager;

function GameManager(options) {
  this.groupManager = options.groupManager;
  this.dataCollector = options.dataCollector;
  this.GameCtor = options.GameCtor;

  this.roomNameToId = {};
  this.roomIdToName = {};

  this.groupManager.on('create', this.create.bind(this));
  this.groupManager.on('delete', this.delete.bind(this));

  this.games = {};
}

GameManager.prototype.create = function(groupName, groupData) {
  var cloakRoom = cloak.createRoom(groupName);
  var dataCollector = this.dataCollector;
  this.roomNameToId[groupName] = cloakRoom.id;
  this.roomIdToName[cloakRoom.id] = groupName;

  // Define a custom reporting function for the new game instance.
  var report = function(gameData) {
    dataCollector.add(groupData.room, {
      groupName: groupName,
      gameData: gameData
    });
  };

  this.games[groupName] = new this.GameCtor({
    report: report,
    cloakRoom: cloakRoom
  });
};

GameManager.prototype.delete = function(groupName) {
  cloak.getRoom(groupName).delete();
  delete this.roomIdToName[this.roomNameToId[groupName]];
  delete this.roomNameToId[groupName];
  delete this.games[groupName];
};

GameManager.prototype.cloakRoomMsgHandlers = function() {
  var gameManager = this;

  return {
    // Cloak specifies the Cloak room via the context of these handlers, so
    // binding the handlers to the `GameManager` instance would prevent access
    // to necessary information. Intead, define handlers via functions that
    // close around a reference to the `GameManager` instance.
    memberLeaves: function(user) {
      var roomName = this.name;
      var game = gameManager.games[roomName];

      if (!game) {
        return;
      }

      game.leave(user);
    }
  };
};

GameManager.prototype.cloakMsgsMsgHandlers = function() {
  var cloakHandlers = {
    joinRoom: this.onJoinRoom.bind(this)
  };

  Object.keys(this.GameCtor.messageHandlers).forEach(function(topic) {
    var methodName = this.GameCtor.messageHandlers[topic];

    cloakHandlers[topic] = function(data, user) {
      var roomName = user.getRoom().name;
      var game = this.games[roomName];

      game[methodName](data, user);
    }.bind(this);
  }, this);

  return cloakHandlers;
};

GameManager.prototype.onJoinRoom = function(roomName, user) {
  var room = cloak.getRoom(this.roomNameToId[roomName]);
  var game = this.games[roomName];

  if (!room || !game) {
    return;
  }

  game.join(user);
  room.addMember(user);
};
