define(function(require) {
  'use strict';

  var PlayerModel = require('../../../shared/player-model');
  var PizzaModel = require('../../../shared/pizza-model');
  var PizzaCollection = require('../../../shared/pizza-collection');
  var GameModel = require('../../../shared/game-model');
  var ActivityView = require('components/activity/activity');
  var RoundView = require('../round/round');
  var RoundStart = require('../round-start/round-start');

  // TODO: Load these values from a declarative parameters file.
  var RoundDuration = 80000;

  // Pizza models behave slightly differently on the client--they emit events
  // related to local player actions.
  PizzaModel.isClient = true;

  var MainView = ActivityView.extend({
    // This activity's `main` view has been built strictly for flow control
    // between other views. It defines no shared UI, so the `homeTemplate`
    // function is a no-op.
    homeTemplate: function() {},
    config: require('json!./../../../config.json'),
    description: require('jade!./../../description')(),
    instructions: require('jade!./../../instructions')(),

    initialize: function() {
      this.gameState = new GameModel();
      this.playerModel = new PlayerModel();
      this.pizzas = new PizzaCollection();

      // Generate dummy game state
      // TODO: Replace these lines with and fetch state from the server
      (function() {
        var pizzaCount = 4 + Math.random() * 10;
        var idx;
        this.playerModel.set('id', 1 + Math.round(1000 * Math.random()));
        for (idx = 0; idx < pizzaCount; ++idx) {
          this.pizzas.add({ id: idx });
        }
        this.playerModel.activate();
      }.call(this));

      PizzaModel.localPlayerID = this.playerModel.get('id');

      this.round = new RoundView({
        playerModel: this.playerModel,
        pizzas: this.pizzas,
        gameState: this.gameState
      });
      this.roundStart = new RoundStart({
        gameState: this.gameState,
        playerModel: this.playerModel,
      });

      this.setView('.activity-stage', this.round);

      this.listenTo(
        this.gameState,
        'change:roundNumber',
        this.handleRoundStart
      );
    },

    /**
     * This activity has no runtime configuration, but the `setConfig` method
     * is used as a hook into when the user has dismissed the initial "Welcome"
     * dialog.
     *
     * TODO: Remove this logic, as round advancement should be dictated by the
     * server (not by client interaction).
     */
    setConfig: function() {
      this.gameState.set('roundNumber', 1);
      this.gameState.timeRemaining(RoundDuration);
    },

    handleRoundStart: function() {
      this.insertView('.activity-modals', this.roundStart);
      this.roundStart.startIn(5432);

      this.round.begin();
    }
  });

  return MainView;
});
