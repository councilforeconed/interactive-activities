define(function(require) {
  'use strict';

  var Collection = require('backbone').Collection;

  var PlayerModel = require('./player-model');

  var PlayerCollection = Collection.extend({
    model: PlayerModel,

    activeByRound: function() {
      return this.chain()
        .groupBy(function(player) {
          return player.get('activatedRound');
        })
        .toArray()
        .map(function(roundPlayers) {
          return roundPlayers.length;
        })
        .value();
    }
  });

  return PlayerCollection;
});
