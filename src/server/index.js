var express = require('express');
var jade = require('jade');

var app = express();
var getActivities = require('./get-activities');
var port = parseInt(process.env.NODE_PORT, 10) || 8000;

app.configure('development', function() {
  // Support addition of arbitrary pushState routes by serving the main index
  // file from all directories
  app.get(/\/$/, function(req, res, next) {
    res.render('index.jade', { activities: getActivities() });
    res.end();
  });

  // Map path to static activity assets in the `src/` directory
  app.get('/activity/:activity/*', function(req, res) {
    var activity = req.params.activity;
    var path = req.params[0];
    res.sendfile(path, { root: './src/activities/' + activity + '/client' });
  });

  app.use('/bower_components', express.static('bower_components'));
  app.use('/', express.static('src/client'));
  app.set('view engine', 'jade');
  app.set('views', 'src/client');
});

app.configure('production', function() {
  console.log('prod');
});

app.listen(port, '0.0.0.0');
console.log('Listening on 0.0.0.0:' + port);
