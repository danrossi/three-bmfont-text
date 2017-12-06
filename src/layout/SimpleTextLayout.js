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

    	let positionOffset = 0,
		x = 0;

    	this._positions = new Float32Array(text.length * 8);
    	this._uvs = new Float32Array(text.length * 8);

		if (glyph.width * glyph.height > 0) {

			  x = this.getAlignment(glyph.width);

              Vertices.positions(glyph, this._positions, positionOffset, x, y);
              Vertices.uvs(glyph, this._uvs, positionOffset, this.font, this._opt.flipY);
              
              this.glyphs.push({
                position: [x, y],
                data: glyph
              }); 

        }
	}

}