var _ = require('lodash');
var path = require('path');
var glob = require('glob');
var webpack = require('webpack');

var globPattern = 'spec-js/**/!(mocha.sauce.gruntfile|mocha.sauce.runner|webpack.mocha.config|painter|diagram-test-runner|polyfills|testScheduler-ui).js';
var files = _.map(glob.sync(globPattern), function (x) {
  return path.resolve('./', x);
});

module.exports = {
  devtool: '#inline-source-map',

  stats: {
    colors: true,
    assets: false,
    chunks: false
  },

  entry: {
    'browser.polyfills': './spec-js/helpers/polyfills.js',
    'browser.testscheduler': './spec-js/helpers/testScheduler-ui.js',
    'browser.spec': files
  },

  output: {
    path: 'tmp/browser',
    filename: '[name].js',
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('browser.common.js'),
    new webpack.IgnorePlugin(/^mocha$/)
  ]
};
