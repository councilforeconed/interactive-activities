var express = require('express');
var jade = require('jade');

var app = express();
var getActivities = require('./get-activities');
var port = parseInt(process.env.NODE_PORT, 10) || 8000;

app.configure('development', function() {
  app.get(/^\/(?:activity\/[^\/]+\/?)?$/, function(req, res, next) {
    res.render('index.jade', { activities: getActivities() });
    res.end();
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
