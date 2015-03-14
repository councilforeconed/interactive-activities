define(function(require) {
  'use strict';
  var $ = require('jquery');
  var Layout = require('layoutmanager');
  var _ = require('lodash');

  var JoinGroupView = require('components/joingroup/joingroup');
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
        title: this.config.title,
        image: this.config.image
      }));

      data.formatters = formatters;
      $markup.find('.activity-stage').html(this.homeTemplate(data));

      return $markup.html();
    },

    constructor: function(options) {

      // When a child view define custom `events` hash, explicitly copy the
      // events defined by this view *into* the child (they would otherwise be
      // shadowed).
      if (this.events !== ActivityView.prototype.events) {
        _.extend(this.events, ActivityView.prototype.events);
      }

      // Whitelist group.
      this.group = options.group;

      Layout.prototype.constructor.apply(this, arguments);

      // Track when the activity has begun so the modal can be redrawn as
      // appropriate.
      this.hasBegun = null;

      // If the activity is room based and we don't have an assigned group for
      // a room, prompt the user for a group.
      if (this.config.roomBased && typeof options.group !== 'string') {
        var joinGroupView = new JoinGroupView({
          activity: this.activitySlug
        });

        var joinGroupModal = new Modal({
          content: joinGroupView
        });

        this.setView('.activity-modals', joinGroupModal);

        this.listenTo(joinGroupView, 'join', function(group) {
          this.group = group;
          this.welcome();
          joinGroupModal.dismiss();
        });

        joinGroupModal.summon({ mayDismiss: false });

        return;
      }

      this.welcome();
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

    /**
     * Initialize a realtime connection to the server. This method *must* be
     * implemented by "room-based" (i.e. network-enabled) Activities.
     *
     * @virtual
     */
    initConnection: function() {
      throw new Error(
        'Room-based activities must define an `initConnection` method'
      );
    },

    /**
     * Set up the activity for game play, welcoming the user and (in the case
     * of room-based activities) initializing a real-time connection.
     */
    welcome: function() {
      // Create a modal containing the activity's description and instructions.
      var welcomeView = new WelcomeView({
        title: this.config.title,
        image: this.config.image,
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

      if (this.config.roomBased) {
        this.initConnection();
      }

      this.setView('.activity-modals', this.welcomeModal);

      this.showWelcome();
    },

    showWelcome: function() {
      this.welcomeModal.summon({ mayDismiss: this.hasBegun });
    }
  });

  return ActivityView;
});
