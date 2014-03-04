// @file Test findServerScripts.
'use strict';

// Third party libs.
var assert = require('chai').assert;

// Locally defined libs.
var findServerScripts = require(
  '../../src/server/get-activities'
);

suite('getActivities', function() {
  test('finds example', function(done) {
    findServerScripts()
      .then(function(activities) {
        var exampleScript = 'src/activities/example/index.js';
        var scriptCount = 0;

        activities.map(function(activity) {
          if (activity.serverIndex.indexOf(exampleScript) > -1) {
            scriptCount++;
          }
        });
        assert.equal(scriptCount, 1, 'found example server script');
      })
      .always(done);
  });
});
