import BaseShader from './BaseShader';

export default class MultipageShader extends BaseShader {

  static get vertexShader() {
      return `
        attribute vec2 uv;
        attribute vec4 position;
        attribute float page;
        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;
        varying vec2 vUv;
        varying float vPage;
        void main() {
          vUv = uv;
          vPage = page;
          gl_Position = projectionMatrix * modelViewMatrix * position;
        }
      `;
  }

  static multiPageUniforms(map, color, opacity, textures) {

    const baseUniforms = {};

    textures.forEach(function (tex, i) {
      baseUniforms['texture' + i] = {
        type: 't',
        value: tex
      }
    });

    return Object.assign({}, baseUniforms, MultipageShader.uniforms(map, color, opacity));
  }

  static multiPageFragment(precision, alphaTest, textures) { 

    const discard = BaseShader.discarOnAlphaTest(alphaTest);
    const samplers = textures.map(function (tex, i) {
      return `uniform sampler2D texture${i}; \n`
    });

    const body = textures.map(function (tex, i) {
      const cond = i === 0 ? 'if' : 'else if';

      return `
        ${cond} (vPage == ${i}.0) {
          sampleColor = texture2D(texture${i}, vUv);
        }
      `;
    });
   
    return `
      precision ${precision || 'highp'} float;
      uniform float opacity;
      uniform vec3 color;
      ${samplers}
      varying float vPage;
      varying vec2 vUv;

      void main() {
        vec4 sampleColor = vec4(0.0);
        ${body}
        gl_FragColor = sampleColor * vec4(color, opacity);
        ${discard}
      }
    `
  }

  createMultiPageShader(opt) {
      opt = opt || {};
      const opacity = typeof opt.opacity === 'number' ? opt.opacity : 1,
      alphaTest = typeof opt.alphaTest === 'number' ? opt.alphaTest : 0.0001;

      const textures = opt.textures || [];
      textures = Array.isArray(textures) ? textures : [ textures ];

      // remove to satisfy r73
      delete opt.textures;
      delete opt.map;
      delete opt.color;
      delete opt.precision;
      delete opt.opacity;

      return Object.assign({
        uniforms: MultipageShader.multiPageUniforms(opt.map, opt.color, opacity, textures),
        vertexShader: MultipageShader.vertexShader,
        fragmentShader: MultipageShader.multiPageFragment(opt.precision, alphaTest, textures)
      }, opt);
  }
}

export function createShader(opt) {
  return MultipageShader.createMultiPageShader(opt);
};