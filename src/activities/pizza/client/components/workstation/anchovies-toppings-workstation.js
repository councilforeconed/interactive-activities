define(function(require) {
  'use strict';

  var ToppingsWorkstation = require('./toppings-workstation');
  var workstations = require('../../../shared/config').workstations;

  require('css!./anchovies-toppings-workstation');

  var AnchoviesWorkstation = ToppingsWorkstation.extend({
    toppingClass: 'pizza-topping-anchovie',
    config: workstations.byId.anchovies.config
  });

  return AnchoviesWorkstation;
});
