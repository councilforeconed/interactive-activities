// @file Example server. This demonstrates how to create a sub server that can
//    handle normal http traffic and websockets with socket.io. `process.send`
//    and `process.on('message')` are used to communicate with the parent node
//    process, such as telling the parent the port it is listening on.

'use strict';

// Third party libs.
var _debug = require('debug')('cee:example');

// Locally defined libs.
var common = require('../../../server/common');

// Create an express server.
// @param {object} options
//    - port port to listen to. Defaults to 0.
//    - hostname hostname to bind to. Defaults to 0.0.0.0.
// @param debug debug module instance to use
// @returns {Promise} Promise that resolves to the created server.
module.exports.createServer = function(options, debug) {
  options = options || {};
  // debug instances iterate the color value even if they share the name of
  // another instance, so passing an instance around is the only way to
  // maintain that color value.
  debug = debug || _debug;

  var app = common.createExpressServer(options);
  var server = app.listen(options.port || 0);

  return common.whenListening(server, debug);
};
