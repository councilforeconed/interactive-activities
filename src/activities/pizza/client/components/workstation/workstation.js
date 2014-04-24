define(function(require) {
  'use strict';

  var Layout = require('layoutmanager');

  var WorkstationPizza = require('../workstation-pizza/workstation-pizza');

  require('scripts/jquery.whenanimationend');
  require('css!./workstation');

  var WorkstationView = Layout.extend({
    className: 'pizza-workstation',
    template: require('jade!./workstation'),

    initialize: function() {
      this.pizza = null;
      this.pizzaView = null;
    },

    setPizza: function(pizzaModel) {
      this.pizza = pizzaModel;
      this.pizzaView = new WorkstationPizza({ model: pizzaModel });
      this.setView('.pizza-workstation-surface', this.pizzaView);

      this.pizzaView.render();

      // Notify the inheriting class that a pizza has been set.
      if (this._onSetPizza) {
        this._onSetPizza();
      }
    },

    enterFrom: function(direction) {
      var moveVal = 'enter-from-' + ((direction === 'next') ? 'right' : 'left');
      return this._setMove(moveVal);
    },

    exitTo: function(direction) {
      var moveVal = 'exit-to-' + ((direction === 'next') ? 'left' : 'right');
      return this._setMove(moveVal);
    },

    _setMove: function(moveVal) {
      var $el = this.$el;

      $el.attr('data-move', moveVal);

      return $el.whenAnimationEnd()
        // Remove the data- attribute so future re-renderings/re-insertions do
        // no re-trigger the animation.
        .always(function() {
          $el.attr('data-move', '');
        });
    },

    releasePizza: function() {
      this.pizza = null;
      this.pizzaView.remove();

      if (this._onReleasePizza) {
        this._onReleasePizza();
      }
    }
  });

  return WorkstationView;
});
