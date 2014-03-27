define(function(require) {
  'use strict';
  var Layout = require('layoutmanager');
  var _ = require('underscore');

  require('jquery-mobile/js/widgets/forms/rangeslider');
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

  require('css!./range-slider');

  var requiredAttributes = [
    'lowerAttr', 'upperAttr', 'label', 'max', 'min', 'model', 'step'
  ];

  var ControlView = Layout.extend({
    className: 'cee-range-slider',
    template: require('jade!./range-slider'),
    keep: true,

    events: {
      // jQuery UI's slider is built with a `#`-targeted anchor tag, which
      // will trigger navigation in `main.js` if allowed to bubble to the
      // document.
      'click .ui-slider-handle': function(event) {
        event.preventDefault();
        event.stopPropagation();
      },
      'change': 'handleChange'
    },

    initialize: function(options) {
      _.forEach(requiredAttributes, function(attr) {
        if (!(attr in options)) {
          throw new Error(
              'Range Slider component must be initialized with a "' + attr +
              '" option.'
          );
        }
        this[attr] = options[attr];
      },this);
    },

    cleanup: function() {
      this.$('.range-slider-container').rangeslider('destroy');
    },

    afterRender: function() {
      this.$('.range-slider-container').rangeslider({
          theme: 'a',
          highlight: true
        })
        .bind('change', this.handleSlide);
    },

    handleChange: function(event) {
      var value = parseFloat(event.target.value);
      var attr = event.target.dataset.ceeBoundary + 'Attr';
      this.model.set(this[attr], value);
    },

    serialize: function() {
      var templateData = _.pick(this, requiredAttributes);

      templateData.lowerValue = this.model.get(this.lowerAttr);
      templateData.upperValue = this.model.get(this.upperAttr);

      return templateData;
    }
  });

  return ControlView;
});
