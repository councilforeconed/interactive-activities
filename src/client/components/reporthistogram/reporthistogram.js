define(function(require) {
  'use strict';

  var $ = require('jquery');
  var _ = require('lodash');

  var BarChart = require('components/bar-chart/bar-chart');

  var report = _.map($.parseJSON($('#report-data').text()), function(counts) {
    var sum;

    if (!counts) {
      return 0;
    }

    sum = _.reduce(counts, function(total, next) {
      return total + next;
    }, 0);

    return sum / counts.length;
  });

  var barChart = new BarChart(null, {
    xLabel: 'Number of Chefs',
    yLabel: 'Average Number of Pizzas Completed',
    omitZero: true
  });

  barChart.height(300);
  barChart.width(500);
  barChart
    .yAxisWidth(60)
    .yAxisPadding(10)
    .xAxisHeight(35);

  $(function() {
    $('#bar-chart').append(barChart.base.node());
    barChart.extent(report);
    barChart.draw(report);
    $('#raw-data').text(report.join(','));
  });
});
