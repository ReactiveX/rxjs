var rollup = require('rollup');
var fs = require('fs');
var path = require('path');

rollup.rollup({
  entry: 'dist/es6/Rx.js'
}).then(function (bundle) {
  var result = bundle.generate({
    format: 'umd',
    moduleName: 'Rx',
    sourceMap: true
  });
  var tslib = fs.readFileSync(path.join(process.cwd() + '/node_modules/tslib/tslib.js'), 'utf8')

  fs.writeFileSync('dist/global/Rx.js', tslib + result.code);
  fs.writeFileSync('dist/global/Rx.js.map', result.map);
});
