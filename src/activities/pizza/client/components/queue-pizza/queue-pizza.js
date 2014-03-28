define(function(require) {
  'use strict';

  var _ = require('lodash');
  var Layout = require('layoutmanager');

  require('css!./queue-pizza');
  require('jquery.pep');

  var QueuePizza = Layout.extend({
    className: 'pizza-queue-pizza',
    template: require('jade!./queue-pizza'),
    initialize: function() {

      this.revertIf = _.bind(function() {
        return !this.isOverWorkstation();
      }, this);
      this.onStop = _.bind(this.onStop, this);

      this.$el.pep({
        deferPlacement: true,
        revert: true,
        shouldEase: false,
        revertIf: this.revertIf,
        droppable: '.pizza-workstation',
        droppableActiveClass: 'pizza-workstation-active',
        stop: this.onStop
      });
    },

    finishBuild: function() {
      this.toggleDrag(true);

      this.listenToOnce(this.model, 'change:ownerID', function() {
        this.model.nextStep();
      });
    },

    onStop: function() {
      var alreadyOwns = this.model.get('ownerID') !== null;
      if (this.isOverWorkstation()) {
        if (alreadyOwns) {
          return;
        }

        this.model.set('ownerID', this.model.constructor.localPlayerID);

        // Simulate delay where player adds ingredients to pizza, then allow
        // pizza to be returned.
        setTimeout(_.bind(function() {
          this.finishBuild();
        }, this), 3000);
      } else {
        if (!alreadyOwns) {
          return;
        }

        this.model.set('ownerID', null);
      }
    },

    toggleDrag: function(value) {
      this.$el.data('plugin_pep').toggle(value);
    },

    isOverWorkstation: function() {
      return this.$el.data('plugin_pep').activeDropRegions.length > 0;
    }
  });

  return QueuePizza;
});
