define(function(require) {
  'use strict';

  var Backbone = require('backbone');

  var workstations = require('./config').workstations;
  var stationCount = workstations.byPosition.length;

  var PlayerModel = Backbone.Model.extend({
    defaults: {
      workstation: workstations.byPosition[0].id
    },

    move: function(direction) {
      var currentIdx = workstations.byId[this.get('workstation')].index;
      var delta = (direction === 'next') ? 1 : -1;
      var nextIdx = (currentIdx + delta + stationCount) % stationCount;

      this.set('workstation', workstations.byPosition[nextIdx].id);
      this.trigger('move', direction);
    }
  });

  return PlayerModel;
});
