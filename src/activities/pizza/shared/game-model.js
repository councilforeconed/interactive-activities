define(function(require) {
  'use strict';

  var Model = require('backbone').Model;

  var GameState = Model.extend({
    defaults: {
      roundNumber: 0,
      roundEndTime: 0
    },

    /**
     * Convenience method to get and set the current round's end time relative
     * to the local system time.
     *
     * @argument {Number} [ms] Number of milliseconds from now that the current
     *                         round will end. If unset, this method will
     *                         simply return the value according to the current
     *                         round end time.
     *
     * @return {Number} Number of milliseconds from now that the current round
     *                  will end.
     */
    timeRemaining: function(ms) {
      var now = +new Date();

      if (arguments.length) {
        this.set('roundEndTime', now + ms);
      } else {
        ms = this.get('roundEndTime') - now;

        if (ms < 0) {
          ms = 0;
        }
      }

      return ms;
    }

  });

  return GameState;
});
