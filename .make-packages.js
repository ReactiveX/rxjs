const { writeFileSync } = require('fs');
const { cp, exec, ls, mkdir, rm } = require('shelljs');
const { buildOptimizer } = require('@angular-devkit/build-optimizer');
const pkg = require('./package.json');

// TODO: 
// - what about sourcemaps? 
// Angular itself has inline sourcemaps. I don't see the point, since you don't have sources
// on the package.
// - what about shipping TS for bazel support? 
// I think this isn't needed anymore?
// - maybe add a debug flag?
// Would turn silent off for execs, and print stuff on non-exec things
// - whats src/Rx.global.js for?

// Ensure commands are run from __dirname.
process.chdir(__dirname);

// Clean directories before building.
console.log('# Deleting dist dir.')
rm('-rf', './dist');

// Run TS to produce cjs, esm5, esm2015, and typings.
console.log('# Compiling TypeScript sources.');
exec('npm run tsc -- --build ./build-configuration/tsconfig.project.json', { silent: true });

// Run BO over esm5 and esm2015 to remove side effects.
console.log('# Removing side effects from esm5 and esm2015.');
const buildOptimizerOptions = { emitSourceMap: false, isSideEffectFree: true };
ls('./dist/formats/{esm5,esm2015}/**/*.js').forEach(inputFilePath => {
  const { content } = buildOptimizer({ inputFilePath, ...buildOptimizerOptions });
  writeFileSync(inputFilePath, content);
});

// Create UMD bundles, then remove the UMD entry point.
console.log('# Creating UMD bundles.')
exec('npm run rollup -- --config ./build-configuration/rollup.config.js', { silent: true });
rm('-rf', './dist/**/internal/umd.js');

// Add package.json, licenses, and readme.
console.log('# Adding package metadata.');
['', 'ajax/', 'fetch/', 'operators/', 'testing/', 'webSocket/'].forEach(entryPoint => {
  let entryPointPkg = {
    'name': `rxjs/${entryPoint.replace('/', '')}`,
    'main': `../formats/cjs/${entryPoint}index.js`,
    'module': `../formats/esm5/${entryPoint}index.js`,
    'es2015': `../formats/esm2015/${entryPoint}index.js`,
    'typings': `../formats/typings/${entryPoint}index.d.ts`,
    'sideEffects': false
  };

  if (entryPoint === '') {
    entryPointPkg = { ...pkg, ...entryPointPkg, name: 'rxjs' };
    cp('./README.md', `./dist/README.md`);
  } else {
    mkdir(`./dist/${entryPoint}`);
  }
  writeFileSync(`./dist/${entryPoint}package.json`, JSON.stringify(entryPointPkg, undefined, 2));
  cp('./LICENSE.txt', `./dist/${entryPoint}LICENSE.txt`);
});

console.log('# Done!');
