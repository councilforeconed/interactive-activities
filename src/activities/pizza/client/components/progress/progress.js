define(function(require) {
  'use strict';

  var Layout = require('layoutmanager');

  require('css!./progress');

  var ProgressView = Layout.extend({
    className: 'pizza-progress',
    template: require('jade!./progress')
  });

  return ProgressView;
});
