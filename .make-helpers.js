"use strict";

let fs = require('fs-extra');
let path = require('path');
let klawSync = require('klaw-sync');

function cleanSourceMapRoot(mapRoot, sourcesRoot) {
  klawSync(mapRoot, {filter: (item) => item.path.endsWith('.js.map')})
  .map(f => f.path)
  .forEach(fName => {
    const sourceMap = fs.readJsonSync(fName);

    // Get relative path from map file to source file
    sourceMap.sources = sourceMap.sources.map(s => {
      const sRel = path.relative(path.parse(fName).dir, path.resolve(path.join(sourcesRoot, s)));
      return sRel;
    });
    delete sourceMap.sourceRoot;

    fs.writeJsonSync(fName, sourceMap);
  });
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

module.exports = {
  copySources,
  createImportTargets,
  cleanSourceMapRoot
}