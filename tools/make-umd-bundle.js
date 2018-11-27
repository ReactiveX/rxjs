var rollupBundle = require('./rollup-bundle');

rollupBundle({
  input: 'dist/esm5_for_rollup/internal/umd.js',
  dest: 'dist/global/rxjs.umd.js',
});
