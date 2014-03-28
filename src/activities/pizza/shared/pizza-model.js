define(function(require) {
  'use strict';
  var Backbone = require('backbone');
  var foodStates = [
    'doughball',
    'flat',
    'sauce',
    'cheese',
    'anchovies',
    'olives'
  ];

  var PizzaModel = Backbone.Model.extend({
    initialize: function() {
      this.localPlayerID = PizzaModel.localPlayerID;
    },
    defaults: {
      foodState: foodStates[0],
      ownerID: null
    },

    isComplete: function() {
      return this.get('foodState') === foodStates[foodStates.length - 1];
    },

    localIsDropping: function() {
      return this.hasChanged('ownerID') &&
        this.previous('ownerID') === PizzaModel.localPlayerID;
    },

    localIsTaking: function() {
      return this.hasChanged('ownerID') &&
        this.get('ownerID') === PizzaModel.localPlayerID;
    },

    nextStep: function() {
      var previousState = this.get('foodState');
      var previousIdx = foodStates.indexOf(previousState);
      var nextState;
      if (previousIdx === -1) {
        throw new Error('PizzaModel: Unrecognized food state: "' +
          previousState + '"');
      }
      if (this.isComplete()) {
        throw new Error('PizzaModel: Pizza in final food state--cannot ' +
          'increment.');
      }

      nextState = foodStates[previousIdx + 1];

      this.set({
        foodState: nextState,
        ownerID: null
      });
    }
  });

  return PizzaModel;
});
