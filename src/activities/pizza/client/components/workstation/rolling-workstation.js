define(function(require) {
  'use strict';

  var ToppingsWorkstation = require('./toppings-workstation');
  var workstations = require('../../../shared/config').workstations;

  require('css!./rolling-workstation');

  var DoughWorkstation = ToppingsWorkstation.extend({
    toppingClass: 'pizza-topping-dough',
    config: workstations.byId.rolling.config
  });

  return DoughWorkstation;
});
