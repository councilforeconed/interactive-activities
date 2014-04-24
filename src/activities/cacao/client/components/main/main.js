define(function(require) {
  'use strict';

  var $ = require('jquery');
  var _ = require('lodash');
  var cloak = require('cloak');
  var io = require('scripts/socketio.monkey');

  var ActivityView = require('components/activity/activity');
  var TxnModal = require('../txn-modal/txn-modal');
  var Player = require('../../../shared/player');
  var Txn = require('../../scripts/txn');
  var config = require('json!../../../shared/config.json');

  require('css!./main');

  var Main = ActivityView.extend({
    homeTemplate: require('jade!./main'),
    config: require('json!../../../config.json'),
    description: require('jade!../../description')(),
    instructions: require('jade!../../instructions')(),
    events: {
      'submit .cacao-form': 'handleSubmit'
    },

    initialize: function() {
      this.player = new Player();
      this.txn = new Txn();
      this.$el.addClass('cacao');

      this.txnModal = new TxnModal();

      this.listenTo(this.txn, 'change invalid', this.render);
      this.listenTo(this.player, 'change', this.render);

      this._initConnection();
    },

    _initConnection: function() {
      // Cloak doesn't currently provide proper ways to clean itself up. So we
      // must force a page reload to reset it.
      if (cloak.dirty) {
        location.reload();
      }
      cloak.dirty = true;

      cloak.configure({

        // Define custom messages sent by server to respond to.
        messages: {
          reject: _.bind(this.txn.trigger, this.txn, 'reject'),
          accept: _.bind(this.txn.trigger, this.txn, 'accept'),
          status: _.bind(function(status) {
            this.player.set(status);
            this.txn.set(
              this.player.get('role') + 'ID',
              this.player.get('id')
            );
          }, this)
        },

        // Define handlers for built in events.
        serverEvents: {
          begin: _.bind(function() {
            // Join cloak room for this group
            cloak.message('joinRoom', this.group);
          }, this)
        }
      });

      // Cloak wraps socket.io such that we must monkey-patch in some options.
      io.connect.options = {
        resource: 'activities/cacao/socket.io'
      };

      cloak.run();
    },

    handleSubmit: function(event) {
      var attrs = {};
      var txn = this.txn;
      var txnModal = this.txnModal;

      event.stopPropagation();
      event.preventDefault();

      var serialized = $(event.target).serializeArray();
      _.forEach(serialized, function(input) {
        attrs[input.name] = parseInt(input.value, 10);
      });

      var isValid = txn.set(attrs, { validate: true });

      if (!isValid) {
        return;
      }

      this.insertView('.activity-modals', this.txnModal);
      txnModal.summon();
      txnModal.pending();

      txn.save()
        .then(function() {
          txn.reset();
          txnModal.success();
        }, function() {
          txnModal.failure();
        });
    },

    serialize: function() {
      var player = this.player.toJSON();
      var otherRole = (player.role === 'buyer' ? 'seller' : 'buyer') + 'ID';
      var validationError;

      if (this.txn.validationError) {
        validationError = this.txn.validationError.message;
      }

      return {
        player: player,
        txn: this.txn.toJSON(),
        validationError: validationError,
        otherRole: otherRole,
        tradeAmount: config.tradeAmount
      };
    }
  });

  return Main;
});
