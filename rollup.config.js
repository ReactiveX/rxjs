import typescript from 'rollup-plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const config = min => ({
	input: 'package/src/internal/umd.ts',
		output: {
			file: min
				? `package/bundles/rxjs.umd.min.js`
				: `package/bundles/rxjs.umd.js`,
			format: 'umd',
			name: 'rxjs',
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
