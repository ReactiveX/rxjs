var _ = require('lodash');

var rollup = require('rollup');
var typescript = require('rollup-plugin-typescript');
var rollupNodeResolve = require('rollup-plugin-node-resolve');
var alias = require('rollup-plugin-alias');
var fs = require('fs');
var path = require('path');

rollup.rollup({
  input: './src/internal/umd.ts',
  output: {
    name: 'rxjs.umd',
  },
  plugins: [
    typescript(),
    // alias({
    //   'rxjs': path.join(__dirname, '../package/_rollup'),
    // })
  ],
}).then(function (bundle) {
  return bundle.generate({
    format: 'umd',
    output: {
      name: 'rxjs.umd',
    },
    moduleName: 'rxjs',
    sourceMap: true
  });
}).then(function (result) {
  fs.writeFileSync('package/bundles/rxjs.umd.js', result.code);
  fs.writeFileSync('package/bundles/rxjs.umd.js.map', result.map);
});
