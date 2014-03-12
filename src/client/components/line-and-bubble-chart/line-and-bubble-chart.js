define(function(require) {
  'use strict';
  var d3 = require('d3');
  require('d3.chart');

  require('css!./line-and-bubble-chart');

  var svgNamespace = 'http://www.w3.org/2000/svg';

  var LineAndBubble = d3.chart('LineAndBubble', {
    /**
     * Set up the chart.
     *
     * @constructor
     *
     * @argument {Object} [options] Accepts the following attributes:
     *           - {String} [xLabel] Name for x axis
     *           - {String} [yLabel] Name for y axis
     */
    initialize: function(options) {
      var axisLabelSpacing = '0.71em';

      if (!this.base) {
        this.base = d3.select(
          document.createElementNS(svgNamespace, "svg")
        );
      }

      options = options || {};

      this.content = this.base.append('g');
      var x = this.x = d3.scale.linear();
      var y = this.y = d3.scale.linear();
      this.xAxis = d3.svg.axis().scale(this.x).orient('bottom');
      this.yAxis = d3.svg.axis().scale(this.y).orient('left');
      this.line = d3.svg.line()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); });

      this.xAxisg = this.content.append('g')
        .classed('x axis', true);

      this.xAxisLabel = this.xAxisg.append('text')
        .style('text-anchor', 'end')
        .attr('dy', '-' + axisLabelSpacing);

      if (options.xLabel) {
        this.xAxisLabel.text(options.xLabel);
      }

      this.yAxisg = this.content.append('g')
        .classed('y axis', true);

      this.yAxisLabel = this.yAxisg.append('text')
        .attr('transform', 'rotate(-90)')
        .style('text-anchor', 'end')
        .attr('y', 6)
        .attr('dy', axisLabelSpacing);

      if (options.yLabel) {
        this.yAxisLabel.text(options.yLabel);
      }

      this.pointsg = this.content.append('g')
        .classed('points', true);

      this.layer('line', this.content.append('g'), require('./line-layer'));

      this.layer(
        'points',
        this.content.append('g').classed('points', true),
        require('./bubble-layer')
      );

      this.height(300);
      this.width(200);
    },

    margin: function(val) {
      var margin = this._margin;
      if (!margin) {
        margin = this._margin = {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        };
      }

      if (!arguments.length) {
        return margin;
      }

      if ('top' in val) {
        margin.top = val.top;
      }
      if ('right' in val) {
        margin.right = val.right;
      }
      if ('bottom' in val) {
        margin.bottom = val.bottom;
      }
      if ('left' in val) {
        margin.left = val.left;
      }

      if (('top' in val) || ('left' in val)) {
        this.content.attr(
          'transform',
          'translate(' + margin.left + ', ' + margin.top + ')'
        );
      }
      if (('top' in val) || ('bottom' in val)) {
        this._handleContentHeightChange();
      }
      if (('left' in val) || ('right' in val)) {
        this._handleContentWidthChange();
      }
    },

    _handleContentWidthChange: function() {
      var margin = this.margin();
      var width = this.width() - margin.left - margin.right;
      this.x.range([0, width]);
      this.xAxisLabel.attr('x', width);
      this.xAxisg.call(this.xAxis);
      this.redraw();
    },

    _handleContentHeightChange: function() {
      var margin = this.margin();
      var height = this.height() - margin.top - margin.bottom;
      this.y.range([height, 0]);
      this.xAxisg.attr('transform', 'translate(0, ' + height + ')');
      this.yAxisg.call(this.yAxis);
      this.redraw();
    },

    width: function(val) {
      var margin;

      if (arguments.length) {
        margin = this.margin();
        this._width = val;
        this.base.attr('width', val);
        this._handleContentWidthChange();
      }

      return this._width;
    },

    height: function(val) {
      var margin;

      if (arguments.length) {
        margin = this.margin();
        this._height = val;
        this.base.attr('height', val);
        this._handleContentHeightChange();
      }

      return this._height;
    },

    redraw: function() {
      if (!this._latestData) {
        return;
      }

      this.draw(this._latestData);
    },

    extent: function(data) {
      this.x.domain(d3.extent(data, function(d) { return d.x; }));
      this.y.domain(d3.extent(data, function(d) { return d.y; }));

      this._handleContentHeightChange();
      this._handleContentWidthChange();
    },

    /**
     * Cache the data specified for the latest `draw` operation so it can be
     * re-used in `LineAndBubble#redraw`.
     */
    transform: function(data) {
      this._latestData = data;
      return data;
    }

  });

  return LineAndBubble;
});
