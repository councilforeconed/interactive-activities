define(function(require) {
  'use strict';

  var Layout = require('layoutmanager');
  require('css!./home');

  var ActivityView = Layout.extend({
    template: require('jade!./home'),

    initialize: function(options) {
      this.activities = options.activities;
    },

    serialize: function() {
      return {
        activities: this.activities
      };
    }
  });

  return ActivityView;
});
