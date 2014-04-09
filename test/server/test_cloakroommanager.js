'use strict';

var EventEmitter = require('events').EventEmitter;

var assert = require('chai').assert;

var CloakRoomManager = require('../../src/server/cloakroommanager');

var CloakRoomMock = require('./mock/mock_cloakroom');

suite('CloakRoomManager', function() {
  var fakeCloak;
  var cloakRoomManager;
  var emitter;

  setup(function() {
    fakeCloak = CloakRoomMock.useFakeCloak();
    cloakRoomManager = new CloakRoomManager();
    emitter = new EventEmitter();
    cloakRoomManager.listenTo(emitter);
  });
  teardown(function() {
    fakeCloak.restore();
  });

  test('create room', function() {
    cloakRoomManager.create('name', {});
    assert.isDefined(cloakRoomManager.byName('name'));
  });

  test('delete room', function() {
    cloakRoomManager.create('name');
    cloakRoomManager.delete('name');
    assert.ok(fakeCloak.room.delete.calledOnce);
    assert.isUndefined(cloakRoomManager.byName('name'));
  });

  test('id', function() {
    cloakRoomManager.create('name');
    var room = cloakRoomManager.byName('name');
    assert.equal(cloakRoomManager.getRoomId('name'), room.id);
    assert.equal(cloakRoomManager.byId(room.id), room);
  });

  test('name', function() {
    cloakRoomManager.create('name');
    var room = cloakRoomManager.byName('name');
    assert.equal(cloakRoomManager.getRoomName(room.id), 'name');
  });


  test('cleanup', function() {
    cloakRoomManager.create('name');
    cloakRoomManager.cleanup();
    assert.ok(fakeCloak.room.delete.calledOnce);
    assert.isUndefined(cloakRoomManager.byName('name'));
  });
});
