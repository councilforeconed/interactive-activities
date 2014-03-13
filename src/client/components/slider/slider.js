define(function(require) {
  'use strict';
  var Layout = require('layoutmanager');
  var _ = require('underscore');
  require('rangeslider');

  var requiredAttributes = [
    'attr', 'label', 'max', 'min', 'model', 'step'
  ];

  var decimalRe = /\.(\d+)$/;
  /**
   * Given a number, return a power of ten reflecting the number of decimal
   * places necessary to represent that number. For example
   *
   * getPrecision(10.45) === 100
   */
  function getPrecision(number) {
    var match = String(number).match(decimalRe);
    if (match) {
      return 10 * match[1].length;
    }
    return 1;
  }

  var ControlView = Layout.extend({
    className: 'slider',
    template: require('jade!./slider'),
    keep: true,

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

      // rangeslider.js does not behave correctly for range inputs with
      // floating-point values. Record the precision of the `step` option so
      // all range-related options can be converted to whole numbers. This
      // conversion is done consistently throughout the component so that
      // consumers are not exposed to the implementation detail.
      // https://github.com/andreruffert/rangeslider.js/pull/13
      this.precision = getPrecision(this.step);

      this.listenTo(this.model, 'change:' + this.attr, this.render);

      this.handleSlide = _.bind(this.handleSlide, this);
      this.handleSlideEnd = _.bind(this.handleSlideEnd, this);
    },

    afterRender: function() {
      this.$('input[type="range"]').rangeslider({
        polyfill: false,
        onSlide: this.handleSlide,
        onSlideEnd: this.handleSlideEnd
      });
    },

    handleSlide: function(position, value) {
      value /= this.precision;

      if (this.format) {
        value = this.format(value);
      }

      this.$('.value').text(value);
    },

    handleSlideEnd: function(position, value) {
      this.model.set(this.attr, value / this.precision);
    },

    serialize: function() {
      var templateData = _.pick(this, requiredAttributes);
      var value = this.model.get(this.attr);

      templateData.value = value;

      _.forEach(['min', 'max', 'value', 'step'], function(attr) {
        templateData[attr] *= this.precision;
      }, this);

      if (this.format) {
        templateData.formattedValue = this.format(value);
      } else {
        templateData.formattedValue = value;
      }

      return templateData;
    }
  });

  return ControlView;
});
