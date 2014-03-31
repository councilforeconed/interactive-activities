'use strict';

var http = require('http');
var spawn = require('child_process').spawn;

http.createServer(function(req, res) {
  var json = '';

  if (req.method !== 'POST') {
    return;
  }
  if (req.headers['x-github-event'] !== 'push') {
    return;
  }

  req.on('data', function(chunk) {
    json += chunk;
  });
  req.on('end', function() {
    var data = JSON.parse(json);

    if (data.ref === 'refs/heads/master') {
      // The spawned process invokes Grunt, which will fail if run in a "detached"
      // state *without* I/O redirection.
      spawn('./deploy.sh', [], {
        detached: true,
        stdio: 'ignore'
      });
    }

    res.end();
  });
  req.on('error', function() {
    res.end();
  });
}).listen(1337, '0.0.0.0');

console.log('Server running at http://0.0.0.0:1337/');
