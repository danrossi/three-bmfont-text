import BaseShader from './BaseShader';

export default class BasicShader extends BaseShader {

  static fragmentShader(precision, alphaTest) { 

    const discard = BaseShader.discarOnAlphaTest(alphaTest);
       
    return `
      precision ${precision || 'highp'} float;
      uniform float opacity;
      uniform vec3 color;
      uniform sampler2D map;
      varying vec2 vUv;

      void main() {
        gl_FragColor = texture2D(map, vUv) * vec4(color, opacity);
        ${discard}
      }
    `
  }
}

/*
export function createShader(opt) {
  return BasicShader.createShader(BasicShader, opt);
};*/