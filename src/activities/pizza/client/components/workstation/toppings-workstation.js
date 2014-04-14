define(function(require) {
  'use strict';

  var $ = require('jquery');
  var _ = require('lodash');

  var GenericWorkstation = require('./workstation');
  var elementInCircle = require('../../scripts/element-in-circle');

  var freeToppingCount = require('../../scripts/parameters').freeToppingCount;

  require('jquery.pep');

  require('css!./toppings-workstation');

  var largestStation = _.max(
    require('../../../shared/config').workstations.byId,
    function(workstation) {
      return workstation.minToppingCount;
    });

  if (freeToppingCount < largestStation.minToppingCount) {
    throw new Error(
      'The `freeToppingsCount` parameter cannot be less than ' +
      largestStation.minToppingCount +
      ' in order to accomodate the ' +
      largestStation.title + ' station.'
    );
  }

  function doOverlap($a, $b) {
    var $pizza, $topping;

    if ($a.hasClass('pizza-workstation-pizza')) {
      $pizza = $a;
      $topping = $b;
    } else if ($b.hasClass('pizza-workstation-pizza')) {
      $pizza = $b;
      $topping = $a;
    } else {
      return false;
    }

    return elementInCircle($topping, $pizza);
  }

  var ToppingsWorkstation = GenericWorkstation.extend({
    initialize: function() {
      GenericWorkstation.prototype.initialize.apply(this, arguments);

      if (!this.config.minToppingCount) {
        throw new Error(
          'Toppings workstations must define a minimum topping count.'
        );
      }
      if (!this.config.title) {
        throw new Error(
          'Toppings workstations must define a title.'
        );
      }
      if (!this.toppingClass) {
        throw new Error(
          'Toppings workstations must define a CSS class.'
        );
      }
    },

    toggleToppings: function(val) {
      this.$('.pizza-topping').each(function() {
        $(this).data('plugin_pep').toggle(val);
      });
    },

    _onSetPizza: function() {
      this.toggleToppings(true);
      this.progress = 0;
    },

    _onReleasePizza: function() {
      this.render();
      this.progress = 0;
    },

    onPlace: function($topping) {
      var pep = $topping.data('plugin_pep');
      var goodPlacement = pep && pep.activeDropRegions.length > 0;
      var delta;

      var wasPlaced = !!$topping.data('cee-pizza-is-placed');

      if (wasPlaced !== goodPlacement) {
        delta = wasPlaced ? -1 : 1;
        this.progress += delta;

        if (this.progress === this.config.minToppingCount) {
          this.pizza.set('isReady', true);
        } else if (this.progress < this.config.minToppingCount) {
          this.pizza.set('isReady', false);
        }
      }

      $topping.data('cee-pizza-is-placed', goodPlacement);

      // Freeze toppings in place
      if (goodPlacement) {
        this.pizzaView.placeTopping($topping);
        $.pep.unbind($topping);
      }

      return !goodPlacement;
    },

    makeToppings: function(count) {
      var $platter = this.$('.pizza-workstation-platter');
      var $toppingTemplate = $('<div></div>')
        .addClass('pizza-topping')
        .addClass(this.toppingClass);
      var width = $platter.width();
      var height = $platter.height();
      var idx, $topping;

      $toppingTemplate.css('visibility', 'hidden')
        .appendTo($platter);
      width -= $toppingTemplate.width() +
        (parseInt($toppingTemplate.css('border-left-width'), 10) || 0) +
        (parseInt($toppingTemplate.css('border-right-width'), 10) || 0);
      height -= $toppingTemplate.height() +
        (parseInt($toppingTemplate.css('border-top-width'), 10) || 0) +
        (parseInt($toppingTemplate.css('border-bottom-width'), 10) || 0);
      $toppingTemplate.css('visibility', '').remove();

      for (idx = 0; idx < count; ++idx) {
        $topping = $toppingTemplate.clone();
        $topping
          .css({
            left: Math.round(Math.random() * width) + 'px',
            top: Math.round(Math.random() * height) + 'px'
          })
          .appendTo($platter)
          .pep({
            deferPlacement: true,
            shouldEase: false,
            revert: true,
            place: false,
            overlapFunction: doOverlap,
            droppable: '.pizza-workstation-pizza',
            revertIf: _.bind(this.onPlace, this, $topping)
          });
      }
    },

    afterRender: function() {
      this.makeToppings(freeToppingCount);
    }
  });

  return ToppingsWorkstation;
});
