const nodeResolve = require( 'rollup-plugin-node-resolve' ) , commonjs = require( 'rollup-plugin-commonjs' );

import serve from 'rollup-plugin-serve'

export default {
	//entry: 'src/three-bmfont-text.js',
	//indent: '\t',
	//external:['three'], 
//	globals: { three: 'THREE' },
	plugins: [
		nodeResolve({
                            extensions: ['.js'],
                            browser: true,
                            preferBuiltins: false
        }),
		commonjs({
			include: './node_modules/**'
		}),/*
		babel({
			externalHelpers: false,
			//include: './node_modules/three/**',
			exclude: './node_modules/**',
			presets: ['es2015-rollup']
		}),*/
		 //serve('test')
	],
	targets: [
		{
			format: 'cjs',
			//moduleName: 'THREE',
			dest: 'test/three-bmfont-text.js'
		}
	]
};