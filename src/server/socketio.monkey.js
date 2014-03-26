// @file Monkey patch socket.io to use default options for io.listen. Normally
//   we might just give those options normally to socket.io however this is to
//   get options to socket.io around a dependency, cloak, which is making the
//   call it self but does not provide a means to pass these options.
'use strict';

// Third party libs
var _ = require('lodash');
var io = require('socket.io');

// Re-export socket.io
module.exports = io;

var _listen = io.listen;
io.listen = function(host, options) {
  options = _.extend(options, io.listen.options);
  return _listen.call(io, host, options);
};
io.listen.options = {};
