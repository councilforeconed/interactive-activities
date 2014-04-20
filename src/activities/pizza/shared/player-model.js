define(function(require) {
  'use strict';

  var Backbone = require('backbone');

  var workstations = require('./config').workstations;
  var stationCount = workstations.byPosition.length;

  var PlayerModel = Backbone.Model.extend({
    defaults: {
      workstation: null,
      activedRound: -1
    },

    activate: function(roundNumber) {
      if (this.get('workstation') !== null) {
        throw new Error(
          'PlayerModel#activate: attempted to activate a player that has ' +
          'been activated previously.'
        );
      }

      this.set('activatedRound', roundNumber);
      this.set('workstation', workstations.byPosition[0].id);
    },

    move: function(direction) {
      var workstation = this.get('workstation');
      var currentIdx = workstations.byId[workstation].index;
      var delta = (direction === 'next') ? 1 : -1;
      var nextIdx = (currentIdx + delta + stationCount) % stationCount;

      if (workstation === null) {
        throw new Error(
          'PlayerModel#move: Cannot transition when workstation is not set'
        );
      }

      this.set('workstation', workstations.byPosition[nextIdx].id);
      this.trigger('move', direction);
    }
  });

  return PlayerModel;
});
