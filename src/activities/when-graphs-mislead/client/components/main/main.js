define(function(require) {
  'use strict';
  var $ = require('jquery');
  var _ = require('lodash');
  var d3 = require('d3');

  var ActivityView = require('components/activity/activity');
  var Chart = require('components/line-and-bubble-chart/line-and-bubble-chart');
  var RangeSlider = require('components/range-slider/range-slider');
  var Radio = require('components/radio/radio');
  var ChartState = require('../../scripts/model');
  var parameters = require('../../scripts/parameters');
  var fragmentData = require('scripts/fragment-data');
  var WindowEmitter = require('scripts/window-emitter');

  require('css!./main');

  // Normalize input data
  var gdpData = {
    raw: require('../../scripts/data'),
  };
  gdpData.normalized = _.map(gdpData.raw, function(point) {
    return {
      x: point.year,
      y: point.gdp
    };
  });
  gdpData.USD = gdpData.normalized.slice();
  gdpData.Pct = _.map(gdpData.normalized, function(current, index, set) {
    var previous = set[index - 1];
    if (!previous) {
      return { y: 1, x: current.x };
    }
    return { y: 1 + ((current.y - previous.y) / previous.y), x: current.x };
  });

  var yearFormat = d3.format('4');

  var tickFormatters = {
    Pct: d3.format('%'),
    USD: d3.format('$,2')
  };

  var MainView = ActivityView.extend({
    homeTemplate: require('jade!./main'),
    config: require('json!../../../config.json'),
    description: require('jade!../../description')(),
    instructions: require('jade!../../instructions')(),

    initialize: function() {
      var chart = this.chart = new Chart(null, {
        xLabel: 'Year'
      });
      var initialState;

      chart
        .yAxisWidth(90)
        .yAxisPadding(5)
        .xAxisHeight(40)
        .xAxisPadding(20)
        .height(300);
      chart.xAxis.tickFormat(yearFormat);

      this.chartState = new ChartState();
      this.listenTo(this.chartState, 'change', function() {
        fragmentData.set(this.chartState.toUrl());
      });
      this.listenTo(this.chartState, 'change', this.drawChart);

      // Ensure the chart is properly redrawn as the viewport width changes
      this.listenTo(WindowEmitter, 'resize', this.resize);

      this.insertView('.wgdu-controls', new Radio(_.extend({
        tagName: 'li',
        model: this.chartState,
        attr: 'yUnit'
      }, parameters.yUnit)));

      this.sliders = {
        yLimits: {}
      };

      this.sliders.yLimits.USD = new RangeSlider(_.extend({
        tagName: 'li',
        model: this.chartState,
        lowerAttr: 'yLowerUSD',
        upperAttr: 'yUpperUSD'
      }, parameters.yLimitsUSD));

      this.sliders.yLimits.Pct = new RangeSlider(_.extend({
        tagName: 'li',
        model: this.chartState,
        lowerAttr: 'yLowerPct',
        upperAttr: 'yUpperPct'
      }, parameters.yLimitsPct));

      this.sliders.xLimits = new RangeSlider(_.extend({
        tagName: 'li',
        model: this.chartState,
        lowerAttr: 'xLower',
        upperAttr: 'xUpper',
      }, parameters.xLimits));

      this.insertView('.wgdu-controls', this.sliders.yLimits.USD);
      this.insertView('.wgdu-controls', this.sliders.yLimits.Pct);
      this.insertView('.wgdu-controls', this.sliders.xLimits);

      initialState = fragmentData.get();
      if (initialState) {
        this.chartState.fromUrl(fragmentData.get());
      }

      this.drawChart();
    },

    resize: function() {
      this.chart.width(this.$('.wgdu-chart').width());
    },

    afterRender: function() {
      this.$('.wgdu-chart').append(this.chart.base.node());

      this.resize();
    },

    drawChart: function() {
      var yUnit = this.chartState.get('yUnit');
      var data = gdpData[yUnit];
      var extent;

      this.chart.yAxisLabel.text(parameters.yUnit.values[yUnit]);

      this.sliders.yLimits[yUnit].$el.show();
      this.sliders.yLimits[yUnit === 'USD' ? 'Pct' : 'USD'].$el.hide();

      this.chart.yAxis.tickFormat(tickFormatters[yUnit]);

      extent = [
        {
          x: this.chartState.get('xLower'),
          y: this.chartState.get('yLower' + yUnit)
        },
        {
          x: this.chartState.get('xUpper'),
          y: this.chartState.get('yUpper' + yUnit)
        }
      ];

      this.chart.draw(data);
      this.chart.extent(extent);
    },

    handleYUnitChange: function(event) {
      this.chartState.set('yUnit', event.target.value);
    }
  });

  return MainView;
});
