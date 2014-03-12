define(function(require) {
  'use strict';
  var Layout = require('layoutmanager');
  var _ = require('underscore');
  require('rangeslider');

  var requiredAttributes = [
    'attr', 'label', 'max', 'min', 'model', 'step'
  ];

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

      this.listenTo(this.model, 'change:' + this.attr, this.render);

      this.handleSlide = _.bind(this.handleSlide, this);
      this.handleSlideEnd = _.bind(this.handleSlideEnd, this);
    },

    beforeRender: function() {
      var oldSlider = this.$('input[type="range"]').data('plugin_rangeslider');

      if (oldSlider) {
        oldSlider.cleanup();
      }
    },

    cleanup: function() {
      this.beforeRender();
    },

    afterRender: function() {
      this.$('input[type="range"]').rangeslider({
        polyfill: false,
        onSlide: this.handleSlide,
        onSlideEnd: this.handleSlideEnd
      });
    },

    handleSlide: function(position, value) {
      if (this.format) {
        value = this.format(value);
      }

      this.$('.value').text(value);
    },

    handleSlideEnd: function(position, value) {
      this.model.set(this.attr, value);
    },

    serialize: function() {
      var templateData = _.pick(this, requiredAttributes);
      var value = this.model.get(this.attr);

      templateData.value = value;

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
