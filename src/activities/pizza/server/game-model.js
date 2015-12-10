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
    this.on('roundEnd', this.handleRoundEnd, this);
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

    // Override the model's `toJSON` method but store a reference to the
    // original implementation. This allows the overriding method to delegate
    // to the original implementation. The definition is done dynamically
    // within the model's `initialize` method in order to honor the prototype
    // chain when locating the original implementation.
    this.originalToJSON = this.toJSON;
    this.toJSON = this.toJSONOverride;
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

  /**
   * Ensure that all pizzas ("active" or "inactive") are unassigned.
   */
  releasePizzas: function() {
    this.get('pizzas')
      .forEach(function(pizza) {
        pizza.set('ownerID', null);
      });
  },

  handleRoundStart: function() {
    this.timeRemaining(RoundDuration);

    this.activatePlayers();
    this.allocatePizzas();

    setTimeout(this.advance.bind(this), RoundDuration);
  },

  handleRoundEnd: function() {
    // Release all pizzas at the termination of each round so that players who
    // are in possession of a pizza as a round ends are able to navigate
    // immediately at the onset of the following round.
    this.releasePizzas();
  },

  /**
   * Prepare the game state for transmission to remote clients. This method is
   * redefined on each instance as `toJSON` during initialization.
   */
  toJSONOverride: function() {
    var serialized = this.originalToJSON();

    // The `roundEndTime` attribute is interpreted in terms of the system clock
    // and is therefore inappropriate for transmission to the client. Clients
    // will calculate an equivalent value using the relative `timeRemaing`
    // attribute--see the shared Game model's `parse` method for details.
    delete serialized.roundEndTime;

    return serialized;
  }
});

module.exports = ServerGameModel;
