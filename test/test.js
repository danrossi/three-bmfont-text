/*
  This is an example of 3D rendering with
  a custom shader, special per-line shader effects,
  and glslify.
 */

global.THREE = require('three')
var quote = require('sun-tzu-quotes')
var buffer = require('three-buffer-vertex-data')
var createOrbitViewer = require('three-orbit-viewer')(THREE)
var createBackground = require('three-vignette-background')
var createGeometry = require('../')
var glslify = require('glslify')

// wrapper class for three-bmfont-text-bundle.js

var SDFShader = {

  uniforms: {
    map: { type: 't', value: null },
    color: { type: 'v3', value: new THREE.Color('#fff') },
    smoothing: { type: 'f', value: 0.1 },
    threshold: { type: 'f', value: 0.4 }
  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"

  ].join('\n'),

  // todo: outline
  // https://github.com/libgdx/libgdx/wiki/Distance-field-fonts#adding-an-outline
  // http://stackoverflow.com/questions/26155614/outlining-a-font-with-a-shader-and-using-distance-field

  fragmentShader: [

    "varying vec2 vUv;",

    "uniform sampler2D map;",
    "uniform vec3 color;",

    "uniform float smoothing;",
    "uniform float threshold;",

    "void main() {",
      // "vec4 texel = texture2D( map, vUv );",
      "float distance = texture2D( map, vUv ).a;",
      "float alpha = smoothstep( threshold - smoothing, threshold + smoothing, distance );",
      "gl_FragColor = vec4( color, alpha );",
    "}"

  ].join('\n')

};


var TextBitmap = function( config ) {

  this.config = config;
  config.color = config.color || '#fff';

  var geometry = this.geometry = createGeometry( config ); // text-bm-font

  var textureLoader = new THREE.TextureLoader();
  var texture = textureLoader.load(config.imagePath, function(){
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = renderer.getMaxAnisotropy();
  });

  var material = this.material = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone( SDFShader.uniforms ),
    fragmentShader: SDFShader.fragmentShader,
    vertexShader: SDFShader.vertexShader,
    side: THREE.DoubleSide,
    transparent: true,
    depthTest: false
  });

  material.uniforms.map.value = texture;
  material.uniforms.color.value = new THREE.Color( config.color );

  var mesh = this.mesh = new THREE.Mesh( geometry, material );
  var group = this.group = new THREE.Group();

  mesh.renderOrder = 1;

  mesh.rotation.x = Math.PI;

  var boxGeo = new THREE.BoxGeometry(1,1,1);
  var boxMat = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: config.showHitBox ? 1 : 0,
    wireframe: true
  });
  var hitBox = this.hitBox = new THREE.Mesh( boxGeo, boxMat );
  hitBox.mesh = mesh;

  this.update();

  var s = config.scale || 1;
  group.scale.set( s, s, s );

  group.add( mesh );
  group.add( hitBox );

}

TextBitmap.prototype.update = function(){

  var geometry = this.geometry;
  var mesh = this.mesh;

  geometry.update( this.config );

  // centering
  geometry.computeBoundingBox();
  mesh.position.x = - geometry.layout.width / 2;
  mesh.position.y = - ( geometry.boundingBox.max.y - geometry.boundingBox.min.y ) / 2; // valign center
  this.hitBox.scale.set( geometry.layout.width, geometry.layout.height, 1 );
  // mesh.position.y = - ( geometry.boundingBox.max.y - geometry.boundingBox.min.y ); // valign top
  // this.hitBox.position.y = - geometry.layout.height / 2; // valign top

  this.height = geometry.layout.height * this.config.scale; // for html-like flow / positioning
}

Object.defineProperty(TextBitmap.prototype, 'text', {

  get: function() {
    return this.config.text;
  },

  set: function(s) {

    this.config.text = s;
    this.update();

    return this;

  }

});

/*
require('./load')({
  font: 'fnt/DejaVu-sdf.fnt',
  image: 'fnt/DejaVu-sdf.png'
}, start)*/

var r = new XMLHttpRequest();
r.open('GET', 'fnt/Arial.json');

r.onreadystatechange = function() {
  if (r.readyState === 4 && r.status === 200) {
    start(JSON.parse(r.responseText));
  }
};

r.send();


