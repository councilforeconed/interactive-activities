define(function(require) {
  'use strict';

  var sinon = require('sinon');

  var COMPLETED_STATE = 'olives';

  var GameModel = require('activities/pizza/shared/game-model');

  suite('Pizza Productivity: GameModel', function() {
    suite('#hasBegun', function() {
      test('initial state', function() {
        assert.isFalse(new GameModel().hasBegun());
      });

      test('during initial round', function() {
        var m = new GameModel({ roundNumber: 0 });

        assert.isTrue(m.hasBegun());
      });

      test('during some later round', function() {
        var m = new GameModel({ roundNumber: 2 });

        assert.isTrue(m.hasBegun());
      });
    });

    suite('#countReadyPlayers', function() {
      test('zero players', function() {
        var m = new GameModel();

        assert.equal(m.countReadyPlayers(), 0);
      });

      test('one non-ready player', function() {
        var m = new GameModel();
        m.get('players').add([{ isReady: false }]);

        assert.equal(m.countReadyPlayers(), 0);
      });

      test('many non-ready players', function() {
        var m = new GameModel();
        m.get('players').add([
            { isReady: false }, { isReady: false }, { isReady: false }
          ]);

        assert.equal(m.countReadyPlayers(), 0);
      });

      test('one ready player', function() {
        var m = new GameModel();
        m.get('players').add([{ isReady: true }]);

        assert.equal(m.countReadyPlayers(), 1);
      });

      test('many ready players', function() {
        var m = new GameModel();
        m.get('players').add([
            { isReady: true }, { isReady: true }, { isReady: true }
          ]);

        assert.equal(m.countReadyPlayers(), 3);
      });

      test('many players of different readiness', function() {
        var m = new GameModel();
        m.get('players').add([
            { isReady: true }, { isReady: false }, { isReady: true },
            { isReady: false }, { isReady: true }, { isReady: false },
            { isReady: true }, { isReady: true }, { isReady: true },
            { isReady: false }, { isReady: false }, { isReady: false }
          ]);

        assert.equal(m.countReadyPlayers(), 6);
      });
    });

    suite('#report', function() {
      function create(playerCounts, pizzas) {
        var m = new GameModel({ activePlayerCounts: playerCounts });

        m.get('pizzas').reset(pizzas);

        return m;
      }

      test('zero pizzas', function() {
        var m = create([1, 2, 2, 3], []);
        var expected = [
          { playerCount: 1, pizzaCount: 0 },
          { playerCount: 2, pizzaCount: 0 },
          { playerCount: 2, pizzaCount: 0 },
          { playerCount: 3, pizzaCount: 0 }
        ];

        assert.deepEqual(expected, m.report());
      });

      test('zero pizzas (with absent players)', function() {
        var m = create([1, 2, 0, 0], []);
        var expected = [
          { playerCount: 1, pizzaCount: 0 },
          { playerCount: 2, pizzaCount: 0 },
          { playerCount: 0, pizzaCount: 0 },
          { playerCount: 0, pizzaCount: 0 }
        ];

        assert.deepEqual(expected, m.report());
      });

      test('zero pizzas completed', function() {
        var m = create([1, 2, 2, 3], [
            { activeRound: 1, foodState: null },
            { activeRound: 2, foodState: null },
            { activeRound: 2, foodState: null },
            { activeRound: 3, foodState: null },
            { activeRound: 3, foodState: null },
            { activeRound: 3, foodState: null }
          ]);
        var expected = [
          { playerCount: 1, pizzaCount: 0 },
          { playerCount: 2, pizzaCount: 0 },
          { playerCount: 2, pizzaCount: 0 },
          { playerCount: 3, pizzaCount: 0 }
        ];

        assert.deepEqual(expected, m.report());
      });

      test('zero pizzas completed (with absent players)', function() {
        var m = create([1, 2, 0, 0], [
            { activeRound: 1, foodState: null },
            { activeRound: 2, foodState: null },
            { activeRound: 2, foodState: null },
            { activeRound: 3, foodState: null },
            { activeRound: 3, foodState: null },
            { activeRound: 3, foodState: null }
          ]);
        var expected = [
          { playerCount: 1, pizzaCount: 0 },
          { playerCount: 2, pizzaCount: 0 },
          { playerCount: 0, pizzaCount: 0 },
          { playerCount: 0, pizzaCount: 0 }
        ];

        assert.deepEqual(expected, m.report());
      });

      test('all pizzas completed', function() {
        var m = create([1, 2, 2, 3], [
            { activeRound: 1, foodState: COMPLETED_STATE },
            { activeRound: 2, foodState: COMPLETED_STATE },
            { activeRound: 2, foodState: COMPLETED_STATE },
            { activeRound: 3, foodState: COMPLETED_STATE },
            { activeRound: 3, foodState: COMPLETED_STATE },
            { activeRound: 3, foodState: COMPLETED_STATE },
            { activeRound: 4, foodState: COMPLETED_STATE },
            { activeRound: 4, foodState: COMPLETED_STATE },
            { activeRound: 4, foodState: COMPLETED_STATE },
            { activeRound: 4, foodState: COMPLETED_STATE }
          ]);
        var expected = [
          { playerCount: 1, pizzaCount: 1 },
          { playerCount: 2, pizzaCount: 2 },
          { playerCount: 2, pizzaCount: 3 },
          { playerCount: 3, pizzaCount: 4 }
        ];

        assert.deepEqual(expected, m.report());
      });

      test('some pizzas completed', function() {
        var m = create([1, 2, 2, 3], [
            { activeRound: 1, foodState: COMPLETED_STATE },
            { activeRound: 2, foodState: COMPLETED_STATE },
            { activeRound: 2, foodState: null },
            { activeRound: 3, foodState: null },
            { activeRound: 3, foodState: null },
            { activeRound: 3, foodState: null },
            { activeRound: 4, foodState: null },
            { activeRound: 4, foodState: COMPLETED_STATE },
            { activeRound: 4, foodState: COMPLETED_STATE },
            { activeRound: 4, foodState: null }
          ]);
        var expected = [
          { playerCount: 1, pizzaCount: 1 },
          { playerCount: 2, pizzaCount: 1 },
          { playerCount: 2, pizzaCount: 0 },
          { playerCount: 3, pizzaCount: 2 }
        ];

        assert.deepEqual(expected, m.report());
      });

    });

    suite('#timeRemaining', function() {
      var clock;

      setup(function() {
        clock = sinon.useFakeTimers();
      });

      teardown(function() {
        clock.restore();
      });

      suite('retrieval', function() {
        test('with time remaining', function() {
          var m = new GameModel({ roundEndTime: 1234 });

          assert.equal(m.timeRemaining(), 1234);

          clock.tick(100);

          assert.equal(m.timeRemaining(), 1134);
          assert.equal(m.toJSON().timeRemaining, 1134);
        });

        test('with exactly zero time remaining', function() {
          var m = new GameModel({ roundEndTime: 333 });

          clock.tick(333);

          assert.equal(m.timeRemaining(), 0);
          assert.equal(m.toJSON().timeRemaining, 0);
        });

        test('after time has expired', function() {
          var m = new GameModel({ roundEndTime: 777 });

          clock.tick(1234);

          assert.equal(m.timeRemaining(), 0);
          assert.equal(m.toJSON().timeRemaining, 0);
        });
      });

      suite('setting', function() {
        test('now', function() {
          var m = new GameModel({ roundEndTime: 321 });
          clock.tick(444);

          m.timeRemaining(0);

          assert.equal(m.get('roundEndTime'), 444);
        });

        test('in the future', function() {
          var m = new GameModel({ roundEndTime: 321 });
          clock.tick(444);

          m.timeRemaining(10);

          assert.equal(m.get('roundEndTime'), 454);
        });
      });
    });
  });
});
