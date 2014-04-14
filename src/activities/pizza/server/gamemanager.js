'use strict';

var _ = require('lodash');

var ListenTo = require('../../../server/listento');
var common = require('../../../server/common');
var requirejs = common.createRequireJS({
  shared: '../src/activities/pizza/shared'
});

var PizzaGameModel = requirejs('shared/game-model');

var sync = require('../../../server/sync');

module.exports = GameManager;

function GameManager(cloakRooms) {
  ListenTo.call(this, ['create', 'delete']);
  this.cloakRooms = cloakRooms;
  this.rooms = {};
  this.games = {};
  this.syncs = {};

  this._boundHandlers = {};
}

GameManager.prototype = Object.create(ListenTo.prototype);
GameManager.prototype.constructor = GameManager;

GameManager.prototype._messages = {
  'join': '_join',
  'pizza/update': '_pizza_update',
  'player/update': '_player_update'
};

GameManager.prototype._serverEvents = {
  'leaveRoom': '_leaveRoom'
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

GameManager.prototype.cloakEvents = function() {
  return this._handlers('_serverEvents');
};

GameManager.prototype.create = function(roomName, room) {
  this.rooms[roomName] = room;

  this.syncs[roomName] = sync.set({
    game: { prefix: 'game/' },
    pizzaCollection: { prefix: 'pizza-collection/' },
    playerCollection: { prefix: 'player-collection/' }
  }, {
    room: room
  });

  var game = new PizzaGameModel();
  game.sync = this.syncs[roomName].game;
  game.get('pizzas').sync = this.syncs[roomName].pizzaCollection;
  game.get('players').sync = this.syncs[roomName].playerCollection;
  this.games[roomName] = game;
};

GameManager.prototype.delete = function(roomName) {
  delete this.rooms[roomName];
  delete this.syncs[roomName];
  delete this.games[roomName];
};

GameManager.prototype._join = function(roomName, user) {
  var room = this.rooms[roomName];
  if (!room) {
    return;
  }

  room.addMember(user);

  var game = this.games[roomName];

  // Send old players to new player.
  var players = game.get('players');
  players.each(function(player) {
    user.message('player/create', player.toJSON());
  });

  // Send old pizzas.
  var pizzas = game.get('pizzas');
  pizzas.each(function(pizza) {
    user.message('pizza/create', pizza.toJSON());
  });

  user.message('game/create', game.toJSON());

  // Create new player.
  var nextId = 0;
  if (players.length > 0) {
    nextId = players.last().get('id') + 1;
  }
  var newPlayer = players.add({
    id: nextId,
    cloakId: user.id,
    station: null
  });

  user.message('player/set-local', newPlayer.get('id'));
};

GameManager.prototype._pizza_update = function(obj, user) {
  // Update the local object which will fire off a bounce to clients.
  var roomName = this.cloakRooms.getRoomName(user.getRoom().id);
  this.games[roomName].get('pizzas').get(obj.id).save(obj);
};

GameManager.prototype._player_update = function(obj, user) {
  // Update the local object which will fire off a bounce to clients.
  var roomName = this.cloakRooms.getRoomName(user.getRoom().id);
  this.games[roomName].get('players').get(obj.id).save(obj);
};

// TODO: Check that leaveRoom is the correct name.
GameManager.prototype._leaveRoom = function(user, room) {
  var roomName = this.cloakRooms.getRoomName(room.id);
  var game = this.games[roomName];
  if (!game) {
    return;
  }

  var player = game.get('players').findWhere({ cloakId: user.id });
  if (!player) {
    return;
  }

  player.destroy();
};

GameManager.prototype.cleanup = function() {
  // Delete all remaining rooms.
  _.each(_.pairs(this.games), this._delete.apply.bind(this._delete, this));
};
