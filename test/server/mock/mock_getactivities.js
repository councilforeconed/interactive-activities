'use strict';

// Core node modules
var path = require('path');

// Third party libs
var when = require('when');

var activitiesDir = path.join(__dirname, '../../../src/activities');

// Return a function that behaves like getActivities. Taking no parameters and
// returning a promise that resolves to a list of activity objects. In this
// case, it'll be just the example.
module.exports = function() {
  return when([{
    slug: 'example',
    directory: path.join(activitiesDir, 'example'),
    configFile: path.join(activitiesDir, 'example/config.json'),
    serverIndex: path.join(activitiesDir, 'example/index.js')
  }]);
};
