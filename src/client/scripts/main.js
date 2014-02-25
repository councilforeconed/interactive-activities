define(function(require) {
  var $ = require('jquery');
  var Backbone = require('backbone');
  var Router = require('./router');
  var router = new Router({
    $el: $("#main")
  });
  Backbone.history.start({ pushState: true });

  $(document).on('click', 'a[href^="#"]:not([data-bypass])', function(event) {
    event.preventDefault();

    var href = $(this).attr('href');
    Backbone.history.navigate(href, true);
  });
});
