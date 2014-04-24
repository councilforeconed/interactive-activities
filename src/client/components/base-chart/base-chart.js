define(function(require) {
  'use strict';
  var d3 = require('d3');
  require('d3.chart');

  var svgNamespace = 'http://www.w3.org/2000/svg';
  require('css!./base-chart');

  var CEEBase = d3.chart('CEEBase', {
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
      var clipId;

      if (!this.base) {
        this.base = d3.select(
          document.createElementNS(svgNamespace, "svg")
        );
      }

      options = options || {};

      this.content = this.base.append('g');
      this.x = d3.scale.linear();
      this.y = d3.scale.linear();
      this.xAxis = d3.svg.axis().scale(this.x).orient('bottom');
      this.yAxis = d3.svg.axis().scale(this.y).orient('left');

      this.fieldGroup = this.content.append('g');

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

      // Create a clipping path to limit the rendered line to the graph's
      // "field" (i.e. prevent overlaying on the visualization axes and
      // margins)
      this.defs = this.content.append('defs');
      clipId = 'cee-base-chart-' + (+new Date());
      this.clipField = this.defs.append('clipPath')
        .attr('id', clipId).append('rect');
      this.fieldGroup.attr('clip-path', 'url(#' + clipId + ')');
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
      this.clipField.attr('width', width);
      this.redraw();
    },

    _handleContentHeightChange: function() {
      var margin = this.margin();
      var height = this.height() - margin.top - margin.bottom;
      this.y.range([height, 0]);
      this.xAxisg.attr('transform', 'translate(0, ' + height + ')');
      this.yAxisg.call(this.yAxis);
      this.clipField.attr('height', height);
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

    /**
     * Cache the data specified for the latest `draw` operation so it can be
     * re-used in `LineAndBubble#redraw`.
     */
    transform: function(data) {
      this._latestData = data;
      return data;
    }

  });

  return CEEBase;
});
