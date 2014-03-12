require({
  baseUrl: '/',
  paths: {
    jquery: 'bower_components/jquery/dist/jquery',
    backbone: 'bower_components/backbone/backbone',
    lodash: 'bower_components/lodash/dist/lodash.underscore',
    'socket.io': 'bower_components/socket.io-client/dist/socket.io',
    d3: 'bower_components/d3/d3',
    'd3.chart': 'bower_components/d3.chart/d3.chart',
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
    d3: {
      exports: 'd3',
    },
    'd3.chart': {
      deps: ['d3']
    },
    rangeslider: {
      deps: [
        'jquery',
        'css!bower_components/rangeslider.js/dist/rangeslider'
      ]
    }
  },
  deps: ['scripts/main']
});
