define(function(require) {
  'use strict';

  var _ = require('lodash');
  var when = require('when');
  var whenDelay = require('when/delay');

  var PlayerModel = require('../../../shared/player-model');
  var PizzaModel = require('../../../shared/pizza-model');
  var PizzaCollection = require('../../../shared/pizza-collection');
  var ActivityView = require('components/activity/activity');
  var QueueView = require('../queue/queue');
  var ProgressView = require('../progress/progress');
  var Navigation = require('../navigation/navigation');
  // In order for the build process to infer module dependencies through static
  // analysis, the `require` function cannot be invoked programatically (even
  // in cases like this which have a fair amount of repetion).
  var workstations = {
    rolling: require('../workstation/rolling-workstation'),
    sauce: require('../workstation/sauce-workstation'),
    cheese: require('../workstation/cheese-workstation'),
    anchovies: require('../workstation/anchovies-toppings-workstation'),
    olives: require('../workstation/olives-toppings-workstation')
  };

  var workstationTransitionDelay =
      require('../../scripts/parameters').workstationTransitionDelay;

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
        playerModel: this.localPlayer
      });
      this.progress = new ProgressView({ collection: this.pizzas });
      this.workstation = new workstations.rolling();
      this.navigation = new Navigation({ playerModel: this.localPlayer });

      this.listenTo(this.pizzas, 'localOwnerTake', function(pizza) {
        this.workstation.setPizza(pizza);
        this.navigation.disable();
      });
      this.listenTo(this.pizzas, 'localOwnerRelease', function(pizza) {
        this.workstation.releasePizza(pizza);
        this.navigation.enable();
      });
      this.listenTo(this.localPlayer, 'move', this.handleMove);

      for (idx = 0; idx < pizzaCount; ++idx) {
        this.pizzas.add({ id: idx });
      }

      this.insertView('.pizza-queue-container', this.queue);
      this.insertView('.progress-container', this.progress);
      this.insertView('.pizza-workstation-container', this.workstation);
      this.insertView('.pizza-navigation-container', this.navigation);
    },

    handleMove: function(direction) {
      var newWorkstationName = this.localPlayer.get('workstation');
      var oldWorkstation = this.workstation;
      var newWorkstation = new workstations[newWorkstationName]();
      var whenDelayComplete = whenDelay(workstationTransitionDelay);
      var whenExited;

      this.navigation.disable();

      whenExited = oldWorkstation.exitTo(direction);
      whenExited.then(function() {
        oldWorkstation.remove();
      });

      when.all([whenDelayComplete, whenExited])
        .then(_.bind(function() {
            this.workstation = newWorkstation;
            this.insertView('.pizza-workstation-container', this.workstation);
            this.workstation.render();
            return newWorkstation.enterFrom(direction);
          }, this))
        .then(_.bind(this.navigation.enable, this.navigation));
    }
  });

  return Home;
});
