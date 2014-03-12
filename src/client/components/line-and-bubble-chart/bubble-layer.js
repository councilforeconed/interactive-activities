define(function() {
  'use strict';

  return {
    dataBind: function(data) {
      return this.selectAll('.point').data(data);
    },
    insert: function() {
      return this.append('circle').classed('point', true);
    },
    events: {
      enter: function() {
        this.attr('r', 4);
      },
      'merge:transition': function() {
        this.duration(100)
          .attr('cx', this.chart().line.x())
          .attr('cy', this.chart().line.y());
      },
      exit: function() {
        this.remove();
      }
    }
  };
});
