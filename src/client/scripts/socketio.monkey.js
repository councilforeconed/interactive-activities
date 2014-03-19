/* global io:true */

// @file Monkey patch socket.io to use default options for io.connect. Normally
//   we might just give those options normally to socket.io however this is to
//   get options to socket.io around a dependency, cloak, which is making the
//   call it self but does not provide a means to pass these options.
define(function(require) {
  'use strict';
  var _ = require('lodash');
  require('socket.io');

  var _connect = io.connect;
  io.connect = function(host, options) {
    options = _.extend(options, io.connect.options);
    return _connect.call(io, host, options);
  };
  io.connect.options = {};

  return io;
});
