//import { Texture, Color } from 'three';
import { Color } from '../../../three.js/src/math/Color';
import { Texture } from '../../../three.js/src/textures/Texture';

export default class BaseShader {

	static uniforms(map, color, opacity) {
	    return {
	      opacity: { type: 'f', value: opacity },
	      map: { type: 't', value: map || new Texture() },
	      color: { type: 'c', value: new Color(color) }
	    };
	}

	static get vertexShader() {
	    return `
	      attribute vec2 uv;
	      attribute vec4 position;
	      uniform mat4 projectionMatrix;
	      uniform mat4 modelViewMatrix;
	      varying vec2 vUv;
	      void main() {
	        vUv = uv;
	        gl_Position = projectionMatrix * modelViewMatrix * position;
	      }
	    `;
	}

	static discarOnAlphaTest(alphaTest) {
		return (alphaTest > 0 ? ` if (gl_FragColor.a < ${alphaTest}) discard;` : "");
	}

	static createShader(opt) {

	    opt = opt || {};
	    const shader = this,
	    color = opt.color,
	    map = opt.map,
	    precision = opt.precision,
	    opacity = typeof opt.opacity === 'number' ? opt.opacity : 1,
	    alphaTest = typeof opt.alphaTest === 'number' ? opt.alphaTest : 0.0001;

	    // remove to satisfy r73
	    delete opt.map;
	    delete opt.color;
	    delete opt.precision;
	    delete opt.opacity;

	    return Object.assign({
	      uniforms: shader.uniforms(map, color, opacity),
	      vertexShader: shader.vertexShader,
	      fragmentShader: shader.fragmentShader(precision, alphaTest)
	    }, opt);
	}
}