function start (font, texture) {

  console.log("FONT", font);

   var mouse = new THREE.Vector2();
   mouse.moved = false;
   var raycaster = new THREE.Raycaster();
   var hitBoxes = [];
   var INTERSECTED;

   /*
  var app = createOrbitViewer({
    clearColor: 'rgb(40, 40, 40)',
    clearAlpha: 1.0,
    fov: 75,
    position: new THREE.Vector3(1, 1, -2)
  });

  app.camera.position.set( 0.13, 0, -0.26 );*/

   var scene = new THREE.Scene();

      var renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setClearColor( 0x333333, 1 );
      
      var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, .01, 100000 );
      camera.position.set( 0.13, 0, -0.26 );

      var orbitControls = new THREE.OrbitControls( camera, renderer.domElement );

      document.body.appendChild( renderer.domElement );

  //var bg = createBackground()
  //app.scene.add(bg)

  /*var geom = createText({
    font: font,
    align: 'center',
    width: 500,
    flipY: texture.flipY
  })*/

  var bmtext = new TextBitmap({
          imagePath: "fnt/Arial.png",
          text: 'Grumpy wizards make toxic brew for the evil Queen and Jack.',
          width: 1000,
          align: 'center',
          font: font,
          lineHeight: font.common.lineHeight - 20,
          letterSpacing: 1,
          scale: 0.0004,
          rotate: false,
          color: "#ccc",
          showHitBox: true // for debugging
  });

  /*var material = new THREE.RawShaderMaterial({
    vertexShader: glslify(__dirname + '/shaders/fx.vert'),
    fragmentShader: glslify(__dirname + '/shaders/fx.frag'),
    uniforms: {
      animate: { type: 'f', value: 1 },
      iGlobalTime: { type: 'f', value: 0 },
      map: { type: 't', value: texture },
      color: { type: 'c', value: new THREE.Color('#000') }
    },
    attributes: { // not needed in > ThreeJS r72
      line: { type: 'f', value: 0 }
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthTest: false
  })

  var text = new THREE.Mesh(geom, material)

  // scale it down so it fits in our 3D units
  var textAnchor = new THREE.Object3D()
  textAnchor.scale.multiplyScalar(-0.005)
  textAnchor.add(text)
  app.scene.add(textAnchor)*/

  app.scene.add( bmtext.group );
  hitBoxes.push( bmtext.hitBox );

  /*
  var gui = new dat.GUI();
        gui.add( bmtext, 'text' );
        gui.add( bmtext.config, 'align', ['left', 'center', 'right'] ).onChange(function(){ bmtext.geometry.update( bmtext.config ); });
        gui.add( bmtext.config, 'width', 200, 1500 ).onChange(function(){ bmtext.update(); });
        gui.add( bmtext.config, 'letterSpacing', -10, 100 ).step(1).onChange(function(){ bmtext.update(); });
        gui.add( bmtext.config, 'lineHeight', 0, 500 ).step(1).onChange(function(){ bmtext.update(); });
        gui.add( bmtext.config, 'scale', 0.0001, 0.0009 ).onChange(function(s){ bmtext.group.scale.set(s,s,s); });
        gui.add( bmtext.material.uniforms.smoothing, 'value', 0, 0.4 ).name('smoothing');
        gui.add( bmtext.material.uniforms.threshold, 'value', 0, 2 ).name('threshold');
        gui.add( bmtext.config, 'rotate' ).onChange(function(val){ if ( !val ) bmtext.group.rotation.set(0,0,0); });
        gui.add( bmtext.config, 'showHitBox' ).onChange(function(val) { bmtext.hitBox.material.opacity = val ? 1 : 0; });
        gui.addColor( bmtext.config, 'color' ).onChange(function(val){ bmtext.material.uniforms.color.value.setStyle(val); });*/


      function mousemove(event){
        event.preventDefault();
        if ( !mouse.moved ) mouse.moved = true;
        // normalized device coordinates
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      }

  function hover() {
        raycaster.setFromCamera( mouse, camera );

        var intersects = raycaster.intersectObjects( hitBoxes );

        if ( intersects.length > 0 ) {

          if ( INTERSECTED != intersects[ 0 ].object ) {

            if ( INTERSECTED ) {
              INTERSECTED.mesh.material.uniforms.color.value.setHex( INTERSECTED.currentHex );
              document.body.style.cursor = 'auto';
            }

            INTERSECTED = intersects[ 0 ].object;
            INTERSECTED.currentHex = INTERSECTED.mesh.material.uniforms.color.value.getHex();
            // INTERSECTED.mesh.material.uniforms.color.value.setHex( 0xff0000 );
            INTERSECTED.mesh.material.uniforms.color.value.offsetHSL(0,0,0.25); // lighten
            document.body.style.cursor = 'pointer';

          }

        } else {

          if ( INTERSECTED ) {
            INTERSECTED.mesh.material.uniforms.color.value.setHex( INTERSECTED.currentHex );
            document.body.style.cursor = 'auto';
          }

          INTERSECTED = null;

        }
      }

      function mousedown(event) {
        event.preventDefault();
        if ( INTERSECTED ) {
          INTERSECTED.mesh.material.uniforms.color.value.offsetHSL(0,0,-0.35); // darken
          //orbitControls.enabled = false;
        }
      }

      function mouseup(event) {
        event.preventDefault();
        if ( INTERSECTED ) {
          INTERSECTED.mesh.material.uniforms.color.value.setHex( INTERSECTED.currentHex );
          INTERSECTED.mesh.material.uniforms.color.value.offsetHSL(0,0,0.25);
        }
        //orbitControls.enabled = true;
      }


  renderer.domElement.addEventListener( 'mousemove', mousemove, false );
  renderer.domElement.addEventListener( 'mousedown', mousedown, false );
  renderer.domElement.addEventListener( 'mouseup', mouseup, false );


  var duration = 3
  next()

  var time = 0
  /*app.on('tick', function (dt) {
    time += dt / 1000
    //material.uniforms.iGlobalTime.value = time
    //material.uniforms.animate.value = time / duration
    if (time > duration) {
      time = 0
      next()
    }

    var width = window.innerWidth
    var height = window.innerHeight
    bg.style({
      aspect: width / height,
      aspectCorrection: false,
      scale: 2.5,
      grainScale: 0
    })
  })*/

  

  function next () {
    // set new text string
    //geom.update(quote())

    bmtext.text = quote();

   /* var lines = geom.visibleGlyphs.map(function (glyph) {
      return glyph.line
    })

    var lineCount = lines.reduce(function (a, b) {
      return Math.max(a, b)
    }, 0)

    // for each quad, let's give it a vertex attribute
    // with the line index
    var lineData = lines.map(function (line) {
      // map to 0..1 for attribute
      var t = lineCount <= 1 ? 1 : (line / (lineCount - 1))
      // quad - 4 verts
      return [ t, t, t, t ]
    }).reduce(function (a, b) {
      return a.concat(b)
    }, [])

    // update the "line" vertex attribute
    buffer.attr(geom, 'line', lineData, 1)

    // center the text
    var layout = geom.layout
    text.position.x = -layout.width / 2
    text.position.y = layout.height / 2*/
  }
}
