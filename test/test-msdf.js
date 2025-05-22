/*
  This is an example of 2D rendering, simply
  using bitmap fonts in orthographic space.

  var geom = createText({
    multipage: true,
    ... other options
  })
 */



import  * as THREE  from 'three';


import { WebGPURenderer } from 'three/webgpu';


import { OrbitControls } from "three-vr-orbitcontrols";



import TextBitmap from '../src/TextBitmap';
import { fontLoader } from './fontLoader';




fontLoader({
  font: 'fnt/Roboto-Bold.json',
  image: 'fnt/Roboto-Bold.png'
}, start)

let scene, renderer, camera, container, clock;

function onEnableVr(presenting) {
        console.log(" presenting", presenting);
        renderer.xr.enabled = true;

        
      }

function start (font, texture) {

      scene = new THREE.Scene();

      renderer = new WebGPURenderer({ antialias: true, forceWebGL: true });
      renderer.setClearColor( 0x000000, 1 );
      renderer.xr.enabled = true;

      console.log(renderer);

      document.body.appendChild(renderer.domElement);

    

   camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, .01, 100000 );

        camera.layers.enable( 1 ); // render left view when no stereo available

        camera.position.set( 0, 0, -0.26 );

        camera.zoom = 1;
            camera.target = new THREE.Vector3(0, 0, 0);
            camera.rotation.reorder('YXZ');
            camera.layers.enable(1);


  var gridHelper = new THREE.GridHelper( 5, 10, 0xDDDDDD );
      gridHelper.position.y = -1;
      scene.add( gridHelper );


  var orbitControls = new OrbitControls( camera, renderer.domElement );
  orbitControls.target.set(0,0,0);

    container = new THREE.Object3D();
  scene.add(container);



     var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
var material = new THREE.MeshNormalMaterial();
 var uiObject = new THREE.Mesh(geometry, material);
uiObject.position.z = -1

   

        scene.add( uiObject );


  clock = new THREE.Clock();
 

  createGlyph(font, texture);

   window.addEventListener('resize', resize, false);
  resize();


  renderer.setAnimationLoop( loop );
  // update orthographic
  function loop() {

    renderer.render( scene, camera );
  };

  function resize() {
        var width = window.innerWidth;
        var height = window.innerHeight;

        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
  }

  function createGlyph (font, texture) {

     const text = new TextBitmap({
          text: 'Tap',
          width: 1000,
          align: 'center',
          font: font,
          //lineHeight: font.common.lineHeight - 20,
          letterSpacing: 1,
          scale: 0.001,
          color: "#ffffff",
          texture: texture,
          showHitBox: true // for debugging
        }, renderer);

     
     text.text = "Text";

     setTimeout(function() {
      text.color = new THREE.Color(0x000000);
      text.text = "Text 2";
        
         
     }, 5000);


      text.group.position.set( 0, 0, - 50);
      text.group.visible = true;

//container.add(text.group);
     //camera.add(text.group);
      scene.add(text.group);
  }

}
