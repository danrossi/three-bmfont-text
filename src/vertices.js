export function pages (glyphs) {
  var pages = new Float32Array(glyphs.length * 4 * 1)
  var i = 0
  glyphs.forEach(function (glyph) {
    var id = glyph.data.page || 0
    pages[i++] = id
    pages[i++] = id
    pages[i++] = id
    pages[i++] = id
  })
  return pages
}

export function uvs (glyphs, currentUvs, texWidth, texHeight, flipY) {
  var uvs = currentUvs || new Float32Array(glyphs.length * 4 * 2)
  var i = 0
  glyphs.forEach(function (glyph) {
    var bitmap = glyph.data
    var bw = (bitmap.x + bitmap.width)
    var bh = (bitmap.y + bitmap.height)

    // top left position
    var u0 = bitmap.x / texWidth
    var v1 = bitmap.y / texHeight
    var u1 = bw / texWidth
    var v0 = bh / texHeight

    if (flipY) {
      v1 = (texHeight - bitmap.y) / texHeight
      v0 = (texHeight - bh) / texHeight
    }

    // BL
    /*uvs[i++] = u0
    uvs[i++] = v1
    // TL
    uvs[i++] = u0
    uvs[i++] = v0
    // TR
    uvs[i++] = u1
    uvs[i++] = v0
    // BR
    uvs[i++] = u1
    uvs[i++] = v1*/

    uvs[i+0] = u0
    uvs[i+1] = v1
    // TL
    uvs[i+2] = u0
    uvs[i+3] = v0
    // TR
    uvs[i+4] = u1
    uvs[i+5] = v0
    // BR
    uvs[i+6] = u1
    uvs[i+7] = v1

    i+= 8;
    
  })
  return uvs
}

export function positions (glyphs, currentPositions) {
  var positions = currentPositions || new Float32Array(glyphs.length * 4 * 2)
  var i = 0
  glyphs.forEach(function (glyph) {
    var bitmap = glyph.data

    // bottom left position
    var x = glyph.position[0] + bitmap.xoffset
    var y = glyph.position[1] + bitmap.yoffset

    // quad size
    var w = bitmap.width
    var h = bitmap.height

    positions[i+0] = x
    positions[i+1] = y
    // TL
    positions[i+2] = x
    positions[i+3] = y + h
    // TR
    positions[i+4] = x + w
    positions[i+5] = y + h
    // BR
    positions[i+6] = x + w
    positions[i+7] = y

    i+= 8;



    // BL
   /* positions[i++] = x
    positions[i++] = y
    // TL
    positions[i++] = x
    positions[i++] = y + h
    // TR
    positions[i++] = x + w
    positions[i++] = y + h
    // BR
    positions[i++] = x + w
    positions[i++] = y*/

  })
  return positions
}
