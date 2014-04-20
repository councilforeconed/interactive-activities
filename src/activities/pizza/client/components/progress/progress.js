define(function(require) {
  'use strict';

  var Layout = require('layoutmanager');
  var _ = require('lodash');

  require('css!./progress');

  var ProgressView = Layout.extend({
    className: 'pizza-progress',
    template: require('jade!./progress'),
    keep: true,

    initialize: function(options) {
      this.gameState = options.gameState;
      this.pizzas = options.pizzas;
      this.tickID = null;

      this.tick = _.bind(this.tick, this);

      this.listenTo(this.pizzas, 'complete', this.render);
      this.listenTo(this.gameState, 'change:roundEndTime', this.tick);
    },

    /**
     * Render the view and schedule the view to be rendered at the next second
     * edge.
     */
    tick: function() {
      var timeRemaining = this.gameState.timeRemaining();
      var nextTick;

      // Ticking should stop when the round is over.
      if (timeRemaining < 0) {
        return;
      }

      // Guard against scheduler drift.
      nextTick = timeRemaining % 1000 || 1000;

      this.render();

      // In order to avoid accidental buildup of redundant tick cycles (due to
      // erroneously invoking `tick` more than once), cancel the previously-
      // scheduled timeout.
      if (this.tickID) {
        clearTimeout(this.tickID);
      }
      this.tickID = setTimeout(this.tick.bind(this), nextTick);
    },

    serialize: function() {
      var roundNumber = this.gameState.get('roundNumber');
      return {
        completeCount: this.pizzas.filter(function(pizza) {
          return pizza.isComplete() &&
            pizza.get('activeRound') === roundNumber;
        }).length,
        timeRemaining: this.gameState.timeRemaining()
      };
    }
  });

  return ProgressView;
});
