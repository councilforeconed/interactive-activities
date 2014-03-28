define(function(require) {
  'use strict';

  var Backbone = require('backbone');

  var PizzaModel = require('./pizza-model');

  var PizzaCollection = Backbone.Collection.extend({
    model: PizzaModel
  });

  return PizzaCollection;
});
