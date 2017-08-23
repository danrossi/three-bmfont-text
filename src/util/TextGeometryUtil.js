const itemSize = 2,
box = { min: [0, 0], max: [0, 0] };


function bounds (positions) {
  var count = positions.length / itemSize
  box.min[0] = positions[0]
  box.min[1] = positions[1]
  box.max[0] = positions[0]
  box.max[1] = positions[1]

  for (var i = 0; i < count; i++) {
    var x = positions[i * itemSize + 0]
    var y = positions[i * itemSize + 1]
    box.min[0] = Math.min(x, box.min[0])
    box.min[1] = Math.min(y, box.min[1])
    box.max[0] = Math.max(x, box.max[0])
    box.max[1] = Math.max(y, box.max[1])
  }
}

export default class TextGeometryUtil {

/*
	flattenVertexData (data, output, offset) {
	  //if (!data) throw new TypeError('must specify data as first parameter')
	  offset = +(offset || 0) | 0

	  if (Array.isArray(data) && Array.isArray(data[0])) {
	    var dim = data[0].length
	    var length = data.length * dim

	    // no output specified, create a new typed array
	    if (!output || typeof output === 'string') {
	      output = new (dtype(output || 'float32'))(length + offset)
	    }

	    var dstLength = output.length - offset
	    if (length !== dstLength) {
	      throw new Error('source length ' + length + ' (' + dim + 'x' + data.length + ')' +
	        ' does not match destination length ' + dstLength)
	    }

	    for (var i = 0, k = offset; i < data.length; i++) {
	      for (var j = 0; j < dim; j++) {
	        output[k++] = data[i][j]
	      }
	    }
	  } else {
	    if (!output || typeof output === 'string') {
	      // no output, create a new one
	      var Ctor = dtype(output || 'float32')
	      if (offset === 0) {
	        output = new Ctor(data)
	      } else {
	        output = new Ctor(data.length + offset)
	        output.set(data, offset)
	      }
	    } else {
	      // store output in existing array
	      output.set(data, offset)
	    }
	  }

	  return output;
	}*/
	
	static computeBox(positions, output) {
	  bounds(positions);
	  output.min.set(box.min[0], box.min[1], 0);
	  output.max.set(box.max[0], box.max[1], 0);
	}

	static computeSphere(positions, output) {
	  bounds(positions);
	  const minX = box.min[0],
	  minY = box.min[1],
	  maxX = box.max[0],
	  maxY = box.max[1],
	  width = maxX - minX,
	  height = maxY - minY,
	  length = Math.sqrt(width * width + height * height);
	  output.center.set(minX + width / 2, minY + height / 2, 0);
	  output.radius = length / 2;
	}
}