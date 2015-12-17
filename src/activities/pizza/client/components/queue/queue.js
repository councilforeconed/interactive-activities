define(function(require) {
  'use strict';

  var Layout = require('layoutmanager');
  var _ = require('lodash');

  var QueuePizza = require('../queue-pizza/queue-pizza');

  require('css!./queue');

  var QueueView = Layout.extend({
    tagName: 'ul',
    className: 'pizza-queue',
    template: require('jade!./queue'),
    keep: true,

    initialize: function(options) {
      this.playerModel = options.playerModel;
      this.gameState = options.gameState;

      this.collection.each(this.insertPizza, this);

      this.listenTo(this.collection, 'add', this.insertPizza);
      this.listenTo(this.collection, 'complete', this.removePizza);
      this.listenTo(this.collection, 'localOwnerTake', this.handleTake);
      this.listenTo(this.collection, 'localOwnerRelease', this.handleDrop);
      this.listenTo(this.collection, 'change:isReady', this.render);
      this.listenTo(this.collection, 'change:ownerID', this.render);
    },

    insertPizza: function(model) {
      var view = new QueuePizza({
        model: model,
        playerModel: this.playerModel
      });
      var containerSelector = '[data-pizza-id="' + model.get('id') + '"]';

      // During drag operations, the "queue pizza" elements are removed from
      // the document flow and positioned absolutely. Explicitly set the
      // dimensions of the containing element at that time so the queue does
      // not "collapse."
      this.listenTo(view, 'startDrag', function() {
        var $container = this.$(containerSelector);
        $container.height(view.$el.height());
        $container.width(view.$el.width());
      });

      this.insertView(containerSelector, view);
    },

    removePizza: function(model) {
      this.removeView('[data-pizza-id="' + model.get('id') + '"]');
      this.render();
    },

    handleTake: function() {
      this.toggleDraggables(false);
    },

    handleDrop: function() {
      this.toggleDraggables(true);
    },

    activePizzas: function() {
      return this.collection.active(this.gameState.get('roundNumber'));
    },

    toggleDraggables: function(val) {
      _.forEach(this.activePizzas(), function(pizza) {
        this.getView('[data-pizza-id="' + pizza.get('id') + '"]')
          .toggleDrag(val);
      }, this);
    },

    serialize: function() {
      return {
        pizzas: _.map(this.activePizzas(), function(model) {
          return model.toJSON();
        })
      };
    }
  });

  return QueueView;
});
