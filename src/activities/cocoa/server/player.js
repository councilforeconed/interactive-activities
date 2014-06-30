'use strict';

var cloak = require('cloak');

var common = require('../../../server/common');
var requirejs = common.createRequireJS({
  shared: '../src/activities/cocoa/shared'
});

var Player = requirejs('shared/player');

var ServerPlayer = Player.extend({
  getCloakUser: function() {
    return cloak.getUser(this.get('cloakID'));
  },

  acceptTxn: function(txnData) {
    var currentEarnings = this.get('earnings');
    var thisSale;

    if (this.get('role') === 'buyer') {
      thisSale = this.get('targetPrice') - txnData.amount;
    } else {
      thisSale = txnData.amount - this.get('targetPrice');
    }

    this.save({
      earnings: currentEarnings + thisSale
    });

    this.getCloakUser().message('accept', txnData);
  },

  rejectTxn: function(txnData) {
    this.getCloakUser().message('reject', txnData);
  },

  sync: function() {
    this.getCloakUser().message('status', this.toJSON());
  }
});

module.exports = ServerPlayer;
