define(function(require) {
  'use strict';

  var $ = require('jquery');

  var ActivityView = require('components/activity/activity');
  var Model = require('./model');
  var BillView = require('../bill/bill');
  var LedgerView = require('../ledger/ledger');
  var ControlsView = require('../controls/controls');

  require('css!./main');

  var Home = ActivityView.extend({
    homeTemplate: require('jade!./main'),
    title: 'Money Creation',
    description: require('jade!./../../description')(),
    instructions: require('jade!./../../instructions')(),
    events: {
      'click .change-round': 'onClickChangeRound',
      'mouseover .reserved-overlay': 'onMouseOverlay'
    },
    initialize: function() {
      this.model = new Model();
      this.billView = new BillView({ model: this.model });
      this.ledgerView = new LedgerView({ model: this.model });
      this.controlsView = new ControlsView({ model: this.model });
      this.setView('.mc-supply-container', this.billView);
      this.setView('.mc-ledger-container', this.ledgerView);
      this.setView('.mc-controls-container', this.controlsView);
    },

    setConfig: function(config) {
      this.model.set(config);
    },

    serialize: function() {
      return this.model.toJSON();
    },

    onClickChangeRound: function(event) {
      this.changeRound(event.target.dataset.dir);
    },

    changeRound: function(direction) {
      var delta;
      if (direction === 'prev') {
        delta = -1;
      } else {
        delta = 1;
      }

      this.model.set('currentRound', this.model.get('currentRound') + delta);
    },

    onMouseOverlay: function(event) {
      this.$('.focus').removeClass('focus');
      $(event.currentTarget).addClass('focus');
    }
  });

  return Home;
});
