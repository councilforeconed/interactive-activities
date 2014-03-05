define(function() {
  'use strict';

  return function(value) {
    var dollarsStr, match;
    match = value.toFixed(2).match(/^(\d+)\.(\d\d)$/);


    // Insert commas
    dollarsStr = match[1].replace(/(\d)(?=(?:[\d]{3})+$)/g, '$1,');

    return '$' + dollarsStr + '.' + match[2];
  };
});
