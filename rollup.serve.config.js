import nodeResolve from '@rollup/plugin-node-resolve'; 
import commonjs from '@rollup/plugin-commonjs';
import serve from 'rollup-plugin-serve'

export default [
	{
		input: 'test/test-msdf.js',
		plugins: [
			nodeResolve({
				module: true,
				extensions: ['.js'],
				main: true,
				jsnext: true,
				browser: true,
				preferBuiltins: false
			}),
			commonjs({
				include: './node_modules/**'
			}),
			serve('test')
		],
		output: [
			{
				format: 'esm',
				file: 'test/three-bmfont-text.js'
			}
		]
	}
];
