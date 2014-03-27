define(function(require) {
  'use strict';
  var Model = require('backbone').Model;
  var _ = require('lodash');

  var parameters = require('./parameters');

  var defaults = _.reduce(parameters, function(defaults, param, name) {
    defaults[name] = param.dflt;
    return defaults;
  }, {});

  defaults.yLowerUSD = parameters.yLimitsUSD.min;
  defaults.yUpperUSD = parameters.yLimitsUSD.max;
  defaults.yLowerPct = parameters.yLimitsPct.min;
  defaults.yUpperPct = parameters.yLimitsPct.max;
  defaults.xLower = parameters.xLimits.min;
  defaults.xUpper = parameters.xLimits.max;

  var ChartState = Model.extend({
    defaults: defaults,
    validate: function(data) {
      if (!(data.yUnit in parameters.yUnit.values)) {
        return new Error('WhenGraphsMislead: Attribute "yUnit" ' +
          'value unrecognized: "' + data.yUnit + '"');
      }
    },
    toUrl: function() {
      var yUnit = this.get('yUnit');
      return 'yUnit=' + yUnit + '&yBounds=' +
          [this.get('yLower' + yUnit), this.get('yUpper' + yUnit)].toString() +
          '&xBounds=' + [this.get('xLower'), this.get('xUpper')].toString();
    },
    fromUrl: function(str) {
      var attrs = {};
      var yUnit, yBounds, xBounds;

      _.forEach(str.split('&'), function(keyVal) {
        keyVal = keyVal.split('=');
        attrs[keyVal[0]] = keyVal[1];
      });

      yUnit = attrs.yUnit;

      // "1.3,4.3" -> [1.3, 4.3]
      yBounds = attrs.yBounds.split(',').map(parseFloat);
      delete attrs.yBounds;
      xBounds = attrs.xBounds.split(',').map(parseFloat);
      delete attrs.xBounds;

      attrs['yLower' + yUnit] = yBounds[0];
      attrs['yUpper' + yUnit] = yBounds[1];
      attrs.xLower = xBounds[0];
      attrs.xUpper = xBounds[1];

      this.set(attrs, { validate: true });
    }
  });

  return ChartState;
});
