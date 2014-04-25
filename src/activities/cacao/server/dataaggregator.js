'use strict';

var through2reduce = require('through2-reduce');

var INITIAL = 'initial';

module.exports = through2reduce.ctor(
  { objectMode: true },
  function(previous, current) {
    // Initialize the object.
    var groupData;
    if (previous === INITIAL) {
      previous = {};
    }

    groupData = previous[current.groupName];
    if (!groupData) {
      groupData = previous[current.groupName] = [];
    }

    groupData.push(current.gameData);

    return previous;
  },
  // Specifiy an initial value so the callback is called the first time.
  INITIAL
);
