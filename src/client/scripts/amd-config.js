require({
  baseUrl: '/bower_components',
  paths: {
    scripts: '../scripts',
    components: '../components',
    activities: '../activities',

    jquery: 'jquery/dist/jquery',
    'jquery.pep': 'jquery.pep/src/jquery.pep',
    d3: 'd3/d3',
    'd3.chart': 'd3.chart/d3.chart',
    backbone: 'backbone/backbone',
    lodash: 'lodash/dist/lodash.underscore',
    'socket.io': 'socket.io-client/dist/socket.io',
    layoutmanager: 'layoutmanager/backbone.layoutmanager',
    rangeslider: 'rangeslider.js/dist/rangeslider',

    // AMD loader plugins
    jade: 'require-jade/jade',
    css: 'require-css/css'
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
