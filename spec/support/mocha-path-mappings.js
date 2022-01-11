const { join } = require('path');
const root = join(__dirname, '../..');

// We need to intercept the require calls made within the tests to replace
// paths like 'rxjs/operators' with the relative path to the source files
// within the 'dist' directory. To do this, we're going to patch the
// '_resolveFilename' function within Node's built-in 'module'.

const mod = require('module');
const originalResolveFilename = mod._resolveFilename;

// We've already specified 'paths' within the 'tsconfig.json' file - so that
// TypeScript is able to find the source files when it's compiling the tests.
// Now, we just need to change those paths to refer to the 'src' directory
// that's within the 'dist' directory.

const tsconfig = require(join(root, 'tsconfig.json'));
const paths = tsconfig.compilerOptions.paths;

const keys = Object.keys(paths);

mod._resolveFilename = function (path, ...rest) {
  for (const key of keys) {
    if (key.endsWith('*')) {
      // If the key ends with a wildcard, we need to take the part of the
      // original path matched by the wildcard and use it to replace the
      // wildcard in the mapped path. TypeScript uses this configuration to
      // support deep paths. (Whilst RxJS does not support deep imports, there
      // are places in the tests in which deep imports of internals are made.)

      const regExp = new RegExp(key.replace(/\//g, '\\/').replace(/\*$/, '(.*)'));
      const match = path.match(regExp);
      if (match) {
        const [, more] = match;
        return originalResolveFilename.call(this, join(root, paths[key][0].replace(/\*$/, more)), ...rest);
      }
    } else if (path === key) {
      // If the original path matches the key, we use the mapped path instead.

      return originalResolveFilename.call(this, join(root, paths[key][0]), ...rest);
    }
  }

  // Otherwise, we use the original path.

  return originalResolveFilename.call(this, path, ...rest);
};
