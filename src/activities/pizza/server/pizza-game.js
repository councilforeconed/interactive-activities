'use strict';

var common = require('../../../server/common');
var requirejs = common.createRequireJS({
  shared: '../src/activities/pizza/shared'
});

var GameModel = require('./game-model');

requirejs('backbone').sync = require('../../../server/sync');

module.exports = PizzaGame;

function PizzaGame(options) {
  var state = this.state = new GameModel();
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

  user.message('game/update', this.state.toJSON());
  user.message('player/set-local', newPlayer.get('id'));
};

PizzaGame.prototype.updatePizza = function(obj) {
  var pizza = this.state.get('pizzas').get(obj.id);

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
