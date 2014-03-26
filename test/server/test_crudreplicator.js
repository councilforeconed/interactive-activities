'use strict';

var when = require('when');

var CRUDManager = require('../../src/server/crudmanager');
var CRUDReplicator = require('../../src/server/crudreplicator');
var MemoryStore = require('../../src/server/storememory');

var ReplicatorTarget = require('./mock/mock_replicatortarget');

suite('CRUDReplicator', function() {
  var manager1, managerA, replicator, target;
  setup(function() {
    manager1 = new CRUDManager({ name: '1', store: new MemoryStore() });
    managerA = new CRUDManager({ name: 'A', store: new MemoryStore() });
    target = new ReplicatorTarget();
    replicator = new CRUDReplicator({
      manager: manager1,
      type: 'test',
      target: target
    });
    managerA.listenTo(new CRUDReplicator.EndPoint({
      emitter: target,
      type: 'test'
    }));
  });

  test('replicate create', function(done) {
    var whenCreated = when.promise(function(resolve) {
      managerA.on('create', resolve);
    });
    manager1.create('key', { value: 'value' })
      .yield(whenCreated)
      .yield(undefined)
      .always(done);
  });

  test('replicate update', function(done) {
    var whenUpdated = when.promise(function(resolve) {
      managerA.on('update', resolve);
    });
    manager1.create('key', { value: 'value' })
      .then(manager1.update.bind(manager1, 'key', { value: 'different' }))
      .yield(whenUpdated)
      .yield(undefined)
      .always(done);
  });

  test('replicate delete', function(done) {
    var whenDeleted = when.promise(function(resolve) {
      managerA.on('delete', resolve);
    });
    manager1.create('key', { value: 'value' })
      .then(manager1.delete.bind(manager1, 'key'))
      .yield(whenDeleted)
      .yield(undefined)
      .always(done);
  });
});
