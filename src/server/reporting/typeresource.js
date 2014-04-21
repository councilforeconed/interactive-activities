'use strict';

var reportdownload = require('./delivery/download');
var reportemail = require('./delivery/email');

var id = 'report_type';

module.exports.factory = function(options) {
  var streamResourceId = options.streamResourceId;

  var handles = {
    'download': reportdownload.handle,
    'email': reportemail.handle
  };

  return {
    id: id,
    show: function(req, res, next) {
      if (req.params[id] in handles) {
        handles[req.params[id]](req[streamResourceId], req, res, next);
      } else {
        next(new Error('Do not know how to perform ' + req.params[id] + '.'));
      }
    }
  };
};
