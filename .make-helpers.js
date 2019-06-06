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

module.exports = {
  copySources,
  cleanSourceMapRoot
}
