'use strict';

var assert = require('chai').assert;

var MemoryStore = require('../../src/server/storememory');

var util = require('./util');

suite('MemoryStore', function() {
  var store;

  setup(function() {
    store = new MemoryStore();
  });

  test('error for missing value', function(done) {
    store.get('missing')
      .then(util.mustThrow, util.testErrorMessage(/not found/))
      .then(store.delete.bind(store, 'missing'))
      .then(util.mustThrow, util.testErrorMessage(/not stored/))
      .always(done);
  });

  test('set, get, and delete', function(done) {
    store.set('key', 'value')
      .then(store.get.bind(store, 'key'))
      .then(function(value) {
        assert.equal(value, 'value');
        return store.delete('key');
      })
      .then(function(wasDeleted) {
        assert.equal(wasDeleted, true);
        return store.get('key');
      })
      .then(util.mustThrow, util.testErrorMessage(/not found/))
      .always(done);
  });

  test('#hasKey', function(done) {
    store.hasKey('missing')
      .then(function(hasKey) {
        assert.equal(hasKey, false);
        return store.set('key', 'value');
      })
      .then(store.hasKey.bind(store, 'key'))
      .then(function(hasKey) {
        assert.equal(hasKey, true);
      })
      .always(done);
  });
});
