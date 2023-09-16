import MSDFShader from './shaders/MSDFShader';
import BasicShader from './shaders/BasicShader';
import TextGeometry from './TextGeometry';



import { 
    RawShaderMaterial,
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
 
 import { MeshBasicNodeMaterial } from 'three-webgpu';


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
        const geometry = this.geometry = this.createGeometry(),
        texture = config.texture;
        //webgl2 = renderer.capabilities.isWebGL2;

        this.initTexture(texture, renderer);

        const shaderConf = {
                side: DoubleSide,
                transparent: true,
                depthTest: false,
                map: texture,
                //depthWrite: false,
                color: config.color,
                glslVersion: GLSL3
                //glslVersion: webgl2 ? GLSL3 : GLSL1
        };


        //const material = new RawShaderMaterial(webgl2 ? MSDFShader.createShader2(shaderConf) : MSDFShader.createShader(shaderConf));
        let material;

        if (renderer.isWebGPURenderer) {
            material = new MeshBasicNodeMaterial({ map: texture, color: new Color(config.color), opacity: 1.0, transparent: true, depthTest: false, side: DoubleSide, alphaTest: 0.0001 });
            const colorNode = MSDFShader.createWebGPUColorShader();
            material.colorNode = colorNode( { color: material.color });
            //material.colorNode = colorNode( { texture: texture, color: material.color, opacity: material.opacity });

            const opacityNode = MSDFShader.createWebGPUOpacityShader();
            material.opacityNode = opacityNode( { texture: texture, color: material.color, opacity: material.opacity });

            //const colorNode = MSDFShader.createWebGPUShader();
            //material.colorNode = colorNode( { texture: texture, color: material.color, opacity: material.opacity });
        } else {
            material = new RawShaderMaterial(MSDFShader.createShader(shaderConf));
            material.extensions.derivatives = true;
        }
      
        
        const mesh = this.mesh = new Mesh(geometry, material),
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
        const boxGeo = new BoxGeometry(1, 1, 1),
            //boxMat = new RawShaderMaterial(BasicShader.createShader({
            boxMat = new MeshBasicMaterial({
              color: 0xff0000,
              transparent: true,
               opacity: 0,
               alphaTest: 0.0001,
//              opacity: config.showHitBox ? 1 : 0,
              //wireframe: true
            }),
            //  })),
            /*boxMat = new MeshBasicMaterial({
                //color: 0x000000,
                transparent: false,
                opacity: 1,
                //opacity: config.showHitBox ? 1 : 0,
                //wireframe: true
            }),*/
            hitBox = this.hitBox = new Mesh(boxGeo, boxMat);
        hitBox.mesh = this.mesh;
       // boxMat.alphaTest = 0.0001;
        this.group.add(hitBox);
    }

    initTexture(texture, renderer) {
        texture.needsUpdate = true;
        texture.minFilter = LinearMipMapLinearFilter;
        texture.magFilter = LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = renderer.capabilities && renderer.capabilities.getMaxAnisotropy() || 6;
    }

    update() {
        const geometry = this.geometry,
            mesh = this.mesh;
        //geometry.update( this.config );
        // centering
        geometry.computeBoundingBox();
        //geometry.computeBoundingSphere();
        //this.hitBox.geometry.computeBoundingSphere();
        mesh.position.x = -geometry.layout.width / 2;
        mesh.position.y = -(geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2; // valign center
        
        //console.log(geometry.boundingSphere);
        //console.log(this.hitBox.geometry.boundingSphere);
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