import MSDFShader from './shaders/MSDFShader';
import BasicShader from './shaders/BasicShader';
import TextGeometry from './TextGeometry';
/*import {
    //MeshBasicMaterial,
    ShaderMaterial,
    RawShaderMaterial,
    BoxBufferGeometry,
    Mesh,
    Group,
    LinearMipMapLinearFilter,
    LinearFilter,
    DoubleSide
} from 'three';*/


//import files directly for bundling with three.js
//bundling is flawed and need to find a better system. 

import { RawShaderMaterial } from '../../three.js/src/materials/RawShaderMaterial';
import { BoxBufferGeometry } from '../../three.js/src/geometries/BoxGeometry';
import { Mesh } from '../../three.js/src/objects/Mesh';
import { Group } from '../../three.js/src/objects/Group';
import { LinearMipMapLinearFilter,LinearFilter, DoubleSide } from '../../three.js/src/constants';


export default class TextBitmap {

    constructor(config, renderer) {
        config.color = config.color || '#fff';
        config.lineHeight = config.lineHeight ? config.font.common.lineHeight + config.lineHeight : config.font.common.lineHeight;
        this.config = config;
        this._text = null;
        this.init(config, renderer);
    }

    createGeometry() {
        return new TextGeometry(this.config);
    }

    init(config, renderer) {
        const geometry = this.geometry = this.createGeometry(); // text-bm-font
        const texture = config.texture;
        this.initTexture(texture, renderer);
        const material = new RawShaderMaterial(MSDFShader.createShader({
                side: DoubleSide,
                transparent: true,
                depthTest: false,
                map: texture,
                //depthWrite: false,
                color: config.color
            })),
            mesh = this.mesh = new Mesh(geometry, material),
            group = this.group = new Group();
        mesh.renderOrder = 1;

        this.rotateMesh(mesh);
        
        const s = config.scale || 1;
        group.scale.set(s, s, s);
        group.add(mesh);
        this.createHitBox(config);
        this.update();
        //if (config.hitbox) this.createHitBox();
    }

    rotateMesh(mesh) {
      mesh.rotation.x = Math.PI;
    }

    createHitBox(config) {
        const boxGeo = new BoxBufferGeometry(1, 1, 1),
            boxMat = new RawShaderMaterial(BasicShader.createShader({
              color: 0xff0000,
              transparent: false,
               opacity: 1,
//              opacity: config.showHitBox ? 1 : 0,
              wireframe: true
            })),
            /*boxMat = new MeshBasicMaterial({
                color: 0x000000,
                transparent: false,
                opacity: 1,
                //opacity: config.showHitBox ? 1 : 0,
                wireframe: true
            }),*/
            hitBox = this.hitBox = new Mesh(boxGeo, boxMat);
        hitBox.mesh = this.mesh;
        this.group.add(hitBox);
    }

    initTexture(texture, renderer) {
        texture.needsUpdate = true;
        texture.minFilter = LinearMipMapLinearFilter;
        texture.magFilter = LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    }

    update() {
        const geometry = this.geometry,
            mesh = this.mesh;
        //geometry.update( this.config );
        // centering
        geometry.computeBoundingBox();
        mesh.position.x = -geometry.layout.width / 2;
        mesh.position.y = -(geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2; // valign center
        this.hitBox.scale.set(geometry.layout.width, geometry.layout.height, 1);
        // mesh.position.y = - ( geometry.boundingBox.max.y - geometry.boundingBox.min.y ); // valign top
        //this.hitBox.position.y = - geometry.layout.height / 2; // valign top
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