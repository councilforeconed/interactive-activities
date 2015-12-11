define(function(require) {
  'use strict';
  var d3 = require('d3');
  require('d3.chart');

  require('../base-chart/base-chart');
  require('css!./line-and-bubble-chart');

  var LineAndBubble = d3.chart('CEEBase').extend('LineAndBubble', {
    /**
     * Set up the chart.
     *
     * @constructor
     *
     * @argument {Object} [options] Accepts the following attributes:
     *           - {String} [xLabel] Name for x axis
     *           - {String} [yLabel] Name for y axis
     */
    initialize: function() {
      var x = this.x;
      var y = this.y;
      this.line = d3.svg.line()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); });

      this.lineGroup = this.fieldGroup.append('g')
        .classed('line', true);
      this.pointsGroup = this.fieldGroup.append('g')
        .classed('points', true);

      this.layer('line', this.lineGroup, require('./line-layer'));
      this.layer('points', this.pointsGroup, require('./bubble-layer'));

      this.height(300);
      this.width(200);
    },

    extent: function(data) {
      this.x.domain(d3.extent(data, function(d) { return d.x; }));
      this.y.domain(d3.extent(data, function(d) { return d.y; }));

      this._handleContentHeightChange();
      this._handleContentWidthChange();
    }
  });

  return LineAndBubble;
});
