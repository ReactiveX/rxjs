var webpack = require('webpack');
var config = require('./webpack.mocha.config');

config.plugins.push(
  new webpack.NormalModuleReplacementPlugin(
    /\.\.\/dist\/cjs\/Rx/,
    function(result) { result.request = result.request.replace('cjs', 'global'); }
  )
);

module.exports = config;
