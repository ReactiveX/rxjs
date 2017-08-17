"use strict";

let pkg = require('./package.json');
let fs = require('fs-extra');
let mkdirp = require('mkdirp');
let path = require('path');
let klawSync = require('klaw-sync');
let licenseTool = require('./tools/add-license-to-file');
let addLicenseToFile = licenseTool.addLicenseToFile;
let addLicenseTextToFile = licenseTool.addLicenseTextToFile;

const ROOT = 'dist/';
const CJS_ROOT = ROOT + 'cjs/';
const ESM5_ROOT = ROOT + 'esm5/';
const ESM2015_ROOT = ROOT + 'esm2015/';
const UMD_ROOT = ROOT + 'global/';
const TYPE_ROOT = ROOT + 'typings/';
const PKG_ROOT = ROOT + 'package/';
const CJS_PKG = PKG_ROOT + '_cjs/';
const ESM5_PKG = PKG_ROOT + '_esm5/';
const ESM2015_PKG = PKG_ROOT + '_esm2015/';
const UMD_PKG = PKG_ROOT + 'bundles/';
const TYPE_PKG = PKG_ROOT + '_typings/';


// License info for minified files
let licenseUrl = 'https://github.com/ReactiveX/RxJS/blob/master/LICENSE.txt';
let license = 'Apache License 2.0 ' + licenseUrl;

delete pkg.scripts;
fs.removeSync(PKG_ROOT);

let rootPackageJson = Object.assign({}, pkg, {
  name: 'rxjs',
  main: './_cjs/Rx.js',
  module: './_esm5/Rx.js',
  es2015: './_esm2015/Rx.js',
  typings: './_typings/Rx.d.ts'
});

// Read the files and create package.json files for each. This allows Node,
// Webpack, and any other tool to resolve using the "main", "module", or
// other keys we add to package.json.
klawSync(CJS_ROOT, {
  nodir: true,
  filter: function(item) {
    return item.path.endsWith('.js');
  }
})
.map(item => item.path)
.map(path => path.slice((`${__dirname}/${CJS_ROOT}`).length))
.forEach(fileName => {
  // Get the name of the directory to create
  let parentDirectory = path.dirname(fileName);
  // Get the name of the file to be the new directory
  let directory = fileName.slice(0, fileName.length - 3);
  let targetFileName = path.basename(directory);

  fs.ensureDirSync(PKG_ROOT + parentDirectory);

  // For "index.js" files, these are re-exports and need a package.json
  // in-place rather than in a directory
  if (targetFileName !== "index") {
    fs.ensureDirSync(PKG_ROOT + directory);
    fs.writeJsonSync(PKG_ROOT + directory + '/package.json', {
      main: path.relative(PKG_ROOT + directory, CJS_PKG + directory) + '.js',
      module: path.relative(PKG_ROOT + directory, ESM5_PKG + directory) + '.js',
      es2015: path.relative(PKG_ROOT + directory, ESM2015_PKG + directory) + '.js',
      typings: path.relative(PKG_ROOT + directory, TYPE_PKG + directory) + '.d.ts'
    });
  } else {
    // If targeting an "index", there is no directory
    directory = directory.split('/').slice(0, -1).join('/');
    fs.writeJsonSync(PKG_ROOT + directory + '/package.json', {
      main: path.relative(PKG_ROOT + directory, CJS_PKG + directory + '/index.js'),
      module: path.relative(PKG_ROOT + directory, ESM5_PKG + directory + '/index.js'),
      es2015: path.relative(PKG_ROOT + directory, ESM2015_PKG + directory + '/index.js'),
      typings: path.relative(PKG_ROOT + directory, TYPE_PKG + directory + '/index.d.ts')
    });
  }
});

// Make the distribution folder
mkdirp.sync(PKG_ROOT);

// Copy over the sources
copySources('src/', PKG_ROOT + 'src/');
copySources(CJS_ROOT, CJS_PKG);
copySources(ESM5_ROOT, ESM5_PKG);
copySources(ESM2015_ROOT, ESM2015_PKG);
fs.copySync(TYPE_ROOT, TYPE_PKG);

fs.writeJsonSync(PKG_ROOT + 'package.json', rootPackageJson);

fs.copySync(UMD_ROOT, UMD_PKG);
// Add licenses to tops of bundles
addLicenseToFile('LICENSE.txt', UMD_PKG + 'Rx.js');
addLicenseTextToFile(license, UMD_PKG + 'Rx.min.js');
addLicenseToFile('LICENSE.txt', UMD_PKG + 'Rx.js');
addLicenseTextToFile(license, UMD_PKG + 'Rx.min.js');

// Copy over the ESM5 files
fs.copySync(ESM5_ROOT, ESM5_PKG);

function copySources(rootDir, packageDir, packageJson) {
  // Copy over the CommonJS files
  fs.copySync(rootDir, packageDir);
  fs.copySync('./LICENSE.txt', packageDir + 'LICENSE.txt');
  fs.copySync('./README.md', packageDir + 'README.md');
  if (packageJson) {
    fs.writeJsonSync(packageDir + 'package.json', packageJson);
  }
}
