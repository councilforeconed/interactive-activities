define(function(require) {
  'use strict';
  var Layout = require('layoutmanager');

  var formatters = require('scripts/formatters');
  var template = require('jade!./controls');
  var Slider = require('components/slider/slider');

  require('css!./controls');

  var ControlsView = Layout.extend({
    className: 'mc-controls',

    template: function(data) {
      data.formatters = formatters;
      return template(data);
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.setView('.ratio-slider', new Slider({
        label: 'Reserve Ratio',
        min: 5,
        max: 70,
        step: 1,
        attr: 'ratio',
        format: function(val) { return val + '%'; },
        model: this.model
      }));
    },

    serialize: function() {
      return this.model.toJSON();
    }
  });

  return ControlsView;
});
