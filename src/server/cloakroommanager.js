'use strict';

var _ = require('lodash');
var cloak = require('cloak');

var ListenTo = require('./listento');

module.exports = CloakRoomManager;

function CloakRoomManager() {
  ListenTo.call(this, this._listeningNames);

  this.roomNameToId = {};
  this.roomIdToName = {};
}

CloakRoomManager.prototype = Object.create(ListenTo.prototype);
CloakRoomManager.prototype.constructor = CloakRoomManager;

CloakRoomManager.prototype._listeningNames = [
  'create',
  'delete'
];

CloakRoomManager.prototype.getRoomId = function(roomName) {
  return this.roomNameToId[roomName];
};

CloakRoomManager.prototype.getRoomName = function(roomId) {
  return this.roomIdToName[roomId];
};

// @returns {cloak.Room}
CloakRoomManager.prototype.byId = function(roomId) {
  return cloak.getRoom(roomId);
};

// @returns {cloak.Room}
CloakRoomManager.prototype.byName = function(roomName) {
  return cloak.getRoom(this.roomNameToId[roomName]);
};

CloakRoomManager.prototype.create = function(name) {
  var room = cloak.createRoom(name);
  this.roomNameToId[name] = room.id;
  this.roomIdToName[room.id] = name;
  this.emit('create', name, room);
};

CloakRoomManager.prototype.delete = function(name) {
  cloak.getRoom(this.roomNameToId[name]).delete();
  delete this.roomIdToName[this.roomNameToId[name]];
  delete this.roomNameToId[name];
  this.emit('delete', name);
};

CloakRoomManager.prototype.cleanup = function() {
  // Delete all remaining rooms.
  _.each(this.roomIdToName, this.delete, this);
};
