define(function(require) {
  'use strict';

  var Backbone = require('backbone');
  var _ = require('lodash');

  var params = require('./parameters');
  var RoundCount = params.RoundCount;

  var PlayerCollection = require('./player-collection');
  var PizzaCollection = require('./pizza-collection');

  var GameState = Backbone.Model.extend({
    defaults: {
      roundNumber: -1,
      roundEndTime: 0,
      pizzas: null,
      players: null
    },

    // Vivify nested arrays into true Backbone Collections
    parse: function(data) {
      if (data.pizzas) {
        this.get('pizzas').set(data.pizzas);
        delete data.pizzas;
      }

      if (data.players) {
        this.get('players').set(data.players);
        delete data.players;
      }

      if (data.timeRemaining) {
        this.timeRemaining(data.timeRemaining);
        delete data.timeRemaining;
      }

      return data;
    },

    toJSON: function() {
      var orig = Backbone.Model.prototype.toJSON.apply(this, arguments);
      orig.timeRemaining = this.timeRemaining();
      return orig;
    },

    initialize: function() {
      var players = new PlayerCollection();
      this.set({
        players: players,
        pizzas: new PizzaCollection()
      });

      this.on('change:roundNumber', this.handleRoundChange, this);
    },

    /**
     * Trigger round-related events that carry more meaning than
     * 'change:roundNumber':
     *
     * - 'roundStart': when a new round is beginning
     * - 'complete': when transitioning out of the final round
     */
    handleRoundChange: function(model, roundNumber) {
      if (this.isOver()) {
        this.trigger('complete');
      } else {
        this.trigger('roundStart', roundNumber);
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
      var completedPizzasByRound = this.get('pizzas').completedByRound();
      var activePlayersByRound = this.get('players').activeByRound();

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
