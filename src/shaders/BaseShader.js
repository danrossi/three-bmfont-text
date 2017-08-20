export default class BaseShader {

	static uniforms(map, color, opacity) {
	    return {
	      opacity: { type: 'f', value: opacity },
	      map: { type: 't', value: map || new THREE.Texture() },
	      color: { type: 'c', value: new THREE.Color(color) }
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

	discarOnAlphaTest(alphaTest) {
		return (alphaTest > 0 ? ` if (gl_FragColor.a < ${alphaTest}) discard;` : "");
	}

	createShader(shader, opt) {
	    opt = opt || {};
	    const opacity = typeof opt.opacity === 'number' ? opt.opacity : 1,
	    alphaTest = typeof opt.alphaTest === 'number' ? opt.alphaTest : 0.0001;

	    // remove to satisfy r73
	    delete opt.map;
	    delete opt.color;
	    delete opt.precision;
	    delete opt.opacity;

	    return Object.assign({
	      uniforms: shader.uniforms(opt.map, opt.color, opacity),
	      vertexShader: shader.vertexShader,
	      fragmentShader: shader.fragmentShader(opt.precision, alphaTest)
	    }, opt);
	}
}

