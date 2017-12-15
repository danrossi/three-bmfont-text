/*
  This is an example of 2D rendering, simply
  using bitmap fonts in orthographic space.

  var geom = createText({
    multipage: true,
    ... other options
  })
 */



import  * as THREE  from 'three';

import createControls from 'three-orbit-controls';

import { palettes } from './palettes';

import wrap from 'word-wrap';
import wordWrap from 'word-wrapper';

var OrbitControls = createControls(THREE);

var palette = palettes[5]
var background = palette.shift();

import SingleTextBitmap from '../src/SingleTextBitmap';

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
  font: 'fnt/flowplayer-icons.json',
  image: 'fnt/flowplayer-icons.png'
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

   

        //scene.add( uiObject );

      

  createGlyph(font, texture);

   window.addEventListener('resize', resize, false);
  resize();

  renderer.animate( loop );


  var time = 0
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

     const text = new SingleTextBitmap({
          text: "\uE007",
          width: 36,
          align: 'center',
          font: font,
          letterSpacing: 1,
          scale: 0.01,
          color: "#ffffff",
          texture: texture
        }, renderer);


      text.group.position.set( 0, 0, - 1);
      text.group.visible = true;

      scene.add(text.group);
  }
}
