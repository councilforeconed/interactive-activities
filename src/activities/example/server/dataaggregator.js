'use strict';

var through2reduce = require('through2-reduce');

var INITIAL = 'initial';

module.exports = through2reduce.ctor(
  { objectMode: true },
  function(previous, current) {
    // Initialize the object.
    if (previous === INITIAL) {
      previous = {
        groups: {}
      };
    }

    // Add an object per group.
    if (!(current.group in previous.groups)) {
      previous.groups[current.group] = {
        events: {
          'join-room': 0,
          'chat': 0
        },
        byUser: {}
      };
    }

    // Add an object per user per group.
    if (!(current.user in previous.groups[current.group].byUser)) {
      previous.groups[current.group].byUser[current.user] = {
        'join-room': 0,
        'chat': 0
      };
    }

    // Increment group and user events.
    previous.groups[current.group].events[current.type]++;
    previous.groups[current.group].byUser[current.user][current.type]++;

    return previous;
  },
  // Specifiy an initial value so the callback is called the first time.
  INITIAL
);
