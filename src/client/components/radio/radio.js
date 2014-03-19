define(function(require) {
  'use strict';
  var Layout = require('layoutmanager');

  var Radio = Layout.extend({
    className: 'cee-radio-component',
    template: require('jade!./radio'),

    events: {
      'change input[type="radio"]': 'handleChange'
    },

    initialize: function(options) {
      this.label = options.label;
      this.values = options.values;
      this.model = options.model;
      this.attr = options.attr;

      this.listenTo(this.model, 'change:' + this.attr, this.render);
    },

    handleChange: function(event) {
      this.model.set(this.attr, event.target.value);
    },

    serialize: function() {
      return {
        label: this.label,
        values: this.values,
        value: this.model.get(this.attr)
      };
    }
  });

  return Radio;
});
