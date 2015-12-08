var pkg = require('./package.json');
var fs = require('fs');

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

fs.writeFileSync('dist/es6/package.json', JSON.stringify(es6Pkg, null, 2));
fs.writeFileSync('dist/es6/LICENSE.txt', fs.readFileSync('./LICENSE.txt').toString());
fs.writeFileSync('dist/es6/README.md', fs.readFileSync('./README.md').toString());
