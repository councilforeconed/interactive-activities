define(function(require) {
  'use strict';

  var $ = require('jquery');
  var Layout = require('layoutmanager');

  require('css!./navigation');

  var Navigation = Layout.extend({
    tagName: 'nav',
    template: require('jade!./navigation'),
    keep: true,
    events: {
      'click .pizza-paddle': 'navigate'
    },

    initialize: function(options) {
      this.playerModel = options.playerModel;
    },

    navigate: function(event) {
      if (this.$el.hasClass('pizza-disabled')) {
        return;
      }
      var direction = $(event.target).data('pizza-dir');
      this.playerModel.move(direction);
    },

    enable: function() {
      this.$el.removeClass('pizza-disabled');
    },

    disable: function() {
      this.$el.addClass('pizza-disabled');
    }
  });

  return Navigation;
});
