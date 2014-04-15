define(function(require) {
  'use strict';

  var _ = require('lodash');

  var PlayerModel = require('../../../shared/player-model');
  var PizzaModel = require('../../../shared/pizza-model');
  var GameModel = require('../../../shared/game-model');

  var ActivityView = require('components/activity/activity');
  var ReportView = require('../report/report');
  var RoundView = require('../round/round');
  var PlayerWait = require('../player-wait/player-wait');
  var RoundStart = require('../round-start/round-start');

  var RoundDuration = require('../../../shared/parameters').RoundDuration;

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
      this.pizzas = this.gameState.pizzas;

      // Generate dummy game state
      // TODO: Replace these lines with and fetch state from the server
      (function() {
        var pizzaID = 0;
        this.playerModel = this.gameState.players.add({
          id: 1 + Math.round(1000 * Math.random())
        });

        _.forEach([2, 6, 8, 10], function(count, roundNumber) {
          var idx;
          for (idx = 0; idx < count; ++idx) {
            this.pizzas.add({
              foodState: 'olives',
              ownerID: 1,
              activeRound: roundNumber
            });
          }
        }, this);

        this.gameState.on('roundStart', function(currentRound) {
          var pizzaCount = 4 + Math.random() * 10;
          var idx;

          this.gameState.timeRemaining(RoundDuration);

          for (idx = 0; idx < pizzaCount; ++idx) {
            this.pizzas.add({
              id: pizzaID++,
              activeRound: currentRound
            });
          }

          if (currentRound === 1) {
            this.playerModel.activate(currentRound);
          }

          setTimeout(
            _.bind(this.gameState.advance, this.gameState),
            RoundDuration
          );
        }, this);

        // Simulate players joining the group asynchronously
        var playerCount = 4 + Math.round(Math.random() * 5);
        var idx;
        var addPlayer = function(idx) {
          this.gameState.players.add({
            id: 1 + Math.round(1000 * Math.random()),
            activatedRound: idx % 4
          });
        };

        for (idx = 0; idx < playerCount; ++idx) {
          setTimeout(_.bind(addPlayer, this, idx), (idx + 1) * 1500);
        }

      }.call(this));

      PizzaModel.localPlayerID = this.playerModel.get('id');

      this.report = new ReportView({
        gameState: this.gameState
      });
      this.round = new RoundView({
        playerModel: this.playerModel,
        pizzas: this.pizzas,
        gameState: this.gameState
      });
      this.roundStart = new RoundStart({
        gameState: this.gameState,
        playerModel: this.playerModel,
      });

      this.listenTo(this.gameState, 'roundStart', this.handleRoundStart);
      this.listenTo(this.gameState, 'complete', this.handleComplete);
    },

    setConfig: function() {
      var playerWait;

      if (!this.gameState.hasBegun()) {
        playerWait = new PlayerWait({
          gameState: this.gameState
        });
        this.insertView('.activity-modals', playerWait);
        playerWait.summon();
      }
    },

    // TODO: Re-name this method `handleRoundChange`, add a modal for when
    // the `roundNumber` is zero ("Waiting for more players..."), and invoke
    // immediately from `MainView#initialize`
    handleRoundStart: function() {
      this.insertView('.activity-modals', this.roundStart);
      this.setView('.activity-stage', this.round);

      this.roundStart.startIn(5432);

      this.round.begin();
    },

    handleComplete: function() {
      this.setView('.activity-stage', this.report);
      this.report.draw();
    }
  });

  return MainView;
});
