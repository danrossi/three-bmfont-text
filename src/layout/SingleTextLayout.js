import TextLayout from './TextLayout';
import Vertices from './Vertices';
import TextLayoutUtils from './TextLayoutUtils';

export default class SingleTextLayout extends TextLayout {
    constructor(opt) {
        super(opt);
    }

    update(opt, attributes) {
        this._height = this.lineHeight - this.descender,
            this._width = opt.width;
        const glyph = TextLayoutUtils.getGlyphById(opt.font, opt.text.charCodeAt(0)),
            //y = 10,
            text = opt.text;
        //console.log(this.lineHeight / 2 - this._height / 2);
        let x = 0,
            y = -(this._height / 2) / 2;
        this.initBuffers(text);
        if (glyph.width * glyph.height > 0) {
            this._width = glyph.width;

            x = -glyph.xoffset;
            
            this.updateVertices(glyph, x, y);

            //set the draw range to 12 for a single character. 
            this._drawRange = 12;
        }
    }
}