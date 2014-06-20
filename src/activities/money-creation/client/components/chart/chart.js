/*jshint indent:false */

define(function (require) {
  'use strict';
  var Layout = require('layoutmanager');
  var $ = require('jquery');
  var d3 = require('d3');

  require('css!./chart');

  var $window = $(window);

  var ChartView = Layout.extend({
    className: 'mc-chart',

    manage: false,

    initialize: function() {
      this.listenTo(this.model, 'change', this.updateChart);
      $window.on('resize', this.resize.bind(this));
    },

    serialize: function() {
      return this.model.toJSON();
    },

    beforeRender: function () {
      this.$container = $('.mc-chart-container');
      this.drawChart();
    },

    resize: function() {
      this.width = this.$container.width();
      this.updateChart();
    },

    cleanup: function() {
      this.svg.remove();
      $window.off('resize');
    },

    drawChart: function() {
      this.baseAmount = require('../../total');
      this.data = [this.baseAmount];

      this.width = this.$container.width();

      this.svg = d3.select(this.el)
        .append("svg")
          .attr("width", this.width)
          .attr("height", 150);

      this.margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 2.75
      };
      
      this.startingMaximum = this.baseAmount * 5;

      this.scale = d3.scale.linear()
        .domain([0,this.startingMaximum])
        .range([0, this.width]);

      this.colors = d3.scale.category20c();

      // Define the x-axis.
      this.xAxis = d3.svg.axis()
        .scale(this.scale)
        .orient('bottom');

      // Append the x-axis to the chart.
      this.svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + this.margin.left + ',130)')
        .call(this.xAxis);
        
      this.svg.selectAll(".tick").each(function (d) {
        if ( d === 0 ) {
            this.remove();
        }
      });

      this.updateChart();
    },

    updateScale: function() {
      var sum = this.data.reduce(function (p, c) {
        return p + c;
      }, 0);
      if (sum < 500000) sum = 500000;
      this.scale = d3.scale.linear()
        .domain([0,sum])
        .range([0, this.width - (this.margin.right + this.margin.left)]);
    },

    updateChart: function() {
      var _this = this;

      this.data = [this.baseAmount]
        .concat(this.model.toJSON().rounds.map(function (round) {
          return round.excess;
        }));

      this.svg.attr('width', this.width);

      this.updateScale();

      this.currentPosition = 0;
      var rects = this.svg.selectAll('rect');

      // Enter new rectangles.
      rects
        .data(this.data)
        .enter()
        .append('rect')
          .attr({
            x: function () {
              return  _this.scale(_this.data.slice(0, -1)
                .reduce(function (a, b) {
                  return a + b;
                }, 0)) + _this.margin.left;
            },
            y: '10px',
            width: function (d) {
              return _this.scale(d);
            },
            height: '115px',
            fill: function (d, i) {
              return _this.colors(i);
            }
          });

      rects.data(this.data)
        .transition()
          .duration(200)
          .ease("linear")
        .attr({
          x: function (d, i) {
            return  _this.scale(_this.data.slice(0, i)
              .reduce(function (a, b) {
                return a + b;
              }, 0)) + _this.margin.left;
          },
          width: function (d) {
            return _this.scale(d);
          }
        });

      rects.data(this.data).exit().remove();

      // Adjust the scale on the x-axis and update it.
      this.xAxis.scale(this.scale);
      this.svg.selectAll("g.axis")
        .call(this.xAxis);
    }
  });

  return ChartView;
});
