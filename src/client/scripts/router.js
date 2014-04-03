define(function(require) {
  'use strict';

  var _ = require('lodash');
  var $ = require('jquery');
  var Backbone = require('backbone');
  var when = require('when');

  var ActivitiesView = require('components/home/home');
  var $documentElement = $(document.documentElement);

  var Router = Backbone.Router.extend({
    initialize: function(options) {
      this.$el = options.$el;
      this.data = options.data;
      this._loadId = null;
    },

    routes: {
      '': 'index',
      'activity/:activity/': 'activity',
      'activity/:activity/group/:group/': 'activity',
      'room/': 'createRoom',
      'room/:room/': 'room',
      'group/:group/': 'group'
    },

    index: function() {
      this.setView(ActivitiesView, { activities: this.data });
    },

    /**
     * Asynchronously load a the specified activity. Ensure that any
     * previously-requested activity navigation is cancelled.
     *
     * @param {String} activity Module ID of desired activity.
     */
    activity: function(activity, group) {
      this._setActivity(activity, group);
    },

    _setActivity: function(activity, group) {
      var activityId = 'activities/' + activity + '/client/scripts/main';
      var loadId = this._loadId = +(new Date());
      var self = this;

      // TODO: Display a "loading" dialog

      require([activityId], function(View) {
        if (self._loadId !== loadId) {
          return;
        }
        self.setView(View, { group: group });
      });
    },

    createRoom: function() {
      var self = this;
      require(['components/createroom/createroom'], function(CreateRoomView) {
        self.setView(CreateRoomView, {
          activities: self.data.filter(function(activity) {
            return activity.config.roomBased;
          })
        });
      });
    },

    room: function(room) {
      var loadId = this._loadId = +(new Date());
      var self = this;
      require(['components/manageroom/manageroom'], function(ManageRoomView) {
        if (self._loadId !== loadId) {
          return;
        }

        var roomModel = new Backbone.Model({ id: room });
        self.setView(ManageRoomView, { model: roomModel});
        self._loadId = loadId;

        when($.get('/api/room/' + room))
          .then(function(data) {
            if (loadId === self._loadId) {
              // Enhance loaded room data with its activity's
              // configuration data.
              data.activityData = _.find(self.data, function(activity) {
                return activity.slug === data.activity;
              });
              roomModel.set(data);
            }
          })
          .catch(function() {
            if (loadId === self._loadId) {
              roomModel.set(
                'error',
                'An error occured loading this room. It might not exist.'
              );
            }
          });
      });
    },

    group: function(group) {
      when($.get('/api/group/' + group))
        .then(function(data) {
          Backbone.history.navigate(
            '/activity/' + data.activity + '/group/' + group + '/',
            {
              trigger: true,
              // Replace the current entry in the history (instead of creating
              // a new one) so that the "back" button does not transition
              // through this intermediate route.
              replace: true
            }
          );
        });
    },

    /**
     * Synchronously initialize the specified view and insert it into the page.
     *
     * @param {View} View Backbone view constructor.
     * @param {mixed} [options] Value to pass to the view constructor when
     *                invoked.
     */
    setView: function(View, options) {
      if (this.currentView) {
        // Ignore navigation events to the same view--assume the view can
        // respond properly to such changes.
        if (this.currentView instanceof View) {
          return;
        }
        this.currentView.remove();
      }

      this._loadId = null;

      this.currentView = new View(options || {});
      this.$el.append(this.currentView.$el);
      this.currentView.render();
      $documentElement.addClass('initial-load-complete');
    }
  });

  return Router;
});
