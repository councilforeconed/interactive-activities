'use strict';

var Transform = require('readable-stream/transform');

module.exports = ReportTemplateStream;

// This may be generalized to being handed a template.
function ReportTemplateStream(req, templateFn, options) {
  options = options || {};
  options.objectMode = true;

  Transform.call(this, options);

  this.request = req;
  this.template = templateFn;
}

ReportTemplateStream.prototype = Object.create(Transform.prototype);
ReportTemplateStream.prototype.constructor = ReportTemplateStream;

ReportTemplateStream.prototype._transform = function(record, enc, cb) {
  // Expect the record to be the report. If not an object, make an empty one.
  var context;
  if (typeof record !== 'object') {
    context = { report: {} };
  } else {
    context = { report: record };
  }

  // Define whether this is in dev mode.
  context.dev = process.env.NODE_ENV !== 'production';

  // Set request data.
  var req = this.request;
  context.requestInfo = {
    protocolAndHost: req.protocol + '://' + req.headers.host,
  };

  context.rendered = this.template(context);
  cb(undefined, context);
};
