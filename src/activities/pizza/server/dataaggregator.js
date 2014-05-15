'use strict';

var through2reduce = require('through2-reduce');
var _ = require('lodash');

var INITIAL = 'initial';

module.exports = through2reduce.ctor(
  { objectMode: true },
  function (previous, current) {
    var gameData = current.gameData;
    if (previous === INITIAL) {
      previous = [];
    }

    _.forEach(gameData.report, function(round) {
      var pizzaCounts = previous[round.playerCount];
      if (!pizzaCounts) {
        pizzaCounts = previous[round.playerCount] = [];
      }
      pizzaCounts.push(round.pizzaCount || 0);
    });

    return previous;
  },
  INITIAL
);
