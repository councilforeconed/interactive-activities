define(function() {
  'use strict';

  return {
    dataBind: function(data) {
      return this.selectAll('path').data([data]);
    },
    insert: function() {
      return this.append('path')
        .classed('line', true);
    },
    events: {
      'merge:transition': function() {
        this.duration(100).attr('d', this.chart().line);
      }
    }
  };
});
