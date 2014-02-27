var express = require('express');
var jade = require('jade');

var app = express();
var getActivities = require('./get-activities');
var port = parseInt(process.env.NODE_PORT, 10) || 8000;
var staticDir;

app.configure('development', function() {
  staticDir = 'src';

  // Support addition of arbitrary pushState routes by serving the main index
  // file from all directories
  app.get(/\/$/, function(req, res, next) {
    res.render('index.jade', { activities: getActivities(), dev: true });
    res.end();
  });
  app.use('/static', express.static(staticDir + '/client'));
  app.use('/static/bower_components', express.static('bower_components'));

  app.set('view engine', 'jade');
  app.set('views', 'src/client');
});

app.configure('production', function() {
  staticDir = 'out';

  // Support addition of arbitrary pushState routes by serving the main index
  // file from all directories
  app.get(/\/$/, function(req, res, next) {
    res.render('index.jade', { activities: getActivities() });
    res.end();
  });
  app.use('/static', express.static(staticDir + '/client'));
  app.use('/static/bower_components', express.static(staticDir + '/bower_components'));


  app.set('view engine', 'jade');
  app.set('views', 'src/client');
});

// Map path to static activity assets
app.get('/static/activities/:activity/*', function(req, res) {
  var activity = req.params.activity;
  var path = req.params[0];
  res.sendfile(path, {
    root: './' + staticDir + '/activities/' + activity
  });
});

app.listen(port, '0.0.0.0');
console.log('Listening on 0.0.0.0:' + port);
