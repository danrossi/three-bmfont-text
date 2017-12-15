export default class Vertices {
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
    }
}