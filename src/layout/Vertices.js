export default class Vertices {

	pages(glyph, pages) {
		const id = glyph.page || 0;
	 	pages.push(...[id, id, id, id]);
	}

	uvs(glyph, uvs, font, flipY) {

		const bw = (glyph.x + glyph.width),
	    bh = (glyph.y + glyph.height),
	    texWidth = font.common.scaleW,
    	texHeight = font.common.scaleH,
		// top left position
	    u0 = glyph.x / texWidth,
	    u1 = bw / texWidth;

	    let v1 = bitmap.y / texHeight,
	    v0 = bh / texHeight;

	    if (flipY) {
	      v1 = (texHeight - glyph.y) / texHeight;
	      v0 = (texHeight - bh) / texHeight;
	    }

	    // BL
	    uvs.push(u0);
	    uvs.push(v1);

	    // TL
	    uvs.push(u0);
	    uvs.push(v0);

	    // TR
	    uvs.push(u1);
	    uvs.push(v0);

	    // BR
	    uvs.push(u1);
	    uvs.push(v1);

	}

	positions(glyph, positions, tx, ty) {

		const x = tx + glyph.xoffset,
		y = ty + glyph.yoffset,
		w = glyph.width,
	    h = glyph.height;

	    // BL
	    positions.push(x);
		positions.push(y);

		// TL
		positions.push(x);
		positions.push(y + h);

		// TR
		positions.push(x);
		positions.push(y + h);

		// BL
		positions.push(x);
		positions.push(y);

		// TL
		positions.push(x);
		positions.push(y + h);

		// TR
		positions.push(x + w);
		positions.push(y + h);

		// BR
		positions.push(x + w);
		positions.push(y);
	}
}