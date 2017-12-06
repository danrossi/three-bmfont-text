//import * as vertices  from './vertices';
import Vertices from './layout/Vertices';
//import createLayout from 'layout-bmfont-text';
import TextLayout from './layout/TextLayout';
import TextGeometryUtil from './util/TextGeometryUtil';
import { BufferGeometry, Box3, Sphere, BufferAttribute } from 'three';

//import { createLayout } from './layout';

export default class TextGeometry extends BufferGeometry {

	constructor(opt) {
		super();

  		//THREE.js already polyfills assign.
		this._opt = Object.assign({
			flipY: true
		}, opt);

		this.boundingBox = new Box3();

  		this.update(opt.text);
	}

	creatTextLayout() {
		return new TextLayout(this._opt);
	}

	update(text) {

	  const opt = this._opt;
	  opt.text = text;

	  this.layout = this.creatTextLayout();

	  // get vec2 texcoords
	  // the desired BMFont data
	 // const font = opt.font;
	//  glyphs = this.layout.glyphs;
	  // get visible glyphs
	 // glyphs = this.layout.glyphs.filter((glyph) => glyph.data.width * glyph.data.height > 0);
	  // provide visible glyphs for convenience
	  //this.visibleGlyphs = glyphs; 

  	  //const data = Vertices.geomData(glyphs, font, opt.flipY);

  	  //console.log(data.index);
  	  //console.log(this.layout.indices);

  	  this.setIndex( new BufferAttribute( this.layout.indices, 1 ) );
  	  //this.setIndex( new BufferAttribute( data.index, 1 ) );
  	  this.setDrawRange(0, this.layout.drawRange);

	  if (this.attributes.position) {
		
		this.attributes.position = new BufferAttribute( this.layout.positions, 2 );
  	  	this.attributes.uv = new BufferAttribute( this.layout.uvs, 2 );
  	  	//this.attributes.position = new BufferAttribute( data.positions, 2 );
  	  	//this.attributes.uv = new BufferAttribute( data.uvs, 2 );

  	  	this.index.needsUpdate = true;

  	  	this.attributes.position.needsUpdate = true;
  	  	this.attributes.uv.needsUpdate = true;
	  } else {
	 	
	 	this.addAttribute( 'position', new BufferAttribute( this.layout.positions, 2 ));
	  	this.addAttribute( 'uv', new BufferAttribute( this.layout.uvs, 2 ));
	  	//this.addAttribute( 'position', new BufferAttribute( data.positions, 2 ));
	  	//this.addAttribute( 'uv', new BufferAttribute( data.uvs, 2 ));
	  }
	  
	  // update multipage data
	  if (!opt.multipage && 'page' in this.attributes) {
	    // disable multipage rendering
	    this.removeAttribute('page');
	  } else if (opt.multipage) {
	  	const pages = Vertices.pages(glyphs);
	  	this.addAttribute( 'uv', new BufferAttribute( pages, 1 ));
	    //const pages = Vertices.pages(glyphs);
	    // enable multipage rendering
	    //buffer.attr(this, 'page', this.layout.pages, 1);
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


