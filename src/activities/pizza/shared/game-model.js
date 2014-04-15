define(function(require) {
  'use strict';

  var Backbone = require('backbone');
  var _ = require('lodash');

  var RoundCount = require('./parameters').RoundCount;

  var PlayerCollection = require('./player-collection');
  var PizzaCollection = require('./pizza-collection');

  var GameState = Backbone.Model.extend({
    defaults: {
      roundNumber: -1,
      roundEndTime: 0
    },

    initialize: function() {
      this.players = new PlayerCollection();
      this.pizzas = new PizzaCollection();
    },

    /**
     * Transitions to the next round number:
     *
     * - If the game has not yet begun, the round number will be set to `0`.
     * - If the game has begun, the round number will be incremented by 1.
     *
     * Triggers a `roundStart` event if a round is starting, or triggers a
     * `complete` event if transitioning out of the final round.
     */
    advance: function() {
      var currentRoundNumber = this.get('roundNumber');
      var nextRoundNumber = currentRoundNumber + 1;

      this.set('roundNumber', nextRoundNumber);

      if (this.isOver()) {
        this.trigger('complete');
      } else {
        this.trigger('roundStart', nextRoundNumber);
      }
    },

    hasBegun: function() {
      return this.get('roundNumber') > -1;
    },

    isOver: function() {
      return this.get('roundNumber') === RoundCount;
    },

    /**
     * Generate the data for a productivity report according to the current
     * state of the game.
     *
     * @return {Array} A collection of objects the number of active players in
     *                 a given round (`playerCount`) and the total number of
     *                 pizzas completed by those players. Each element's
     *                 position in the array reflects the round it describes.
     */
    report: function() {
      var completedPizzasByRound = this.pizzas.completedByRound();
      var activePlayersByRound = this.players.activeByRound();

      _.forEach(activePlayersByRound, function(roundPlayers, idx, allRounds) {
        var alreadyActive = allRounds[idx - 1];

        if (alreadyActive) {
          allRounds[idx] += alreadyActive;
        }
      });

      return _.map(
          _.zip(activePlayersByRound, completedPizzasByRound),
          function(pair) {
            return {
              playerCount: pair[0],
              pizzaCount: pair[1]
            };
          });
    },

    /**
     * Convenience method to get and set the current round's end time relative
     * to the local system time.
     *
     * @argument {Number} [ms] Number of milliseconds from now that the current
     *                         round will end. If unset, this method will
     *                         simply return the value according to the current
     *                         round end time.
     *
     * @return {Number} Number of milliseconds from now that the current round
     *                  will end.
     */
    timeRemaining: function(ms) {
      var now = +new Date();

      if (arguments.length) {
        this.set('roundEndTime', now + ms);
      } else {
        ms = this.get('roundEndTime') - now;

        if (ms < 0) {
          ms = 0;
        }
      }

      return ms;
    }

  });

  return GameState;
});
