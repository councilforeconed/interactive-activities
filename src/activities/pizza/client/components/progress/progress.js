define(function(require) {
  'use strict';

  var Layout = require('layoutmanager');

  require('css!./progress');

  var ProgressView = Layout.extend({
    className: 'pizza-progress',
    template: require('jade!./progress'),

    initialize: function() {
      this.listenTo(this.collection, 'complete', this.render);
    },

    serialize: function() {
      return {
        completeCount: this.collection.filter(function(pizza) {
          return pizza.isComplete();
        }).length
      };
    }
  });

  return ProgressView;
});
