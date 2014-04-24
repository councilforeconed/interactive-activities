define(function(require) {
  'use strict';

  var ToppingsWorkstation = require('./toppings-workstation');
  var workstations = require('../../../shared/config').workstations;

  require('css!./sauce-workstation');

  var SauceWorkstation = ToppingsWorkstation.extend({
    toppingClass: 'pizza-topping-sauce',
    config: workstations.byId.sauce.config
  });

  return SauceWorkstation;
});
