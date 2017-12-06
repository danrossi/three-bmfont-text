import TextLayout from './TextLayout';
import Vertices from './Vertices';
import TextLayoutUtils from './TextLayoutUtils';

export default class SimpleTextLayout extends TextLayout {

	constructor(opt) {
		super(opt);
	}

	update(opt, attributes) {		
    	this._height = this.lineHeight - this.descender,
    	this._width = opt.width;

		const glyph = TextLayoutUtils.getGlyphById(opt.font, opt.text.charCodeAt(0)),
    	y = -this._height,
    	text = opt.text;

    	let x = 0;

    	this.initBuffers(text);

		if (glyph.width * glyph.height > 0) {

			  x = this.getAlignment(glyph.width);

              Vertices.positions(glyph, this._positions, 0, x, y);
              Vertices.uvs(glyph, this._uvs, 0, this.font, this._opt.flipY);
              Vertices.index(this._indices, 0, 0);
             
             //set the draw range to 8 for a single character. 
             this._drawRange = 8;
        }
	}

}