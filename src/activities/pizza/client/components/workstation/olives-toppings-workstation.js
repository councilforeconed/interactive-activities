define(function(require) {
  'use strict';

  var ToppingsWorkstation = require('./toppings-workstation');
  var workstations = require('../../../shared/config').workstations;

  var OlivesWorkstation = ToppingsWorkstation.extend({
    toppingClass: 'pizza-topping-olive',
    config: workstations.byId.olives.config
  });

  return OlivesWorkstation;
});
