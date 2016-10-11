var pkg = require('./package.json');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var licenseTool = require('./tools/add-license-to-file');
var addLicenseToFile = licenseTool.addLicenseToFile;
var addLicenseTextToFile = licenseTool.addLicenseTextToFile;

// License info for minified files
var licenseUrl = 'https://github.com/ReactiveX/RxJS/blob/master/LICENSE.txt';
var license = 'Apache License 2.0 ' + licenseUrl;

delete pkg.scripts;

var cjsPkg = Object.assign({}, pkg, {
  name: 'rxjs',
  main: 'Rx.js',
  typings: 'Rx.d.ts'
});

fs.writeFileSync('dist/cjs/package.json', JSON.stringify(cjsPkg, null, 2));
fs.writeFileSync('dist/cjs/LICENSE.txt', fs.readFileSync('./LICENSE.txt').toString());
fs.writeFileSync('dist/cjs/README.md', fs.readFileSync('./README.md').toString());

// Bundles for CJS only
mkdirp.sync('dist/cjs/bundles');
// UMD bundles
fs.writeFileSync('dist/cjs/bundles/Rx.js', fs.readFileSync('dist/global/Rx.js').toString());
fs.writeFileSync('dist/cjs/bundles/Rx.min.js', fs.readFileSync('dist/global/Rx.min.js').toString());
fs.writeFileSync('dist/cjs/bundles/Rx.min.js.map', fs.readFileSync('dist/global/Rx.min.js.map').toString());

// Add licenses to tops of bundles
addLicenseToFile('LICENSE.txt', 'dist/cjs/bundles/Rx.js');
addLicenseTextToFile(license, 'dist/cjs/bundles/Rx.min.js');
addLicenseToFile('LICENSE.txt', 'dist/global/Rx.js');
addLicenseTextToFile(license, 'dist/global/Rx.min.js');