define(function(require) {
  'use strict';

  var Backbone = require('backbone');
  var template = require('jade!./collection');

  var ActivityView = Backbone.View.extend({
    render: function(data) {
      this.$el.html(template({
        activities: data
      }));
      return this;
    }
  });

  return ActivityView;
});
