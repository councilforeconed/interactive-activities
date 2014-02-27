define(function(require) {
  'use strict';
  var ActivityView = require('components/activity/view');

  var HomeView = ActivityView.extend({
    template: require('jade!./template')
  });

  return HomeView;
});
