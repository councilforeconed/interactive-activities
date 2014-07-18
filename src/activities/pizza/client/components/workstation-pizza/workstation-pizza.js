define(function(require) {
  'use strict';

  var Layout = require('layoutmanager');
  var _ = require('lodash');

  require('css!./workstation-pizza');
  require('jquery.pep');

  var WorkstationPizza = Layout.extend({
    className: 'pizza-workstation-pizza',
    template: require('jade!./workstation-pizza'),

    initialize: function() {
      this.listenTo(this.model, 'change:foodState', this.render);

      this.$el.pep({
        shouldEase: false,
        droppable: '.pizza-queue',
        revert: true,
        revertIf: _.bind(this.revertIf, this)
      });
      // jQuery.pep sets the element's CSS `position` property to `absolute`,
      // which interferes with its rendering method (specifically, `width:
      // 100%`). Explicitly over-ride this setting, which is not necessary when
      // easing is disabled.
      this.$el.css('position', '');
    },

    afterRender: function() {
      var imgSrc = '/activities/pizza/client/images/workstation-pizzas/' +
        this.model.get('foodState') + '.png';
      this.$('img').attr('src', imgSrc);
    },

    /**
     * Insert the given element into the view's "toppings" container, ensuring
     * that its spatial position (relevant to the document) remains constant.
     */
    placeTopping: function($topping) {
      var $toppingsContainer = this.$('.toppings');
      var containerOffset = $toppingsContainer.offset();
      var toppingOffset = $topping.offset();
      var newPosition = {
        top: toppingOffset.top - containerOffset.top,
        left: toppingOffset.left - containerOffset.left
      };

      $topping
        // Remove all dynamically-calculated styling
        .removeAttr('style')
        .css(newPosition);

      $toppingsContainer.append($topping);
    },

    revertIf: function() {
      var overQueue = this.isOverPizzaQueue();

      if (overQueue) {
        this.model.set('ownerID', null);
      }

      return !overQueue;
    },

    isOverPizzaQueue: function() {
      var pep = this.$el.data('plugin_pep');

      // The DOM node may not have an associated `jQuery.pep` instance if the
      // layout has been removed since the drag operation began.
      return pep && pep.activeDropRegions.length > 0;
    }
  });

  return WorkstationPizza;
});
