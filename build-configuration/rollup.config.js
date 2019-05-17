import { join } from 'path';
import { readFileSync } from 'fs';
import resolve from 'rollup-plugin-node-resolve';
import license from 'rollup-plugin-license';
import { terser } from "rollup-plugin-terser";

const licenseText = readFileSync(join(__dirname, '../LICENSE.txt'));
const banner = `/**
  @license
  ${licenseText}
 **/`;

const generateConfig = (minify = false) => ({
  input: join(__dirname, '../dist/formats/esm5/internal/umd.js'),
  output: {
    file: join(__dirname, `../dist/bundles/rxjs.umd${minify ? '.min' : ''}.js`),
    format: 'umd',
    name: 'rxjs',
    amd: { id: 'rxjs' },
  },
  plugins: [
    resolve(),
    ...(minify ? [terser()] : []),
    license({ banner }),
  ]
});

export default [
  generateConfig(),
  generateConfig(true),
];