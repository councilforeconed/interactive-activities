define(function(require) {
  'use strict';

  var MainView = require('../components/main/main');

  // TODO: Remove this dependency. It is included here only for prototyping
  // purposes (as a proof-of-concept for the optimization of shared library
  // code).
  require('socket.io');

  return MainView;
});
