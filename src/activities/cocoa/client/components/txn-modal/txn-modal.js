define(function(require) {
  'use strict';

  var Layout = require('layoutmanager');
  var _ = require('lodash');

  var Modal = require('components/modal/modal');

  require('css!./txn');

  var TxnView = Layout.extend({
    keep: true,
    template: require('jade!./txn'),

    _setStatus: function(value) {
      this.$el.attr('data-cocoa-status', value);
      this.render();
    },

    pending: function() {
      this._setStatus('pending');
    },

    success: function() {
      this._setStatus('success');
    },

    failure: function() {
      this._setStatus('failure');
    }
  });

  var TxnModal = Modal.extend({
    keep: true,
    dismissTimeout: 2000,

    initialize: function(options) {
      options = options || {};
      options.content = new TxnView();
      Modal.prototype.initialize.call(this, options);
    },
    success: function() {
      this.content.success();
      setTimeout(_.bind(this.dismiss, this), this.dismissTimeout);
    },
    failure: function() {
      this.content.failure();
      setTimeout(_.bind(this.dismiss, this), this.dismissTimeout);
    },
    pending: function() {
      this.content.pending();
    }
  });

  return TxnModal;
});
