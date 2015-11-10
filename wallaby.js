module.exports = wallaby => ({
  files: [
    'index.js',
    'src/**/*.ts',
    {pattern: 'spec/helpers/*.js', instrument: false}
  ],

  tests: ['spec/**/*-spec.js'],

  compilers: {
    '**/*.ts': wallaby.compilers.typeScript({
      module: 1,  // commonjs
      target: 1,  // ES5
      preserveConstEnums: true,
    })
  },

  testFramework: 'jasmine',

  env: {
    type: 'node'
  },

  workers: {initial: 1, regular: 1},

  bootstrap: function (w) {
    // Remapping all require calls to `dist/cjs` right to `src`
    var Module = require('module').Module;
    if (!Module._originalRequire) {
      var modulePrototype = Module.prototype;
      Module._originalRequire = modulePrototype.require;
      modulePrototype.require = function (filePath) {
        return Module._originalRequire.call(this, filePath.replace('dist/cjs', 'src'));
      };
    }

    // Global test helpers
    require('./spec/helpers/test-helper');
  }
});