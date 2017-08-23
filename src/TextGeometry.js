import createIndices from 'quad-indices';
//import buffer from 'three-buffer-vertex-data';
import BufferVertexData from './util/BufferVertexData';
import Vertices from './layout/Vertices';
import TextLayout from './layout/TextLayout';
import TextGeometryUtil from './util/TextGeometryUtil';
//import { BufferGeometry } from 'three/build/three.modules'
import { BufferGeometry, Box3, Sphere } from 'three';

export default class TextGeometry extends BufferGeometry {

	constructor(opt) {
		super();

		if (typeof opt === 'string') {
			opt = { text: opt }
		}

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

	  this.layout = new TextLayout(opt);

	  // get vec2 texcoords
	  const flipY = opt.flipY !== false,
	  // the desired BMFont data
	  font = opt.font,
	  // determine texture size from font file
	  //texWidth = font.common.scaleW,
	  //texHeight = font.common.scaleH,
	  glyphs = this.layout.glyphs;
	  // get visible glyphs
	 // glyphs = this.layout.glyphs.filter((glyph) => glyph.data.width * glyph.data.height > 0);
	  // provide visible glyphs for convenience
	  this.visibleGlyphs = glyphs;
	  // get common vertex data
	  //const positions = Vertices.positions(glyphs),
	  //uvs = Vertices.uvs(glyphs, texWidth, texHeight, flipY);
	  const indices = createIndices({
	    clockwise: true,
	    type: 'uint16',
	    count: glyphs.length
	  });

	  // update vertex data
	  BufferVertexData.setIndex(this, indices, 1, 'uint16');
	  BufferVertexData.setAttribute(this, 'position', this.layout.positions, 2);
	 	BufferVertexData.setAttribute(this, 'uv', this.layout.uvs, 2);

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


