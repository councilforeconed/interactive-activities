define(function(require) {
  'use strict';

  var Backbone = require('backbone');
  var ActivitiesView = require('components/home/home');

  var Router = Backbone.Router.extend({
    initialize: function(options) {
      this.$el = options.$el;
      this.data = options.data;
      this._loadId = null;
    },

    routes: {
      '': 'index',
      'activity/:activity/': 'activity'
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
    activity: function(activity) {
      this._setActivity(activity);
    },

    _setActivity: function(activity) {
      var activityId = 'activities/' + activity + '/client/scripts/main';
      var loadId = this._loadId = +(new Date());
      var self = this;

      // TODO: Display a "loading" dialog

      require([activityId], function(View) {
        if (self._loadId !== loadId) {
          return;
        }
        self.setView(View);
      });
    },

    /**
     * Synchronously initialize the specified view and insert it into the page.
     *
     * @param {View} View Backbone view constructor.
     */
    setView: function(View, data) {
      if (this.currentView) {
        this.currentView.remove();
      }

      this._loadId = null;

      this.currentView = new View();
      this.$el.append(this.currentView.$el);
      if (data) {
        this.currentView.serialize = data;
      }
      this.currentView.render();
    }
  });

  return Router;
});
