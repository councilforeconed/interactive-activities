'use strict';

// Third party libs
var when = require('when');

// Return a function that behaves like getActivities. Taking no parameters and
// returning a promise that resolves to a list of activity objects. In this
// case, it'll be just the example.
module.exports = function() {
  return when([{
    slug: 'example',
    directory: 'src/activities/example',
    configFile: 'src/activities/example/config.json',
    serverIndex: 'src/activities/example/index.js'
  }]);
};
