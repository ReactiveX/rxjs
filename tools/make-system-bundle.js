var path = require('path');
var Builder = require('systemjs-builder');
var addLicenseToFile = require('./add-license-to-file');

var config = {
  baseURL: 'dist',
  paths: {
    'rxjs/*': 'cjs/*.js',
    'symbol-observable': '../node_modules/symbol-observable/index.js',
    'ponyfill': '../node_modules/symbol-observable/ponyfill.js'
  }
};

build('rxjs/Rx', '../dist/global/Rx.js', '../dist/global/Rx.min.js');
build('rxjs/Rx.KitchenSink', '../dist/global/Rx.KitchenSink.js', '../dist/global/Rx.KitchenSink.min.js');

function build(name, inputFile, outputFile) {
  var devBuilder = new Builder();

  devBuilder.config(config);

  devBuilder.build(name, path.resolve(__dirname, inputFile)).then(function () {
    var prodBuilder = new Builder();
    prodBuilder.config(config);
    prodBuilder.build(name, path.resolve(__dirname, outputFile), {sourceMaps: true, minify: true}).then(function () {
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

process.stdin.resume();
