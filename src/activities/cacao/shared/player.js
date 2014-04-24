define(function(require) {
  'use strict';

  var Backbone = require('backbone');

  var Player = Backbone.Model.extend({
    defaults: {
      earnings: 0,
      targetPrice: 0
    },

    assignTarget: function() {
      this.set('targetPrice', 20 + Math.round(Math.random() * 80));
    }
  });

  return Player;
});
