define(function(require) {
  'use strict';

  var PlayerModel = require('../../../shared/player-model');
  var PizzaModel = require('../../../shared/pizza-model');
  var PizzaCollection = require('../../../shared/pizza-collection');
  var ActivityView = require('components/activity/activity');
  var QueueView = require('../queue/queue');
  var ProgressView = require('../progress/progress');

  require('css!./main');
  require('jquery.pep');

  var Home = ActivityView.extend({
    homeTemplate: require('jade!./main'),
    config: require('json!./../../../config.json'),
    description: require('jade!./../../description')(),
    instructions: require('jade!./../../instructions')(),

    initialize: function() {
      var pizzaCount = 4 + Math.random() * 10;
      var idx;

      this.pizzas = new PizzaCollection();
      this.localPlayer = new PlayerModel({
        id: 1 + Math.round(1000 * Math.random())
      });

      PizzaModel.localPlayerID = this.localPlayer.get('id');

      this.queue = new QueueView({
        collection: this.pizzas,
        localPlayer: this.localPlayer
      });
      this.progress = new ProgressView();

      for (idx = 0; idx < pizzaCount; ++idx) {
        this.pizzas.add({ id: idx });
      }

      this.insertView('.pizza-queue-container', this.queue);
      this.insertView('.progress-container', this.progress);
    }
  });

  return Home;
});
