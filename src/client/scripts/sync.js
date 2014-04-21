define(function(require) {
  'use strict';

  var cloak = require('cloak');

  return function(method, model) {
    var prefix = this.prefix;

    if (!prefix && this.collection) {
      prefix = this.collection.prefix;
    }

    if (method === 'read' || method === 'delete' || method === 'create') {
      throw new Error('Client may only update and patch models.');
    }

    cloak.message(prefix + '/' + method, model.toJSON());
  };
});
