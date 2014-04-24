'use strict';

var _ = require('lodash');
var cloak = require('cloak');

var ListenTo = require('./listento');

module.exports = CloakRoomManager;

function CloakRoomManager() {
  ListenTo.call(this, ['create', 'delete']);

  this.roomNameToId = {};
  this.roomIdToName = {};
  this.userIdToRoomId = {};
  this.roomIdToUserId = {};
}

CloakRoomManager.prototype = Object.create(ListenTo.prototype);
CloakRoomManager.prototype.constructor = CloakRoomManager;

CloakRoomManager.prototype.addUser = function(user) {
  if (!user.room) {
    throw new Error('User ' + user.id + ' is not a member of any room');
  }
  if (user.room.isLobby) {
    throw new Error(
      'Cannot add user ' + user.id +
      ' to a room: user is currently in the lobby.'
    );
  }

  this.userIdToRoomId[user.id] = user.room.id;
  this.roomIdToUserId[user.room.id] = user.id;
};

CloakRoomManager.prototype.removeUser = function(user) {
  var roomId = this.userIdToRoomId[user.id];
  delete this.userIdToRoomId[user.id];
  delete this.roomIdToUserId[roomId];
};

CloakRoomManager.prototype.getName = function(criteria) {
  var roomId;

  if (criteria.user) {
    roomId = this.userIdToRoomId[criteria.user.id];
  } else if (criteria.room) {
    roomId = criteria.room.id;
  }

  return this.roomIdToName[roomId];
};

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
