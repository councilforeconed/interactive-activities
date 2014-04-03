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
      this.insertView('[data-pizza-id="' + model.get('id') + '"]', view);
    },

    removePizza: function(model) {
      this.removeView('[data-pizza-id="' + model.get('id') + '"]');
      this.render();
    },

    handleTake: function(pizza) {
      this.toggleDraggables(false);
      this.getView('[data-pizza-id="' + pizza.get('id') + '"]')
        .$el.hide();
    },

    handleDrop: function() {
      this.toggleDraggables(true);
    },

    toggleDraggables: function(val) {
      _.forEach(this.collection.active(), function(pizza) {
        this.getView('[data-pizza-id="' + pizza.get('id') + '"]')
          .toggleDrag(val);
      }, this);
    },

    serialize: function() {
      var activePizzas = this.collection.active();
      return {
        pizzas: _.map(activePizzas, function(model) {
          return model.toJSON();
        })
      };
    }
  });

  return QueueView;
});
