/**
 * @file A wrapper around global browser events that implements Backbone Events
 * in order to facilitate "safe" binding and unbinding. By using
 * `WindowEmitter.listenTo` consumer code can safely remove event listeners
 * upon destruction via `Backbone.Events#stopListening`.
 */
define(function(require) {
  'use strict';
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');

  var WindowEmitter = _.extend({}, Backbone.Events);
  // 0.1 second is about the limit for having the user feel that the system is
  // reacting instantaneously, meaning that no special feedback is necessary
  // except to display the result.
  // Source: http://www.nngroup.com/articles/response-times-3-important-limits/
  var period = 100;
  var $window = $(window);

  var triggerScroll = _.bind(WindowEmitter.trigger, WindowEmitter, 'scroll');
  var triggerResize = _.bind(WindowEmitter.trigger, WindowEmitter, 'resize');

  $window.on('scroll', _.throttle(triggerScroll, period));
  $window.on('resize', _.throttle(triggerResize, period));

  return WindowEmitter;
});
