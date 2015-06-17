define(function(require) {
  'use strict';

  var Layout = require('layoutmanager');

  var Modal = require('components/modal/modal');
  var MinPlayers = require('../../../shared/parameters').MinPlayers;

  var PlayerWait = Layout.extend({
    className: 'pizza-player-wait',
    template: require('jade!./player-wait'),
    initialize: function(options) {
      this.gameState = options.gameState;

      this.listenTo(
        this.gameState.get('players'), 'add change:isReady remove', this.render
      );
    },

    serialize: function() {
      return {
        playerCount: this.gameState.countReadyPlayers(),
        MinPlayers: MinPlayers
      };
    }
  });

  var PlayerWaitModal = Modal.extend({
    initialize: function(options) {
      this.playerWait = options.content = new PlayerWait(options);
      this.gameState = options.gameState;

      this.listenTo(this.gameState, 'roundStart', this.remove);

      Modal.prototype.initialize.apply(this, arguments);
    }
  });

  return PlayerWaitModal;
});
