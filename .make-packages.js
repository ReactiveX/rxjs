var pkg = require('./package.json');
var fs = require('fs');

var cjsPkg = pkg;
var es6Pkg = pkg;

//override stuff for CJS package
cjsPkg.name = 'rxjs';
cjsPkg.main = 'Rx.js';
cjsPkg.typings = 'Rx.d.ts';

//override stuff for ES6 package
es6Pkg.name = 'rxjs-es6';
es6Pkg.main = 'Rx.js';
es6Pkg.typings = 'Rx.d.ts';

fs.writeFileSync('dist/cjs/package.json', JSON.stringify(cjsPkg, null, 2));
fs.writeFileSync('dist/es6/package.json', JSON.stringify(es6Pkg, null, 2));