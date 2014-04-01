'use strict';

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

  var app = common.createExpressServer(options);
  var server = app.listen(options.port || 0);

  return common.whenListening(server, debug);
};
