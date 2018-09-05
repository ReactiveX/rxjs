module.exports = wallaby => ({
  files: [
    "tsconfig.base.json",
    "tsconfig.json",
    "migrations/**/*",
    "legacy-reexport/**/*.ts",
    "compat/**/*.ts",
    "src/**/*.ts",
    { pattern: "spec/helpers/*.ts", instrument: false, load: true }
  ],

  tests: ["spec/**/*-spec.ts"],

  testFramework: {
    type: "mocha",
    path: "mocha"
  },

  env: {
    type: "node"
  },

  workers: { initial: 2, regular: 1 },

  setup: function (w) {
    if (!global._tsconfigPathsRegistered) {
      const tsConfigPaths = require("tsconfig-paths");
      tsConfigPaths.register();
      global._tsconfigPathsRegistered = true;
    }

    // Global test helpers
    global.mocha = require("mocha");
    global.Suite = global.mocha.Suite;
    global.Test = global.mocha.Test;

    //delete global context due to avoid issue by reusing process
    //https://github.com/wallabyjs/public/issues/536
    if (global.asDiagram) {
      delete global.asDiagram;
    }

    const mocha = wallaby.testFramework;
    const path = require("path");
    require(path.resolve(w.projectCacheDir, "spec/helpers/polyfills"))
    mocha.ui(path.resolve(w.projectCacheDir, "spec/helpers/testScheduler-ui"));
  }
});
