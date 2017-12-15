import Vertices from './Vertices';
import TextLayoutUtils from './TextLayoutUtils';

export default class TextLayout {
  
    constructor(opt) {
        this._glyphs = [];
        this._positions = [];
        this._uvs = [];
        this._pages = [];
        this._opt = opt;
        this.update(opt);
    }

    initBuffers(text) {
        const bufferLength = text.length * 8;
        //this._positions = [];
        this._positions = new Float32Array(text.length * 12);
        this._uvs = new Float32Array(text.length * 8);
        this._indices = new Uint16Array(text.length * 6);
    }

    update(opt, attributes) {
        opt.align = opt.align || "left";
        this._opt.measure = (text, start, end, width) => this.computeMetrics(text, start, end, width);
        this._opt.tabSize = this._opt.tabSize > 0 ? this._opt.tabSize : 4;
        const text = opt.text || '',
            font = this.font,
            lines = TextLayoutUtils.wordwrap(text, this._opt),
            minWidth = opt.width || 0,
            lineHeight = this.lineHeight,
            letterSpacing = this.letterSpacing;
        let pages = this._pages,
            positionOffset = 0,
            uvOffset = 0,
            indicesOffset = 0,
            indicesValueOffset = 0,
            pagesOffset = 0;
        pages = [0, 0, 0, 0];
        //init position, uv and indices buffers
        this.initBuffers(text);
        if (opt.multipage) this._pages = new Uint16Array(text.length * 4);
        this._glyphCount = 0;
        //get max line width
        this._width = lines.reduce((prev, line) => Math.max(prev, line.width, minWidth), 0);
        //the pen position
        this._height = this.lineHeight * lines.length - this.descender;
        let x = 0,
            y = 0;
        //draw text along baseline
        y = -this._height;
        //layout each glyph
        lines.forEach((line, lineIndex) => {
            const start = line.start,
                end = line.end,
                lineWidth = line.width,
                alignment = this.getAlignment(lineWidth);
            let lastGlyph = null;
            //for each glyph in that line...
            //for (let i of TextLayoutUtils.range(start, end, 1)) {
            for (let i = start; i < end; i++) {
                const glyph = TextLayoutUtils.getGlyphById(font, text.charCodeAt(i));
                if (glyph) {
                    if (lastGlyph) {
                        x += TextLayoutUtils.getKerning(font, lastGlyph, glyph);
                    }
                    let tx = x;
                    tx += alignment;
                    //add visible glyphs determined by width and height
                    if (glyph.width * glyph.height > 0) {
                        this._glyphCount++;

                        this.updateVertices(glyph, tx, y, positionOffset,  uvOffset, indicesOffset, indicesValueOffset);
                        
                        if (glyph.page) {
                            Vertices.pages(glyph, this._pages, pagesOffset);
                            pagesOffset += 4;
                        }
                        indicesOffset += 6;
                        indicesValueOffset += 4;
                        uvOffset += 8;
                        positionOffset += 12;
                        this._drawRange = positionOffset;
                    }
                    //move pen forward
                    x += glyph.xadvance + letterSpacing;
                    lastGlyph = glyph;
                }
            }
            //next line down
            y += lineHeight;
            x = 0;
        });
        this._linesTotal = lines.length;
    }

    updateVertices(glyph, x, y, positionOffset = 0,  uvOffset = 0, indicesOffset = 0, indicesValueOffset = 0) {
        Vertices.positions(glyph, this._positions, positionOffset, x, y);
        Vertices.uvs(glyph, this._uvs, uvOffset, this.font, this._opt.flipY);
        Vertices.index(this._indices, indicesOffset, indicesValueOffset);
    }

    getAlignment(lineWidth) {
        switch (this._opt.align) {
            case "center":
                return (this._width - lineWidth) / 2;
            case "right":
                return (this._width - lineWidth);
            default:
                return 0;
                break;
        };
    }

    computeMetrics(text, start, end, width) {
        const letterSpacing = this.letterSpacing,
            font = this.font;
        let curPen = 0,
            curWidth = 0,
            count = 0,
            glyph = null,
            lastGlyph = null;
       
        for (let i = start; i < Math.min(text.length, end); i++) {
            //for (let i of TextLayoutUtils.range(start, Math.min(text.length, end), 1)) {
            const glyph = TextLayoutUtils.getGlyphById(font, text.charCodeAt(i));
            if (glyph) {
                //move pen forward
                const xoff = glyph.xoffset,
                    kern = lastGlyph ? TextLayoutUtils.getKerning(font, lastGlyph, glyph) : 0;
                //kern1 = lastGlyph ? this.getKerning(font, lastGlyph.id, glyph.id) : 0;
                curPen += kern;
                const nextPen = curPen + glyph.xadvance + letterSpacing,
                    nextWidth = curPen + glyph.width;
                //we've hit our limit; we can't move onto the next glyph
                if (nextWidth >= width || nextPen >= width) break
                //otherwise continue along our line
                curPen = nextPen;
                curWidth = nextWidth;
                lastGlyph = glyph;
            }
            count++;
        }
        //make sure rightmost edge lines up with rendered glyphs
        if (lastGlyph) curWidth += lastGlyph.xoffset;
        return {
            start: start,
            end: start + count,
            width: curWidth
        }
    }
    get pages() {
        return new Float32Array(this._pages, 0, this.glyphs.length * 4 * 1);
    }
    get positions() {
        //return new Float32Array(this._positions, 0, this._opt.text.length * 8);
        return this._positions;
    }
    get uvs() {
        return this._uvs;
    }
    get indices() {
        return this._indices;
    }
    get glyphCount() {
        return this._glyphCount;
    }
    get drawRange() {
        return this._drawRange;
    }
    get font() {
        return this._opt.font;
    }
    /*get glyphs() {
      return this._glyphs;
    }*/
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get lineHeight() {
        return this._opt.lineHeight || this.font.common.lineHeight;
    }
    get baseline() {
        return this.font.common.base;
    }
    get descender() {
        return this.lineHeight - this.baseline;
    }
    get ascender() {
        return this.lineHeight - descender - this.xHeight;
    }
    get xHeight() {
        return this.font.common.xHeight;
    }
    get capHeight() {
        return this.font.common.capHeight;
    }
    get letterSpacing() {
        return this._opt.letterSpacing || 0;
    }
}