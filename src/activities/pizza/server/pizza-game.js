'use strict';

var common = require('../../../server/common');
var requirejs = common.createRequireJS({
  shared: '../src/activities/pizza/shared'
});

var GameModel = require('./game-model');

requirejs('backbone').sync = require('../../../server/sync');

module.exports = PizzaGame;

function PizzaGame(options) {
  // Initialize the Game model with an ID so that future invocations of `save`
  // generate "update" messages (not "create" messages)
  var state = this.state = new GameModel({ id: options.cloakRoom.id });
  var pizzas = state.get('pizzas');
  var players = state.get('players');
  this.report = options.report;

  state.room = pizzas.room = players.room = options.cloakRoom;
  state.prefix = 'game';
  pizzas.prefix = 'pizza';
  players.prefix = 'player';

  state.on('complete', function() {
    this.report({
      report: this.state.report()
    });
  }, this);
}

PizzaGame.messageHandlers = {
  'pizza/update': 'updatePizza',
  'player/update': 'updatePlayer'
};

PizzaGame.prototype.join = function(user) {
  var players = this.state.get('players');


  // Create new player.
  var nextId = 1;
  if (players.length > 0) {
    nextId = players.last().get('id') + 1;
  }
  var newPlayer = players.create({
    id: nextId,
    cloakId: user.id,
    station: null
  });

  user.message('game/create', this.state.toJSON());
  user.message('player/set-local', newPlayer.get('id'));
};

PizzaGame.prototype.updatePizza = function(obj) {
  var pizza = this.state.get('pizzas').get(obj.id);
  var currentOwner = pizza.get('ownerID');
  var newOwner = obj.ownerID;

  /**
   * Players may only retrieve a pizza from the queue; they may not take
   * directly from one another. If the server receives a message to set the
   * `ownerID` to a non-null value (i.e. a request to "take") but the pizza
   * already belongs to a player, this state transition should be rejected.
   *
   * This event may originate from a dishonest client, but it may also occur
   * when two clients attempt to take the same pizza concurrently.
   */
  if (currentOwner && newOwner && currentOwner !== newOwner) {
    // Because clients behave "optimistically" (assuming that `save` operations
    // will complete successfully), the client that issued the faulty request
    // is in an invalid state. Save the pizza model to synchronize the client's
    // pizza model with the canonical version on the server.
    pizza.save();

    return;
  }

  if (pizza.parse) {
    obj = pizza.parse(obj);
  }

  pizza.save(obj);
};

PizzaGame.prototype.updatePlayer = function(obj) {
  var player = this.state.get('players').get(obj.id);

  if (player.parse) {
    obj = player.parse(obj);
  }

  player.save(obj);
};

PizzaGame.prototype.leave = function(user) {
  var player = this.state.get('players').findWhere({ cloakId: user.id });

  if (!player) {
    return;
  }

  player.destroy();
};
