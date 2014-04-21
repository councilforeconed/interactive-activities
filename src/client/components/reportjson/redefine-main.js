/* global host:true */

// In dev mode a host variable is set that used here will force requirejs to
// baseUrl to the remote host that served this file. Otherwise requirejs 
// up on the file: protocol and combines it with baseUrl in amd-config 
// create a baseUrl of file:///bower_components.
if (typeof host !== 'undefined') {
  require({
    baseUrl: host + '/bower_components'
  });
}

// Undefine scripts/main before we define the new one that will execute our new
// "main" file.
require.undef('scripts/main');
define('scripts/main', function(require) {
  'use strict';
  require('components/reportjson/reportjson');
});
