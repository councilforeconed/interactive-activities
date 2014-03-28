define(function(require) {
  'use strict';

  var ToppingsWorkstation = require('./toppings-workstation');
  var workstations = require('../../../shared/config').workstations;

  require('css!./cheese-workstation');

  var CheeseWorkstation = ToppingsWorkstation.extend({
    toppingClass: 'pizza-topping-cheese',
    config: workstations.byId.cheese.config
  });

  return CheeseWorkstation;
});
