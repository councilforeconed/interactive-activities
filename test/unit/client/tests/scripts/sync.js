define(function(require) {
  'use strict';

  var Backbone = require('backbone');
  var cloak = require('cloak');
  var sinon = require('sinon/stub');

  var sync = require('scripts/sync');

  suite('sync', function() {
    var SyncModel = Backbone.Model.extend({
      sync: sync
    });
    var SyncCollection = Backbone.Collection.extend({
      sync: sync,
      model: SyncModel
    });
    var model, collection;

    setup(function() {
      model = new SyncModel({ id: 0, rev: 0 });
      model.prefix = 'prefix1';

      collection = new SyncCollection({ id: 0, rev: 0 });
      collection.prefix = 'prefix2';

      sinon.stub(cloak, 'message');
    });

    teardown(function() {
      cloak.message.restore();
    });

    test('model', function() {
      var args;

      model.save({ rev: 1, state: 'value' });

      assert.equal(cloak.message.callCount, 1);
      args = cloak.message.args[0];
      assert.ok(args[0]);
      assert.equal(args[0], 'prefix1/update');
      assert.ok(args[1]);
      assert.equal(args[1].rev, 1);
      assert.equal(args[1].state, 'value');
    });

    test('collection', function() {
      var args;

      // Create a model with an attribute so `save` triggers an "update"
      // operation (and not a "create" operation)
      collection.add({ id: 4 }).save({ rev: 1, state: 'value' });

      assert.equal(cloak.message.callCount, 1);
      args = cloak.message.args[0];
      assert.ok(args[0]);
      assert.equal(args[0], 'prefix2/update');
      assert.ok(args[1]);
      assert.equal(args[1].rev, 1);
      assert.equal(args[1].state, 'value');
    });
  });
});
