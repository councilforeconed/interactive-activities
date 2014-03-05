define(function(require) {
  'use strict';

  var Layout = require('scripts/layout');
  var template = require('jade!./collection');

  var ActivityView = Layout.extend({
    render: function(data) {
      this.$el.html(template({
        activities: data
      }));
      return this;
    }
  });

  return ActivityView;
});
