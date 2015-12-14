var pkg = require('./package.json');
var fs = require('fs');
var mkdirp = require('mkdirp');

delete pkg.scripts;

var cjsPkg = Object.assign({}, pkg, {
  name: 'rxjs',
  main: 'Rx.js',
  typings: 'Rx.d.ts'
});
var es6Pkg = Object.assign({}, cjsPkg, {
  name: 'rxjs-es',
});

fs.writeFileSync('dist/cjs/package.json', JSON.stringify(cjsPkg, null, 2));
fs.writeFileSync('dist/cjs/LICENSE.txt', fs.readFileSync('./LICENSE.txt').toString());
fs.writeFileSync('dist/cjs/README.md', fs.readFileSync('./README.md').toString());
// Bundles for CJS only
mkdirp('dist/cjs/bundles', function () {
  fs.writeFileSync('dist/cjs/bundles/Rx.umd.js', fs.readFileSync('dist/global/Rx.umd.js').toString());
  fs.writeFileSync('dist/cjs/bundles/Rx.umd.min.js', fs.readFileSync('dist/global/Rx.umd.min.js').toString());
  fs.writeFileSync('dist/cjs/bundles/Rx.umd.min.js.map', fs.readFileSync('dist/global/Rx.umd.min.js.map').toString());

  fs.writeFileSync('dist/es6/package.json', JSON.stringify(es6Pkg, null, 2));
  fs.writeFileSync('dist/es6/LICENSE.txt', fs.readFileSync('./LICENSE.txt').toString());
  fs.writeFileSync('dist/es6/README.md', fs.readFileSync('./README.md').toString());
});




