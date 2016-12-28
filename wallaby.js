module.exports = wallaby => ({
  files: [
    'src/**/*.ts',
    {pattern: 'spec/helpers/*.ts', instrument: false}
  ],

  tests: ['spec/**/*-spec.ts'],

  compilers: {
    '**/*.ts': wallaby.compilers.typeScript({
      module: 1,  // commonjs
      target: 1,  // ES5
      preserveConstEnums: true,
    })
  },

  testFramework: {
    type: 'mocha',
    path: 'mocha'
  },

  env: {
    type: 'node'
  },

  workers: {initial: 1, regular: 1},

  bootstrap: function (w) {
    // Remapping all require calls to `dist/cjs` right to `src`
    const Module = require('module').Module;
    if (!Module._originalRequire) {
      const modulePrototype = Module.prototype;
      Module._originalRequire = modulePrototype.require;
      modulePrototype.require = function (filePath) {
        return Module._originalRequire.call(this, filePath.replace('dist/cjs', 'src'));
      };
    }

    // Global test helpers
    global.mocha = require('mocha');
    global.Suite = global.mocha.Suite;
    global.Test = global.mocha.Test;

    //delete global context due to avoid issue by reusing process
    //https://github.com/wallabyjs/public/issues/536
    if (global.asDiagram) {
      delete global.asDiagram;
    }

    const mocha = wallaby.testFramework;
    const path = require('path');
    mocha.ui(path.resolve(w.projectCacheDir, 'spec/helpers/testScheduler-ui'));
  }
});
