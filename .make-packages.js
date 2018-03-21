"use strict";

let pkg = require('./package.json');
let fs = require('fs-extra');
let mkdirp = require('mkdirp');
let path = require('path');
let klawSync = require('klaw-sync');
let licenseTool = require('./tools/add-license-to-file');
let addLicenseToFile = licenseTool.addLicenseToFile;
let addLicenseTextToFile = licenseTool.addLicenseTextToFile;
let bo = null;
// Build Optimizer is not available on Node 4.x. Using a try/catch
// here to make sure the build passes on Travis using Node 4, but
// the NPM distribution will run through build-optimizer.
try {
  bo = require('@angular-devkit/build-optimizer');
} catch (e) {}


const ROOT = 'dist/';
const CJS_ROOT = ROOT + 'cjs/';
const ESM5_ROOT = ROOT + 'esm5/';
const ESM2015_ROOT = ROOT + 'esm2015/';
const UMD_ROOT = ROOT + 'global/';
const LEGACY_REEXPORT_ROOT = ROOT + "legacy-reexport/"
const TYPE_ROOT = ROOT + 'typings/';
const PKG_ROOT = ROOT + 'package/';
const CJS_PKG = PKG_ROOT + '';
const ESM5_PKG = PKG_ROOT + '_esm5/';
const ESM2015_PKG = PKG_ROOT + '_esm2015/';
const UMD_PKG = PKG_ROOT + 'bundles/';
const TYPE_PKG = PKG_ROOT;

// License info for minified files
let licenseUrl = 'https://github.com/ReactiveX/RxJS/blob/master/LICENSE.txt';
let license = 'Apache License 2.0 ' + licenseUrl;

delete pkg.scripts;
fs.removeSync(PKG_ROOT);

let rootPackageJson = Object.assign({}, pkg, {
  name: 'rxjs',
  main: './index.js',
  typings: './index.d.ts',
  module: './_esm5/index.js',
  es2015: './_esm2015/index.js'
});

// Get a list of the file names. Sort in reverse order so re-export files
// such as "operators.js" are AFTER their more specfic exports, such as
// "operators/map.js". This is due to a Webpack bug for node-resolved imports
// (rxjs/operators resolves to rxjs/operators.js), Webpack's "alias"
// functionality requires that the most broad mapping (rxjs/operators) be at
// the end of the alias mapping object. Created Webpack issue:
// https://github.com/webpack/webpack/issues/5870
const fileNames = klawSync(ESM5_ROOT, {
  nodir: true,
  filter: function(item) {
    return item.path.endsWith('.js');
  }
})
.map(item => item.path)
.map(path => path.slice((`${__dirname}/${ESM5_ROOT}`).length))
.sort().reverse();

// Execute build optimizer transforms on ESM5 files
fileNames.map(fileName => {
  if (!bo) return fileName;
  let fullPath = path.resolve(__dirname, ESM5_ROOT, fileName);
  // The file won't exist when running build_test as we don't create the ESM5 sources
  if (!fs.existsSync(fullPath)) return fileName;
  let content = fs.readFileSync(fullPath).toString();
  let transformed = bo.transformJavascript({
    content: content,
    getTransforms: [bo.getPrefixClassesTransformer, bo.getPrefixFunctionsTransformer, bo.getFoldFileTransformer]
  });
  fs.writeFileSync(fullPath, transformed.content);
  return fileName;
});

// Create an object hash mapping imports to file names
const importTargets = fileNames.reduce((acc, fileName) => {
  // Get the name of the file to be the new directory
  const directory = fileName.slice(0, fileName.length - 3);

  acc[directory] = fileName;
  return acc;
}, {});

createImportTargets(importTargets, "_esm5/", ESM5_PKG);
createImportTargets(importTargets, "_esm2015/", ESM2015_PKG);

// Make the distribution folder
mkdirp.sync(PKG_ROOT);

// Copy over the sources
copySources('src/', PKG_ROOT + 'src/');
copySources(CJS_ROOT, CJS_PKG);
fs.copySync(TYPE_ROOT, TYPE_PKG);
fs.copySync(LEGACY_REEXPORT_ROOT, CJS_PKG, {overwrite: false, errorOnExist: true});

copySources(ESM5_ROOT, ESM5_PKG, true);
copySources(ESM2015_ROOT, ESM2015_PKG, true);

// Copy over tsconfig.json for bazel build support
fs.copySync('./tsconfig.base.json', PKG_ROOT + 'src/tsconfig.json');

fs.writeJsonSync(PKG_ROOT + 'package.json', rootPackageJson, {spaces: 2});
fs.copySync('src/operators/package.json', PKG_ROOT + '/operators/package.json');
fs.copySync('src/ajax/package.json', PKG_ROOT + '/ajax/package.json');
fs.copySync('src/websocket/package.json', PKG_ROOT + '/websocket/package.json');
fs.copySync('src/testing/package.json', PKG_ROOT + '/testing/package.json');
fs.copySync('src/internal-compatibility/package.json', PKG_ROOT + '/internal-compatibility/package.json');


if (fs.existsSync(UMD_ROOT)) {
  fs.copySync(UMD_ROOT, UMD_PKG);
  // Add licenses to tops of bundles
  addLicenseToFile('LICENSE.txt', UMD_PKG + 'rxjs.umd.js');
  addLicenseTextToFile(license, UMD_PKG + 'rxjs.umd.min.js');
  addLicenseToFile('LICENSE.txt', UMD_PKG + 'rxjs.umd.js');
  addLicenseTextToFile(license, UMD_PKG + 'rxjs.umd.min.js');
}

// remove umd.js/umd.d.ts files that are only needed for creation of the umd bundle
fs.removeSync(CJS_PKG + '/internal/umd.js');
fs.removeSync(CJS_PKG + '/internal/umd.js.map');
fs.removeSync(ESM5_PKG + '/internal/umd.js');
fs.removeSync(ESM5_PKG + '/internal/umd.js.map');
fs.removeSync(ESM2015_PKG + '/internal/umd.js');
fs.removeSync(ESM2015_PKG + '/internal/umd.js.map');
fs.removeSync(TYPE_PKG + '/internal/umd.d.ts');

function copySources(rootDir, packageDir, ignoreMissing) {
  // If we are ignoring missing directories, early return when source doesn't exist
  if (!fs.existsSync(rootDir)) {
    if (ignoreMissing) {
      return;
    } else {
      throw "Source root dir does not exist!";
    }
  }
  // Copy over the CommonJS files
  fs.copySync(rootDir, packageDir);
  fs.copySync('./LICENSE.txt', packageDir + 'LICENSE.txt');
  fs.copySync('./README.md', packageDir + 'README.md');
}

// Create a file that exports the importTargets object
function createImportTargets(importTargets, targetName, targetDirectory) {
  const importMap = {};
  for (const x in importTargets) {
    importMap['rxjs/' + x] = ('rxjs-compat/' + targetName + importTargets[x]).replace(/\.js$/, '');
  }

  const outputData =
`
"use strict"

var path = require('path');
var dir = path.resolve(__dirname);

module.exports = function() {
  return ${JSON.stringify(importMap, null, 4)};
}
`

  fs.outputFileSync(targetDirectory + 'path-mapping.js', outputData);
}
