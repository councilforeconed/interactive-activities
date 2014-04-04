define(function(require) {
  'use strict';

  var _ = require('lodash');
  var Layout = require('layoutmanager');
  var when = require('when');
  var whenDelay = require('when/delay');

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

  require('css!./round');
  require('jquery.pep');

  var RoundView = Layout.extend({
    template: require('jade!./round'),

    initialize: function(options) {
      this.playerModel = options.playerModel;
      this.pizzas = options.pizzas;

      this.queue = new QueueView({
        collection: this.pizzas,
        playerModel: this.playerModel,
        gameState: this.gameState
      });
      this.progress = new ProgressView({
        gameState: this.gameState,
        pizzas: this.pizzas
      });

      this.navigation = new Navigation({ playerModel: this.playerModel });

      this.listenTo(this.pizzas, 'localOwnerTake', function(pizza) {
        this.workstation.setPizza(pizza);
        this.navigation.disable();
      });
      this.listenTo(this.pizzas, 'localOwnerRelease', function(pizza) {
        this.workstation.releasePizza(pizza);
        this.navigation.enable();
      });
      this.listenTo(this.playerModel, 'move', this.handleMove);

      this.insertView('.pizza-queue-container', this.queue);
      this.insertView('.progress-container', this.progress);
    },

    begin: function() {
      var currentWorkstation = this.playerModel.get('workstation');

      if (!currentWorkstation) {
        return;
      }

      this.workstation = new workstations[currentWorkstation]();

      this.setView('.pizza-workstation-container', this.workstation);
      this.insertView('.pizza-navigation-container', this.navigation);

      this.render();
    },

    handleMove: function(direction) {
      var newWorkstationName = this.playerModel.get('workstation');
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
            this.setView('.pizza-workstation-container', this.workstation);
            this.workstation.render();
            return newWorkstation.enterFrom(direction);
          }, this))
        .always(_.bind(this.navigation.enable, this.navigation));
    }
  });

  return RoundView;
});
