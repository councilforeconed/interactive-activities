'use strict';
var fs = require('fs');
var whenNode = require('when/node/function');

/**
 * Read an input file for a comma-separated list of process identifiers and
 * attempt to kill each represented process.
 *
 * @param {String} filename
 *
 * @returns {Promise} Array of process identifiers
 */
module.exports.read = function(filename) {
  return whenNode.call(fs.readFile, filename, { encoding: 'utf-8' })
    .then(function(content) {
      return content.split(',').map(function(pidStr) {
        return parseInt(pidStr, 10);
      }).filter(function(pid) {
        return !!pid;
      });
    });
};

/**
 * Save an array of process identifiers as a comma-separated list in a file at
 * the provided location.
 *
 * @param {String} filename
 * @param {Array} pids
 *
 * @returns {Promise} resolved when the operation is complete
 */
module.exports.write = function(filename, pids) {
  var pidStr = pids.join(',');
  return whenNode.call(fs.writeFile, filename, pidStr);
};
