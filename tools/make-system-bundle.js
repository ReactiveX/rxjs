var path = require('path');
var Builder = require('systemjs-builder');
var addLicenseToFile = require('./add-license-to-file');

var config = {
  paths: {
    'rxjs/': 'dist/cjs/',
    'symbol-observable/*': 'node_modules/symbol-observable/*',
  },
  packages: {
    'symbol-observable': {
      main: 'index.js'
    }
  },

  defaultJSExtensions: true,
};

function build(name, inputFile, outputFile) {
  var devBuilder = new Builder();

  devBuilder.config(config);

  devBuilder.bundle(name, path.resolve(__dirname, inputFile)).then(function () {
    var prodBuilder = new Builder();
    prodBuilder.config(config);
    prodBuilder.bundle(name, path.resolve(__dirname, outputFile), {sourceMaps: true, minify: true}).then(function () {
      process.exit(0);
    }, function (err) {
      console.error('prod died', err);
      process.exit(1);
    });
  }, function (err) {
    console.error('dev died', err);
    process.exit(1);
  });
}

build('rxjs/Rx', '../dist/global/Rx.js', '../dist/global/Rx.min.js');

process.stdin.resume();
