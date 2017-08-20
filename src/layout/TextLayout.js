import wordWrap from 'word-wrapper';
import Vertices from './Vertices';

export default class TextLayout {

  constructor(opt) {
      this._glyphs = [];
      this._positons = [];
      this._uvs = [];
      this._pages = [];

      this.update(opt);
  }

  update(opt) {

    opt.align = opt.align || "left";

    this._opt = opt;
    this._opt.measure = (text, start, end, width) => this.computeMetrics(text, start, end, width);
    this._opt.tabSize = this._opt.tabSize > 0 ? this._opt.tabSize : 4;

    //if (!opt.font)
    //  throw new Error('must provide a valid bitmap font')

    const glyphs = this._glyphs,
    positions = this._positions,
    uvs = this._uvs,
    text = opt.text || '',
    font = this.font,
    lines = wordWrap.lines(text, opt),
    minWidth = opt.width || 0,
    letterSpacing = this.letterSpacing;

    //clear glyphs
    glyphs.length = position.length = uvs.length = 0;
    pages = [0, 0, 0, 0];

    //get max line width
    this._width = lines.reduce((prev, line) => Math.max(prev, line.width, minWidth), 0);

    //the pen position
    this._height = this.lineHeight * lines.length - this.descender;

    let x = 0,
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
      for (let i of TextLayoutUtils.range(start, end, 1)) {

        const glyph = TextLayoutUtils.getGlyphById(font, text.charCodeAt(i));
        
        if (glyph) {
          if (lastGlyph) 
            x += TextLayoutUtils.getKerning(font, lastGlyph.id, glyph.id);
            x += alignment;

            //add visible glyphs determined by width and height
            if (glyph.width * glyph.height > 0) {

              Vertices.positions(glyph, positions, tx, y);
              Vertices.uvs(glyph, uvs, this.font, this._opt.flipY);
              if (glyph.page) Vertices.positions(glyph, pages);

              glyphs.push({
                //position: [tx, y],
                data: glyph,
                index: i,
                line: lineIndex
              }); 

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
    const letterSpacing = this.letterSpacing;
    font = this.font;

    let curPen = 0,
    curWidth = 0,
    count = 0,
    glyph = null,
    lastGlyph = null;

    if (!font.chars || font.chars.length === 0) {
      return {
        start: start,
        end: start,
        width: 0
      };
    }

    for (let i of TextLayoutUtils.range(start, Math.min(text.length, end), 1)) {

      const glyph = TextLayoutUtils.getGlyphById(font, text.charCodeAt(i));

      if (glyph) {
        //move pen forward
        const xoff = glyph.xoffset,
        kern = lastGlyph ? TextLayoutUtils.getKerning(font, lastGlyph.id, glyph.id) : 0;
        
        curPen += kern;

        const nextPen = curPen + glyph.xadvance + letterSpacing,
        nextWidth = curPen + glyph.width;

        //we've hit our limit; we can't move onto the next glyph
        if (nextWidth >= width || nextPen >= width)
          break

        //otherwise continue along our line
        curPen = nextPen;
        curWidth = nextWidth;
        lastGlyph = glyph;
      }

      count++;
    }
    
    //make sure rightmost edge lines up with rendered glyphs
    if (lastGlyph)
      curWidth += lastGlyph.xoffset;

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
    return new Float32Array(this._positions, 0, this.glyphs.length * 4 * 2);
  }

  get uvs() {
    return new Float32Array(this._uvs, 0, this.glyphs.length * 4 * 2);
  }

  get font() {
    return this._opt.font;
  }

  get glyphs() {
    return this._glyphs;
  }

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