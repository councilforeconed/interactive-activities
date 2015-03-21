'use strict';

var common = require('../../../server/common');
var requirejs = common.createRequireJS({
  shared: '../src/activities/pizza/shared'
});
var GameModel = requirejs('shared/game-model');

var params = requirejs('shared/parameters');
var MinPlayers = params.MinPlayers;
var RoundDuration = params.RoundDuration;
var RoundCount = params.RoundCount;

var ServerGameModel = GameModel.extend({
  initialize: function() {
    GameModel.prototype.initialize.apply(this, arguments);

    this.pizzaID = 0;

    this.on('roundStart', this.handleRoundStart, this);
    this.get('players').on('change:isReady', this.handleReadyPlayer, this);

    this.get('pizzas').on('change:foodState', function(pizza) {
      if (pizza.isComplete()) {
        this.allocatePizzas();
      }
    }, this);

    // The number of active players in each round is necessary for report
    // generation. The server maintains this number explicitly so that it can
    // be sent to clients and remains constant even after the original
    // participants have left the game.
    this.set('activePlayerCounts', []);
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

  handleReadyPlayer: function() {
    if (this.countReadyPlayers() < MinPlayers) {
      return;
    }
    if (this.hasBegun()) {
      return;
    }

    this.advance();
  },

  /**
   * Allow players to participate in the current round. This method is invoked
   * immediately after each new round begins.
   */
  activatePlayers: function() {
    var currentRound = this.get('roundNumber');
    var players = this.get('players');
    var currentCount = players.active().length;
    var targetCount = Math.round(
      ((currentRound + 1) / RoundCount) * players.length
    );

    players.each(function(player) {
      if (currentCount >= targetCount) {
        return;
      }

      if (player.get('activatedRound') < 0) {
        player.activate(currentRound);
        player.save();
        currentCount++;
      }
    });

    this.get('activePlayerCounts')[currentRound] = currentCount;
  },

  /**
   * Insert new pizzas into the queue. This method is invoked immediately after
   * each new round begins and after the completion of any pizza.
   */
  allocatePizzas: function() {
    var pizzas = this.get('pizzas');
    var players = this.get('players');
    var targetCount = players.length;
    var currentRound = this.get('roundNumber');
    var currentCount = pizzas.active(currentRound).length;

    while (currentCount < targetCount) {
      pizzas.create({
        id: ++this.pizzaID,
        activeRound: currentRound
      });

      currentCount++;
    }
  },

  handleRoundStart: function() {
    this.timeRemaining(RoundDuration);

    this.activatePlayers();
    this.allocatePizzas();

    setTimeout(this.advance.bind(this), RoundDuration);
  }
});

module.exports = ServerGameModel;
