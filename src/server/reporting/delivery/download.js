'use strict';

var path = require('path');

var through2 = require('through2');

module.exports.handle = function(stream, req, res) {
  stream
    .pipe(through2({ objectMode: true }, function(record, enc, cb) {
      var filename;
      if (record.filename) {
        filename = record.filename;
      } else {
        filename = 'report.html';
      }

      // Instruct browsers to download?
      res.set(
        'Content-Disposition',
        'attachment; filename="' + path.basename(filename) + '"'
      );

      // Filter rendered content.
      cb(undefined, record.rendered);
    }))
    .pipe(res);
};
