import BaseShader from './BaseShader';

import { texture, color, min, max, tslFn, uniform, clamp, fwidth } from 'three-webgpu-renderer';

export default class MSDFShader extends BaseShader {

  static get vertexShader() {
      return `
        in vec2 uv;
        in vec4 position;
        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;
        out vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * position;
        }
      `;
  }

  static discarOnAlphaTest(alphaTest) {
    return (alphaTest > 0 ? ` if (outColor.a < ${alphaTest}) discard;` : "");
  }

  static fragmentShader(precision, alphaTest) { 

    const discard = this.discarOnAlphaTest(alphaTest);
       
    return `
      precision ${precision || 'highp'} float;
      uniform float opacity;
      uniform vec3 color;
      uniform sampler2D map;
      in vec2 vUv;
      out vec4 outColor;

      float median(float r, float g, float b) {
        return max(min(r, g), min(max(r, g), b));
      }

      void main() {
        vec3 sample1 = texture(map, vUv).rgb;
        float sigDist = median(sample1.r, sample1.g, sample1.b) - 0.5;
        float alpha = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);
        outColor = vec4(color.xyz, alpha * opacity);
        ${discard}
      }
    `
  }

  static createWebGPUColorShader() {
    return tslFn( ( input ) => {
      //const color = uniform(input.color);
    
      return color(input.color);
    });

  }

  static createWebGPUOpacityShader() {
    return tslFn( ( input ) => {

      const tex = texture(input.texture);
      const opacity = uniform(input.opacity);

      const sigDist = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)).sub(0.5);

      const alpha = clamp(sigDist.div(fwidth(sigDist)).add(0.5), 0.0, 1.0);

   
      return alpha.mul(opacity);
    });

  }
}

/*
export function createShader(opt) {
  return MSDFShader.createShader(opt);
};*/


