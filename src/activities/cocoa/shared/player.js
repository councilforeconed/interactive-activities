define(function(require) {
  'use strict';

  var Backbone = require('backbone');
  var _ = require('lodash');

  var config = require('json!./config.json');
  var targets = {};

  function makeTargets(distribution) {
    var targets = [];

    _.forEach(distribution, function(count, priceStr) {
      var price = parseInt(priceStr, 10);

      // Target prices are explicitly required to be integers (as opposed to
      // floating-point values) by the source material.
      if (price !== +priceStr) {
        throw new Error(
          'CEE Cocoa activity: Prices must be integer values. ' +
          '(Could not cast "' + priceStr + '" to an integer.)'
        );
      } else if (price <= 0) {
        throw new Error(
          'CEE Cocoa activity: Prices must be greater than 0. ' +
          '(Encountered value "' + price + '".)'
        );
      }

      while (count-- > 0) {
        targets.push(price);
      }
    });

    return targets;
  }

  targets.buyer = makeTargets(config.targetDistributions.buyer);
  targets.seller = makeTargets(config.targetDistributions.seller);

  var Player = Backbone.Model.extend({
    defaults: {
      earnings: 0,
      targetPrice: 0
    },

    /**
     * Assign a target price to the player.
     *
     * @returns {Player} the Player instance
     */
    assignTarget: function() {
      var playerTargets = targets[this.get('role')];
      var idx = Math.floor(Math.random() * playerTargets.length);

      this.set('targetPrice', playerTargets[idx]);

      return this;
    }
  });

  return Player;
});
