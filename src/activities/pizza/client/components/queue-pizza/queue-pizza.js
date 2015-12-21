define(function(require) {
  'use strict';

  var _ = require('lodash');
  var Layout = require('layoutmanager');

  require('css!./queue-pizza');
  require('jquery.pep');

  var QueuePizza = Layout.extend({
    className: 'pizza-queue-pizza',
    template: require('jade!./queue-pizza'),
    keep: true,

    initialize: function(options) {
      this.isDraggable = true;

      this.onStop = _.bind(this.onStop, this);

      this.playerModel = options.playerModel;
      this.listenTo(this.model, 'change:foodState', this.render);
    },

    onStop: function() {
      var alreadyOwns = this.model.get('ownerID') !== null;

      if (alreadyOwns) {
        return;
      }

      if (!this.isOverWorkstation()) {
        return;
      }

      if (!this.model.mayPlaceIn(this.playerModel.get('workstation'))) {
        this.trigger('notification', {
          type: 'error',
          title: 'Whoops!',
          details: 'You can\'t work on that pizza in this workstation.'
        });
        return;
      }

      this.model.set('ownerID', this.model.constructor.localPlayerID);
    },

    toggleDrag: function(value) {
      var pep = this.$el.data('plugin_pep');

      // Store the latest value so it can be referenced during future render
      // operations.
      this.isDraggable = value;

      // The DOM node may not have an associated `jQuery.pep` instance if the
      // layout has been removed since the drag operation began.
      if (pep) {
        pep.toggle(value);
      }
    },

    isOverWorkstation: function() {
      var pep = this.$el.data('plugin_pep');
      // TODO: Remove the "guard" check for `pep.activeDropRegions` (and simply
      // test the length of that array) when the underlying bug in the
      // jQuery.pep plugin is resolved:
      // https://github.com/briangonzalez/jquery.pep.js/pull/113
      return pep && pep.activeDropRegions && pep.activeDropRegions.length > 0;
    },

    afterRender: function() {
      this.$el.removeAttr('style');
      this.$el.pep({
        deferPlacement: true,
        // Dragging removes the element from the document flow; alert the
        // parent view of this event so it may take any precautions necessary
        // to preserve layout geometry.
        initiate: _.bind(function() {
          this.trigger('startDrag');
        }, this),
        revert: true,
        shouldEase: false,
        // The "queue pizza" is hidden after it is placed, so it may be
        // reverted to the queue in all cases.
        revertIf: function() { return true; },
        droppable: '.pizza-workstation-surface',
        droppableActiveClass: 'pizza-workstation-active',
        stop: this.onStop
      });
      this.toggleDrag(this.isDraggable);

      this.$el.attr('data-foodstate', this.model.get('foodState'));
    },

    serialize: function() {
      return {
        foodStateChar: this.model.get('foodState')[0].toUpperCase()
      };
    }
  });

  return QueuePizza;
});
