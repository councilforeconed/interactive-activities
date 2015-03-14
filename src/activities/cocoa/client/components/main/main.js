define(function(require) {
  'use strict';

  var $ = require('jquery');
  var _ = require('lodash');
  var cloak = require('cloak');

  var ActivityView = require('components/activity/activity');
  var Slider = require('components/slider/slider');
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
      'change .cocoa-trade-with': 'handleTradeWithChange',
      'submit .cocoa-form': 'handleSubmit'
    },

    initialize: function() {
      this.player = new Player();
      this.txn = new Txn();
      this.$el.addClass('cocoa');

      this.txnModal = new TxnModal();

      this.setView('.cocoa-trade-amount', new Slider({
        model: this.txn,
        attr: 'amount',
        label: 'Trade Amount',
        max: config.tradeAmount.max,
        min: config.tradeAmount.min,
        step: 1
      }));
      window.txn = this.txn;
      window.player = this.player;

      this.listenTo(this.txn, 'invalid', this.render);
      this.listenTo(this.player, 'change', this.render);

      // The server changes the player's target price when the player first
      // joins and after every successful transaction. At these times, the
      // player's transaction should be updated to match.
      this.listenTo(
        this.player,
        'change:targetPrice',
        function(player, price) {
          this.txn.set('amount', price);
        }
      );

    },

    initConnection: function() {
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

      cloak.run(undefined, {
        'socket.io': {
          resource: 'activities/cocoa/socket.io'
        }
      });
    },

    handleTradeWithChange: function(event) {
      this.txn.set(event.target.name, parseInt($(event.target).val(), 10));
    },

    handleSubmit: function(event) {
      var txn = this.txn;
      var txnModal = this.txnModal;

      event.stopPropagation();
      event.preventDefault();

      if (!txn.isValid()) {
        return;
      }

      // Clean up any previously-rendered validation error messages.
      this.render();

      this.insertView('.activity-modals', this.txnModal);
      txnModal.summon();
      txnModal.pending();

      txn.save()
        .then(function() {
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
    },

    cleanup: function() {
      cloak.stop();
    }
  });

  return Main;
});
