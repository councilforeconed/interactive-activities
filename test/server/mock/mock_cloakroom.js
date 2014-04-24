'use strict';

var _ = require('lodash');
var sinon = require('sinon');

var cloak = require('cloak');

module.exports.useFakeCloak = function() {
  var room = {
    id: 'always-the-same',
    delete: sinon.stub(),
    messageMembers: sinon.spy()
  };

  var user = {
    id: 'not-a-room',
    getRoom: function() {
      return room;
    }
  };

  sinon.stub(cloak, 'createRoom');
  cloak.createRoom.returns(room);
  sinon.stub(cloak, 'getRoom');
  cloak.getRoom.withArgs('always-the-same').returns(room);

  var mock = {
    room: room,
    restore: function() {
      cloak.createRoom.restore();
      cloak.getRoom.restore();
    }
  };

  return mock;
};
