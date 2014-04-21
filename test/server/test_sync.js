'use strict';

var assert = require('chai').assert;
var common = require('../../src/server/common');
var requirejs = common.createRequireJS();
var sinon = require('sinon');

var sync = require('../../src/server/sync');
var Backbone = requirejs('backbone');

suite('sync', function() {
  var model;
  var collection;
  var SyncModel = Backbone.Model.extend({
    sync: sync
  });
  var SyncCollection = Backbone.Collection.extend({
    model: SyncModel,
    sync: sync
  });
  var fakeRoom;

  setup(function() {
    fakeRoom = {
      messageMembers: sinon.spy()
    };
    model = new SyncModel({ id: 0, rev: 0 });
    model.prefix = 'prefix';
    model.room = fakeRoom;

    collection = new SyncCollection([{}]);
    collection.prefix = 'prefix2';
    collection.room = fakeRoom;
  });

  test('models', function() {
    var args;

    model.save({ rev: 1, state: 'value' });

    args = fakeRoom.messageMembers.args[0];
    assert.equal(fakeRoom.messageMembers.callCount, 1);
    assert.ok(args[0]);
    assert.equal(args[0], 'prefix/update');
    assert.ok(args[1]);
    assert.equal(args[1].rev, 1);
    assert.equal(args[1].state, 'value');
  });

  test('collections', function() {
    var args;

    collection.at(0).save({ rev: 1, state: 'value' });

    args = fakeRoom.messageMembers.args[0];
    assert.equal(fakeRoom.messageMembers.callCount, 1);
    assert.ok(args[0]);
    assert.equal(args[0], 'prefix2/create');
    assert.ok(args[1]);
    assert.equal(args[1].rev, 1);
    assert.equal(args[1].state, 'value');
  });
});
