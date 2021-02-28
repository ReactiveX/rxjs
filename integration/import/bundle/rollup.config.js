import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
export default {
  input: './app.js',
  plugins: [json(), nodeResolve()],
};
