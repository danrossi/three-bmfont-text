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


import MSDFShader from '../src/shaders/MSDFShader';
import TextGeometry from '../src/TextGeometry';

import { fontLoader } from './fontLoader';

fontLoader({
  font: 'fnt/Roboto-Bold-msdf.json',
  image: 'fnt/Roboto-Bold-msdf.png'
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

  camera = new THREE.OrthographicCamera();
  camera.left = 0;
  camera.top = 0;
  camera.near = -1;
  camera.far = 1000;
  camera.fov = 65;
  camera.position.set( 0, 0, -0.26 );

  var orbitControls = new OrbitControls( camera, renderer.domElement );
  orbitControls.target.set(0,0,0);

  container = new THREE.Object3D();
  scene.add(container);

  clock = new THREE.Clock();

  var count = 25;


  
  for (var i = 0; i < count; i++) {
    createGlyph();
  }

   window.addEventListener('resize', resize, false);
  resize();

  renderer.animate( loop );


  var time = 0
  // update orthographic
  function loop() {
    time += clock.getDelta() / 1000
    var s = (Math.sin(time * 0.5) * 0.5 + 0.5) * 2.0 + 0.5
    container.scale.set(s, s, s)
    // update camera
    var width = window.innerWidth;
    var height = window.innerHeight;

    camera.left = -width / 2
    camera.right = width / 2
    camera.top = -height / 2
    camera.bottom = height / 2
    camera.updateProjectionMatrix();

    renderer.render( scene, camera );
  };

  function resize() {
        var width = window.innerWidth;
        var height = window.innerHeight;

        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
  }

  function createGlyph () {
    var angle = (Math.random() * 2 - 1) * Math.PI
    var geom = new TextGeometry({
      text: quotes[Math.floor(Math.random() * quotes.length)].split(/\s+/g).slice(0, 6).join(' '),
      font: font,
      align: 'left',
      flipY: texture.flipY
    })

    var material = new THREE.RawShaderMaterial(MSDFShader.createShader(MSDFShader, {
      map: texture,
      transparent: true,
      color: palette[Math.floor(Math.random() * palette.length)]
    }))

    var layout = geom.layout
    var text = new THREE.Mesh(geom, material)
    text.position.set(0, -layout.descender + layout.height, 0)
    text.scale.multiplyScalar(Math.random() * 0.5 + 0.5)

    var textAnchor = new THREE.Object3D()
    textAnchor.add(text)
    textAnchor.rotation.z = angle
    container.add(textAnchor)
  }
}
