
import TextGeometry from './TextGeometry';


import {
    MeshBasicMaterial,
    BoxGeometry,
    Mesh,
    Group,
    LinearMipMapLinearFilter,
    LinearFilter,
    DoubleSide,
    GLSL3,
    Color
} from 'three';

import { MeshBasicNodeMaterial } from 'three/webgpu';

import WebGPUtils from './util/WebGPUtils';


export default class TextBitmap extends Mesh {

    constructor(config, isWebGPU = false) {
        config.color = config.color || '#fff';
        config.lineHeight = config.lineHeight ? config.font.common.lineHeight + config.lineHeight : config.font.common.lineHeight;

        const geometry = new TextGeometry(config)
        super(geometry, null);
        this.config = config;
        this._text = null;
        this.init(config, isWebGPU);
    }

    createGeometry() {
        return new TextGeometry(this.config);
    }

    /**
     * Setter to set an updated color on the colorNode
     */
    set color(val) {
		const colorNode = WebGPUtils.createWebGPUColorShader();
		this.material.colorNode = colorNode({ color: val });
	}

    init(config) {
        const texture = config.texture;

        this.initTexture(texture, config.maxAnisotropy);

        this.material = new MeshBasicNodeMaterial({ map: texture, color: new Color(config.color), opacity: 1.0, transparent: true, depthTest: false, side: DoubleSide, alphaTest: 0.0001 });
        
        this.color = this.material.color;

        const opacityNode = WebGPUtils.createWebGPUOpacityShader();
        this.material.opacityNode = opacityNode({ texture: texture, color: this.material.color, opacity: this.material.opacity });

        this.mesh = this;

        const group = this.group = new Group();
        this.renderOrder = 1;

        this.rotateMesh();

        const groupScale = config.groupScale || 1,
            scale = config.scale || 1;
        group.scale.set(groupScale, groupScale, groupScale);
        group.add(this);
        this.createHitBox(config);
        this.update();
    }

    set minWidth(width) {
        this.geometry.minWidth = width;
    }


    rotateMesh() {
        this.rotation.x = Math.PI;
    }

    createHitBox(config) {
        const boxGeo = new BoxGeometry(1, 1, 1),
            boxMat = new MeshBasicMaterial({
                color: 0xff0000,
                transparent: true,
                opacity: 0,
                alphaTest: 0.0001
            }),
            hitBox = this.hitBox = new Mesh(boxGeo, boxMat);
        hitBox.mesh = this;
        this.group.add(hitBox);
    }

    initTexture(texture, maxAnisotropy = 16) {
        texture.needsUpdate = true;
        texture.minFilter = LinearMipMapLinearFilter;
        texture.magFilter = LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = maxAnisotropy;
    }

    update() {
        const geometry = this.geometry;
        // centering
        geometry.computeBoundingBox();
        this.position.x = -geometry.layout.width / 2;
        this.position.y = -(geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2; // valign center
        this.hitBox.scale.set(geometry.layout.width, geometry.layout.height, 1);
        this.height = geometry.layout.height * this.config.scale; // for html-like flow / positioning
    }

    get text() {
        return this._text;
    }

    set text(value) {
        this._text = value;
        this.geometry.update(value);
        this.update();
    }
}