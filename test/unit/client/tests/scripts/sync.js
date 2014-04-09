define(function(require) {
  'use strict';

  var _ = require('lodash');
  var Backbone = require('backbone');
  var sinon = require('sinon');
  require('sinon/util/fake_timers');

  var sync = require('scripts/sync');

  var FakeCloak = require('../mocks/cloak');
  var FakeServerSync = require('../mocks/serversync');

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
    var clientModels;
    var serverModel;
    var clientCollections;
    var serverCollection;

    suite('Model', function() {
      setup(function() {
        clock = sinon.useFakeTimers();
        fakeCloak = FakeCloak.useFakeCloak();

        clientModels = [
          new Backbone.Model({ id: 0, rev: 0 }),
          new Backbone.Model({ id: 0, rev: 0 })
        ];
        clientModels[0].sync = sync({ prefix: 'prefix/' });
        clientModels[1].sync = clientModels[0].sync;

        serverModel = new Backbone.Model({ id: 0, rev: 0 });
        serverModel.sync = FakeServerSync.sync({
          prefix: 'prefix/',
          fakeCloak: fakeCloak,
          delay: 50
        });

        fakeCloak.on('prefix/update', sync.store({ model: clientModels[0] }));
        fakeCloak.on('prefix/update', sync.store({ model: clientModels[1] }));
        fakeCloak.server.on(
          'prefix/update',
          bindTimeout(FakeServerSync.store({ model: serverModel }))
        );
      });

      teardown(function() {
        clock.restore();
        fakeCloak.restore();
      });

      test('by server', function() {
        serverModel.save({ rev: 1, state: 'value' });

        clock.tick(100);

        assert.equal(clientModels[0].get('rev'), 1, 'client 0 updated');
        assert.equal(clientModels[1].get('rev'), 1, 'client 1 updated');
      });

      test('by client', function() {
        clientModels[0].save({ rev: 1, state: 'value' });

        clock.tick(200);

        assert.equal(serverModel.get('rev'), 1, 'server updated');
        assert.equal(clientModels[1].get('rev'), 1, 'other client updated');
      });
    });

    suite('Collection', function() {
      setup(function() {
        clock = sinon.useFakeTimers();
        fakeCloak = FakeCloak.useFakeCloak();

        clientCollections = [
          new Backbone.Collection([
            { id: 0, rev: 0 },
            { id: 1, rev: 0 }
          ]),
          new Backbone.Collection([
            { id: 0, rev: 0 },
            { id: 1, rev: 0 }
          ]),
        ];
        clientCollections[0].sync = sync({ prefix: 'collection/' });
        clientCollections[1].sync = clientCollections[0].sync;
        var remoteModelSync = sync({ prefix: 'model/' });
        _.invoke(clientCollections, 'each', function(model) {
          model.sync = remoteModelSync;
        });

        serverCollection = new Backbone.Collection([
          { id: 0, rev: 0 },
          { id: 1, rev: 0 }
        ]);
        serverCollection.sync = FakeServerSync.sync({
          prefix: 'collection/',
          fakeCloak: fakeCloak,
          delay: 50
        });
        var modelSync = FakeServerSync.sync({
          prefix: 'model/',
          fakeCloak: fakeCloak,
          delay: 50
        });
        serverCollection.each(function(model) {
          model.sync = modelSync;
        });

        var serverCollectionSet =
          FakeServerSync.store({ collection: serverCollection });
        fakeCloak.server.on('collection/update', serverCollectionSet);
        fakeCloak.server.on('model/update', serverCollectionSet);
        var clientCollectionSets = [
          sync.store({ collection: clientCollections[0] }),
          sync.store({ collection: clientCollections[1] })
        ];
        _.each(
          clientCollectionSets,
          _.bind(fakeCloak.on, fakeCloak, 'collection/update')
        );
        _.each(
          clientCollectionSets,
          _.bind(fakeCloak.on, fakeCloak, 'model/update')
        );
      });

      teardown(function() {
        clock.restore();
        fakeCloak.restore();
      });

      test('by server', function() {
        serverCollection.at(0).save({ rev: 1, state: 'value' });

        clock.tick(100);

        assert.equal(
          clientCollections[0].at(0).get('rev'), 1,
          'client 0 updated'
        );
        assert.equal(
          clientCollections[1].at(0).get('rev'), 1,
          'client 1 updated'
        );
      });

      test('model save by client', function() {
        clientCollections[0].at(0).save({ rev: 1, state: 'value' });

        clock.tick(200);

        assert.equal(serverCollection.at(0).get('rev'), 1, 'server updated');
        assert.equal(
          clientCollections[1].at(0).get('rev'), 1,
          'client 1 updated'
        );
      });

      test('collection reset by client', function() {
        // sync and store work with Backbone's normal handling of models.
        // Collections require some more setup.
        clientCollections[0].on('reset', function() {
          clientCollections[0].sync('update', clientCollections[0]);
        });
        serverCollection.on('reset', function() {
          serverCollection.sync('update', serverCollection);
        });

        var collection = clientCollections[0].toJSON();
        collection[0] = { id: 0, rev: 1, state: 'value' };
        clientCollections[0].reset(collection);
        clientCollections[0].sync('update', clientCollections[0]);

        clock.tick(200);

        assert.equal(serverCollection.at(0).get('rev'), 1, 'server updated');
        assert.equal(
          clientCollections[1].at(0).get('rev'), 1,
          'client 1 updated'
        );
      });
    });
  });
});
