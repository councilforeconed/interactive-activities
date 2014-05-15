'use strict';

var through2reduce = require('through2-reduce');

var INITIAL = 'initial';

module.exports = through2reduce.ctor(
  { objectMode: true },
  function(previous, current) {
    var groupName = current.groupName;
    var gameData = current.gameData;
    // Initialize the object.
    if (previous === INITIAL) {
      previous = {
        groups: {}
      };
    }

    // Add an object per group.
    if (!(groupName in previous.groups)) {
      previous.groups[groupName] = {
        events: {
          joinRoom: 0,
          chat: 0
        },
        byUser: {}
      };
    }

    // Add an object per user per group.
    if (!(gameData.user in previous.groups[groupName].byUser)) {
      previous.groups[groupName].byUser[gameData.user] = {
        joinRoom: 0,
        chat: 0
      };
    }

    // Increment group and user events.
    previous.groups[groupName].events[gameData.type]++;
    previous.groups[groupName].byUser[gameData.user][gameData.type]++;

    return previous;
  },
  // Specifiy an initial value so the callback is called the first time.
  INITIAL
);
