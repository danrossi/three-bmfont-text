import BaseShader from './BaseShader';

export default class SDFShader extends BaseShader {

  static fragmentShader(precision, alphaTest) { 

    const discard = BaseShader.discarOnAlphaTest(alphaTest);
       
    return `
      #ifdef GL_OES_standard_derivatives
        #extension GL_OES_standard_derivatives : enable
      #endif
      precision ${precision || 'highp'} float;
      uniform float opacity;
      uniform vec3 color;
      uniform sampler2D map;
      varying vec2 vUv;

      
      float aastep(float value) {
        #ifdef GL_OES_standard_derivatives
          float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
        #else
          float afwidth = (1.0 / 32.0) * (1.4142135623730951 / (2.0 * gl_FragCoord.w));
        #endif
        return smoothstep(0.5 - afwidth, 0.5 + afwidth, value);
      }

      void main() {
        vec4 texColor = texture2D(map, vUv);
        float alpha = aastep(texColor.a);
        gl_FragColor = vec4(color, opacity * alpha);
        ${discard}
      }
    `
  }
}


export function createShader(opt) {
  return SDFShader.createShader(SDFShader, opt);
};