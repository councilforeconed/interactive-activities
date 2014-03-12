'use strict';

var url = require('url');

var assert = require('chai').assert;
var request = require('request');
var whenNode = require('when/node/function');

exports.mustThrow = function() {
  assert.fail('should have thrown an error');
};

exports.testErrorMessage = function(re) {
  return function(e) {
    if (re.test(e.message)) {
      return;
    }
    throw e;
  };
};

exports.testUrl = function(server, path) {
  return url.format({
    protocol: 'http',
    hostname: 'localhost',
    port: server.address().port,
    pathname: path
  });
};

exports.whenTestRequest = function() {
  var args = Array.prototype.slice.call(arguments);
  var server = args.shift();
  var url = args[0];
  if (typeof url === 'object') {
    url = url.url;
  }
  url = this.testUrl(server, url);
  if (typeof args[0] === 'object') {
    args[0].url = url;
  } else {
    args[0] = url;
  }
  return whenNode.apply(request, args);
};
