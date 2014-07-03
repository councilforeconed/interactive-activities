define(function(require) {
  'use strict';
  var Layout = require('layoutmanager');
  var _ = require('underscore');

  require('jquery-mobile/js/widgets/forms/slider');
  /**
   * The Slider widget has an implicit dependency on the `events` module.
   * Therefore, this module must be loaded explicitly.
   *
   * TODO: Remove this statement when bug 7274 is resolved:
   * https://github.com/jquery/jquery-mobile/pull/7274
   */
  require('jquery-mobile/js/jquery.mobile.events');

  /**
   * jQuery Mobile components do not express CSS dependencies. Instead of
   * attempting to maintain a list of the specific stylesheets necessary to
   * render the "range" slider (along with the default theme), check in and
   * include the built styles for the current version of jQuery Mobile.
   * This file will need to be manually synchronized with the Bower dependency
   * on jQuery Mobile until that project correctly expresses CSS dependencies.
   */
  require('css!./jquery.mobile-1.4.2');

  require('css!./slider');

  var requiredAttributes = [
    'attr', 'label', 'max', 'min', 'model', 'step'
  ];

  var ControlView = Layout.extend({
    className: 'cee-slider',
    template: require('jade!./slider'),
    keep: true,

    events: {
      // jQuery UI's slider is built with a `#`-targeted anchor tag, which
      // will trigger navigation in `main.js` if allowed to bubble to the
      // document.
      'click .ui-slider-handle': function(event) {
        event.preventDefault();
        event.stopPropagation();
      },
      'change .ui-slider-input': 'handleChange'
    },

    initialize: function(options) {
      _.forEach(requiredAttributes, function(attr) {
        if (!(attr in options)) {
          throw new Error(
              'Slider component must be initialized with a "' + attr +
              '" option.'
          );
        }
        this[attr] = options[attr];
      },this);

      this.format = options.format;

      this.listenTo(this.model, 'change:' + this.attr, this.render);

      this.handleChange = _.bind(this.handleChange, this);
    },

    cleanup: function() {
      this.$('input').slider('destroy');
    },

    afterRender: function() {
      this.$('input').slider({
        theme: 'a',
        highlight: true,
        stop: this.handleChange
      });
    },

    handleChange: function() {
      var value = parseFloat(this.$('input').val());
      this.model.set(this.attr, value);
    },

    serialize: function() {
      var templateData = _.pick(this, requiredAttributes);
      var value = this.model.get(this.attr);

      templateData.value = value;

      return templateData;
    }
  });

  return ControlView;
});
