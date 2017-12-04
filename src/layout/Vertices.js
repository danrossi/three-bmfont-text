export default class Vertices {

	static pages(glyph, pages, i) {
		const id = glyph.page || 0;

		pages[i++] = id;
    	pages[i++] = id;
    	pages[i++] = id;
    	pages[i++] = id;
	 	//pages.push(...[id, id, id, id]);
	}

	/*static uvs(glyph, uvs, i, font, flipY) {

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
	    uvs[i++] = u0;
	    uvs[i++] = v1;
	    // TL
	    uvs[i++] = u0;
	    uvs[i++] = v0;
	    // TR
	    uvs[i++] = u1;
	    uvs[i++] = v0;
	    // BR
	    uvs[i++] = u1;
	    uvs[i++] = v1;

	   

	}*/

	static geomData(glyphs, font, flipY) {

		const uvs = new Float32Array(glyphs.length * 8),
		positions = new Float32Array(glyphs.length * 8);


		const indices = new Uint16Array(glyphs.length * 6);

		let i = 0, indicesIndex = 0, indicesValueIndex = 0;
		
		glyphs.forEach(function (glyph) {

			const bitmap = glyph.data;

			//uv data
			const width = bitmap.width,
			height = bitmap.height,
			bw = (bitmap.x + width),
		    bh = (bitmap.y + height),
		    texWidth = font.common.scaleW,
	    	texHeight = font.common.scaleH,
			// top left position
		    u0 = bitmap.x / texWidth,
		    u1 = bw / texWidth;

		    let v1 = bitmap.y / texHeight,
		    v0 = bh / texHeight;

		    if (flipY) {
		      v1 = (texHeight - bitmap.y) / texHeight;
		      v0 = (texHeight - bh) / texHeight;
		    }


		    //position data
			let x = glyph.position[0] + bitmap.xoffset,
				y = glyph.position[1] + bitmap.yoffset,
				heightPos = y + height,
				widthPos = x + width;

			// BL
		    positions[i] = x;
		    uvs[i] = u0;

		    positions[i+1] = y;
		    uvs[i+1] = v1;

		    // TL
		    positions[i+2] = x;
		    uvs[i+2] = u0;

		    positions[i+3] = heightPos;
		    uvs[i+3] = v0;

		    // TR
		    positions[i+4] = widthPos;
		    uvs[i+4] = u1;

		    positions[i+5] = heightPos;
		    uvs[i+5] = v0;

		    // BR
		    positions[i+6] = widthPos;
		    uvs[i+6] = u1;

		    positions[i+7] = y;
		    uvs[i+7] = v1;

		    indices[indicesIndex + 0] = indicesValueIndex + 0;
	        indices[indicesIndex + 1] = indicesValueIndex + 1;
	        indices[indicesIndex + 2] = indicesValueIndex + 2;
	        indices[indicesIndex + 3] = indicesValueIndex + 0;
	        indices[indicesIndex + 4] = indicesValueIndex + 2;
	        indices[indicesIndex + 5] = indicesValueIndex + 3;

		    i += 8;
		    indicesIndex += 6;
		    indicesValueIndex += 4;

		    //console.log(indicesIndex);

		});

		return { uvs: uvs, positions: positions, index: indices };
	}

	/*static positions(glyph, positions,  i,  tx, ty) {

		const x = tx + glyph.xoffset,
		y = ty + glyph.yoffset,
		w = glyph.width,
	    h = glyph.height;

	    // BL
	    positions[i++] = x;
	    positions[i++] = y;
	    // TL
	    positions[i++] = x;
	    positions[i++] = y + h;
	    // TR
	    positions[i++] = x + w;
	    positions[i++] = y + h;
	    // BR
	    positions[i++] = x + w;
	    positions[i++] = y;

	}*/
}