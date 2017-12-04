//import createIndices from 'quad-indices';
//import buffer from 'three-buffer-vertex-data';
//import BufferVertexData from './util/BufferVertexData';
import * as vertices  from './vertices';
import Vertices from './layout/Vertices';
import createLayout from 'layout-bmfont-text';
import TextLayout from './layout/TextLayout';
import TextGeometryUtil from './util/TextGeometryUtil';
//import { BufferGeometry } from 'three/build/three.modules'
import { BufferGeometry, Box3, Sphere, BufferAttribute, Float32BufferAttribute, Uint16BufferAttribute } from 'three';

//import  * as utils from './utils';

export default class TextGeometry extends BufferGeometry {

	constructor(opt) {
		super();

		/*if (typeof opt === 'string') {
			opt = { text: opt }
		}*/

		// use these as default values for any subsequent
  		// calls to update()
  		//THREE.js already polyfills assign.
		this._opt = Object.assign({}, opt);

		this.boundingBox = new Box3();

		// also do an initial setup...
  		if (opt) this.update(opt);
	}

	update(opt) {

	  if (typeof opt === 'string') {
	    opt = { text: opt }
	  }

	  // use constructor defaults
	  opt = Object.assign({}, this._opt, opt);

	  /*if (!opt.font) {
	    throw new TypeError('must specify a { font } in options')
	  }*/

	  //this.layout = new TextLayout(opt);

	  this.layout = createLayout(opt);


	  //console.log(this.layout);

	  // get vec2 texcoords
	  const flipY = opt.flipY !== false,
	  // the desired BMFont data
	  font = opt.font,
	  // determine texture size from font file
	  texWidth = font.common.scaleW,
	  texHeight = font.common.scaleH,
	  glyphs = this.layout.glyphs;
	  // get visible glyphs
	 // glyphs = this.layout.glyphs.filter((glyph) => glyph.data.width * glyph.data.height > 0);
	  // provide visible glyphs for convenience
	  this.visibleGlyphs = glyphs;
	  // get common vertex data
	  //const positions = Vertices.positions(glyphs),
	  //uvs = Vertices.uvs(glyphs, texWidth, texHeight, flipY);
	 /* const indices = createIndices({
	    clockwise: true,
	    type: 'uint16',
	    count: glyphs.length
	  });*/



	  /*var positions = vertices.positions(glyphs);
  	  var uvs = vertices.uvs
  	  (glyphs, texWidth, texHeight, flipY);*/


	  //	var positions = vertices.positions(glyphs);
  	  //var uvs = vertices.uvs
  	  //(glyphs, texWidth, texHeight, flipY);

  	 

  	 // console.log("GLYPHS LENGTH", glyphs.length);

  // update vertex data
  //buffer.index(this, indices, 1, 'uint16')
  //buffer.attr(this, 'position', positions, 2)
  //buffer.attr(this, 'uv', uvs, 2)

/*
  console.log(positions);
  console.log(uvs);
  console.log(indices);
*/

//console.log(this.attributes.position);

		//let positions = null,
		//vertices = null;

		//const indices = TextGeometryUtil.createIndices(glyphs.length);


		//console.log(indices);

		//console.log(glyphs.length);
		//console.log(indices.length);

  	  	//this.setIndex( new BufferAttribute( indices, 1 ) );

  	  	const data = Vertices.geomData(glyphs, font, flipY);

  	  	this.setIndex( new BufferAttribute( data.index, 1 ) );

	  // update vertex data
	  //this.setIndex( new BufferAttribute( indices, 1 ) );
	  //this.setIndex(  new Uint16BufferAttribute( indices, 1 ) );
	  //this.addAttribute('index', new Uint16BufferAttribute( indices, 1 ));
	  //this.setIndex(  TextGeometryUtil.createIndices(glyphs.length) );
	  if (this.attributes.position) {
	  	//const newPos = vertices.positions(glyphs),
	  	//newUvs = vertices.uvs
  	  //(glyphs, null, texWidth, texHeight, flipY);
  	 // console.log(this.attributes.index.array);
  	 	//TextGeometryUtil.createIndices(glyphs.length, this.index.array);
	  	//vertices.positions(glyphs, this.attributes.position.array);
	  //	vertices.uvs
  	   //(glyphs, this.attributes.uv.array, texWidth, texHeight, flipY);
  	  	//this.attributes.position = new BufferAttribute( newPos, 2 );
  	  	//this.attributes.uv = new BufferAttribute( newUvs, 2 );

  	  	this.attributes.position = new BufferAttribute( data.positions, 2 );
  	  	this.attributes.uv = new BufferAttribute( data.uvs, 2 );

  	  	this.index.needsUpdate = true;

  	  	this.attributes.position.needsUpdate = true;
  	  	this.attributes.uv.needsUpdate = true;
	  } else {
	  	//const data = Vertices.geomData(glyphs, font, flipY);


	  	//console.log(data.index); 

	  	//this.setIndex( new BufferAttribute( data.index, 1 ) );

	  	//const positions = vertices.positions(glyphs),
	  	//uvs = vertices.uvs(glyphs, null, texWidth, texHeight, flipY);

  	   //const indices = TextGeometryUtil.createIndices(glyphs.length);


  	  	//this.setIndex( new BufferAttribute( indices, 1 ) );
  	  //var uvs = vertices.uvs
  	  //(glyphs, texWidth, texHeight, flipY);

	  	this.addAttribute( 'position', new BufferAttribute( data.positions, 2 ));
	  	this.addAttribute( 'uv', new BufferAttribute( data.uvs, 2 ));
	  }
	  
	 
	 // this.addAttribute( 'position', new Float32BufferAttribute( positions, 2 ) );
	//this.addAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
	 // this.addAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

	  //BufferVertexData.setIndex(this, indices, 1, 'uint16');
	  //BufferVertexData.setAttribute(this, 'position', positions, 2);
	 //BufferVertexData.setAttribute(this, 'uv', uvs, 2);
	  //BufferVertexData.setAttribute(this, 'position', this.layout.positions, 2);
	 //BufferVertexData.setAttribute(this, 'uv', this.layout.uvs, 2);

	  // update multipage data
	  if (!opt.multipage && 'page' in this.attributes) {
	    // disable multipage rendering
	    this.removeAttribute('page');
	  } else if (opt.multipage) {
	    //const pages = Vertices.pages(glyphs);
	    // enable multipage rendering
	    buffer.attr(this, 'page', this.layout.pages, 1);
	  }
	}

	computeBoundingSphere() {

	  if (this.boundingSphere === null) {
	    this.boundingSphere = new Sphere();
	  }

	  const positions = this.attributes.position.array,
	  itemSize = this.attributes.position.itemSize;

	  if (!positions || !itemSize || positions.length < 2) {
	    this.boundingSphere.radius = 0
	    this.boundingSphere.center.set(0, 0, 0)
	    return;
	  }

	  TextGeometryUtil.computeSphere(positions, this.boundingSphere);

	  /*if (isNaN(this.boundingSphere.radius)) {
	    console.error('THREE.BufferGeometry.computeBoundingSphere(): ' +
	      'Computed radius is NaN. The ' +
	      '"position" attribute is likely to have NaN values.')
	  }*/
	}

	computeBoundingBox() {

	  const bbox = this.boundingBox,
	  positions = this.attributes.position.array,
	  itemSize = this.attributes.position.itemSize;

	  if (!positions || !itemSize || positions.length < 2) {
	    bbox.makeEmpty();
	    return
	  }

	  TextGeometryUtil.computeBox(positions, bbox);
	}
}


