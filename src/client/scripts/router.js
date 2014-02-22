define(function(require) {
  var Backbone = require('backbone');
  var ActivitiesView = require('activity/collection-view');

  var Router = Backbone.Router.extend({
    initialize: function(options) {
      this.$el = options.$el;
    },

    routes: {
      '': 'index',
      'activity/:activity': 'activity'
    },

    index: function() {
      var view = new ActivitiesView();
      var data = JSON.parse(document.getElementById('activity-data').innerHTML);
      view.render(data);
      this.$el.append(view.el);
    },

    activity: function(activity) {
      console.log(activity);
      this.$el.empty();
    }
  });

  return Router;
});
