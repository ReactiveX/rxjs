var rollup = require('rollup');
var fs = require('fs');

var babel = require('babel-core');

rollup.rollup({
  entry: 'dist/es6/Rx.js'
}).then(function (bundle) {
  var result = bundle.generate({
    format: 'es'
  });

  var out = babel.transform(result.code, {
    compact: false,
    presets: [
      ['es2015', {loose: true}]
    ],
  });

  fs.writeFileSync('dist/global/Rx.js', out.code);
});
