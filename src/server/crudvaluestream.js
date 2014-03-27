'use strict';

// Third party libs
var Readable = require('readable-stream').Readable;

// Export CRUDValueStream class.
module.exports = CRUDValueStream;

// Help DataCollection by iterating the objects in a CRUDManager by a list of
// keys and emitting stream events for each.
// @param {CRUDManager} crudManager
// @param {array} keys array of key strings to read from crud manager
function CRUDValueStream(crudManager, keys) {
  Readable.call(this, { objectMode: true });

  this.crudManager = crudManager;
  this.keys = keys;
  this.index = 0;
}

// Inherit from Readable, an abstract Stream implementation.
CRUDValueStream.prototype = Object.create(Readable.prototype);
CRUDValueStream.prototype.constructor = CRUDValueStream;

// By instruction of the Readable Stream implementation, read the next object
// and push it.
CRUDValueStream.prototype._read = function() {
  var self = this;
  if (self.index < self.keys.length) {
    // Read the next key, push it, and then if true is returned by push repeat
    self.crudManager.read(self.keys[self.index++])
      .then(function(data) {
        if (self.push(data)) {
          self._read();
        }
      })
      .catch(function(err) {
        self.emit('error', err);
        throw err;
      });
  } else {
    // EOF, push null to signal that self stream is done.
    self.push(null);
  }
};
