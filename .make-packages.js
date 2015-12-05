var pkg = require('./package.json');
var fs = require('fs');

delete pkg.scripts;

var cjsPkg = pkg;
var es6Pkg = pkg;

//override stuff for CJS package
cjsPkg.name = 'rxjs';
cjsPkg.main = 'Rx.js';
cjsPkg.typings = 'Rx.d.ts';

fs.writeFileSync('dist/cjs/package.json', JSON.stringify(cjsPkg, null, 2));
fs.writeFileSync('dist/cjs/LICENSE.txt', fs.readFileSync('./LICENSE.txt').toString());
fs.writeFileSync('dist/cjs/README.md', fs.readFileSync('./README.md').toString());

//override stuff for ES6 package
es6Pkg.name = 'rxjs-es';
es6Pkg.main = 'Rx.js';
es6Pkg.typings = 'Rx.d.ts';

fs.writeFileSync('dist/es6/package.json', JSON.stringify(es6Pkg, null, 2));
fs.writeFileSync('dist/es6/LICENSE.txt', fs.readFileSync('./LICENSE.txt').toString());
fs.writeFileSync('dist/es6/README.md', fs.readFileSync('./README.md').toString());
