define(function(require) {
  'use strict';
  var CollectionView = require('components/activity/collection-view');

  suite('CollectionView', function() {
    test('Exposes a valid constructor', function() {
      var instance = new CollectionView();

      assert.ok(instance instanceof CollectionView);
    });
  });
});
