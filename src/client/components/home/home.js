define(function(require) {
  'use strict';

  var Layout = require('layoutmanager');
  require('css!./home');

  var ActivityView = Layout.extend({
    template: require('jade!./home'),
    events: {
      'click a': 'setLoading'
    },

    initialize: function(options) {
      this.activities = options.activities;
      this.browserIsInternetExplorer = !!navigator.userAgent.match('Trident');
    },

    afterRender: function() {
      if (this.browserIsInternetExplorer) {
        var activitiesThatDoNotSupportIE = $('.no-ie');
        activitiesThatDoNotSupportIE.addClass('disabled');
      }
    },

    setLoading: function(event) {
      this.$(event.target).closest('.home-activity-item').addClass('loading');
    },

    serialize: function() {
      return {
        activities: this.activities
      };
    }
  });

  return ActivityView;
});
