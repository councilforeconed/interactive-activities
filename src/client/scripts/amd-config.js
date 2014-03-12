require({
  baseUrl: '/',
  paths: {
    jquery: 'bower_components/jquery/dist/jquery',
    backbone: 'bower_components/backbone/backbone',
    lodash: 'bower_components/lodash/dist/lodash.underscore',
    'socket.io': 'bower_components/socket.io-client/dist/socket.io',
    layoutmanager: 'bower_components/layoutmanager/backbone.layoutmanager',
    rangeslider: 'bower_components/rangeslider.js/dist/rangeslider',

    // AMD loader plugins
    jade: 'bower_components/require-jade/jade',
    css: 'bower_components/require-css/css'
  },
  map: {
    '*': {
      underscore: 'lodash'
    }
  },
  shim: {
    rangeslider: {
      deps: [
        'jquery',
        'css!bower_components/rangeslider.js/dist/rangeslider'
      ]
    }
  },
  deps: ['scripts/main']
});
