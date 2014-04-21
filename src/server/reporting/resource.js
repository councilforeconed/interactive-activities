'use strict';

var id = 'report';

module.exports.id = id;

module.exports.factory = function(options) {
  var transform = options.transform;
  var collector = options.collector;

  return {
    id: id,
    load: function(req, id, fn) {
      // Determine protocol and host as the client sees it. Give this option
      // information to the transform to use as it sees fit.
      fn(undefined, transform(req, collector.getStream(id)));
    }
  };
};
