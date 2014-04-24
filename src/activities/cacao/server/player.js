'use strict';

var cloak = require('cloak');

var common = require('../../../server/common');
var requirejs = common.createRequireJS({
  shared: '../src/activities/cacao/shared'
});

var Player = requirejs('shared/player');

var ServerPlayer = Player.extend({
  getCloakUser: function() {
    return cloak.getUser(this.get('cloakID'));
  },

  acceptTxn: function(txnData) {
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
