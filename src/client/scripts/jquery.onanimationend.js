/**
 * @file - A simple jQuery plugin for registering events on an element's next
 * `animationend` event for CSS3 animations. In browsers that do not implement
 * this API, the event is simulated in the next scheduler time slice.
 */
define(function(require) {
  'use strict';

  var $ = require('jquery');

  var legacy = function(callback) {
    setTimeout(callback, 0);
  };
  var style, eventName, method;

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
    method = function(callback) {
      this.one(eventName, callback);
    };
  } else {
    method = legacy;
  }

  $.fn.onanimationend = function(handler) {
    this.one(eventName, handler);
  };
});
