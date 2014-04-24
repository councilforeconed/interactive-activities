define(function() {
  'use strict';

  /**
   * Create a set of Cloak message handlers for "create", "update", and "read"
   * events emitted by the server for a given model/collection.
   *
   * @argument {String} prefix Namespace for the model/collection events as
   *                    defined by the server.
   * @argument {Object} source Object specifying either a Backbone.Model
   *                    instance (via the `instance` attribute) *or* a
   *                    Backbone.Collection instance (via the `collection`
   *                    attribute)
   *
   * @returns {Object}
   */
  return function(prefix, source) {
    var messages = {};
    var setFn, setOpts;

    if (!source || ('model' in source) === ('collection' in source)) {
      throw new Error(
        'Either `model` or `collection` source must be set (but not both)'
      );
    }

    if (source.model) {
      source = source.model;
      setFn = source.set;
    } else {
      source = source.collection;
      setFn = source.add;
      setOpts = { merge: true };
    }

    messages[prefix + '/create'] = function(obj) {
      // Because the `trigger` option is only supported for
      // `Backbone.Collection#set` (and not `Backbone.Model#set`), manually
      // invoke the object's `parse` method, if defined.
      // See "GH-2636: Give model.set a parse option"
      // https://github.com/jashkenas/backbone/pull/2636
      if (source.parse) {
        obj = source.parse(obj);
      }

      setFn.call(source, obj, setOpts);
    };
    messages[prefix + '/update'] = messages[prefix + '/create'];
    messages[prefix + '/delete'] = function(attrs) {
      source.remove(source.get(attrs.id));
    };

    return messages;
  };
});
