define(function(require) {
  'use strict';
  var Layout = require('layoutmanager');

  var template = require('jade!./ledger');
  var formatters = require('scripts/formatters');

  require('css!./ledger');

  var LedgerView = Layout.extend({
    template: function(data) {
      data.formatters = formatters;
      return template(data);
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },

    serialize: function() {
      return this.model.toJSON();
    }
  });

  return LedgerView;
});
