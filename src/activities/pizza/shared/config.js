define(function(require) {
  'use strict';

  var _ = require('lodash');

  var foodStatesConfig = require('json!./food-states-config.json');
  var workstationsConfig = require('json!./workstations-config.json');

  var foodStateKeys = ['dough', 'flat', 'sauce', 'cheese', 'olives'];
  var workstationKeys = ['rolling', 'sauce', 'cheese', 'olives'];


  var assert = function(value, message) {
    if (!message) {
      message = 'Assertion error';
    }
    message = 'CEE: ' + message;

    if (!value) {
      throw new Error(message);
    }
  };

  var createLookups = function(keys, config) {
    var byId = {};
    var byPosition = [];

    assert(
      config.length === keys.length,
      'Expected exactly ' + keys.length + ' configuration objects.'
    );

    _.forEach(keys, function(id, index) {
      var previous = byPosition[index - 1] || null;

      var current = {
        id: id,
        index: index,
        previous: previous,
        config: config[index]
      };

      if (previous) {
        previous.next = current;
      }

      byId[id] = current;
      byPosition.push(current);
    });

    return {
      byId: byId,
      byPosition: byPosition
    };
  };

  return {
    foodStates: createLookups(foodStateKeys, foodStatesConfig),
    workstations: createLookups(workstationKeys, workstationsConfig)
  };
});
