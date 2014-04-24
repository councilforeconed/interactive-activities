define(function(require) {
  'use strict';

  var Backbone = require('backbone');
  var config = require('json!./config.json');
  var minPrice = config.targetPrice.min;
  var priceRange = config.targetPrice.max - minPrice;

  var Player = Backbone.Model.extend({
    defaults: {
      earnings: 0,
      targetPrice: 0
    },

    assignTarget: function() {
      this.set(
        'targetPrice',
        minPrice + Math.round(Math.random() * priceRange)
      );
    }
  });

  return Player;
});
