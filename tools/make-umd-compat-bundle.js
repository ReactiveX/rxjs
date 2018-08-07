var rollup = require('rollup');
var rollupAlias = require('rollup-plugin-alias');
var rollupNodeResolve = require('rollup-plugin-node-resolve');

var fs = require('fs');

rollup.rollup({
  entry: 'dist-compat/esm5_for_rollup/compat/umd.js',
  plugins: [
    rollupAlias({
      'rxjs/testing': 'dist-compat/esm5_for_rollup/src/testing/index.js',
      'rxjs/operators': 'dist-compat/esm5_for_rollup/src/operators/index.js',
      'rxjs/webSocket': 'dist-compat/esm5_for_rollup/src/webSocket/index.js',
      'rxjs/ajax': 'dist-compat/esm5_for_rollup/src/ajax/index.js',
      'rxjs/internal-compatibility': 'dist-compat/esm5_for_rollup/src/internal-compatibility/index.js',
      'rxjs': 'dist-compat/esm5_for_rollup/src/index.js',
    }),
    rollupNodeResolve({
      jsnext: true,
    }),
  ],
}).then(function (bundle) {
  var result = bundle.generate({
    format: 'umd',
    moduleName: 'rxjs',
    sourceMap: true
  });

  fs.writeFileSync('dist-compat/global/rxjs-compat.umd.js', result.code);
  fs.writeFileSync('dist-compat/global/rxjs-compat.umd.js.map', result.map);
});
