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


export default class TextBitmap extends Mesh {

    constructor(config, isWebGPU) {
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

    init(config, isWebGPU) {
        //const geometry = this.geometry = this.createGeometry(),
        const texture = config.texture;
        //webgl2 = renderer.capabilities.isWebGL2;

        this.initTexture(texture, config.maxAnisotropy);

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

        if (isWebGPU) {
            this.material = new MeshBasicNodeMaterial({ map: texture, color: new Color(config.color), opacity: 1.0, transparent: true, depthTest: false, side: DoubleSide, alphaTest: 0.0001 });
            const colorNode = MSDFShader.createWebGPUColorShader();
            this.material.colorNode = colorNode( { color: this.material.color });
            //material.colorNode = colorNode( { texture: texture, color: material.color, opacity: material.opacity });

            const opacityNode = MSDFShader.createWebGPUOpacityShader();
            this.material.opacityNode = opacityNode( { texture: texture, color: this.material.color, opacity: this.material.opacity });

            //const colorNode = MSDFShader.createWebGPUShader();
            //material.colorNode = colorNode( { texture: texture, color: material.color, opacity: material.opacity });
        } else {
            this.material = new RawShaderMaterial(MSDFShader.createShader(shaderConf));
            this.material.extensions.derivatives = true;
        }
      
        
        //const mesh = this.mesh = new Mesh(geometry, material),
        const  group = this.group = new Group();
        this.renderOrder = 1;

        this.rotateMesh();
        
        const s = config.scale || 1;
        group.scale.set(s, s, s);
        group.add(this);
        this.createHitBox(config);
        this.update();
        //if (config.hitbox) this.createHitBox();
    }

    rotateMesh() {
      this.rotation.x = Math.PI;
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

    initTexture(texture, maxAnisotropy = 16) {
        texture.needsUpdate = true;
        texture.minFilter = LinearMipMapLinearFilter;
        texture.magFilter = LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = maxAnisotropy;
    }

    update() {
        const geometry = this.geometry;
        //geometry.update( this.config );
        // centering
        geometry.computeBoundingBox();
        //geometry.computeBoundingSphere();
        //this.hitBox.geometry.computeBoundingSphere();
        this.position.x = -geometry.layout.width / 2;
        this.position.y = -(geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2; // valign center
        
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