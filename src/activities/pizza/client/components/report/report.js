define(function(require) {
  'use strict';

  var Layout = require('layoutmanager');

  var ReportView = Layout.extend({
    template: require('jade!./report'),

    initialize: function(options) {
      this.pizzas = options.pizzas;
    },

    serialize: function() {
      return {
        pizzas: this.pizzas.toJSON()
      };
    }
  });

  return ReportView;
});
