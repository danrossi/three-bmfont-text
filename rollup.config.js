const babel = require('rollup-plugin-babel'), nodeResolve = require( 'rollup-plugin-node-resolve' ) , commonjs = require( 'rollup-plugin-commonjs' );

import uglify from 'rollup-plugin-uglify';

export default {
	entry: 'src/three-bmfont-text.js',
	indent: '\t',
	external:['three'], 
	globals: { three: 'THREE' },
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
		babel({
			externalHelpers: false,
			//include: './node_modules/three/**',
			exclude: './node_modules/**',
			presets: ['es2015-rollup']
		}),
     	/*uglify({
	       output: {
	         comments: false
	       },
	       compress: {
	            warnings: true,
	            dead_code: true,
	            unused: true,
	            collapse_vars: true,
	            join_vars: true,
	            reduce_vars: true,
	            passes: 1,

	            drop_console: true
	       }
     	})*/
	],
	targets: [
		{
			format: 'umd',
			name: 'BmFont',
			//moduleName: 'THREE',
			dest: 'build/three-bmfont-text.js'
		}
	]
};
