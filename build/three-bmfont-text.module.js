import { BufferGeometry, Box3, BufferAttribute, Mesh, DoubleSide, Color, Group, BoxGeometry, MeshBasicMaterial, LinearMipMapLinearFilter, LinearFilter } from 'three';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { Fn, color, texture, uniform, max, min, clamp, fwidth } from 'three/tsl';

class Vertices {
    static pages(glyph, pages, pagesOffset) {
        const id = glyph.page || 0;
        pages[pagesOffset] = id;
        pages[pagesOffset + 1] = id;
        pages[pagesOffset + 2] = id;
        pages[pagesOffset + 3] = id;
    }
    static uvs(glyph, uvs, offset, font, flipY) {
        const bw = (glyph.x + glyph.width),
            bh = (glyph.y + glyph.height),
            texWidth = font.common.scaleW,
            texHeight = font.common.scaleH,
            // top left position
            u0 = glyph.x / texWidth,
            u1 = bw / texWidth;
        let v1 = glyph.y / texHeight,
            v0 = bh / texHeight;
        if (flipY) {
            v1 = (texHeight - glyph.y) / texHeight;
            v0 = (texHeight - bh) / texHeight;
        }
        // BL
        uvs[offset] = u0;
        uvs[offset + 1] = v1;
        // TL
        uvs[offset + 2] = u0;
        uvs[offset + 3] = v0;
        // TR
        uvs[offset + 4] = u1;
        uvs[offset + 5] = v0;
        // BR
        uvs[offset + 6] = u1;
        uvs[offset + 7] = v1;
    }
    static index(indices, indicesOffset, indicesValueOffset) {
        indices[indicesOffset] = indicesValueOffset;
        indices[indicesOffset + 1] = indicesValueOffset + 1;
        indices[indicesOffset + 2] = indicesValueOffset + 2;
        indices[indicesOffset + 3] = indicesValueOffset + 0;
        indices[indicesOffset + 4] = indicesValueOffset + 2;
        indices[indicesOffset + 5] = indicesValueOffset + 3;
    }

    static positions(glyph, positions, offset, tx, ty) {
        const x = tx + glyph.xoffset,
            y = ty + glyph.yoffset,
            w = glyph.width,
            h = glyph.height;
            
        //BL    
        positions[offset] = x;
        positions[offset + 1] = y;
        positions[offset + 2] = 0;
        // TL
        positions[offset + 3] = x;
        positions[offset + 4] = y + h;
        positions[offset + 5] = 0;
        // TR
        positions[offset + 6] = x + w;
        positions[offset + 7] = y + h;
        positions[offset + 8] = 0;
        // BR
        positions[offset + 9] = x + w;
        positions[offset + 10] = y;
        positions[offset + 11] = 0;

        //geometry.attributes.color.updateRange.offset = 0; // where to start updating
        //    geometry.attributes.color.updateRange.count = 14000; 
    }
}

const newlineChar = '\n',
    whitespace = /\s/;

function idxOf(text, chr, start, end) {
    var idx = text.indexOf(chr, start);
    if (idx === -1 || idx > end) return end
    return idx
}

function isWhitespace(chr) {
    return whitespace.test(chr)
}

function greedy(measure, text, start, end, width) {
    //A greedy word wrapper based on LibGDX algorithm
    //https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java
    const lines = [];
    let testWidth = width;
    while (start < end && start < text.length) {
        //get next newline position
        let newLine = idxOf(text, newlineChar, start, end);
        //eat whitespace at start of line
        while (start < newLine) {
            if (!isWhitespace(text.charAt(start))) break;
            start++;
        }
        //determine visible # of glyphs for the available width
        const measured = measure(text, start, newLine, testWidth);
        let lineEnd = start + (measured.end - measured.start),
            nextStart = lineEnd + newlineChar.length;
        //if we had to cut the line before the next newline...
        if (lineEnd < newLine) {
            //find char to break on
            while (lineEnd > start) {
                if (isWhitespace(text.charAt(lineEnd))) break;
                lineEnd--;
            }
            if (lineEnd === start) {
                if (nextStart > start + newlineChar.length) nextStart--;
                    lineEnd = nextStart; // If no characters to break, show all.
            } else {
                nextStart = lineEnd;
                //eat whitespace at end of line
                while (lineEnd > start) {
                    if (!isWhitespace(text.charAt(lineEnd - newlineChar.length))) break;
                    lineEnd--;
                }
            }
        }
        if (lineEnd >= start) {
            const result = measure(text, start, lineEnd, testWidth);
            lines.push(result);
        }
        start = nextStart;
    }
    return lines;
}

