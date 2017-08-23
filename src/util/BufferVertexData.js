import flatten from 'flatten-vertex-data';
import { BufferAttribute } from 'three';

export default class BufferVertexData {


  static setIndex (geometry, data, itemSize, dtype) {
    //if (typeof itemSize !== 'number') itemSize = 1;
    //if (typeof dtype !== 'string') dtype = 'uint16';

    //const isR69 = !geometry.index && typeof geometry.setIndex !== 'function'
    //var attrib = isR69 ? geometry.getAttribute('index') : geometry.index
    
    const newAttrib = BufferVertexData.updateAttribute(geometry.index, data, itemSize, dtype);
    
    if (newAttrib) geometry.index = newAttrib;
   // if (newAttrib) {
      //if (isR69) geometry.addAttribute('index', newAttrib)
      //else geometry.index = newAttrib
    //}
  }


  static updateAttribute (attrib, data, itemSize, dtype) {
    data = data || []
    if (!attrib || rebuildAttribute(attrib, data, itemSize)) {
      // create a new array with desired type
      data = flatten(data, dtype);

      //var needsNewBuffer = attrib && typeof attrib.setArray !== 'function'
      //if (!attrib || needsNewBuffer) {
        // We are on an old version of ThreeJS which can't
        // support growing / shrinking buffers, so we need
        // to build a new buffer
       /* if (needsNewBuffer && !warned) {
          warned = true
          console.warn([
            'A WebGL buffer is being updated with a new size or itemSize, ',
            'however this version of ThreeJS only supports fixed-size buffers.',
            '\nThe old buffer may still be kept in memory.\n',
            'To avoid memory leaks, it is recommended that you dispose ',
            'your geometries and create new ones, or update to ThreeJS r82 or newer.\n',
            'See here for discussion:\n',
            'https://github.com/mrdoob/three.js/pull/9631'
          ].join(''))
        }*/

        // Build a new attribute
       // attrib = new BufferAttribute(data, itemSize);
     // }
      if (!attrib) attrib = attrib = new BufferAttribute(data, itemSize);

      attrib.itemSize = itemSize;
      attrib.needsUpdate = true;

      // New versions of ThreeJS suggest using setArray
      // to change the data. It will use bufferData internally,
      // so you can change the array size without any issues
      //if (typeof attrib.setArray === 'function') {
      // attrib.setArray(data)
      //}
      attrib.setArray(data);

      return attrib;
    } else {
      // copy data into the existing array
      flatten(data, attrib.array);
      attrib.needsUpdate = true;
      return null;
    }
  }

  static setAttribute (geometry, key, data, itemSize, dtype) {
    //if (typeof itemSize !== 'number') itemSize = 3
    //if (typeof dtype !== 'string') dtype = 'float32'
    
    /*if (Array.isArray(data) &&
      Array.isArray(data[0]) &&
      data[0].length !== itemSize) {
      throw new Error('Nested vertex array has unexpected size; expected ' +
        itemSize + ' but found ' + data[0].length)
    }*/

    const attrib = geometry.getAttribute(key), 
    newAttrib = BufferVertexData.updateAttribute(attrib, data, itemSize, dtype)
    if (newAttrib) {
      geometry.addAttribute(key, newAttrib)
    }
  }

}

// Test whether the attribute needs to be re-created,
// returns false if we can re-use it as-is.
function rebuildAttribute (attrib, data, itemSize) {
  if (attrib.itemSize !== itemSize || !attrib.array) return true;
  //if (!attrib.array) return true
  const attribLength = attrib.array.length, 
  hasLength = attribLength !== data.length,
  hasData = Array.isArray(data) && Array.isArray(data[0]);

  return hasData ? hasLength * itemSize : hasLength;
}
