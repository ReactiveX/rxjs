var rollupBundle = require('./rollup-bundle');

rollupBundle({
  input: 'dist-compat/esm5_for_rollup/compat/umd.js',
  dest: 'dist-compat/global/rxjs-compat.umd.js',
  aliases: {
    'rxjs/testing': 'dist-compat/esm5_for_rollup/src/testing/index.js',
    'rxjs/operators': 'dist-compat/esm5_for_rollup/src/operators/index.js',
    'rxjs/webSocket': 'dist-compat/esm5_for_rollup/src/webSocket/index.js',
    'rxjs/ajax': 'dist-compat/esm5_for_rollup/src/ajax/index.js',
    'rxjs/fetch': 'dist-compat/esm5_for_rollup/src/fetch/index.js',
    'rxjs/internal-compatibility': 'dist-compat/esm5_for_rollup/src/internal-compatibility/index.js',
    'rxjs': 'dist-compat/esm5_for_rollup/src/index.js',
  },
});
