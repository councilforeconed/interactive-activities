'use strict';

var config = require('../shared/config.json');
var common = require('../../../server/common');
var requirejs = common.createRequireJS({
  shared: '../src/activities/cacao/shared'
});

var PlayerCollection = requirejs('shared/player-collection');
PlayerCollection.prototype.model = require('./player');
var TxnCollection = requirejs('shared/txn-collection');

module.exports = CacaoGame;

/**
 * Create an instance of the Cacao "game".
 *
 * @argument {Object} options
 *           - {Function} options.report A function that may be invoked with
 *                        game-specific data that should be included in the
 *                        game report.
 */
function CacaoGame(options) {
  var report = options.report;

  this.players = new PlayerCollection();
  this.pendingTxns = new TxnCollection();
  this.completedTxns = new TxnCollection();

  this.completedTxns.on('add', function(model) {
    report(model.toJSON());
  });
}

CacaoGame.messageHandlers = {
  trade: 'trade'
};

CacaoGame.prototype.join = function(user) {
  var lastPlayer = this.players.last();
  var roles = this.players.groupBy('role');
  var buyerCount = roles.buyer && roles.buyer.length || 0;
  var sellerCount = roles.seller && roles.seller.length || 0;
  var role, id, newPlayer;

  if (buyerCount > sellerCount) {
    role = 'seller';
  } else {
    role = 'buyer';
  }

  if (lastPlayer) {
    id = lastPlayer.get('id') + 1;
  } else {
    id = 1;
  }

  newPlayer = this.players.add({
    id: id,
    cloakID: user.id,
    role: role
  });
  newPlayer.assignTarget();

  newPlayer.save();
};

CacaoGame.prototype.leave = function(user) {
  var player = this.players.findWhere({ cloakID: user.id });
  if (!player) {
    return;
  }

  this.players.remove(player);
};

CacaoGame.prototype.trade = function(txnData, user) {
  var pending = this.pendingTxns.find(function(txn) {
    return txn.fuzzyMatch(txnData);
  });
  var player = this.players.findWhere({ cloakID: user.id });
  var initiator, buyer, seller;

  if (!pending) {
    pending = this.pendingTxns.add(txnData);
    pending.set('initiatorID', player.get('id'));
    setTimeout(function() {
      pending.destroy();
      player.rejectTxn(txnData);
    }, config.txnTimeout);
  } else {
    initiator = this.players.get(pending.get('initiatorID'));

    // Transactions re-submitted by the same player can safely be ignored.
    if (player === initiator) {
      return;
    }

    if (player.get('role') === 'buyer') {
      buyer = player;
      seller = initiator;
    } else {
      buyer = initiator;
      seller = player;
    }

    // Finalize transaction

    // The initiator is only relevant to the trade negotation algorithm; it
    // does not need to be stored after the transaction has been verified.
    pending.unset('initiatorID');
    pending.set({
      buyerTarget: buyer.get('targetPrice'),
      sellerTarget: seller.get('targetPrice'),
      timeStamp: (new Date()).getTime()
    });

    player.acceptTxn(txnData);
    initiator.acceptTxn(txnData);
    player.assignTarget().save();
    initiator.assignTarget().save();

    this.completedTxns.add(pending);
  }
};
