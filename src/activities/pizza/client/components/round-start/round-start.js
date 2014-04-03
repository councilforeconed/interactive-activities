define(function(require) {
  'use strict';

  var Layout = require('layoutmanager');
  var _ = require('lodash');

  var Modal = require('components/modal/modal');

  var RoundStart = Layout.extend({
    className: 'pizza-round-start',
    template: require('jade!./round-start'),
    initialize: function() {
      this.timeRemaining = null;
      this.timeoutID = null;
    },

    startIn: function(ms) {
      var nextTick;

      if (ms < 0) {
        this.trigger('begin');
        return;
      }


      this.timeRemaining = ms;
      // Guard against scheduler drift.
      nextTick = ms % 1000 || 1000;

      this.render();

      // In order to avoid accidental buildup of redundant render cycles (due
      // to erroneously invoking `startIn` more than once), cancel the
      // previously-scheduled timeout.
      if (this.timeoutID) {
        clearTimeout(this.timeoutID);
      }

      this.timeoutID = setTimeout(
        _.bind(this.startIn, this, ms - nextTick),
        nextTick
      );
    },

    serialize: function() {
      return {
        game: this.gameState.toJSON(),
        player: this.playerModel.toJSON(),
        timeRemaining: this.timeRemaining
      };
    }
  });

  var RoundStartModal = Modal.extend({
    initialize: function(options) {
      this.roundStart = options.content = new RoundStart(options);
      this.listenTo(this.roundStart, 'begin', this.dismiss);
      Modal.prototype.initialize.apply(this, arguments);
    },

    startIn: function() {
      this.render();
      return this.roundStart.startIn.apply(this.roundStart, arguments);
    }
  });

  return RoundStartModal;
});
