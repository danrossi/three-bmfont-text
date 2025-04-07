import { texture, color, min, max, Fn, uniform, clamp, fwidth } from 'three/tsl';

export default class WebGPUtils {

    static createWebGPUColorShader() {
        return Fn((input) => {
            //const color = uniform(input.color);

            return color(input.color);
        });

    }

    static createWebGPUOpacityShader() {
        return Fn((input) => {

            const tex = texture(input.texture);
            const opacity = uniform(input.opacity);

            const sigDist = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)).sub(0.5);

            const alpha = clamp(sigDist.div(fwidth(sigDist)).add(0.5), 0.0, 1.0);


            return alpha.mul(opacity);
        });

    }
}