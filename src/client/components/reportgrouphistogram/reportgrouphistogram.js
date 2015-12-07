define(function(require) {
  'use strict';

  var $ = require('jquery');
  var _ = require('lodash');

  var BarChart = require('components/bar-chart/bar-chart');

  var $window = $(window);
  var toCSV = function(attrList, dataPoint) {
    return _.map(attrList, function(attr) {
      return dataPoint[attr];
    }).join(',');
  };

  var makeBarChart = function(data) {
    var barChart = new BarChart(null, {
      xLabel: 'Trader ID',
      yLabel: 'Earnings ($)'
    });
    var buyers = _.groupBy(data, 'buyerID');
    var sellers = _.groupBy(data, 'sellerID');
    var earningsById = [];
    var binned;

    _.forEach(buyers, function(txns, id) {
      earningsById[id] = _.reduce(txns, function(tot, txn) {
        return tot + txn.buyerTarget - txn.amount;
      }, 0);
    });

    _.forEach(sellers, function(txns, id) {
      earningsById[id] = _.reduce(txns, function(tot, txn) {
        return tot + txn.amount - txn.sellerTarget;
      }, 0);
    });

    // Fill sparse array in with zeros
    binned = _.map(earningsById, function(val) {
      return val || 0;
    });

    barChart.height(300);
    barChart.width(500);
    barChart
      .yAxisWidth(60)
      .yAxisPadding(10)
      .xAxisHeight(35);
    barChart.extent(binned);
    barChart.draw(binned);

    return barChart;
  };

  var makeCSV = function(data) {
    var columns = [
      'amount', 'buyerID', 'buyerTarget', 'sellerID', 'sellerTarget',
      'timeStamp'
    ];

    return columns.join(',') + '\n' +
      _.map(data, _.bind(toCSV, null, columns)).join('\n');
  };

  var makeGroupReport = function(groupData, groupName) {
    var $container = $('<div>');
    var barChart = makeBarChart(groupData);
    var csv = makeCSV(groupData);

    $('<h2>')
      .text('Group: ' + groupName)
      .appendTo($container);
    $('<h3>')
      .text('Earnings')
      .appendTo($container);
    $container.append(barChart.base.node());
    $('<h3>')
      .text('Data')
      .appendTo($container);
    $('<textarea>')
      .prop('disabled', true)
      .text(csv)
      .appendTo($container);

    return {
      $container: $container,
      barChart: barChart
    };
  };

  var resetWidths = function(reports) {
    _.forEach(reports, function(report) {
      report.barChart.width($window.width());
    });
  };

  var reports = _.map($.parseJSON($('#report-data').text()), makeGroupReport);

  $(function() {
    var $body = $(document.body);

    _.forEach(reports, function(report) {
      $body.append(report.$container);
    });

    resetWidths(reports);

    $window.on('resize', _.throttle(function() {
      resetWidths(reports);
    }, 300));
  });
});
