define(function(require) {
  'use strict';
  var Backbone = require('backbone');

  var TOTAL = require('./../../total');

  /**
   * This activity's state can be described completely by two attributes: the
   * current "round" number, and the reserve ratio. Because the majority of the
   * data visualized by the activity is derived from these two attributes, the
   * model defines methods for calculating this data.
   */
  var GameModel = Backbone.Model.extend({
    defaults: {
      currentRound: 0,
      ratio: 20
    },
    total: TOTAL,

    initialize: function() {
      this.rounds = new Backbone.Collection();
      this.on('change', this.setRounds, this);
      this.setRounds();
    },

    remaining: function() {
      var remaining = TOTAL;
      this.rounds.each(function(round) {
        remaining -= round.get('amount');
      });
      return remaining;
    },

    created: function() {
      var created = 0;
      this.rounds.each(function(round) {
        created += round.get('excess');
      });
      return created;
    },

    /**
     * Expand the model's `rounds` collection according to its current state.
     * Depending on how the model has changed since the last `setRounds`
     * operation, this may include adding "round" models, deleting "round"
     * models, and/or updating existing "round" models (as per
     * Backbone.Collection#set).
     *
     * @emits setRounds
     */
    setRounds: function() {
      var currentRound = this.get('currentRound');
      var ratio = parseInt(this.get('ratio'), 10) / 100;
      var roundData = [];
      var remaining = TOTAL;
      var i, amount, excess;

      for (i = 0; i < currentRound; ++i) {
        amount = remaining * ratio;
        excess = remaining - amount;

        roundData.push({
          id: i,
          deposit: remaining,
          reserves: amount,
          excess: excess
        });

        remaining -= amount;
      }

      this.rounds.set(roundData);
      this.rounds.trigger('setRounds');
    },

    toJSON: function() {
      return {
        total: this.total,
        ratio: parseInt(this.get('ratio'), 10) / 100,
        remaining: this.remaining(),
        totalCreated: this.created(),
        rounds: this.rounds.toJSON()
      };
    }
  });

  return GameModel;
});
