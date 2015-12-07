define(function(require) {
  'use strict';
  var COMPLETED_STATE = 'olives';

  var _ = require('lodash');

  var PizzaCollection = require('activities/pizza/shared/pizza-collection');

  suite('Pizza Productivity: PizzaCollection', function() {
    test('#active', function() {
      var c = new PizzaCollection([
        { id: 1, activeRound: 0, foodState: null },
        { id: 2, activeRound: 0, foodState: COMPLETED_STATE },
        { id: 3, activeRound: 0, foodState: null },
        { id: 4, activeRound: 1, foodState: null },
        { id: 5, activeRound: 1, foodState: null },
        { id: 6, activeRound: 1, foodState: null },
        { id: 7, activeRound: 1, foodState: null },
        { id: 8, activeRound: 2, foodState: COMPLETED_STATE },
        { id: 9, activeRound: 2, foodState: COMPLETED_STATE },
        { id: 10, activeRound: 2, foodState: COMPLETED_STATE },
        { id: 11, activeRound: 3, foodState: COMPLETED_STATE },
        { id: 12, activeRound: 3, foodState: null },
        { id: 13, activeRound: 3, foodState: null },
        { id: 14, activeRound: 3, foodState: COMPLETED_STATE },
      ]);

      assert.deepEqual(_.pluck(c.active(0), 'id'), [1, 3]);
      assert.deepEqual(_.pluck(c.active(1), 'id'), [4, 5, 6, 7]);
      assert.deepEqual(_.pluck(c.active(2), 'id'), []);
      assert.deepEqual(_.pluck(c.active(3), 'id'), [12, 13]);
      assert.deepEqual(_.pluck(c.active(4), 'id'), []);
    });

    test('#complete', function() {
      var c = new PizzaCollection([
        { id: 1, activeRound: 0, foodState: null },
        { id: 2, activeRound: 0, foodState: COMPLETED_STATE },
        { id: 3, activeRound: 0, foodState: null },
        { id: 4, activeRound: 1, foodState: null },
        { id: 5, activeRound: 1, foodState: null },
        { id: 6, activeRound: 1, foodState: null },
        { id: 7, activeRound: 1, foodState: null },
        { id: 8, activeRound: 2, foodState: COMPLETED_STATE },
        { id: 9, activeRound: 2, foodState: COMPLETED_STATE },
        { id: 10, activeRound: 2, foodState: COMPLETED_STATE },
        { id: 11, activeRound: 3, foodState: COMPLETED_STATE },
        { id: 12, activeRound: 3, foodState: null },
        { id: 13, activeRound: 3, foodState: null },
        { id: 14, activeRound: 3, foodState: COMPLETED_STATE },
      ]);

      assert.deepEqual(_.pluck(c.complete(0), 'id'), [2]);
      assert.deepEqual(_.pluck(c.complete(1), 'id'), []);
      assert.deepEqual(_.pluck(c.complete(2), 'id'), [8, 9, 10]);
      assert.deepEqual(_.pluck(c.complete(3), 'id'), [11, 14]);
      assert.deepEqual(_.pluck(c.complete(4), 'id'), []);
    });
  });
});
