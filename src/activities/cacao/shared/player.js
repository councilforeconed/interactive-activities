define(function(require) {
  'use strict';

  var Backbone = require('backbone');

  var Player = Backbone.Model.extend({
    defaults: {
      earnings: 0,
      targetPrice: 0
    },

    initialize: function() {
      //this.set('id', Math.round(Math.random() * 1000));
      //this.set('role', Math.random() > 0.5 ? 'buyer' : 'seller');
      this.resetTarget();
    },

    resetTarget: function() {
      this.set('targetPrice', 20 + Math.round(Math.random() * 80));
    }
  });

  return Player;
});
