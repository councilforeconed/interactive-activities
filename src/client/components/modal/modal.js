define(function(require) {
  'use strict';
  var Layout = require('layoutmanager');
  require('css!./modal');

  var Modal = Layout.extend({
    className: 'modal',
    template: require('jade!./modal'),
    events: {
      'click .dismiss': 'requestDismiss',
      'click .screen': 'requestDismiss'
    },
    initialize: function(options) {
      this.mayDismiss = options && options.mayDismiss;
      this.content = options && options.content;
      this.setView('.content', this.content);
    },

    serialize: function() {
      return {
        mayDismiss: this.mayDismiss
      };
    },

    /**
     * Dismiss the modal regardless of its current state.
     */
    dismiss: function() {
      this.$el.hide();
    },

    /**
     * Dismiss the modal only if its current state allows it.
     */
    requestDismiss: function() {
      if (!this.mayDismiss) {
        return;
      }
      this.dismiss();
    },

    /**
     * Display the modal
     *
     * @param {Object} [options] May specify the following attributes:
     * - {Boolean} mayDismiss If true, the modal can be dismissed via its
     *   "Close" button or via clicking on its "screen" element.
     */
    summon: function(options) {
      if (options && 'mayDismiss' in options) {
        this.mayDismiss = options.mayDismiss;
      }
      this.render();
      this.$el.show();
    }
  });

  return Modal;
});
