define(function(require) {
  'use strict';

  var Layout = require('layoutmanager');
  var _ = require('lodash');

  var WindowEmitter = require('scripts/window-emitter');
  var BarChart = require('components/bar-chart/bar-chart');

  var ReportView = Layout.extend({
    template: require('jade!./report'),

    initialize: function(options) {
      this.gameState = options.gameState;
      this.barChart = new BarChart(null, {
        xLabel: '# of Chefs',
        yLabel: '# Pizzas Completed'
      });

      this.barChart.height(300);
      this.barChart.width(500);
      this.barChart.margin({ top: 10, right: 40, bottom: 25, left: 60 });
      this.listenTo(WindowEmitter, 'resize', this.resize);
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
      this.barChart.width(this.$el.width());
    }
  });

  return ReportView;
});
