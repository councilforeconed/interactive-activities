'use strict';

var fs = require('fs');

var _debug = require('debug')('cee:commonreport');
var jade = require('jade');
var whenNode = require('when/node/function');

var ReportResource = require('./resource');
var ReportTypeResource = require('./typeresource');
var ReportTemplateStream = require('./templatestream');

// Add a express resource for reporting to the given app.
// @param options
//    - app an express application
//    - DataAggregator a stream constructor that accepts data from a
//      dataCollector.getStream call
//    - dataCollector a data collector containing the report data
//    - templatePath a path to a jade template to render with the report data
//    - [debug] a debug function
module.exports = function(options) {
  var debug = options.debug || _debug;

  whenNode.call(fs.readFile, options.templatePath)
    .then(jade.compile)
    .then(whenTemplateResourceFactory(options))
    .catch(function(err) {
      debug('!!ERROR', err.message);
    });
};

var whenTemplateResourceFactory = function(options) {
  var app = options.app;
  var dataCollector = options.dataCollector;
  var DataAggregator = options.DataAggregator;

  return function(reportTemplate) {
    // Handle requests to '/report/:room/:report_type'.
    app
      // Load data, aggregate it, and extrude html.
      .resource('report', ReportResource.factory({
        collector: dataCollector,
        transform: function(req, dataStream) {
          return dataStream
            .pipe(new DataAggregator())
            .pipe(new ReportTemplateStream(req, reportTemplate));
        }
      }))
      // Handle by request mode of output (download, email).
      .add(app.resource(ReportTypeResource.factory({
        streamResourceId: ReportResource.id
      })));
  };
};
