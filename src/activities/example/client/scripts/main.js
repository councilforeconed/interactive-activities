define(function(require) {
  var ActivityView = require('components/activity/view');
  var MainView = ActivityView.extend({
    template: function() { return 'Example activity'; }
  });

  return MainView;
});
