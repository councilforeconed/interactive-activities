/**
 * Overload the document fragment to support storage of arbitrary data.
 *
 * This method delineates route information from data via the first occurence
 * of the question mark ('?') character, so the application may not use it
 * concurrently with routes that contain a question mark.
 */
define(function(require) {
  'use strict';

  var Backbone = require('backbone');

  var hashRe = /^([^?]*)(?:\?(.*))?$/;

  return {
    /**
     * Store data in the URL fragment.
     *
     * @param {mixed} value The data to be stored in the fragment.
     */
    set: function(value) {
      var match = hashRe.exec(Backbone.history.getFragment());
      var existing;

      if (match) {
        existing = match[1];
      } else {
        existing = '';
      }

      Backbone.history.navigate(
        existing + '?' + JSON.stringify(value),
        { replace: true }
      );
    },
    /**
     * Retrieve data that has previously been stored in the fragment via this
     * module's `set` method.
     *
     * @return {mixed} The value previously stored in the fragment or `null` if
     *         no value has been stored.
     */
    get: function() {
      var fragment = window.decodeURIComponent(Backbone.history.getFragment());
      var match = hashRe.exec(fragment);
      if (!match || !match[2]) {
        return null;
      }

      try {
        return JSON.parse(match[2]);
      } catch(err) {
        return null;
      }
    }
  };
});
