'use strict';

var common = require('../../../server/common');
var requirejs = common.createRequireJS({
  shared: '../src/activities/cacao/shared'
});

var Backbone = requirejs('backbone');
var _ = require('lodash');

var Txn = require('./txn');

var TxnCollection = Backbone.Collection.extend({
  model: Txn,

  fuzzyFind: function(txnData) {
    return this.findWhere(_.pick(txnData, 'sellerID', 'buyerID', 'amount'));
  }
});

module.exports = TxnCollection;
