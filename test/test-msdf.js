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


import wrap from 'word-wrap';
import wordWrap from 'word-wrapper';

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


var text = "Text Change Text Change Text Change Text Change Text Change Text Change Text Change Text Change";

var a = performance.now();

//console.log(wordWrap.lines(text, { width: 100 }));
console.log(wordWrap(text, { width: 100 }));
//console.log(wordWrap(text, { width: 100 }));

//console.log(wrap(text, { width: 100, trim: true }));

var b = performance.now();

console.log('It took ' + (b - a) + ' ms.');

a = performance.now();

//wrap(text, { width: 100, trim: true });
console.log(wrap(text, { width: 100, trim: true }));

//console.log(wordWrap(text, { width: 100 }));

b = performance.now();

console.log('It took ' + (b - a) + ' ms.');

function wordwrap1(a, b, c, d, e) {
    c = c || '\n';
    b = b || 75;
    d = d || false;
    if (!a) {return a;}
    e = '.{1,' + b + '}(\\s|$)' + (d ? '|.{' + b + '}|.+$' : '|\\S+?(\\s|$)');
    return a.match(RegExp(e, 'g'));
    //return a.match(RegExp(e, 'g')).join(c);
} 

a = performance.now();

//wrap(text, { width: 100, trim: true });
//wordWrap(text, { width: 100 });
console.log(wordwrap1(text, 100));
//console.log(wrap(text, { width: 100, trim: true }));

//console.log(wordwrap1(text, 50));

b = performance.now();

console.log('It took ' + (b - a) + ' ms.');


fontLoader({
  font: 'fnt/Roboto-Bold.json',
  image: 'fnt/Roboto-Bold.png'
}, start)

let scene, renderer, camera, container, clock;

function start (font, texture) {

      scene = new THREE.Scene();

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setClearColor( background, 1 );

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

  renderer.animate( loop );


 
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

     
     text.text = "Text Change";

     setTimeout(function() {
         text.text = "Text Change Text Change Text Change Text Change Text Change Text Change Text ChangeText Change";
         
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
