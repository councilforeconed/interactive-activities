define(function(require) {
  'use strict';

  var Layout = require('layoutmanager');
  var _ = require('lodash');
  var $ = require('jquery');

  var WindowEmitter = require('scripts/window-emitter');
  var BarChart = require('components/bar-chart/bar-chart');

  var ReportView = Layout.extend({
    template: require('jade!./report'),

    initialize: function(options) {
      this.gameState = options.gameState;
      this.barChart = new BarChart(null, {
        xLabel: 'Number of Chefs',
        yLabel: 'Average Number of Pizzas Completed',
        omitZero: true
      });

      this.barChart.height(300);
      this.barChart.width(500);
      this.barChart
        .yAxisWidth(60)
        .yAxisPadding(10)
        .xAxisHeight(40);
      this.listenTo(WindowEmitter, 'resize', this.resize);
      /**
       * Last-minute pizza completions may not propagate to all clients by the
       * time the endgame report is rendered. Listen for such changes and
       * re-render the chart as they occur.
       */
      this.listenTo(this.gameState.get('pizzas'), 'change', this.draw);
    },

    draw: function() {
      var report = this.gameState.report();
      var histogram = [];

      // Create a "bin" for each player count in the report--the value of which
      // is the number of pizzas created by that group of active players.
      _.forEach(report, function(round) {
        histogram[round.playerCount] = round.pizzaCount;
      });
      // Because the array created by the previous operation will be sparse,
      // map over all values and replace falsey values with `0`.
      histogram = _.map(histogram, function(val) {
        return val || 0;
      });

      this.barChart.extent(histogram);
      this.barChart.draw(histogram);
      this.render();
    },

    afterRender: function() {
      this.$el.append(this.barChart.base.node());
      this.barChart.width(this.$el.width());
    },

    resize: function() {
      if (!$.contains(document, this.el)) {
        return;
      }
      this.barChart.width(this.$el.width());
    }
  });

  return ReportView;
});
