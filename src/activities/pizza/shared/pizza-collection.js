define(function(require) {
  'use strict';

  var Backbone = require('backbone');
  var _ = require('lodash');

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

    /**
     * Create an array describing the integer number of pizzas completed in
     * each round. Each element of the array describes the number of pizzas for
     * the round at that element's offset.
     *
     * For example, if the collection contains two pizzas that were completed
     * in the second round and three pizzas created in the third round, this
     * method would return the following array:
     *
     *     [0, 2, 3]
     */
    completedByRound: function() {
      return this.chain()
        .groupBy(function(pizza) {
          return pizza.get('activeRound');
        })
        .map(function(pizzas) {
          return _.filter(pizzas, function(pizza) {
              return pizza.isComplete();
            }).length;
        })
        .toArray()
        .value();
    }
  });

  return PizzaCollection;
});
