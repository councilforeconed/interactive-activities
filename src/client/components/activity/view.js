define(function(require) {
  'use strict';
  var Backbone = require('backbone');

  var ActivityView = Backbone.View.extend({

    render: function() {
      this.$el.html(this.template(this.serialize()));
    },

    serialize: function() {},

    preDestroy: function() {},

    destroy: function() {
      this.preDestroy();
      this.$el.empty();
      this.$stopListenening();
    }
  });

  return ActivityView;
});
