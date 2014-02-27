define(function(require) {
  var Backbone = require('backbone');
  var ActivitiesView = require('components/activity/collection-view');

  var Router = Backbone.Router.extend({
    initialize: function(options) {
      this.$el = options.$el;
    },

    routes: {
      '': 'index',
      'activity/:activity/': 'activity'
    },

    index: function() {
      var view = new ActivitiesView();
      var data = JSON.parse(document.getElementById('activity-data').innerHTML);
      view.render(data);
      this.$el.empty();
      this.$el.append(view.el);
    },

    activity: function(activity) {
      var $el = this.$el;
      $el.empty();
      require(['activities/' + activity + '/scripts/main'], function(View) {
        new View({ el: $el }).render();
      });
    }
  });

  return Router;
});
