define(function(require) {
  'use strict';
  var Backbone = require('backbone');

  var Txn = Backbone.Model.extend({
    defaults: {
      amount: 0,
      buyerTarget: 0,
      sellerTarget: 0,
      buyerID: null,
      sellerID: null
    },

    validate: function(attrs) {
      if (typeof attrs.amount !== 'number') {
        return new TypeError('Transaction amounts must be numeric');
      }
      if (attrs.amount < 0) {
        return new RangeError('Transaction amounts must be positive');
      }
      if (!attrs.buyerID) {
        return new Error('Transactions must have a buyer');
      }
      if (!attrs.sellerID) {
        return new Error('Transactions must have a seller');
      }
    },

    reset: function() {
      this.set('amount', 0);
    }
  });

  return Txn;
});
