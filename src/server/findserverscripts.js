// @file Walk the project hierarchy to find server scripts.

'use strict';

// Node included libs.
var fs = require('fs');
var path = require('path');

// Third party libs.
var _ = require('lodash');
var when = require('when');
var whenNode = require('when/node/function');

// Recursively walk a folder hierarchy, calling a callback for each file found.
// @param {string} p path to walk from
// @param {function} cb callback with one argument for the joined path of the 
//    discovered file
// @returns {Promise} promise that resolves when done
var walk = function(p, cb) {
  // Read the names of objects in a directory.
  return whenNode.call(fs.readdir, p)
    .then(_.partialRight(when.map, function(file) {
      file = path.join(p, file);
      // Stat the full file path.
      // If its a directory recurse into that.
      // Otherwise callback with the path.
      return whenNode.call(fs.stat, file)
        .then(function(stat) {
          if (stat.isDirectory()) {
            return walk(file, cb);
          } else {
            cb(file);
          }
        });
    }))
    .yield(undefined)
    .catch(function(e) {
      // Disallow any more callbacks if we have an error.
      cb = function() {};
      // Re-throw so the promise remains in the reject state for code outside
      // of walk to handle.
      throw e;
    });
};

// Walk the project struct to find server scripts.
// @returns {Promise} promise that resolves to an array of script paths
module.exports.findServerScripts = function() {
  var scripts = [];
  return walk('src/activities', function(file) {
      if (/src\/activities\/\w+\/index.js/.test(file)) {
        scripts.push(file);
      }
    })
    .yield(scripts);
};
