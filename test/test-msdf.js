/*
  This is an example of 2D rendering, simply
  using bitmap fonts in orthographic space.

  var geom = createText({
    multipage: true,
    ... other options
  })
 */



import  * as THREE  from 'three';
//import { default as createOrbitViewer } from 'three-orbit-viewer';

import createControls from 'three-orbit-controls';

import shuffle from 'array-shuffle';

import { suntzuquotes } from './quotes';  
import { palettes } from './palettes';

var OrbitControls = createControls(THREE);

var palette = palettes[5]
var background = palette.shift();

var quotes = shuffle(suntzuquotes);
//var quotes = shuffle(suntzuquotes().join(' ').split('.'));


//import { createMSDFShader  } from '../src/msdf.js';
//import MSDFShader from '../src/shaders/MSDFShader';
//import TextGeometry from '../src/TextGeometry';
//import { OldTextGeometry } from '../src/index.js';
import TextBitmap from '../src/TextBitmap';

import { fontLoader } from './fontLoader';

fontLoader({
  font: 'fnt/Roboto-Bold.json',
  image: 'fnt/Roboto-Bold.png'
}, start)

let scene, renderer, camera, container, clock;

function start (font, texture) {
  //console.log(createOrbitViewer(THREE));
  /*var app = createOrbitViewer(THREE)({
    clearColor: background,
    clearAlpha: 1.0,
    fov: 65,
    position: new THREE.Vector3()
  })*/


      scene = new THREE.Scene();

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setClearColor( background, 1 );

      document.body.appendChild(renderer.domElement);
/*
  camera = new THREE.OrthographicCamera();
  camera.left = 0;
  camera.top = 0;
  camera.near = -1;
  camera.far = 1000;
  camera.fov = 65;
  camera.position.set( 0, 0, -0.26 );*/


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

       

    const boxGeo = new THREE.PlaneGeometry(2, 1, 200, 200),  
    boxMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: false,
      opacity: 1,
      map: texture,
      //side: THREE.DoubleSide,
      //opacity: config.showHitBox ? 1 : 0,
      wireframe: true
    }),
    hitBox = new THREE.Mesh( boxGeo, boxMat );

    //scene.add(hitBox);






  clock = new THREE.Clock();

  var count = 25;


  /*
  for (var i = 0; i < count; i++) {
    createGlyph();
  }*/

  
//createGlyph1(font, texture);  

  createGlyph(font, texture);

   window.addEventListener('resize', resize, false);
  resize();

  renderer.animate( loop );


  var time = 0
  // update orthographic
  function loop() {
    time += clock.getDelta() / 1000
    var s = (Math.sin(time * 0.5) * 0.5 + 0.5) * 2.0 + 0.5
    container.scale.set(s, s, s);
    // update camera
    var width = window.innerWidth;
    var height = window.innerHeight;

   /* camera.left = -width / 2
    camera.right = width / 2
    camera.top = -height / 2
    camera.bottom = height / 2
    camera.updateProjectionMatrix();*/

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
          //imagePath: "fnt/roboto-bold.png",
          //imagePath: "fnt/Arial.png",
          text: 'Tap to reposition',
          width: 1000,
          align: 'center',
          font: font,
          //lineHeight: font.common.lineHeight - 20,
          letterSpacing: 1,
          smoothing: 0.20,
          scale: 0.01,
          rotate: false,
          color: "#ffffff",
          texture: texture,
          showHitBox: true // for debugging
        }, renderer);

     
     //text.text = "Text Change";

     setTimeout(function() {
        // text.text = "Text Change Text Change Text Change Text Change Text Change Text Change Text ChangeText Change";
         
     }, 5000);


      text.group.position.set( 0, 0, - 1);
      text.group.visible = true;

//container.add(text.group);
     //camera.add(text.group);
      scene.add(text.group);
  }


  function createGlyph1 (font, texture) {
    var angle = (Math.random() * 2 - 1) * Math.PI
    var geom = new OldTextGeometry({
      text: "Click To Reset",
      //text: quotes[Math.floor(Math.random() * quotes.length)].split(/\s+/g).slice(0, 6).join(' '),
      font: font,
      align: 'left',
      flipY: texture.flipY
    });

/*
    var material = new THREE.RawShaderMaterial(MSDFShader.createShader({
      map: texture,
      transparent: true,
      color: 0xffffff
      //color: palette[Math.floor(Math.random() * palette.length)]
    }))*/

     //var material = new THREE.RawShaderMaterial(createMSDFShader({
    var material = new THREE.RawShaderMaterial(MSDFShader.createShader({
      map: texture,
      side: THREE.DoubleSide,
      depthTest: false,
      transparent: true,
      color: 0xffffff
      //color: palette[Math.floor(Math.random() * palette.length)]
    }));

    var layout = geom.layout
    var text = new THREE.Mesh(geom, material)
    text.position.set( 0, 0, - 1);
    //text.position.set(0, -layout.descender + layout.height, 0);
    text.scale.set(0.01,0.01,0.01);
    text.rotation.x = -Math.PI;
    //text.scale.multiplyScalar(Math.random() * 0.5 + 0.5)

    scene.add(text);

    var textAnchor = new THREE.Object3D()
    //textAnchor.add(text)
    textAnchor.rotation.z = angle
    //container.add(textAnchor)
  }
}
