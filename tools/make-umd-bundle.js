var rollup = require('rollup');
var rollupNodeResolve = require('rollup-plugin-node-resolve');

var fs = require('fs');

rollup.rollup({
  entry: 'dist/esm5_for_rollup/internal/umd.js',
  plugins: [
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

  fs.writeFileSync('dist/global/rxjs.umd.js', result.code);
  fs.writeFileSync('dist/global/rxjs.umd.js.map', result.map);
});
