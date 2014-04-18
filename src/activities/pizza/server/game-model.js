'use strict';

var common = require('../../../server/common');
var requirejs = common.createRequireJS({
  shared: '../src/activities/pizza/shared'
});
var GameModel = requirejs('shared/game-model');

var params = requirejs('shared/parameters');
var MinPlayers = params.MinPlayers;
var RoundDuration = params.RoundDuration;

var ServerGameModel = GameModel.extend({
  initialize: function() {
    GameModel.prototype.initialize.apply(this, arguments);

    this.pizzaID = 0;

    this.on('roundStart', this.handleRoundStart, this);
    this.get('players').on('add', this.handleAddPlayer, this);

    // Fill game queue with some completed pizzas in order to demonstrate a
    // non- empty endgame report.
    // TODO: Remove this
    var pizzas = this.get('pizzas');
    [2, 6, 8, 10].forEach(function(count, roundNumber) {
      var idx;
      for (idx = 0; idx < count; ++idx) {
        pizzas.add({
          id: ++this.pizzaID,
          foodState: 'olives',
          ownerID: 1,
          activeRound: roundNumber
        });
      }
    }, this);
  },

  /**
   * Transitions to the next round number:
   *
   * - If the game has not yet begun, the round number will be set to `0`.
   * - If the game has begun, the round number will be incremented by 1.
   */
  advance: function() {
    var currentRoundNumber = this.get('roundNumber');
    var nextRoundNumber = currentRoundNumber + 1;

    if (this.isOver()) {
      throw new Error('Cannot advance game state beyond the final round.');
    }

    this.set('roundNumber', nextRoundNumber);
    this.save();
  },

  handleAddPlayer: function() {
    if (this.get('players').length < MinPlayers) {
      return;
    }
    if (this.hasBegun()) {
      return;
    }

    this.advance();
  },

  handleRoundStart: function(currentRound) {
    var pizzaCount = 4 + Math.random() * 10;
    var pizzas = this.get('pizzas');
    var idx;

    this.timeRemaining(RoundDuration);

    for (idx = 0; idx < pizzaCount; ++idx) {
      pizzas.create({
        id: ++this.pizzaID,
        activeRound: currentRound
      });
    }

    // TODO Activate some subset of the players
    this.get('players').each(function(player) {
      if (player.get('activatedRound') < 0) {
        player.activate(currentRound);
        player.save();
      }
    });

    setTimeout(this.advance.bind(this), RoundDuration);
  }
});

module.exports = ServerGameModel;
