define(function(require) {
  'use strict';
  var Layout = require('layoutmanager');
  var _ = require('lodash');

  var formatters = require('scripts/formatters');
  var template = require('jade!./controls');
  require('rangeslider');
  require('css!./controls');

  var ControlsView = Layout.extend({
    className: 'mc-controls',

    template: function(data) {
      data.formatters = formatters;
      return template(data);
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.updateRatio = _.bind(this.updateRatio, this);
      this.setRatio = _.bind(this.setRatio, this);
    },

    afterRender: function() {
      this.$('input[type="range"]').rangeslider({
        polyfill: false,
        onSlide: this.updateRatio,
        onSlideEnd: this.setRatio
      });
    },

    updateRatio: function(position, value) {
      this.$('.ratio').text(value);
    },

    setRatio: function(position, value) {
      this.model.set('ratio', value);
    },

    serialize: function() {
      return this.model.toJSON();
    }
  });

  return ControlsView;
});
