var fs = require('fs');

module.exports = function() {
  return fs.readdirSync('src/activities').map(function(dirName) {
    return {
      slug: dirName,
      fileName: './src/activities/' + dirName + '/config.json'
    };
  }).filter(function(activity) {
    return fs.statSync(activity.fileName).isFile();
  }).map(function(activity) {
    var metaDataJSON = String(fs.readFileSync(activity.fileName));
    var metaData = JSON.parse(metaDataJSON);
    metaData.slug = activity.slug;
    return metaData;
  });
};
