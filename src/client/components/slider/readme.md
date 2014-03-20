# CEE Slider Component

In order to maximize device compatability, this component is implemented with
[jQuery Mobile](http://jquerymobile.com/). That library defines its internals
with AMD, so only the relevant sub-modules are included in the build. However,
not all dependencies are correctly expressed, so the following must be
maintained manually:

- The `event` module - The slider will not respond to mouse/pointer events if
  this module is not loaded.
- CSS - The slider does not express its dependencies on CSS source files.
  Unfortunately, the CSS files themselves do not express their
  interdependencies, so in order to use the styles in the `bower_components/`
  directory, this module would have to explicitly "cherry pick" each CSS file.
  Because of the inherent brittleness of that approach, a [custom
  build](http://jquerymobile.com/download-builder/) of jQuery Mobile's
  stylesheets has been checked in to the repository. If jQuery Mobile is
  updated, this file will need to be manually re-built. Note also that the file
  has been modified to remove global presentation changes.

Both of these details are also documented in the relevant sections of the
source code.
