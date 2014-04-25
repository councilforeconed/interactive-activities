define(function(require) {
  'use strict';
  var d3 = require('d3');

  require('../base-chart/base-chart');
  require('css!./bar-chart');

  var offset = 0;
  // Amount of a bar's maximum available horitontal space to use to draw the
  // bar.
  var widthPct = 0.5;
  // Amount to "pad" below the first bar and after the last bar (as a
  // percentage of a single bar's maximum available horizontal space)
  var padPct = 0.5;

  var BarChart = d3.chart('CEEBase').extend('BarChart', {
    initialize: function() {
      this.base.classed('cee-bar-chart', true);

      this.layer('Bars', this.fieldGroup.append('g'), {
        dataBind: function(data) {
          return this.selectAll('.bar').data(data);
        },
        insert: function() {
          return this.append('rect').classed('bar', true);
        },
        events: {
          enter: function() {
            var chart = this.chart();

            this.attr('height', 0)
              .attr('y', chart.y(0));
          },
          merge: function() {
            var chart = this.chart();
            var barWidth = chart.x(offset - padPct + widthPct);

            this.attr('width', barWidth)
              .attr('x', function(d, i) {
                return chart.x(i + offset) - (barWidth / 2);
              });
          },
          'merge:transition': function() {
            var chart = this.chart();
            var zero = chart.y(0);

            this.duration(900)
              .attr('height', function(d) {
                return Math.abs(zero - chart.y(d));
              })
              .attr('y', function(d) {
                return Math.min(zero, chart.y(d));
              });
          }
        }
      });
    },

    extent: function(data) {
      // In order to ensure that the chart always contains the zero y-axis
      // crossing (even when all values are greater than zero or all values are
      // less than zero), artificially insert a zero into the set used to
      // calculate the Y domain.
      var withZero = [0].concat(data);

      this.y.domain([d3.min(withZero), d3.max(withZero)]);
      this.x.domain([offset - padPct, data.length + (offset * padPct)]);

      // Because the barchart is intended to be used as a histogram,
      // intermediate values have no significance. Ensure that d3 does not
      // render "tick" marks for these values by explicitly setting the number
      // of ticks according to the number of data points.
      this.xAxis.ticks(data.length);

      this._handleContentHeightChange();
      this._handleContentWidthChange();
    }
  });

  return BarChart;
});
