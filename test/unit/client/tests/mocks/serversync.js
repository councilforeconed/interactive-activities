define(function() {
  'use strict';

  return {
    sync: function(options) {
      var prefix = options.prefix;
      var fakeCloak = options.fakeCloak;
      var delay = options.delay;

      return function(method, model) {
        setTimeout(function() {
          fakeCloak.trigger(prefix + method, model.toJSON());
        }, delay);
      };
    },

    store: function(options) {
      if (options.model) {
        return function(model) {
          options.model.save(model);
        };
      } else {
        return function(collection) {
          if (Array.isArray(collection)) {
            options.collection.reset(collection);
          } else {
            var model = collection;
            options.collection.get(model.id).save(model);
          }
        };
      }
    }
  };
});
