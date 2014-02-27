// @file Executable script to start a top server.

'use strict';

// Third party libs.
var _ = require('lodash');
var debug = require('debug')('cee');
var express = require('express');
var when = require('when');
var whenNode = require('when/node/function');

// Locally defined libs.
var common = require('./server/common');
var createTop = require('./server/createtop').createTop;

var argv = require('commander')
  .usage('[options]')
  .option('-p, --port <n>', 'Port to listen on.', parseInt)
  .option('-b, --hostname <a>', 'Address to bind to. (eg. "0.0.0.0")')
  .option(
    '-a, --activities <a>',
    'Comma separated list of activities to start.'
  )
  .parse(process.argv);

var checkArgType = function(arg, type) {
  return typeof arg !== type && arg !== undefined;
};

var logArgError = function(args) {
  console.error.apply(console, arguments);
  argv.help();
};

// Do not allow unknown options to be given. Show help and quit.
if (argv.args.length > 0) {
  logArgError('Unrecognized options:', argv.args.join(' '));
// Make sure hostname is a string. Print a helpful message if it isn't.
} else if (checkArgType(argv.hostname, 'string')) {
  logArgError('--hostname value must be a string. Given:', argv.hostname);
// Make sure activities is a string. Print a helpful message if it isn't.
} else if (checkArgType(argv.activities, 'string')) {
  logArgError('--activities value must be a string. Given:', argv.activities);
}

// Build a scriptFilter function from the activities argument.
//
// Comma separated values can be name, !name, or *.
// name: Include the activity with that name.
// !name: Exclude the activity with that name.
//    If all arguments are !name style, all remaining activities are included.
// *: Include all other activities.
//    Need if name and !name style are used.
if (argv.activities) {
  var activities = argv.activities.split(',');
  var allRemainingActivities = _.contains(activities, '*');
  if (
    !allRemainingActivities &&
    _.all(activities, function(activity) {
      return activity[0] === '!';
    })
  ) {
    allRemainingActivities = true;
  }

  argv.scriptFilter = function(scriptPath) {
    var scriptName = /src\/activities\/(\w+)\/index.js/.exec(scriptPath)[1];
    // User can include a !name argument along with * to exclude activities.
    if (_.contains(activities, '!' + scriptName)) {
      return false;
    } else if (allRemainingActivities || _.contains(activities, scriptName)) {
      return true;
    }
    return false;
  };
}

createTop(argv, debug)
  .then(function(server) {
    common.atTermination(server.close.bind(server), debug);
  })
  .catch(function(e) {
    // Log a more descriptive message for common listen errors.
    if (e.code === 'EACCES' && e.syscall === 'listen') {
      console.error('Unable to bind to port:', argv.port);
    } else if (e.code === 'EADDRNOTAVAIL' && e.syscall === 'listen' ) {
      console.error('Unable to bind to hostname:', argv.hostname);
    }

    // Print the error
    console.error(e);
  });
