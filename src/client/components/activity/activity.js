define(function(require) {
  'use strict';
  var $ = require('jquery');
  var Layout = require('layoutmanager');
  var _ = require('lodash');

  var Modal = require('components/modal/modal');
  var WelcomeView = require('components/welcome/welcome');
  var formatters = require('scripts/formatters');

  require('css!./activity');

  /**
   * A Backbone view that implements logic common to all activities.
   *
   * @constructor
   */
  var ActivityView = Layout.extend({
    className: 'activity',
    events: {
      'click .activity-help': 'showWelcome'
    },
    chromeTemplate: require('jade!./activity'),

    /**
     * Template function that renders the activity's main content.
     *
     * @virtual
     */
    homeTemplate: function() {
      throw new Error(
        'ActivityView: All activities must implement a `homeTemplate` method.'
      );
    },

    template: function(data) {
      var $markup = $('<div>').html(this.chromeTemplate({
        title: this.title
      }));

      data.formatters = formatters;
      $markup.find('.activity-stage').html(this.homeTemplate(data));

      return $markup.html();
    },

    constructor: function() {
      var welcomeView;

      // When a child view define custom `events` hash, explicitly copy the
      // events defined by this view *into* the child (they would otherwise be
      // shadowed).
      if (this.events !== ActivityView.prototype.events) {
        _.extend(this.events, ActivityView.prototype.events);
      }

      Layout.prototype.constructor.apply(this, arguments);

      // Track when the activity has begun so the modal can be redrawn as
      // appropriate.
      this.hasBegun = null;

      // Create a modal containing the activity's description and instructions.
      welcomeView = new WelcomeView({
        title: this.title,
        description: this.description,
        instructions: this.instructions
      });
      this.welcomeModal = new Modal({
        content: welcomeView
      });

      this.listenTo(welcomeView, 'begin', function(data) {
        this.hasBegun = true;
        this.setConfig(data);
        this.welcomeModal.dismiss();
      });

      this.setView('.activity-modals', this.welcomeModal);

      this.showWelcome();
    },

    /**
     * Respond to user-defined runtime configuration as set in the "welcome"
     * modal.
     *
     * @param {Object} config A hash reflecting the state of the from defined
     *                 in the "welcome" modal (if any).
     * @virtual
     */
    setConfig: function() {},

    showWelcome: function() {
      this.welcomeModal.summon({ mayDismiss: this.hasBegun });
    }
  });

  return ActivityView;
});
