define(function(require) {
  'use strict';

  var fragmentData = require('scripts/fragment-data');
  var Backbone = require('backbone');

  suite('fragmentData', function() {
    var oldHash;

    suiteSetup(function() {
      Backbone.history.start();
    });
    setup(function() {
      oldHash = window.location.hash;
      window.location.hash = '';
    });
    teardown(function() {
      window.location.hash = oldHash;
    });

    test('primitives', function() {
      fragmentData.set(23);
      assert.equal(fragmentData.get(), 23);
    });

    test('objects', function() {
      fragmentData.set({ m: 23 });
      assert.deepEqual(fragmentData.get(), { m: 23 });
    });

    test('resetting', function() {
      fragmentData.set(23);
      fragmentData.set(33);
      assert.equal(fragmentData.get(), 33);
    });

    test('unset', function() {
      assert.equal(fragmentData.get(), null);
    });

    test('history preservation', function() {
      var originalLength = window.history.length;
      fragmentData.set(33);
      assert.equal(window.history.length, originalLength);
    });

    test('malformed data tolerance', function() {
      Backbone.history.navigate('?this is not valid JSON');
      assert.equal(fragmentData.get(), null);
    });

    test('keep previously-existing values', function() {
      window.location.hash = 'prev';
      fragmentData.set(99);

      assert.equal(fragmentData.get(), 99);
      assert.match(window.location.hash, /^#prev/);
    });
  });
});
