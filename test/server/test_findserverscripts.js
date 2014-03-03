// @file Test findServerScripts.
'use strict';

// Third party libs.
var assert = require('chai').assert;

// Locally defined libs.
var findServerScripts = require(
  '../../src/server/findserverscripts'
).findServerScripts;

suite('findServerScripts', function() {
  test('finds example', function(done) {
    findServerScripts()
      .then(function(scripts) {
        assert.include(
          scripts,
          'src/activities/example/index.js',
          'found example server script'
        );
      })
      .always(done);
  });
});
