/**
 * @file - A simple jQuery plugin for flow control based on the `animationend`
 * event for CSS3 animations. `$.fn.whenAnimationEnd` will return a jQuery
 * promise which will be resolved when the next `animationend` (or vendor
 * prefixed equivalent) event is triggered. The promise will be rejected if the
 * element is no longer present in the current document.
 *
 * In browsers that do not implement a CSS3 animation API, the event is
 * simulated in the next scheduler time slice.
 */
define(function(require) {
  'use strict';

  var $ = require('jquery');

  var legacyWhenComplete = function(callback) {
    setTimeout(callback, 0);
  };
  var checkForRemoval = function($elem, dfd) {
    if (!$.contains(document.documentElement, $elem[0])) {
      dfd.reject();
    }
  };
  var checkPeriod = 1000;

  var style, eventName, whenComplete;

  // Feature detect for animation events (and vendor prefix)
  style = document.createElement('div').style;
  if ('animationName' in style) {
    eventName = 'animationend';
  } else {
    $.each(['Webkit', 'Moz', 'O', 'ms', 'Khtml'], function(_, prefix) {
      if ((prefix + 'AnimationName') in style) {
        eventName = prefix.toLowerCase() + 'AnimationEnd';
        return false;
      }
    });
  }

  if (eventName) {
    whenComplete = function(callback) {
      this.one(eventName, callback);
    };
  } else {
    whenComplete = legacyWhenComplete;
  }

  $.fn.whenAnimationEnd = function() {
    var dfd = $.Deferred();
    var id = setInterval(
      $.proxy(checkForRemoval, null, this, dfd),
      checkPeriod
    );

    whenComplete.call(this, dfd.resolve);

    dfd.always(function() {
      clearInterval(id);
    });

    return dfd.promise();
  };
});
