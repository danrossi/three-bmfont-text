import BaseShader from './BaseShader';

export default class MSDFShader extends BaseShader {


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

      float median(float r, float g, float b) {
        return max(min(r, g), min(max(r, g), b));
      }

      void main() {
        vec3 sample = texture2D(map, vUv).rgb;
        float sigDist = median(sample.r, sample.g, sample.b) - 0.5;
        float alpha = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);
        gl_FragColor = vec4(color.xyz, alpha * opacity);
        ${discard}
      }
    `
  }
}

export function createShader(opt) {
  return MSDFShader.createShader(MSDFShader, opt);
};