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
    },

    complete: function(roundNumber) {
      return this.filter(function(pizza) {
        return pizza.get('activeRound') === roundNumber && pizza.isComplete();
      });
    },

    completedByRound: function() {
      return this.chain()
        .filter(function(pizza) {
          return pizza.isComplete();
        })
        .groupBy(function(pizza) {
          return pizza.get('activeRound');
        })
        .map(function(pizzas) {
          return pizzas.length;
        })
        .toArray()
        .value();
    }
  });

  return PizzaCollection;
});