class TextLayoutUtils {

    static getGlyphById(font, id) {
        //assume for now every character has a mapping. 
        return font.chars[font.charsmap[id]];
    }

    static getKerning(font, left, right) {
        const amount = font.kerningsmap[left.id + left.index + right.id + right.index];
        return amount || 0;
    }

    //internalise wordwrap for future replacement
    static wordwrap(text, opt) {
        opt = opt || {};
        return greedy(opt.measure, text, opt.start || 0, opt.end || text.length, opt.width || 50);
    }
    /*
      static* range (begin, end, interval = 1) {
        for (let i = begin; i < end; i += interval) {
            yield i;
        }
      }*/
}

class TextLayout {
  
    constructor(opt, geometry) {
        this._glyphs = [];
        this._positions = geometry.attributes.position.array;
        this._uvs = geometry.attributes.uv.array;
        this._indices = geometry.index.array;
        this._pages = [];
        this._opt = opt;
        this.update(opt);

 
    }

    set minWidth(width) {
        this._opt.width = width;
        this.update(this._opt);
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
        this._pages;
            let positionOffset = 0,
            uvOffset = 0,
            indicesOffset = 0,
            indicesValueOffset = 0,
            pagesOffset = 0;
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
                        this.indexOffset = indicesOffset;
                        this.uvOffset = uvOffset;
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
        }    }

    computeMetrics(text, start, end, width) {
        const letterSpacing = this.letterSpacing,
            font = this.font;
        let curPen = 0,
            curWidth = 0,
            count = 0,
            lastGlyph = null;
       
        for (let i = start; i < Math.min(text.length, end); i++) {
            //for (let i of TextLayoutUtils.range(start, Math.min(text.length, end), 1)) {
            const glyph = TextLayoutUtils.getGlyphById(font, text.charCodeAt(i));
            if (glyph) {
                //move pen forward
                glyph.xoffset;
                    const kern = lastGlyph ? TextLayoutUtils.getKerning(font, lastGlyph, glyph) : 0;
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

class TextGeometry extends BufferGeometry {
    
    constructor(opt) {
        super();
        //THREE.js already polyfills assign.
        this._opt = Object.assign({
            flipY: true,
            buffersLength: 100
        }, opt);
        this.boundingBox = new Box3();

   
        this.setIndex(new BufferAttribute(new Uint16Array(this._opt.buffersLength * 6), 1));
        this.setAttribute('position', new BufferAttribute(new Float32Array(this._opt.buffersLength * 12), 3));
        this.setAttribute('uv', new BufferAttribute(new Float32Array(this._opt.buffersLength * 8), 2));

        this.update(opt.text);
    }

    creatTextLayout() {
        return new TextLayout(this._opt, this);
    }

    update(text) {
        const opt = this._opt;
        opt.text = text;
        this.layout = this.creatTextLayout();
        //buffer especially indices buffer is a little bigger to prevent detecting glyph length. Set a draw range just in case. 
        this.setDrawRange(0, this.layout.drawRange);


        this.attributes.position.updateRanges = [{ start:  0, count: this.layout.drawRange }]; 
     
        this.attributes.uv.updateRanges = [{ start:  0, count: this.layout.uvOffset}]; 

        this.index.updateRanges = [{ start:  0, count: this.layout.indexOffset}];  
      

        this.index.needsUpdate = true;
        this.attributes.position.needsUpdate = true;
        this.attributes.uv.needsUpdate = true;


        //multipage support if enabled
        if (opt.multipage) {
            const page = new BufferAttribute(this.layout.pages, 1);
            if (this.attributes.page) {
                this.attributes.page = page;
                this.attributes.page.needsUpdate = true;
            } else {
                // enable multipage rendering
                this.setAttribute('page', page);
            }
        }
    }

    set minWidth(width) {
        this.layout.minWidth = width;
    }
}

class WebGPUtils {

    static createWebGPUColorShader() {
        return Fn((input) => {
            //const color = uniform(input.color);

            return color(input.color);
        });

    }

    static createWebGPUOpacityShader() {
        return Fn((input) => {

            const tex = texture(input.texture);
            const opacity = uniform(input.opacity);

            const sigDist = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)).sub(0.5);

            const alpha = clamp(sigDist.div(fwidth(sigDist)).add(0.5), 0.0, 1.0);


            return alpha.mul(opacity);
        });

    }
}

class TextBitmap extends Mesh {

    constructor(config, isWebGPU = false) {
        config.color = config.color || '#fff';
        config.lineHeight = config.lineHeight ? config.font.common.lineHeight + config.lineHeight : config.font.common.lineHeight;

        const geometry = new TextGeometry(config);
        super(geometry, null);
        this.config = config;
        this._text = null;
        this.init(config, isWebGPU);
    }

    createGeometry() {
        return new TextGeometry(this.config);
    }

    /**
     * Setter to set an updated color on the colorNode
     */
    set color(val) {
		const colorNode = WebGPUtils.createWebGPUColorShader();
		this.material.colorNode = colorNode({ color: val });
        this.material.needsUpdate = true;
	}

    init(config) {
        const texture = config.texture;

        this.initTexture(texture, config.maxAnisotropy);

        this.material = new MeshBasicNodeMaterial({ map: texture, color: new Color(config.color), opacity: 1.0, transparent: true, depthTest: false, side: DoubleSide, alphaTest: 0.0001 });
        
        this.color = this.material.color;

        const opacityNode = WebGPUtils.createWebGPUOpacityShader();
        this.material.opacityNode = opacityNode({ texture: texture, color: this.material.color, opacity: this.material.opacity });

        this.mesh = this;

        const group = this.group = new Group();
        this.renderOrder = 1;

        this.rotateMesh();

        const groupScale = config.groupScale || 1;
            config.scale || 1;
        group.scale.set(groupScale, groupScale, groupScale);
        group.add(this);
        this.createHitBox(config);
        this.update();
    }

    set minWidth(width) {
        this.geometry.minWidth = width;
    }


    rotateMesh() {
        this.rotation.x = Math.PI;
    }

    createHitBox(config) {
        const boxGeo = new BoxGeometry(1.1, 1.1, 1.1),
            boxMat = new MeshBasicMaterial({
                color: 0xff0000,
                transparent: true,
                opacity: 0,
                alphaTest: 0.0001
            }),
            hitBox = this.hitBox = new Mesh(boxGeo, boxMat);
        hitBox.mesh = this;
        this.group.add(hitBox);
    }

    initTexture(texture, maxAnisotropy = 16) {
        texture.needsUpdate = true;
        texture.minFilter = LinearMipMapLinearFilter;
        texture.magFilter = LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = maxAnisotropy;
    }

    update() {
        const geometry = this.geometry;

        // centering
        geometry.computeBoundingBox();
	    geometry.computeBoundingSphere();	
        this.position.x = -geometry.layout.width / 2;
        this.position.y = -(geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2; // valign center
        this.hitBox.scale.set(geometry.layout.width, geometry.layout.height, 1);
        this.height = geometry.layout.height * this.config.scale; // for html-like flow / positioning
    }

    get text() {
        return this._text;
    }

    set text(value) {
        this._text = value;
        this.geometry.update(value);
        this.update();
        //this.material.needsUpdate = true;
    }
}

class SingleTextLayout extends TextLayout {
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

class SingleTextGeometry extends TextGeometry {
	
	constructor(opt) {
		super(opt);
	}

	creatTextLayout() {
		return new SingleTextLayout(this._opt);
	}
}

class SingleTextBitmap extends TextBitmap {

	constructor(opt, isWebGPU = false) {
		super(opt, isWebGPU);
	}

	createGeometry() {
    	return new SingleTextGeometry(this.config);
  	}

  	/*rotateMesh() {
    }*/

	update() {
		super.update();
		this.position.x += this.config.xOffset;
		this.position.y += this.config.yOffset;
	}
}

export { SingleTextBitmap, TextBitmap };
