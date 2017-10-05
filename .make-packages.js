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
  main: './Rx.js',
  module: './_esm5/Rx.js',
  es2015: './_esm2015/Rx.js',
  typings: './Rx.d.ts'
});

// Create an object of key/value pairs resolving the "from" side
// of an import/require to the file name.
const importTargets = klawSync(CJS_ROOT, {
  nodir: true,
  filter: function(item) {
    return item.path.endsWith('.js');
  }
})
.map(item => item.path)
.map(path => path.slice((`${__dirname}/${CJS_ROOT}`).length))
.map(fileName => {
  if (!bo) return fileName;
  let fullPath = path.resolve(__dirname, ESM5_ROOT, fileName);
  let content = fs.readFileSync(fullPath).toString();
  let transformed = bo.transformJavascript({
    content: content,
    getTransforms: [bo.getPrefixClassesTransformer, bo.getPrefixFunctionsTransformer, bo.getFoldFileTransformer]
  });
  fs.writeFileSync(fullPath, transformed.content);
  return fileName;
})
.reduce((acc, fileName) => {
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

copySources(ESM5_ROOT, ESM5_PKG, true);
copySources(ESM2015_ROOT, ESM2015_PKG, true);


fs.writeJsonSync(PKG_ROOT + 'package.json', rootPackageJson);

if (fs.existsSync(UMD_ROOT)) {
  fs.copySync(UMD_ROOT, UMD_PKG);
  // Add licenses to tops of bundles
  addLicenseToFile('LICENSE.txt', UMD_PKG + 'Rx.js');
  addLicenseTextToFile(license, UMD_PKG + 'Rx.min.js');
  addLicenseToFile('LICENSE.txt', UMD_PKG + 'Rx.js');
  addLicenseTextToFile(license, UMD_PKG + 'Rx.min.js');
}

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
    importMap['rxjs/' + x] = 'rxjs/' + targetName + importTargets[x];
  }

  const outputData =
`
"use strict"

var path = require('path');

module.exports = function(PATH_REPLACEMENT) {
  return ${JSON.stringify(importMap, null, 4).replace(/(: )(".+")(,?)/g, "$1path.resolve(PATH_REPLACEMENT, $2)$3")};
}
`

  fs.outputFileSync(targetDirectory + 'path-mapping.js', outputData);
}
