define(function(require) {
  'use strict';
  var d3 = require('d3');

  require('../base-chart/base-chart');
  require('css!./bar-chart');

  var offset = 1;
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
            var height = chart.height();

            this.attr('height', 0)
              .attr('y', height);
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
            var height = chart.height();

            this.duration(900)
              .attr('height', function(d) {
                return height - chart.y(d);
              })
              .attr('y', chart.y);
          }
        }
      });
    },

    extent: function(data) {
      this.y.domain([0, d3.max(data)]);
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
