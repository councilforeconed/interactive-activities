/* global cloak:true */
define(function(require) {
  'use strict';

  var Backbone = require('backbone');
  require('cloak');
  var sinon = require('sinon');
  require('sinon/stub');

  return {
    useFakeCloak: function() {
      var mock = Object.create(Backbone.Events);
      mock.server = Object.create(Backbone.Events);
      sinon.stub(cloak, 'message', function(name, msg) {
        mock.server.trigger(name, msg);
      });
      mock.restore = function() {
        cloak.message.restore();
      };
      return mock;
    }
  };
});
