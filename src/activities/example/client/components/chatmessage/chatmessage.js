// @file Display a received chat message.
define(function(require) {
  'use strict';
  var Layout = require('layoutmanager');

  require('css!./chatmessage.css');

  var ChatMessageView = Layout.extend({
    tagName: 'tr',
    template: require('jade!./chatmessage')
  });

  return ChatMessageView;
});
