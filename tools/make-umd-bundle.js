var rollup = require('rollup');
var fs = require('fs');

var babel = require('babel-core');

var umdPrelude = [
  ';(function (global, factory) {',
  '  if (typeof define === "function" && define.amd) {',
  '      define(["exports"], factory);',
  '  } else if (typeof exports !== "undefined") {',
  '      factory(exports);',
  '  } else {',
  '      var _exports = {};',
  '      factory(_exports);',
  '      global.Rx = _exports;',
  '  }',
  '})(this, (function (exports) {', // The extra wrapping parens are important.
  ''                                // https://github.com/nolanlawson/optimize-js
].join('\n');

var umdPostlude = [
  '',
  '}));'
].join('\n');

rollup.rollup({
  entry: 'dist/es6/Rx.js'
}).then(function (bundle) {
  var result = bundle.generate({
    format: 'es'
  });

  var out = babel.transform(result.code, {
    compact: false,
    presets: [
      ['es2015', { loose: true }]
    ],
  });

  fs.writeFileSync('dist/global/Rx.js', umdPrelude + out.code + umdPostlude);
});
