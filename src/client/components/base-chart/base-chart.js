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

      this.xAxisLabel = this.base.append('text')
        .style('text-anchor', 'end');

      if (options.xLabel) {
        this.xAxisLabel.text(options.xLabel);
      }

      this.yAxisg = this.content.append('g')
        .classed('y axis', true);

      this.yAxisLabel = this.base.append('text')
        .attr('transform', 'rotate(-90)')
        .style('text-anchor', 'end')
        .attr('y', '1em');

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

    xAxisHeight: function(val) {
      if (!arguments.length) {
        return this._xAxisHeight || 0;
      }

      this._xAxisHeight = val;

      this._handleContentHeightChange();

      return this;
    },

    /**
     * Get or set the horizontal "bleed", or distance in pixels between the
     * right edge of the data field and the corresponding edge of the chart's
     * SVG element. Setting this to a positive value introduces padding that
     * may be occupied by the text of x-axis labels.
     *
     * @param {number} [val] - new bleed value to set; if unspecified, the
     *                         current bleed value will be returned
     *
     * @returns {mixed} - either the current bleed value (when no argument has
     *                    been specified), or a reference to the chart instance
     *                    (when an argument has been specified) to facilitate
     *                    method chaining.
     */
    xAxisPadding: function(val) {
      if (!arguments.length) {
        return this._xAxisPadding || 0;
      }

      this._xAxisPadding = val;

      this._handleContentWidthChange();

      return this;
    },

    yAxisWidth: function(val) {
      if (!arguments.length) {
        return this._yAxisWidth || 0;
      }

      this._yAxisWidth = val;

      this._handleContentWidthChange();

      return this;
    },

    /**
     * Get or set the vertical "bleed", or distance in pixels between the top
     * edge of the data field and the corresponding edge of the chart's SVG
     * element. Setting this to a positive value introduces padding that may be
     * occupied by the text of y-axis labels.
     *
     * @param {number} [val] - new bleed value to set; if unspecified, the
     *                         current bleed value will be returned
     *
     * @returns {mixed} - either the current bleed value (when no argument has
     *                    been specified), or a reference to the chart instance
     *                    (when an argument has been specified) to facilitate
     *                    method chaining.
     */
    yAxisPadding: function(val) {
      if (!arguments.length) {
        return this._yAxisPadding || 0;
      }

      this._yAxisPadding = val;

      this._handleContentHeightChange();

      return this;
    },

    _handleContentWidthChange: function() {
      var yAxisWidth = this.yAxisWidth();
      var width = this.width() - yAxisWidth - this.xAxisPadding();

      this.x.range([0, width]);
      this.xAxisg.call(this.xAxis);
      this.clipField.attr('width', width);
      this.content.attr(
        'transform',
        'translate(' + yAxisWidth + ', ' + this.yAxisPadding() + ')'
      );
      this.redraw();
    },

    _handleContentHeightChange: function() {
      var xAxisHeight = this.xAxisHeight();
      var yAxisPadding = this.yAxisPadding();
      var height = this.height() - xAxisHeight - yAxisPadding;
      this.y.range([height, 0]);
      this.xAxisg.attr('transform', 'translate(0, ' + height + ')');
      this.yAxisg.call(this.yAxis);
      this.clipField.attr('height', height);
      this.content.attr(
        'transform',
        'translate(' + this.yAxisWidth() + ', ' + yAxisPadding + ')'
      );
      this.redraw();
    },

    width: function(val) {
      if (arguments.length) {
        this._width = val;
        this.base.attr('width', val);
        this.xAxisLabel.attr('x', val);
        this._handleContentWidthChange();
      }

      return this._width;
    },

    height: function(val) {
      if (arguments.length) {
        this._height = val;
        this.base.attr('height', val);
        this.xAxisLabel.attr('y', val);
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
