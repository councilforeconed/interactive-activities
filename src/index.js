// @file Executable script to start a top server.

'use strict';

// Third party libs.
var debug = require('debug')('cee');
var express = require('express');
var when = require('when');
var whenNode = require('when/node/function');

// Locally defined libs.
var common = require('./server/common');
var createTop = require('./server/createtop').createTop;

if (require.main === module) {
  // TODO: here is a good spot to parse command line arguments.
  createTop({}, debug)
    .then(function(server) {
      common.atTermination(server.close.bind(server), debug);
    });
}
