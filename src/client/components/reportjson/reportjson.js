define('components/reportjson/reportjson', function(require) {
  'use strict';

  var $ = require('jquery');
  var highlight = require('highlight');
  require('css!highlightjs/styles/github');

  $(document).ready(function() {
    $('pre code').each(function(i, e) {
      highlight.highlightBlock(e);
    });
  });
});
