define(function(require) {
  var Backbone = require('backbone');

  var GameView = Backbone.View.extend({
    render: function() {
      this.$el.html('I am a game...');
      return this;
    }
  });

  return GameView;
});
