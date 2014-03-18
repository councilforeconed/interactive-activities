define(function(require) {
  'use strict';
  var Model = require('backbone').Model;
  var _ = require('lodash');

  var parameters = require('./parameters');

  var defaults = _.reduce(parameters, function(defaults, param, name) {
    defaults[name] = param.dflt;
    return defaults;
  }, {});

  var ChartState = Model.extend({
    defaults: defaults,
    points: function() {
      var points = [];
      var autonomousTaxes = this.get('autonomousTaxes');
      var rate = this.get('rate');
      var incChange = this.get('incChange');
      var pointCount = this.get('pointCount');
      var i, income, tax;

      for (i = 0; i < pointCount; ++i) {
        income = i * incChange;
        tax = autonomousTaxes + (rate * income);
        points.push({
          x: income,
          y: tax
        });
      }

      return points;
    }
  });

  return ChartState;
});
