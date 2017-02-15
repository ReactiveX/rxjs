var _ = require('lodash');

var rollup = require('rollup');
var rollupInject = require('rollup-plugin-inject');
var rollupNodeResolve = require('rollup-plugin-node-resolve');

var fs = require('fs');
var path = require('path');

var tslib = require('tslib');

rollup.rollup({
  entry: 'dist/es6/Rx.js',
  plugins: [
    rollupNodeResolve({
      jsnext: true,
    }),
    rollupInject({
      exclude: 'node_modules/**',
      modules: _.mapValues(tslib, function (value, key) {
        return ['tslib', key];
      }),
    }),
  ],
}).then(function (bundle) {
  var result = bundle.generate({
    format: 'umd',
    moduleName: 'Rx',
    sourceMap: true
  });

  fs.writeFileSync('dist/global/Rx.js', result.code);
  fs.writeFileSync('dist/global/Rx.js.map', result.map);
});
