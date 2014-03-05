define(function(require) {
  'use strict';

  var ActivityView = require('components/activity/activity');

  var Home = ActivityView.extend({
    homeTemplate: function() { return 'Example activity'; },
    title: 'Example Activity',
    description: 'This activity is intended to demonstrate things.',
    instructions: 'Strings can go here.'
  });

  return Home;
});
