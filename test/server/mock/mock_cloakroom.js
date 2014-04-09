'use strict';

var EventEmitter = require('events').EventEmitter;

var _ = require('lodash');
var sinon = require('sinon');

var cloak = require('cloak');

module.exports.useFakeCloak = function() {
  var room = {
    id: 'always-the-same',
    delete: sinon.stub(),
    messageMembers: function(name, msg) {
      clientEmitter.emit(name, msg);
    }
  };

  var user = {
    id: 'not-a-room',
    getRoom: function() {
      return room;
    }
  };

  var clientEmitter = new EventEmitter();

  sinon.stub(cloak, 'createRoom');
  cloak.createRoom.returns(room);
  sinon.stub(cloak, 'getRoom');
  cloak.getRoom.withArgs('always-the-same').returns(room);

  var mock = _.extend(new EventEmitter(), {
    clientEmitter: clientEmitter,
    room: room,
    restore: function() {
      cloak.createRoom.restore();
      cloak.getRoom.restore();
    }
  });

  return mock;
};
