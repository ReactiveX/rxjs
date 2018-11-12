var _ = require('lodash');

var rollup = require('rollup');
var rollupAlias = require('rollup-plugin-alias');
var rollupInject = require('rollup-plugin-inject');
var rollupNodeResolve = require('rollup-plugin-node-resolve');

var fs = require('fs');
var tslib = require('tslib');
var path = require('path');

module.exports = function rollupBundle(options) {
  var dest = options.dest;
  var sourcemapFullFile = dest + '.map';

  rollup.rollup({
    input: options.input,
    plugins: [
      rollupAlias(options.aliases),
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
    return bundle.generate({
      format: 'umd',
      name: 'rxjs',
      amd: {
        id: 'rxjs'
      },
      sourcemap: true,
    });
  }).then(function (result) {
    // rollup doesn't add a sourceMappingURL
    // https://github.com/rollup/rollup/issues/121
    result.code = result.code + '\n//# sourceMappingURL=' + path.basename(sourcemapFullFile);

    fs.writeFileSync(dest, result.code);
    fs.writeFileSync(sourcemapFullFile, result.map);
  }).catch(function (err) {
    console.error(err);
    process.exit(1);
  });
};
