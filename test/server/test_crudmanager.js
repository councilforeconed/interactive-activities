'use strict';

// Third party libs
var assert = require('chai').assert;
var sinon = require('sinon');
var when = require('when');

// Locally defined libs
var CRUDManager = require('../../src/server/crudmanager');
var MemoryStore = require('../../src/server/storememory');

// Locally defined test utilities
var util = require('./util');

suite('CRUDManager', function() {
  var manager;

  setup(function() {
    manager = new CRUDManager({ name: 'test', store: new MemoryStore() });
  });

  test('missing values', function() {
    manager.read('missing')
      .then(util.mustThrow, util.testErrorMessage(/not found/))
      .then(manager.update.bind(manager, 'missing', { key: 'value' }))
      .then(util.mustThrow, util.testErrorMessage(/Create it first/));
  });

  test('create read update delete', function(done) {
    manager.create('key', { id: 'key', body: 'data' })
      .then(manager.read.bind(manager, 'key'))
      .then(function(value) {
        assert.deepEqual(value, { id: 'key', body: 'data' });
        return manager.update('key', { id: 'key', body: 'info' });
      })
      .then(function(value) {
        assert.deepEqual(value, { id: 'key', body: 'info' });
        return manager.create('key', { id: 'key', willFail: true });
      })
      .then(util.mustThrow, util.testErrorMessage(/Update it instead/))
      .then(manager.delete.bind(manager, 'key'))
      .then(manager.read.bind(manager, 'key'))
      .then(util.mustThrow, util.testErrorMessage(/not found/))
      .yield(undefined)
      .always(done);
  });

  test('events', function(done) {
    var spy = sinon.spy();
    manager.on('create', spy);
    manager.create('key', { id: 'key' })
      .then(function() {
        assert.ok(spy.calledOnce, 'create called once');
        spy = sinon.spy();
        manager.on('update', spy);
        return manager.update('key', { id: 'key' });
      })
      .then(function() {
        assert.ok(spy.calledOnce, 'update called once');
        spy = sinon.spy();
        manager.on('delete', spy);
        return manager.delete('key');
      })
      .then(function() {
        assert.ok(spy.calledOnce, 'delete called once');
      })
      .always(done);
  });

  // - Test that listenTo performs create on dependent managers.
  // - Then test that it can stop listening by calling with undefined.
  // - Then test that it'll stop listening to what it was listening to when
  //   called to listen to another.
  test('listenTo', function(done) {
    var manager2 = new CRUDManager({
      name: '2',
      store: new MemoryStore()
    });
    var manager3 = new CRUDManager({
      name: '3',
      store: new MemoryStore()
    });

    var spy;
    var whenCreate2 = when.promise(function(resolve) {
      manager2.on('create', resolve);
    });
    var whenCreate3;

    // Listen and start the chain.
    manager2.listenTo(manager);
    manager.create('key', { id: 'key' })
      .yield(whenCreate2)
      .then(function() {
        // manager2 created an object following manager.
        // Now spy that it isn't called.
        spy = sinon.spy();
        manager2.on('create', spy);
        manager2.listenTo(undefined);

        // Have 3 listen to the original so we know when manager2 would have
        // listened if it was still doing so.
        manager3.listenTo(manager);
        whenCreate3 = when.promise(function(resolve) {
          manager3.on('create', resolve);
        });
        return manager.create('key2', { id: 'key2' })
          .yield(whenCreate3);
      })
      .then(function() {
        assert.ok(!spy.called, 'manager2 stopped listening');
        manager2.removeListener('create', spy);

        // Spy on manager3 and that it creates only once as we'll change who it
        // listens to.
        spy = sinon.spy();
        manager3.on('create', spy);
        manager3.listenTo(manager2);
        whenCreate3 = when.promise(function(resolve) {
          manager3.on('create', resolve);
        });

        manager.create('key3', { id: 'key3' });
        manager2.create('key4', { id: 'key4' });
        return whenCreate3;
      })
      .then(function() {
        assert.ok(spy.calledOnce, 'manager3 heard only one object creation');
      })
      .always(done);
  });
});
