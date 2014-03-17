'use strict';

var express = require('express');

var common = require('../../../server/common');

/**
 * Create an express server
 *
 * @param {Object} options
 *    - port port to listen to. Defaults to 0.
 *    - hostname hostname to bind to. Defaults to 0.0.0.0.
 *
 * @returns {Promise} Promise that resolves with the value of the server
 *                    process when it is listening.
 */
module.exports = function(options, debug) {
  options = options || {};

  var app = express();

  var server = app.listen(options.port || 0);
  server.on('listening', function() {
    process.send({ name: 'listening-on', port: server.address().port });
  });

  app.use('/client', express.static('client'));

  process.send('ok');

  return common.whenListening(server, debug);
};
