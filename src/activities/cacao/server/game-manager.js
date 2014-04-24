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
    report: report
  });
};

GameManager.prototype.delete = function(groupName) {
  cloak.getRoom(groupName).delete();
  delete this.roomIdToName[this.roomNameToId[groupName]];
  delete this.roomNameToId[groupName];
  delete this.games[groupName];
};

GameManager.prototype._bindHandlers = function(names) {
  var handlers = {};

  // Set the handlers' context as the GameManager instance. Since Cloak
  // transmits some information via callback context, unshift the callback's
  // context as the first argument to the handler.
  names.forEach(function(name) {
    var methodName = 'on' + name[0].toUpperCase() + name.slice(1);
    var method = this[methodName];
    var self = this;

    handlers[name] = function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(this);
      return method.apply(self, args);
    };
  }, this);

  return handlers;
};

GameManager.prototype.cloakRoomMsgHandlers = function() {
  return this._bindHandlers(['memberLeaves']);
};

GameManager.prototype.cloakMsgsMsgHandlers = function() {
  return this._bindHandlers(['trade', 'joinRoom']);
};

GameManager.prototype.onJoinRoom = function(X, roomName, user) {
  var room = cloak.getRoom(this.roomNameToId[roomName]);
  var game = this.games[roomName];

  if (!room || !game) {
    return;
  }

  game.join(user);
  room.addMember(user);
};

GameManager.prototype.onMemberLeaves = function(room, user) {
  // At this time, the user is in a room and has a corresponding `room`
  // attribute, but the room is the Cloak lobby and therefore does not exist in
  // the `cloakRooms` data structure.
  var roomName = room.name;
  var game = this.games[roomName];

  if (!game) {
    return;
  }

  game.leave(user);
};

GameManager.prototype.onTrade = function(X, txn, user) {
  var roomName = user.getRoom().name;
  var game = this.games[roomName];

  game.trade(txn, user);
};
