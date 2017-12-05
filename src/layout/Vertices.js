export default class Vertices {

	static pages(glyph, pages, i) {
		const id = glyph.page || 0;

		pages[i++] = id;
    	pages[i++] = id;
    	pages[i++] = id;
    	pages[i++] = id;
	 	//pages.push(...[id, id, id, id]);
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

	static geomData(glyphs, font, flipY) {

		const uvs = new Float32Array(glyphs.length * 8),
		positions = new Float32Array(glyphs.length * 8);


		const indices = new Uint16Array(glyphs.length * 6);

		let i = 0, verticesOffset = 0, uvOffset = 0, indicesOffset = 0, indicesValueIndex = 0;
		
		var pos = [];

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
		    positions[verticesOffset] = x;
		    uvs[uvOffset] = u0;

		    positions[verticesOffset+1] = y;
		    uvs[uvOffset+1] = v1;

		    //positions[verticesOffset+2] = 0;

		    // TL
		    positions[verticesOffset+2] = x;
		    uvs[uvOffset+2] = u0;

		    positions[verticesOffset+3] = heightPos;
		    uvs[uvOffset+3] = v0;

		    //positions[verticesOffset+5] = 0;

		    // TR
		    positions[verticesOffset+4] = widthPos;
		    uvs[uvOffset+4] = u1;

		    positions[verticesOffset+5] = heightPos;
		    uvs[uvOffset+5] = v0;

		    //positions[verticesOffset+8] = 0;

		    // BR
		    positions[verticesOffset+6] = widthPos;
		    uvs[uvOffset+6] = u1;

		    positions[verticesOffset+7] = y;
		    uvs[uvOffset+7] = v1;

		   //positions[verticesOffset+11] = 0;
	

			

		    indices[indicesOffset] = indicesValueIndex;
	        indices[indicesOffset + 1] = indicesValueIndex + 1;
	        indices[indicesOffset + 2] = indicesValueIndex + 2;
	        indices[indicesOffset + 3] = indicesValueIndex + 0;
	        indices[indicesOffset + 4] = indicesValueIndex + 2;
	        indices[indicesOffset + 5] = indicesValueIndex + 3;

		    //i += 8;
		    verticesOffset += 8;
		    uvOffset += 8;
		    indicesOffset += 6;
		    indicesValueIndex += 4;


		});

		return { uvs: uvs, positions: positions, index: indices };
	}

	static positions(glyph, positions,  offset,  tx, ty) {

		const x = tx + glyph.xoffset,
		y = ty + glyph.yoffset,
		w = glyph.width,
	    h = glyph.height;

	    // BL
	    positions[offset] = x;
	    positions[offset + 1] = y;
	    // TL
	    positions[offset + 2] = x;
	    positions[offset + 3] = y + h;
	    // TR
	    positions[offset + 4] = x + w;
	    positions[offset + 5] = y + h;
	    // BR
	    positions[offset + 6] = x + w;
	    positions[offset + 7] = y;

	}
}