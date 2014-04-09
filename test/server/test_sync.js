'use strict';

var _ = require('lodash');
var assert = require('chai').assert;
var common = require('../../src/server/common');
var sinon = require('sinon');
var requirejs = common.createRequireJS();

var sync = require('../../src/server/sync');
var Backbone = requirejs('backbone');

var CloakRoomMock = require('./mock/mock_cloakroom');
var ClientSyncMock = require('./mock/mock_clientsync');

var bindTimeout = function(setfn) {
  return function(obj) {
    setTimeout(function() {
      setfn(obj);
    }, 50);
  };
};

suite('sync', function() {
  var clock;
  var fakeCloak;
  var fakeClientSync;
  var remoteModels;
  var serverModel;
  var serverCollection;
  var remoteCollections;

  suite('Model', function() {
    setup(function() {
      clock = sinon.useFakeTimers();
      fakeCloak = CloakRoomMock.useFakeCloak();
      fakeClientSync = ClientSyncMock.sync({
        prefix: 'prefix/',
        fakeCloak: fakeCloak,
        delay: 50
      });

      remoteModels = [
        new Backbone.Model({ id: 0, rev: 0 }),
        new Backbone.Model({ id: 0, rev: 0 })
      ];
      remoteModels[0].sync = fakeClientSync;
      remoteModels[1].sync = fakeClientSync;

      serverModel = new Backbone.Model({ id: 0, rev: 0 });
      serverModel.sync = sync({ prefix: 'prefix/', room: fakeCloak.room });

      fakeCloak.on('prefix/update', sync.store({ model: serverModel }));
      fakeCloak.clientEmitter.on(
        'prefix/update',
        bindTimeout(ClientSyncMock.store({ model: remoteModels[0] }))
      );
      fakeCloak.clientEmitter.on(
        'prefix/update',
        bindTimeout(ClientSyncMock.store({ model: remoteModels[1] }))
      );
    });

    teardown(function() {
      clock.restore();
      fakeCloak.restore();
    });

    test('server', function() {
      serverModel.save({ rev: 1, state: 'value' });

      clock.tick(100);

      assert.equal(remoteModels[0].get('rev'), 1);
      assert.equal(remoteModels[1].get('rev'), 1);
    });

    test('by wire', function() {
      remoteModels[0].save({ rev: 1, state: 'value' });

      clock.tick(200);

      assert.equal(serverModel.get('rev'), 1);
      assert.equal(remoteModels[1].get('rev'), 1);
    });
  });

  suite('Collection', function() {
    setup(function() {
      clock = sinon.useFakeTimers();
      fakeCloak = CloakRoomMock.useFakeCloak();
      fakeClientSync = ClientSyncMock.sync({
        prefix: 'prefix/',
        fakeCloak: fakeCloak,
        delay: 50
      });

      remoteCollections = [
        new Backbone.Collection([
          { id: 0, rev: 0 },
          { id: 1, rev: 0 }
        ]),
        new Backbone.Collection([
          { id: 0, rev: 0 },
          { id: 1, rev: 0 }
        ]),
      ];
      remoteCollections[0].sync = ClientSyncMock.sync({
        prefix: 'collection/',
        fakeCloak: fakeCloak,
        delay: 50
      });
      remoteCollections[1].sync = remoteCollections[0].sync;
      var remoteModelSync = ClientSyncMock.sync({
        prefix: 'model/',
        fakeCloak: fakeCloak,
        delay: 50
      });
      _.invoke(remoteCollections, 'each', function(model) {
        model.sync = remoteModelSync;
      });

      serverCollection = new Backbone.Collection([
        { id: 0, rev: 0 },
        { id: 1, rev: 0 }
      ]);
      serverCollection.sync = sync({
        prefix: 'collection/',
        room: fakeCloak.room
      });
      var modelSync = sync({
        prefix: 'model/',
        room: fakeCloak.room
      });
      serverCollection.each(function(model) {
        model.sync = modelSync;
      });

      var serverCollectionSet = sync.store({ collection: serverCollection });
      fakeCloak.on('collection/update', serverCollectionSet);
      fakeCloak.on('model/update', serverCollectionSet);
      var remoteCollectionSets = [
        bindTimeout(ClientSyncMock.store({ collection: remoteCollections[0] })),
        bindTimeout(ClientSyncMock.store({ collection: remoteCollections[1] }))
      ];
      fakeCloak.clientEmitter.on('collection/update', remoteCollectionSets[0]);
      fakeCloak.clientEmitter.on('collection/update', remoteCollectionSets[1]);
      fakeCloak.clientEmitter.on('model/update', remoteCollectionSets[0]);
      fakeCloak.clientEmitter.on('model/update', remoteCollectionSets[1]);
    });

    teardown(function() {
      clock.restore();
      fakeCloak.restore();
    });

    test('server', function() {
      serverCollection.at(0).save({ rev: 1, state: 'value' });

      clock.tick(100);

      assert.equal(remoteCollections[0].at(0).get('rev'), 1);
      assert.equal(remoteCollections[1].at(0).get('rev'), 1);
    });

    test('by wire', function() {
      remoteCollections[0].at(0).save({ rev: 1, state: 'value' });

      clock.tick(200);

      assert.equal(serverCollection.at(0).get('rev'), 1);
      assert.equal(remoteCollections[1].at(0).get('rev'), 1);
    });
  });
});
