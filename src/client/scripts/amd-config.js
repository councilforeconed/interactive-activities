require({
  baseUrl: '/bower_components',
  paths: {
    activities: '../activities',
    components: '../components',
    scripts: '../scripts',

    // Third-party libraries
    backbone: 'backbone/backbone',
    d3: 'd3/d3',
    'd3.chart': 'd3.chart/d3.chart',
    layoutmanager: 'layoutmanager/backbone.layoutmanager',
    lodash: 'lodash/dist/lodash.underscore',
    jquery: 'jquery/dist/jquery',
    'jquery.pep': 'jquery.pep/src/jquery.pep',
    rangeslider: 'rangeslider.js/dist/rangeslider',
    'socket.io': 'socket.io-client/dist/socket.io',

    // AMD loader plugins
    jade: 'require-jade/jade'
  },
  map: {
    '*': {
      underscore: 'lodash'
    }
  },
  packages: [
    /**
     * The CSS loader plugin references modules using relative paths, so
     * it must be specified as an AMD package in order for r.js to
     * resolve its dependencies correctly.
     */
    {
      location: 'require-css',
      name: 'css',
      main: 'css'
    }
  ],
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
        'css!rangeslider.js/dist/rangeslider'
      ]
    }
  },
  deps: ['scripts/main']
});
