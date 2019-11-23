'use strict';

const { join } = require('path');
const root = join(__dirname, '../..');

const Module = require('module');
const originalResolveFilename = Module._resolveFilename;

const tsconfig = require(join(root, 'tsconfig.json'));
const originalPaths = tsconfig.compilerOptions.paths;

const paths = Object.entries(originalPaths).reduce((acc, [key, values]) => {
  acc[key] = values.map(value => value.replace('/src/', '/dist/src/'));
  return acc;
}, {});
const keys = Object.keys(paths);

Module._resolveFilename = function(path, ...rest) {
  for (let k = 0; k < keys.length; ++k) {
    const key = keys[k];
    if (key.endsWith('*')) {
      const regExp = new RegExp(key.replace(/\//g, '\\\/').replace(/\*$/, '(.*)'));
      const match = path.match(regExp);
      if (match) {
        const [, more] = match;
        return originalResolveFilename.call(this, join(root, paths[key][0].replace(/\*$/, more)), ...rest);
      }
    } else if (path === key) {
      return originalResolveFilename.call(this, join(root, paths[key][0]), ...rest);
    }
  }
  return originalResolveFilename.call(this, path, ...rest);
};
