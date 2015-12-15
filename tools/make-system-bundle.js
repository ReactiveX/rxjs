var path = require('path');
var Builder = require('systemjs-builder');
var addLicenseToFile = require('./add-license-to-file');

var config = {
  baseURL: 'dist',
  paths: {
      'rxjs/*': 'cjs/*.js'
  }
};

var devBuilder = new Builder();
devBuilder.config(config);
devBuilder.build('rxjs/Rx', path.resolve(__dirname, '../dist/global/Rx.js')).then(function() {
  var prodBuilder = new Builder();
  prodBuilder.config(config);
  prodBuilder.build('rxjs/Rx', path.resolve(__dirname, '../dist/global/Rx.min.js'), {sourceMaps: true, minify: true}).then(function() {
    process.exit(0);
  }, function(err) {
    console.error('prod died', err);
    process.exit(1);
  });

}, function(err) {
  console.error('dev died', err);
  process.exit(1);
});

process.stdin.resume();
