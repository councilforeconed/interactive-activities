define(function(require) {
  'use strict';

  var Backbone = require('backbone');

  var PizzaModel = require('./pizza-model');

  var PizzaCollection = Backbone.Collection.extend({
    model: PizzaModel,

    active: function(roundNumber) {
      return this.filter(function(pizza) {
        return pizza.get('activeRound') === roundNumber && !pizza.isComplete();
      });
    }
  });

  return PizzaCollection;
});
