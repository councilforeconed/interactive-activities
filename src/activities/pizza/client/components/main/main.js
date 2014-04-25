define(function(require) {
  'use strict';

  var _ = require('lodash');
  var cloak = require('cloak');
  var io = require('scripts/socketio.monkey');
  var when = require('when');
  var Backbone = require('backbone');

  var createMsgHandlers = require('scripts/create-cloak-msg-handlers');

  var PizzaModel = require('../../../shared/pizza-model');
  var GameModel = require('../../../shared/game-model');
  var sync = require('scripts/sync');

  var ActivityView = require('components/activity/activity');
  var ReportView = require('../report/report');
  var RoundView = require('../round/round');
  var PlayerWait = require('../player-wait/player-wait');
  var RoundStart = require('../round-start/round-start');

  // Pizza models behave slightly differently on the client--they emit events
  // related to local player actions.
  PizzaModel.isClient = true;
  var originalSync = Backbone.sync;

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
      this.ready = this._initConnection();

      Backbone.sync = sync;
    },

    finishInit: function() {
      var playerWait;

      this.round = new RoundView({
        playerModel: this.playerModel,
        pizzas: this.gameState.get('pizzas'),
        gameState: this.gameState
      });
      this.roundStart = new RoundStart({
        gameState: this.gameState,
        playerModel: this.playerModel,
      });

      // Schedule future changes to the game state to be reflected in the
      // layout.
      this.listenTo(this.gameState, 'roundStart', this.handleRoundStart);
      this.listenTo(this.gameState, 'complete', this.handleComplete);

      // Update the layout according to the current game state
      if (!this.gameState.hasBegun()) {
        playerWait = new PlayerWait({
          gameState: this.gameState
        });
        this.insertView('.activity-modals', playerWait);
        playerWait.summon();
      } else if (this.gameState.isOver()) {
        this.handleComplete();
      } else {
        this.handleRoundStart();
      }
    },

    setConfig: function() {
      this.ready.then(_.bind(this.finishInit, this));
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

    _initConnection: function() {

      var dfd = when.defer();
      var pizzas = this.gameState.get('pizzas');
      var players = this.gameState.get('players');

      this.gameState.prefix = 'game';
      pizzas.prefix = 'pizza';
      players.prefix = 'player';
      var pizzaMessages = createMsgHandlers('pizza', { collection: pizzas });
      var playerMessages = createMsgHandlers('player', { collection: players });
      var localPlayerMessages = {
        'player/set-local': _.bind(function(playerId) {
          PizzaModel.localPlayerID = playerId;
          this.playerModel = players.get(playerId);
          this.playerModel.set('isLocal', true);
          dfd.resolve();
        }, this)
      };
      var gameMessages = createMsgHandlers('game', { model: this.gameState });

      cloak.configure({
        messages: _.extend(
          {},
          pizzaMessages,
          playerMessages,
          localPlayerMessages,
          gameMessages
        ),

        serverEvents: {
          begin: _.bind(function() {
            // Join cloak room for this group
            cloak.message('joinRoom', this.group);
          }, this)
        }
      });

      // Reload the page to reset cloak.
      if (cloak.dirty) {
        location.reload();
      }
      // Next run of a cloak-app should reload the page.
      cloak.dirty = true;

      // Cloak wraps socket.io in a way, that we must monkey in some options.
      io.connect.options = {
        'resource': 'activities/pizza/socket.io'
      };
      // Connect to socket
      cloak.run();

      return dfd.promise;
    },

    handleComplete: function() {
      var report = new ReportView({
        gameState: this.gameState
      });
      this.setView('.activity-stage', report);
      report.draw();
    },

    cleanup: function() {
      Backbone.sync = originalSync;
    }
  });

  return MainView;
});
