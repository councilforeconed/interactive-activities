'use strict';

module.exports.sync = function(options) {
  var prefix = options.prefix;
  var fakeCloak = options.fakeCloak;
  var delay = options.delay || 0;

  return function(method, model) {
    setTimeout(function() {
      fakeCloak.emit(prefix + method, model.toJSON());
    }, delay);
  };
};

module.exports.store = function(options) {
  if (options.model) {
    return function(model) {
      options.model.set(model);
    };
  } else {
    return function(collection) {
      options.collection.set(collection);
    };
  }
};
