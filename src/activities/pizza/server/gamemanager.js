'use strict';

var _ = require('lodash');

var ListenTo = require('../../../server/listento');
var common = require('../../../server/common');
var requirejs = common.createRequireJS({
  shared: '../src/activities/pizza/shared'
});

var GameModel = require('./game-model');

requirejs('backbone').sync = require('../../../server/sync');

module.exports = GameManager;

function GameManager(cloakRooms) {
  ListenTo.call(this, ['create', 'delete']);
  this.cloakRooms = cloakRooms;
  this.rooms = {};
  this.games = {};

  this._boundHandlers = {};
}

GameManager.prototype = Object.create(ListenTo.prototype);
GameManager.prototype.constructor = GameManager;

GameManager.prototype._messages = {
  'join': '_join',
  'pizza/update': '_pizza_update',
  'player/update': '_player_update'
};

GameManager.prototype._roomEvents = {
  'newMember': '_new_member',
  'memberLeaves': '_member_leaves'
};

GameManager.prototype._createMessages = function() {};

GameManager.prototype._handlers = function(namesKey) {
  namesKey = namesKey || '_crud';

  if (!this._boundHandlers[namesKey]) {
    this._boundHandlers[namesKey] = ListenTo.bindNames(this, this[namesKey]);
  }
  return this._boundHandlers[namesKey];
};

GameManager.prototype.cloakMessages = function() {
  return this._handlers('_messages');
};

GameManager.prototype.roomEvents = function() {
  return this._handlers('_roomEvents');
};

GameManager.prototype.create = function(roomName, room) {
  this.rooms[roomName] = room;

  var game = new GameModel();
  var pizzas = game.get('pizzas');
  var players = game.get('players');

  game.room = pizzas.room = players.room = room;
  game.prefix = 'game';
  pizzas.prefix = 'pizza';
  players.prefix = 'player';

  this.games[roomName] = game;
};

GameManager.prototype.delete = function(roomName) {
  delete this.rooms[roomName];
  delete this.games[roomName];
};

GameManager.prototype._join = function(roomName, user) {
  var room = this.rooms[roomName];

  if (!room) {
    return;
  }

  room.addMember(user);

  var game = this.games[roomName];
  var players = game.get('players');

  user.message('game/update', game.toJSON());

  // Create new player.
  var nextId = 1;
  if (players.length > 0) {
    nextId = players.last().get('id') + 1;
  }
  var newPlayer = players.create({
    id: nextId,
    cloakId: user.id,
    station: null
  });

  user.message('player/set-local', newPlayer.get('id'));
};

GameManager.prototype._pizza_update = function(obj, user) {
  // Update the local object which will fire off a bounce to clients.
  var roomName = this.cloakRooms.getRoomName(user.getRoom().id);
  var pizza = this.games[roomName].get('pizzas').get(obj.id);

  if (pizza.parse) {
    obj = pizza.parse(obj);
  }

  pizza.save(obj);
};

GameManager.prototype._player_update = function(obj, user) {
  // Update the local object which will fire off a bounce to clients.
  var roomName = this.cloakRooms.getRoomName(user.getRoom().id);
  var player = this.games[roomName].get('players').get(obj.id);

  if (player.parse) {
    obj = player.parse(obj);
  }

  player.save(obj);
};

GameManager.prototype._new_member = function(user) {
  this.cloakRooms.addUser(user);
};

GameManager.prototype._member_leaves = function(user) {
  // At this time, the user is in a room and has a corresponding `room`
  // attribute, but the room is the Cloak lobby and therefore does not exist in
  // the `cloakRooms` data structure.
  var roomName = this.cloakRooms.getName({ user: user });
  var game = this.games[roomName];

  var player = game.get('players').findWhere({ cloakId: user.id });
  if (!game) {
    return;
  }

  if (!player) {
    return;
  }

  player.destroy();
  this.cloakRooms.removeUser(user);
};

GameManager.prototype.cleanup = function() {
  // Delete all remaining rooms.
  _.each(_.pairs(this.games), this._delete.apply.bind(this._delete, this));
};
