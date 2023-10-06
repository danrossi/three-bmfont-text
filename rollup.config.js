import nodeResolve from '@rollup/plugin-node-resolve'; 
import commonjs from '@rollup/plugin-commonjs';

export default [
	{
		input: 'src/three-bmfont-text.js',
		external: ['three', 'three-webgpu-renderer'],
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
			})
		],
		output: [
			{
				format: 'esm',
				file: 'build/three-bmfont-text.module.js'
			}
		]
	},
	{
		input: 'src/three-bmfont-text-legacy.js',
		external: ['three', 'three-webgpu-renderer'],
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
			})
		],
		output: [
			{
				format: 'esm',
				file: 'build/three-bmfont-text-legacy.module.js'
			}
		]
	}
];