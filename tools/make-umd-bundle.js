const rollupBundle = require('./rollup-bundle');
const fs = require('fs-extra');

fs.ensureDirSync('dist/global');

rollupBundle({
  input: 'dist/esm5_for_rollup/internal/umd.js',
  dest: 'dist/global/rxjs.umd.js',
});
