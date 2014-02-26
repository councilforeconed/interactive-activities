var fs = require('fs');
var path = require('path');

var activitiesDir = path.join(__dirname, '../activities');

/**
 * Return an array with metadata for each activity as defined by the files
 * present in the project's `src/activities/` directory. Additionally, perform
 * some basic validation to ensure that each activity conforms to the
 * expectations of the build process.
 */
module.exports = function() {
  return fs.readdirSync(activitiesDir).map(function(name) {
    var directory = path.join(activitiesDir, name);
    return {
      slug: name,
      directory: directory,
      configFile: directory + '/config.json'
    };
  }).filter(function(activity) {
    return fs.statSync(activity.configFile).isFile();
  }).map(function(activity) {
    var configJSON = String(fs.readFileSync(activity.configFile));
    var config = JSON.parse(configJSON);
    try {
      validate(activity.directory, config);
    } catch(err) {
      err.message = 'Activity error: (' + activity.slug + ') '+ err.message;
      throw err;
    }
    config.slug = activity.slug;
    return config;
  });
};

function validate(directory, metaData) {
  if ('slug' in metaData) {
    throw new Error('The "slug" configuration parameter is reserved');
  }
  if (!fs.statSync(directory + '/client/scripts/main.js').isFile()) {
    throw new Error(
      'Missing "main.js" entry point in "client/scripts" directory'
    );
  }
}
