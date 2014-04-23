'use strict';

var common = require('../../../server/common');
var requirejs = common.createRequireJS({
  shared: '../src/activities/cacao/shared'
});

var Txn = requirejs('shared/txn');

/**
 * Extension of shared "Transaction" model intended for use on the server only.
 */
var ServerTxn = Txn.extend({
  reject: function() {
  }
});

module.exports = ServerTxn;
