define(function(require) {
  'use strict';
  var Backbone = require('backbone');

  /**
   * A Backbone view that implements general-purpose utilities.
   *
   * @constructor
   */
  var Layout = Backbone.View.extend({
    constructor: function(options) {
      if (options) {
        if (options.preDestroy) {
          this.preDestroy = options.preDestroy;
        }
        if (options.template) {
          this.template = options.template;
        }
        if (options.serialize) {
          this.serialize = options.serialize;
        }
      }

      return Backbone.View.apply(this, arguments);
    },

    /**
     * Set the content of the view's top-level element by expanding its
     * {@link Layout#template} method with the result of {@link
     * Layout#serialize}.
     */
    render: function() {
      this.$el.html(this.template(this.serialize()));
      return this;
    },

    /**
     * Define the data to use when expanding the view's template.
     *
     * @this Layout
     * @abstract
     *
     * @returns {Object} The view's data to be passed to {@link
     *                   Layout#template}.
     */
    serialize: function() {},

    /**
     * Define the view's markup. This method will be supplied the result of
     * {@link Layout#serialize} with each invocation of {@link Layout#render}.
     *
     * @this Layout
     * @abstract
     *
     * @returns {String} Markup
     */
    template: function() {},

    /**
     * Behavior to be executed at the onset of any destroy operation. See
     * {@link Layout#destroy}.
     *
     * @abstract
     */
    preDestroy: function() {},

    /**
     * Safely clean up the view by emptying its content and unbinding all event
     * handlers.
     */
    destroy: function() {
      this.preDestroy();
      this.$el.empty();
      this.stopListening();
    }
  });

  return Layout;
});
