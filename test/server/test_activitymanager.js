'use strict';

var assert = require('chai').assert;
var express = require('express');
var sinon = require('sinon');
var when = require('when');
require('express-resource');

var ActivityManager = require('../../src/server/activitymanager');
var common = require('../../src/server/common');
var MemoryStore = require('../../src/server/storememory');
var namegen = require('../../src/server/namegen');

var getActivities = require('./mock/mock_getactivities');
var util = require('./util');

var roomNames = ['room', 'shed', 'house', 'box', 'closet', 'bath'];
var groupAdjectives = ['warm', 'red', 'blue', 'tall', 'open', 'flat'];

var makeManager = function() {
  return getActivities()
    .then(function(activities) {
      return new ActivityManager({
        existFor: 1000,
        baseGroups: 0,
        roomNameGen: namegen.factory({
          dicts: { room: roomNames },
          formula: ['room']
        }),
        groupNameGen: namegen.factory({
          dicts: { adj: groupAdjectives },
          formula: ['adj']
        }),
        roomStore: new MemoryStore(),
        groupStore: new MemoryStore(),
        lookupStore: new MemoryStore(),
        activities: activities
      });
    });
};

suite('ActivityManager', function() {
  var clock;
  var manager;

  setup(function(done) {
    clock = sinon.useFakeTimers();

    makeManager()
      .then(function(_manager) {
        manager = _manager;
      })
      .always(done);
  });

  teardown(function(done) {
    clock.restore();

    manager.shutdown().yield(undefined).always(done);
  });

  test('generate a set of room names', function(done) {
    manager
      ._genNames(
        1,
        manager.options.roomNameGen,
        function(v) { return v; },
        when.resolve()
      )
      .then(function(names) {
        assert.lengthOf(names, 1);
      })
      .always(done);
  });

  test('create a room', function(done) {
    manager.create({ activity: 'example' })
      .then(function(room) {
        assert.equal(room.activity, 'example');
        assert.include(roomNames, room.room);
      })
      .always(done);
  });

  test('add groups', function(done) {
    manager.create({ activity: 'example' })
      .then(function(room) {
        return manager.addGroups(room.room, 2);
      })
      .then(function(room) {
        assert.lengthOf(room.groups, 2);
        assert.include(groupAdjectives, room.groups[0].name);
      })
      .always(done);
  });

  test('see room auto-destruct', function(done) {
    var whenDeleted = when.promise(function(resolve) {
      manager.lookupManager.on('delete', resolve);
    });

    manager.create({ activity: 'example' })
      .then(function() {
        // Step the clock forward so the scheduled timeout fires.
        clock.tick(2000);
      })
      .yield(whenDeleted)
      .yield(undefined)
      .always(done);
  });
});

suite('ActivityManager resources', function() {
  var clock;
  var manager;
  var server;

  setup(function(done) {
    clock = sinon.useFakeTimers();

    makeManager()
      .then(function(_manager) {
        manager = _manager;

        var app = express();
        app.use(express.json());
        app.resource('room', manager.roomResource());
        app.resource('group', manager.groupResource());
        server = app.listen(0);
        return common.whenListening(server);
      })
      .yield(undefined)
      .always(done);
  });

  teardown(function(done) {
    clock.restore();

    manager.shutdown().yield(undefined).always(done);
    server.close();
  });

  test('fail to read room that doesn\'t exist', function(done) {
    util.whenTestRequest(server, '/room/missing')
      .spread(function(response) {
        assert.operator(response.statusCode, ">=", 400);
      })
      .always(done);
  });

  test('create room', function(done) {
    util
      .whenTestRequest(server, {
        url: '/room',
        method: 'POST',
        json: { activity: 'example' }
      })
      .spread(function(response, body) {
        assert.equal(response.statusCode, 200);
        assert.lengthOf(body.groups, 0);
      })
      .always(done);
  });

  test('see room auto-destruct', function(done) {
    var whenDeleted = when.promise(function(resolve) {
      manager.lookupManager.on('delete', resolve);
    });

    util
      .whenTestRequest(server, {
        url: '/room',
        method: 'POST',
        json: { activity: 'example' }
      })
      .spread(function(response) {
        assert.equal(response.statusCode, 200);
        clock.tick(2000);
        return whenDeleted;
      })
      .yield(undefined)
      .always(done);
  });

  test('add groups', function(done) {
    util
      .whenTestRequest(server, {
        url: '/room',
        method: 'POST',
        json: { activity: 'example' }
      })
      .spread(function(response, body) {
        assert.equal(response.statusCode, 200);
        return util.whenTestRequest(server, {
          url: '/room/' + body.room,
          method: 'PUT',
          json: { addGroups: 2 }
        });
      })
      .spread(function(response, body) {
        assert.equal(response.statusCode, 200);
        assert.lengthOf(body.groups, 2);
      })
      .always(done);
  });

  test('add groups at creation', function(done) {
    // Sneak in a baseGroups of 2 as if manager had been configured this way.
    manager.activity('example').baseGroups = 2;

    util
      .whenTestRequest(server, {
        url: '/room',
        method: 'POST',
        json: { activity: 'example' }
      })
      .spread(function(response, body) {
        assert.equal(response.statusCode, 200);
        assert.lengthOf(body.groups, 2);
      })
      .always(done);
  });

  test('read room', function(done) {
    util
      .whenTestRequest(server, {
        url: '/room',
        method: 'POST',
        json: { activity: 'example' }
      })
      .spread(function(response, body) {
        return util.whenTestRequest(server, '/room/' + body.room);
      })
      .spread(function(response) {
        assert.equal(response.statusCode, 200);
      })
      .always(done);
  });

  test('fail to read group that doesn\'t exist', function(done) {
    util.whenTestRequest(server, '/group/missing')
      .spread(function(response) {
        assert.operator(response.statusCode, ">=", 400);
      })
      .always(done);
  });

  test('read group', function(done) {
    // Sneak in a baseGroups of 2 as if manager had been configured this way.
    manager.activity('example').baseGroups = 2;

    util
      .whenTestRequest(server, {
        url: '/room',
        method: 'POST',
        json: { activity: 'example' }
      })
      .spread(function(response, body) {
        return util.whenTestRequest(server, '/group/' + body.groups[0].name);
      })
      .spread(function(response) {
        assert.equal(response.statusCode, 200);
      })
      .always(done);
  });
});
