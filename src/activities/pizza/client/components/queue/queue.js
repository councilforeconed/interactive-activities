define(function(require) {
  'use strict';

  var Layout = require('layoutmanager');

  var QueuePizza = require('../queue-pizza/queue-pizza');

  require('css!./queue');

  var QueueView = Layout.extend({
    tagName: 'ul',
    className: 'pizza-queue',
    template: require('jade!./queue'),

    initialize: function(options) {
      this.localPlayer = options.localPlayer;

      this.listenTo(this.collection, 'add', this.insertPizza);
      this.listenTo(this.collection, 'change:ownerID', this.handleOwnerChange);
    },

    insertPizza: function(model) {
      var view = new QueuePizza({ keep: true, model: model });
      this.insertView('[data-pizza-id="' + model.get('id') + '"]', view);
    },

    handleOwnerChange: function(changing) {
      if (changing.localIsTaking()) {
        this.handleTake();
      } else if (changing.localIsDropping()) {
        this.handleRelease();
      }
    },

    handleTake: function() {
      this.toggleDraggables(false);
    },

    handleRelease: function() {
      this.toggleDraggables(true);
    },

    toggleDraggables: function(val) {
      this.collection.each(function(pizza) {
        this.getView('[data-pizza-id="' + pizza.get('id') + '"]')
          .toggleDrag(val);
      }, this);
    },

    serialize: function() {
      return {
        pizzas: this.collection.toJSON()
      };
    }
  });

  return QueueView;
});
