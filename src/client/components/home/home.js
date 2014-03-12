define(function(require) {
  'use strict';

  var Layout = require('layoutmanager');
  require('css!./home');

  var ActivityView = Layout.extend({
    template: require('jade!./home')
  });

  return ActivityView;
});
