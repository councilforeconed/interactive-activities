define(function(require) {
  'use strict';

  var $ = require('jquery');
  var Backbone = require('backbone');
  var Router = require('./router');
  var data = JSON.parse(document.getElementById('activity-data').innerHTML);
  var router = new Router({
    $el: $("#main"),
    data: data
  });
  Backbone.history.start({ pushState: true });

  $(document).on('click', 'a[href^="#"]:not([data-bypass])', function(event) {
    event.preventDefault();

    var href = $(this).attr('href');
    Backbone.history.navigate(href, true);
  });
});
