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

    /**
     * Assign a random target price to the player.
     *
     * @returns {Player} the Player instance
     */
    assignTarget: function() {
      this.set(
        'targetPrice',
        // Currently implemented as a uniform distribution across a
        // configurable range, this heuristic will likely need revision to
        // consistently model some market value.
        minPrice + Math.round(Math.random() * priceRange)
      );

      return this;
    }
  });

  return Player;
});
