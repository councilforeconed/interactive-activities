/* global cloak:true */

define(function(require) {
  'use strict';

  require('cloak');

  var sync = function(options) {
    var prefix = options.prefix;

    return function(method, model) {
      if (method === 'read' || method === 'delete' || method === 'create') {
        throw new Error('Client may only update and patch models.');
      }
      cloak.message(prefix + method, model.toJSON());
    };
  };

  sync.store = function(options) {
    var target = options.model || options.collection;
    var isCollection = options.collection === target;

    if (isCollection) {
      return function(collection) {
        if (Array.isArray(collection)) {
          target.set(collection);
        } else {
          var model = collection;
          target.get(model.id).set(model);
        }
      };
    } else {
      return function(model) {
        target.set(model);
      };
    }
  };

  return sync;
});
