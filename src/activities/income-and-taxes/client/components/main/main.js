define(function(require) {
  'use strict';
  var $ = require('jquery');
  var _ = require('lodash');

  var ActivityView = require('components/activity/activity');
  var Chart = require('components/line-and-bubble-chart/line-and-bubble-chart');
  var Slider = require('components/slider/slider');
  var ChartState = require('../../scripts/model');
  var parameters = require('../../scripts/parameters');

  require('css!./main');

  var $window = $(window);

  var MainView = ActivityView.extend({
    homeTemplate: require('jade!./main'),
    config: require('json!../../../config.json'),
    description: require('jade!../../description')(),
    instructions: require('jade!../../instructions')(),

    initialize: function() {
      var chart = this.chart = new Chart(null, {
        xLabel: 'Income ($)',
        yLabel: 'Tax ($)'
      });
      this.setExtent();

      chart
        .yAxisWidth(70)
        .xAxisHeight(45)
        .xAxisPadding(30);
      chart.height(300);

      this.chartState = new ChartState();
      this.listenTo(this.chartState, 'change', this.drawChart);

      // Ensure the chart is properly redrawn as the viewport width changes
      this._throttledResize = _.throttle(_.bind(this.resize, this, 500));
      $window.on('resize', this._throttledResize);

      this.drawChart();

      this.insertView('.it-controls', new Slider(_.extend({
        tagName: 'li',
        model: this.chartState,
        attr: 'autonomousTaxes'
      }, parameters.autonomousTaxes)));

      this.insertView('.it-controls', new Slider(_.extend({
        tagName: 'li',
        model: this.chartState,
        attr: 'rate'
      }, parameters.rate)));

      this.insertView('.it-controls', new Slider(_.extend({
        tagName: 'li',
        model: this.chartState,
        attr: 'incChange'
      }, parameters.incChange)));
    },

    setExtent: function() {
      var maxState = new ChartState({
        autonomousTaxes: parameters.autonomousTaxes.max,
        rate: parameters.rate.max,
        incChange: parameters.incChange.max
      });

      this.chart.extent(maxState.points());
    },

    resize: function() {
      this.chart.width(this.$('.it-chart').width());
    },

    afterRender: function() {
      this.$('.it-chart').append(this.chart.base.node());

      this.resize();
    },

    drawChart: function() {
      this.chart.draw(this.chartState.points());
    },

    cleanup: function() {
      $window.off('resize', this._throttledResize);
    }
  });

  return MainView;
});
