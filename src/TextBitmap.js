import MSDFShader from './shaders/MSDFShader';
import BasicShader from './shaders/BasicShader';
//import SDFShader from './shaders/SDFShader';
import TextGeometry from './TextGeometry';
//import { RawShaderMaterial, BoxBufferGeometry } from 'three';

import * as THREE from 'three';

export default class TextBitmap {
  constructor(config, renderer) {
    config.color = config.color || '#fff';
    config.lineHeight = config.lineHeight ? config.font.common.lineHeight + config.lineHeight : config.font.common.lineHeight;
    //config.type = config.type || "msdf";
    this.config = config;

    this.init(config, renderer);
  }

  init(config, renderer) {

    const geometry = this.geometry = new TextGeometry( config ); // text-bm-font

    //geometry.center();

    //let texture;

    /*if (config.texture) {
        texture = config.texture;
        this.initTexture(texture, renderer);
    } else {
      const textureLoader = new THREE.TextureLoader();
        texture = textureLoader.load(config.imagePath, () => {
         this.initTexture(texture, renderer); 
      });
    }*/

    const texture = config.texture;
    this.initTexture(texture, renderer);

    /*material = new THREE.RawShaderMaterial(sdfShader({
        side: THREE.DoubleSide,
        transparent: true,
        depthTest: false,
        map: texture,
        //depthWrite: false,
        color: config.color
    })),*/
    const material = new THREE.RawShaderMaterial(MSDFShader.createShader({
        side: THREE.DoubleSide,
        transparent: true,
        depthTest: false,
        map: texture,
        //depthWrite: false,
        color: config.color
    })),
    mesh = this.mesh = new THREE.Mesh( geometry, material ),
    group = this.group = new THREE.Group();

    mesh.renderOrder = 1;
    mesh.rotation.x = Math.PI;

    const s = config.scale || 1;
    group.scale.set( s, s, s );

    group.add( mesh );

    this.createHitBox(config);

    
    this.update();

    //if (config.hitbox) this.createHitBox();
  }

  createHitBox(config) {

    const boxGeo = new THREE.BoxBufferGeometry(1,1,1),
    boxMat = new THREE.RawShaderMaterial(BasicShader.createShader({
      color: 0xff0000,
      transparent: true,
      opacity: config.showHitBox ? 1 : 0,
      wireframe: true
    })),
    /*boxMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: false,
      opacity: 1,
      //opacity: config.showHitBox ? 1 : 0,
      wireframe: true
    }),*/
    hitBox = this.hitBox = new THREE.Mesh( boxGeo, boxMat );
    hitBox.mesh = this.mesh;

    this.group.add( hitBox );
  }

  initTexture(texture, renderer) {
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }

  update() {

    const geometry = this.geometry,
    mesh = this.mesh;

    //geometry.update( this.config );

    // centering
    geometry.computeBoundingBox();
    mesh.position.x = - geometry.layout.width / 2;
    mesh.position.y = - ( geometry.boundingBox.max.y - geometry.boundingBox.min.y ) / 2; // valign center
  
    this.hitBox.scale.set( geometry.layout.width, geometry.layout.height, 1 );
    // mesh.position.y = - ( geometry.boundingBox.max.y - geometry.boundingBox.min.y ); // valign top
     this.hitBox.position.y = - geometry.layout.height / 2; // valign top

    this.height = geometry.layout.height * this.config.scale; // for html-like flow / positioning
  }

  get text() {
    return this.config.text;
  }

  set text(value) {
    this.config.text = value;
    this.geometry.update( this.config );
    this.update();
  }

}