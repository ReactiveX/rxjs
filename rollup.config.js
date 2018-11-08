import typescript from 'rollup-plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const config = min => ({
	input: 'src/index.ts',
		output: {
			file: min
				? `packages/bundles/rxjs.umd.min.js`
				: `packages/bundles/rxjs.umd.js`,
			format: 'umd',
			name: 'RxJS',
			sourcemap: true
		},
		plugins: [
			typescript({
				typescript: require('typescript')
			}),
			min && terser()
		]
});

export default [config(false), config(true)];