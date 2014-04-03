define(function(require) {
  'use strict';
  var _ = require('lodash');
  var Backbone = require('backbone');
  var foodStates = require('./config').foodStates;
  var workstations = require('./config').workstations;
  var foodStateIds = _.pluck(foodStates.byPosition, 'id');

  var PizzaModel = Backbone.Model.extend({
    defaults: {
      foodState: foodStateIds[0],
      ownerID: null
    },

    initialize: function() {

      this.on('change:foodState', this.triggerComplete);

      // The 'localOwner'-related events are only relevant on the client.
      if (PizzaModel.isClient) {
        this.on('change:ownerID', this.triggerLocalOwnerChange);
        this.set('isReady', false);
      }
    },

    isComplete: function() {
      var currentState = foodStates.byId[this.get('foodState')];
      return !!(currentState && !currentState.next);
    },

    /**
     * Determine if the pizza in its current state may be placed in the given
     * workstation.
     *
     * @param {String} workstationId Identifier for the workstation in
     *                 question.
     *
     * @returns {Boolean}
     */
    mayPlaceIn: function(workstationId) {
      var workstation = workstations.byId[workstationId];
      var foodState = foodStates.byId[this.get('foodState')];

      return foodState.index === workstation.index;
    },

    triggerComplete: function() {
      var args;
      if (this.isComplete()) {
        args = Array.prototype.slice.call(arguments);
        args.unshift('complete');
        this.trigger.apply(this, args);
      }
    },

    triggerLocalOwnerChange: function() {
      var args, eventName;
      if (this.previous('ownerID') === PizzaModel.localPlayerID) {
        eventName = 'localOwnerRelease';

        if (this.get('isReady')) {
          this.nextStep();
        }
      } else if (this.get('ownerID') === PizzaModel.localPlayerID) {
        eventName = 'localOwnerTake';
      } else {
        return;
      }

      // Whenever ownership changes, the client-only `isReady` attribute should
      // be reset--either the pizza has been completed or it is being returned
      // to the queue unfinished.
      this.set('isReady', false);

      args = Array.prototype.slice.call(arguments);
      args.unshift(eventName);
      this.trigger.apply(this, args);
    },

    nextStep: function() {
      var previousStateId = this.get('foodState');
      var previousState = foodStates.byId[previousStateId];
      var nextState;

      if (!previousState) {
        throw new Error(
          'PizzaModel: Unrecognized food state: "' + previousStateId + '"'
        );
      }
      if (this.isComplete()) {
        throw new Error(
          'PizzaModel: Pizza in final food state--cannot increment.'
        );
      }

      nextState = previousState.next;

      this.set({
        foodState: nextState.id,
        ownerID: null
      });
    }
  });

  return PizzaModel;
});
