'use strict';

var _ = require('lodash');

module.exports = function(options) {
  var prefix = options.prefix;
  var room = options.room;

  return function(method, model) {
    if (method === 'read') {
      throw new Error(
        'Server cannot read from the client because that would be weird.'
      );
    }
    room.messageMembers(prefix + method, model.toJSON());
  };
};

module.exports.store = function(options) {
  var target = options.model || options.collection;
  var isCollection = options.collection === target;

  if (isCollection) {
    return function(collection) {
      if (Array.isArray(collection)) {
        target.reset(collection);
      } else {
        var model = collection;
        target.get(model.id).save(model);
      }
    };
  } else {
    return function(model) {
      target.save(model);
    };
  }
};

module.exports.set = function(map, options) {
  return _.map(map, function(individualOptions) {
    return this(_.extend(individualOptions, options));
  }, this);
};
