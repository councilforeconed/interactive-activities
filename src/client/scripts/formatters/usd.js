define(function() {
  'use strict';

  return function(value) {
    var dollarsStr, sign, match;
    match = value.toFixed(2).match(/^(-)?(\d+)\.(\d\d)$/);

    // Insert commas
    dollarsStr = match[2].replace(/(\d)(?=(?:[\d]{3})+$)/g, '$1,');

    sign = match[1] || '';

    return sign + '$' + dollarsStr + '.' + match[3];
  };
});
