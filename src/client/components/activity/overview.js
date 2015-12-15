define(function(require) {
  'use strict';
  // Number of milliseconds during which a notification should be displayed
  // before being dismissed.
  var NOTIFICATION_LIFETIME = 4 * 1000;

  var Layout = require('layoutmanager');

  require('scripts/jquery.whenanimationend');

  require('css!./overview');

  return Layout.extend({
    className: 'overview',
    template: require('jade!./overview'),
    events: {
      'click .help': 'requestHelp'
    },

    initialize: function(options) {
      this.title = options.title;
      this.image = options.image;
    },

    notify: function(message) {
      this.message = message;
      this.render();

      // Wait until the next turn of the event loop before adding the class in
      // order to properly trigger CSS transitions on the newly-rendered
      // elements.
      setTimeout(function() {
        this.$el.addClass('notify');

        setTimeout(this.dismissNotification.bind(this), NOTIFICATION_LIFETIME);
      }.bind(this), 0);

      return this;
    },

    dismissNotification: function() {
      this.$el.removeClass('notify');
    },

    requestHelp: function() {
      this.trigger('help');
    },

    serialize: function() {
      return {
        title: this.title,
        image: this.image,
        message: this.message || {}
      };
    }
  });
});
