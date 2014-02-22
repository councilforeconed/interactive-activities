define(function(require) {
  var GameView = require('./game-view');

  var view = new GameView();

  view.render();

  document.body.appendChild(view.el);

});
