define(function(require) {
  'use strict';

  var Backbone = require('backbone');

  var Txn = require('./txn');

  var TxnCollection = Backbone.Collection.extend({
    model: Txn
  });

  return TxnCollection;
});
