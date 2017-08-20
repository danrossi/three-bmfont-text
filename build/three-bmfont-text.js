'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var three_build_three_modules = require('three/build/three.modules');

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var BaseShader = function () {
	function BaseShader() {
		classCallCheck(this, BaseShader);
	}

	createClass(BaseShader, [{
		key: 'discarOnAlphaTest',
		value: function discarOnAlphaTest(alphaTest) {
			return alphaTest > 0 ? ' if (gl_FragColor.a < ' + alphaTest + ') discard;' : "";
		}
	}, {
		key: 'createShader',
		value: function createShader(shader, opt) {
			opt = opt || {};
			var opacity = typeof opt.opacity === 'number' ? opt.opacity : 1,
			    alphaTest = typeof opt.alphaTest === 'number' ? opt.alphaTest : 0.0001;

			// remove to satisfy r73
			delete opt.map;
			delete opt.color;
			delete opt.precision;
			delete opt.opacity;

			return Object.assign({
				uniforms: shader.uniforms(opt.map, opt.color, opacity),
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader(opt.precision, alphaTest)
			}, opt);
		}
	}], [{
		key: 'uniforms',
		value: function uniforms(map, color, opacity) {
			return {
				opacity: { type: 'f', value: opacity },
				map: { type: 't', value: map || new THREE.Texture() },
				color: { type: 'c', value: new THREE.Color(color) }
			};
		}
	}, {
		key: 'vertexShader',
		get: function get$$1() {
			return '\n\t      attribute vec2 uv;\n\t      attribute vec4 position;\n\t      uniform mat4 projectionMatrix;\n\t      uniform mat4 modelViewMatrix;\n\t      varying vec2 vUv;\n\t      void main() {\n\t        vUv = uv;\n\t        gl_Position = projectionMatrix * modelViewMatrix * position;\n\t      }\n\t    ';
		}
	}]);
	return BaseShader;
}();

var MSDFShader = function (_BaseShader) {
  inherits(MSDFShader, _BaseShader);

  function MSDFShader() {
    classCallCheck(this, MSDFShader);
    return possibleConstructorReturn(this, (MSDFShader.__proto__ || Object.getPrototypeOf(MSDFShader)).apply(this, arguments));
  }

  createClass(MSDFShader, null, [{
    key: 'fragmentShader',
    value: function fragmentShader(precision, alphaTest) {

      var discard = BaseShader.discarOnAlphaTest(alphaTest);

      return '\n      #ifdef GL_OES_standard_derivatives\n        #extension GL_OES_standard_derivatives : enable\n      #endif\n      precision ' + (precision || 'highp') + ' float;\n      uniform float opacity;\n      uniform vec3 color;\n      uniform sampler2D map;\n      varying vec2 vUv;\n\n      float median(float r, float g, float b) {\n        return max(min(r, g), min(max(r, g), b));\n      }\n\n      void main() {\n        vec3 sample = texture2D(map, vUv).rgb;\n        float sigDist = median(sample.r, sample.g, sample.b) - 0.5;\n        float alpha = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);\n        gl_FragColor = vec4(color.xyz, alpha * opacity);\n        ' + discard + '\n      }\n    ';
    }
  }]);
  return MSDFShader;
}(BaseShader);

var SDFShader = function (_BaseShader) {
  inherits(SDFShader, _BaseShader);

  function SDFShader() {
    classCallCheck(this, SDFShader);
    return possibleConstructorReturn(this, (SDFShader.__proto__ || Object.getPrototypeOf(SDFShader)).apply(this, arguments));
  }

  createClass(SDFShader, null, [{
    key: 'fragmentShader',
    value: function fragmentShader(precision, alphaTest) {

      var discard = BaseShader.discarOnAlphaTest(alphaTest);

      return '\n      #ifdef GL_OES_standard_derivatives\n        #extension GL_OES_standard_derivatives : enable\n      #endif\n      precision ' + (precision || 'highp') + ' float;\n      uniform float opacity;\n      uniform vec3 color;\n      uniform sampler2D map;\n      varying vec2 vUv;\n\n      \n      float aastep(float value) {\n        #ifdef GL_OES_standard_derivatives\n          float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;\n        #else\n          float afwidth = (1.0 / 32.0) * (1.4142135623730951 / (2.0 * gl_FragCoord.w));\n        #endif\n        return smoothstep(0.5 - afwidth, 0.5 + afwidth, value);\n      }\n\n      void main() {\n        vec4 texColor = texture2D(map, vUv);\n        float alpha = aastep(texColor.a);\n        gl_FragColor = vec4(color, opacity * alpha);\n        ' + discard + '\n      }\n    ';
    }
  }]);
  return SDFShader;
}(BaseShader);

var index$1 = function(dtype) {
  switch (dtype) {
    case 'int8':
      return Int8Array
    case 'int16':
      return Int16Array
    case 'int32':
      return Int32Array
    case 'uint8':
      return Uint8Array
    case 'uint16':
      return Uint16Array
    case 'uint32':
      return Uint32Array
    case 'float32':
      return Float32Array
    case 'float64':
      return Float64Array
    case 'array':
      return Array
    case 'uint8_clamped':
      return Uint8ClampedArray
  }
};

var str = Object.prototype.toString;

var index$3 = anArray;

function anArray(arr) {
  return (
       arr.BYTES_PER_ELEMENT
    && str.call(arr.buffer) === '[object ArrayBuffer]'
    || Array.isArray(arr)
  )
}

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
var index$5 = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
};

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

var CW = [0, 2, 3];
var CCW = [2, 1, 3];

var index = function createQuadElements(array, opt) {
    //if user didn't specify an output array
    if (!array || !(index$3(array) || index$5(array))) {
        opt = array || {};
        array = null;
    }

    if (typeof opt === 'number') //backwards-compatible
        opt = { count: opt };
    else
        opt = opt || {};

    var type = typeof opt.type === 'string' ? opt.type : 'uint16';
    var count = typeof opt.count === 'number' ? opt.count : 1;
    var start = (opt.start || 0); 

    var dir = opt.clockwise !== false ? CW : CCW,
        a = dir[0], 
        b = dir[1],
        c = dir[2];

    var numIndices = count * 6;

    var indices = array || new (index$1(type))(numIndices);
    for (var i = 0, j = 0; i < numIndices; i += 6, j += 4) {
        var x = i + start;
        indices[x + 0] = j + 0;
        indices[x + 1] = j + 1;
        indices[x + 2] = j + 2;
        indices[x + 3] = j + a;
        indices[x + 4] = j + b;
        indices[x + 5] = j + c;
    }
    return indices
};

/*eslint new-cap:0*/

var index$8 = flattenVertexData;
function flattenVertexData (data, output, offset) {
  if (!data) throw new TypeError('must specify data as first parameter')
  offset = +(offset || 0) | 0;

  if (Array.isArray(data) && Array.isArray(data[0])) {
    var dim = data[0].length;
    var length = data.length * dim;

    // no output specified, create a new typed array
    if (!output || typeof output === 'string') {
      output = new (index$1(output || 'float32'))(length + offset);
    }

    var dstLength = output.length - offset;
    if (length !== dstLength) {
      throw new Error('source length ' + length + ' (' + dim + 'x' + data.length + ')' +
        ' does not match destination length ' + dstLength)
    }

    for (var i = 0, k = offset; i < data.length; i++) {
      for (var j = 0; j < dim; j++) {
        output[k++] = data[i][j];
      }
    }
  } else {
    if (!output || typeof output === 'string') {
      // no output, create a new one
      var Ctor = index$1(output || 'float32');
      if (offset === 0) {
        output = new Ctor(data);
      } else {
        output = new Ctor(data.length + offset);
        output.set(data, offset);
      }
    } else {
      // store output in existing array
      output.set(data, offset);
    }
  }

  return output
}

var warned = false;

var attr = setAttribute;
var index_1 = setIndex;

function setIndex (geometry, data, itemSize, dtype) {
  if (typeof itemSize !== 'number') itemSize = 1;
  if (typeof dtype !== 'string') dtype = 'uint16';

  var isR69 = !geometry.index && typeof geometry.setIndex !== 'function';
  var attrib = isR69 ? geometry.getAttribute('index') : geometry.index;
  var newAttrib = updateAttribute(attrib, data, itemSize, dtype);
  if (newAttrib) {
    if (isR69) geometry.addAttribute('index', newAttrib);
    else geometry.index = newAttrib;
  }
}

function setAttribute (geometry, key, data, itemSize, dtype) {
  if (typeof itemSize !== 'number') itemSize = 3;
  if (typeof dtype !== 'string') dtype = 'float32';
  if (Array.isArray(data) &&
    Array.isArray(data[0]) &&
    data[0].length !== itemSize) {
    throw new Error('Nested vertex array has unexpected size; expected ' +
      itemSize + ' but found ' + data[0].length)
  }

  var attrib = geometry.getAttribute(key);
  var newAttrib = updateAttribute(attrib, data, itemSize, dtype);
  if (newAttrib) {
    geometry.addAttribute(key, newAttrib);
  }
}

function updateAttribute (attrib, data, itemSize, dtype) {
  data = data || [];
  if (!attrib || rebuildAttribute(attrib, data, itemSize)) {
    // create a new array with desired type
    data = index$8(data, dtype);

    var needsNewBuffer = attrib && typeof attrib.setArray !== 'function';
    if (!attrib || needsNewBuffer) {
      // We are on an old version of ThreeJS which can't
      // support growing / shrinking buffers, so we need
      // to build a new buffer
      if (needsNewBuffer && !warned) {
        warned = true;
        console.warn([
          'A WebGL buffer is being updated with a new size or itemSize, ',
          'however this version of ThreeJS only supports fixed-size buffers.',
          '\nThe old buffer may still be kept in memory.\n',
          'To avoid memory leaks, it is recommended that you dispose ',
          'your geometries and create new ones, or update to ThreeJS r82 or newer.\n',
          'See here for discussion:\n',
          'https://github.com/mrdoob/three.js/pull/9631'
        ].join(''));
      }

      // Build a new attribute
      attrib = new THREE.BufferAttribute(data, itemSize);
    }

    attrib.itemSize = itemSize;
    attrib.needsUpdate = true;

    // New versions of ThreeJS suggest using setArray
    // to change the data. It will use bufferData internally,
    // so you can change the array size without any issues
    if (typeof attrib.setArray === 'function') {
      attrib.setArray(data);
    }

    return attrib
  } else {
    // copy data into the existing array
    index$8(data, attrib.array);
    attrib.needsUpdate = true;
    return null
  }
}

// Test whether the attribute needs to be re-created,
// returns false if we can re-use it as-is.
function rebuildAttribute (attrib, data, itemSize) {
  if (attrib.itemSize !== itemSize) return true
  if (!attrib.array) return true
  var attribLength = attrib.array.length;
  if (Array.isArray(data) && Array.isArray(data[0])) {
    // [ [ x, y, z ] ]
    return attribLength !== data.length * itemSize
  } else {
    // [ x, y, z ]
    return attribLength !== data.length
  }
  return false
}

var index$7 = {
	attr: attr,
	index: index_1
};

var Vertices = function () {
	function Vertices() {
		classCallCheck(this, Vertices);
	}

	createClass(Vertices, [{
		key: "pages",
		value: function pages(glyph, _pages) {
			var id = glyph.page || 0;
			_pages.push.apply(_pages, [id, id, id, id]);
		}
	}, {
		key: "uvs",
		value: function uvs(glyph, _uvs, font, flipY) {

			var bw = glyph.x + glyph.width,
			    bh = glyph.y + glyph.height,
			    texWidth = font.common.scaleW,
			    texHeight = font.common.scaleH,

			// top left position
			u0 = glyph.x / texWidth,
			    u1 = bw / texWidth;

			var v1 = bitmap.y / texHeight,
			    v0 = bh / texHeight;

			if (flipY) {
				v1 = (texHeight - glyph.y) / texHeight;
				v0 = (texHeight - bh) / texHeight;
			}

			// BL
			_uvs.push(u0);
			_uvs.push(v1);

			// TL
			_uvs.push(u0);
			_uvs.push(v0);

			// TR
			_uvs.push(u1);
			_uvs.push(v0);

			// BR
			_uvs.push(u1);
			_uvs.push(v1);
		}
	}, {
		key: "positions",
		value: function positions(glyph, _positions, tx, ty) {

			var x = tx + glyph.xoffset,
			    y = ty + glyph.yoffset,
			    w = glyph.width,
			    h = glyph.height;

			// BL
			_positions.push(x);
			_positions.push(y);

			// TL
			_positions.push(x);
			_positions.push(y + h);

			// TR
			_positions.push(x);
			_positions.push(y + h);

			// BL
			_positions.push(x);
			_positions.push(y);

			// TL
			_positions.push(x);
			_positions.push(y + h);

			// TR
			_positions.push(x + w);
			_positions.push(y + h);

			// BR
			_positions.push(x + w);
			_positions.push(y);
		}
	}]);
	return Vertices;
}();

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var index$10 = createCommonjsModule(function (module) {
var newline = /\n/;
var newlineChar = '\n';
var whitespace = /\s/;

module.exports = function(text, opt) {
    var lines = module.exports.lines(text, opt);
    return lines.map(function(line) {
        return text.substring(line.start, line.end)
    }).join('\n')
};

module.exports.lines = function wordwrap(text, opt) {
    opt = opt||{};

    //zero width results in nothing visible
    if (opt.width === 0 && opt.mode !== 'nowrap') 
        return []

    text = text||'';
    var width = typeof opt.width === 'number' ? opt.width : Number.MAX_VALUE;
    var start = Math.max(0, opt.start||0);
    var end = typeof opt.end === 'number' ? opt.end : text.length;
    var mode = opt.mode;

    var measure = opt.measure || monospace;
    if (mode === 'pre')
        return pre(measure, text, start, end, width)
    else
        return greedy(measure, text, start, end, width, mode)
};

function idxOf(text, chr, start, end) {
    var idx = text.indexOf(chr, start);
    if (idx === -1 || idx > end)
        return end
    return idx
}

function isWhitespace(chr) {
    return whitespace.test(chr)
}

function pre(measure, text, start, end, width) {
    var lines = [];
    var lineStart = start;
    for (var i=start; i<end && i<text.length; i++) {
        var chr = text.charAt(i);
        var isNewline = newline.test(chr);

        //If we've reached a newline, then step down a line
        //Or if we've reached the EOF
        if (isNewline || i===end-1) {
            var lineEnd = isNewline ? i : i+1;
            var measured = measure(text, lineStart, lineEnd, width);
            lines.push(measured);
            
            lineStart = i+1;
        }
    }
    return lines
}

function greedy(measure, text, start, end, width, mode) {
    //A greedy word wrapper based on LibGDX algorithm
    //https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java
    var lines = [];

    var testWidth = width;
    //if 'nowrap' is specified, we only wrap on newline chars
    if (mode === 'nowrap')
        testWidth = Number.MAX_VALUE;

    while (start < end && start < text.length) {
        //get next newline position
        var newLine = idxOf(text, newlineChar, start, end);

        //eat whitespace at start of line
        while (start < newLine) {
            if (!isWhitespace( text.charAt(start) ))
                break
            start++;
        }

        //determine visible # of glyphs for the available width
        var measured = measure(text, start, newLine, testWidth);

        var lineEnd = start + (measured.end-measured.start);
        var nextStart = lineEnd + newlineChar.length;

        //if we had to cut the line before the next newline...
        if (lineEnd < newLine) {
            //find char to break on
            while (lineEnd > start) {
                if (isWhitespace(text.charAt(lineEnd)))
                    break
                lineEnd--;
            }
            if (lineEnd === start) {
                if (nextStart > start + newlineChar.length) nextStart--;
                lineEnd = nextStart; // If no characters to break, show all.
            } else {
                nextStart = lineEnd;
                //eat whitespace at end of line
                while (lineEnd > start) {
                    if (!isWhitespace(text.charAt(lineEnd - newlineChar.length)))
                        break
                    lineEnd--;
                }
            }
        }
        if (lineEnd >= start) {
            var result = measure(text, start, lineEnd, testWidth);
            lines.push(result);
        }
        start = nextStart;
    }
    return lines
}

//determines the visible number of glyphs within a given width
function monospace(text, start, end, width) {
    var glyphs = Math.min(width, end-start);
    return {
        start: start,
        end: start+glyphs
    }
}
});

var TextLayout = function () {
  function TextLayout(opt) {
    classCallCheck(this, TextLayout);

    this._glyphs = [];
    this._positons = [];
    this._uvs = [];
    this._pages = [];

    this.update(opt);
  }

  createClass(TextLayout, [{
    key: 'update',
    value: function update(opt) {
      var _this = this;

      opt.align = opt.align || "left";

      this._opt = opt;
      this._opt.measure = function (text, start, end, width) {
        return _this.computeMetrics(text, start, end, width);
      };
      this._opt.tabSize = this._opt.tabSize > 0 ? this._opt.tabSize : 4;

      //if (!opt.font)
      //  throw new Error('must provide a valid bitmap font')

      var glyphs = this._glyphs,
          positions = this._positions,
          uvs = this._uvs,
          text = opt.text || '',
          font = this.font,
          lines = index$10.lines(text, opt),
          minWidth = opt.width || 0,
          letterSpacing = this.letterSpacing;

      //clear glyphs
      glyphs.length = position.length = uvs.length = 0;
      pages = [0, 0, 0, 0];

      //get max line width
      this._width = lines.reduce(function (prev, line) {
        return Math.max(prev, line.width, minWidth);
      }, 0);

      //the pen position
      this._height = this.lineHeight * lines.length - this.descender;

      var x = 0,

      //draw text along baseline
      y = -this._height;

      //layout each glyph

      lines.forEach(function (line, lineIndex) {
        var start = line.start,
            end = line.end,
            lineWidth = line.width,
            alignment = _this.getAlignment(lineWidth);

        var lastGlyph = null;

        //for each glyph in that line...
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = TextLayoutUtils.range(start, end, 1)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var i = _step.value;


            var glyph = TextLayoutUtils.getGlyphById(font, text.charCodeAt(i));

            if (glyph) {
              if (lastGlyph) x += TextLayoutUtils.getKerning(font, lastGlyph.id, glyph.id);
              x += alignment;

              //add visible glyphs determined by width and height
              if (glyph.width * glyph.height > 0) {

                Vertices.positions(glyph, positions, tx, y);
                Vertices.uvs(glyph, uvs, _this.font, _this._opt.flipY);
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
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        y += lineHeight;
        x = 0;
      });

      this._linesTotal = lines.length;
    }
  }, {
    key: 'getAlignment',
    value: function getAlignment(lineWidth) {
      switch (this._opt.align) {
        case "center":
          return (this._width - lineWidth) / 2;
        case "right":
          return this._width - lineWidth;
        default:
          return 0;
          break;
      }
    }
  }, {
    key: 'computeMetrics',
    value: function computeMetrics(text, start, end, width) {
      var letterSpacing = this.letterSpacing;
      font = this.font;

      var curPen = 0,
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

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = TextLayoutUtils.range(start, Math.min(text.length, end), 1)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var i = _step2.value;


          var _glyph = TextLayoutUtils.getGlyphById(font, text.charCodeAt(i));

          if (_glyph) {
            //move pen forward
            var xoff = _glyph.xoffset,
                kern = lastGlyph ? TextLayoutUtils.getKerning(font, lastGlyph.id, _glyph.id) : 0;

            curPen += kern;

            var nextPen = curPen + _glyph.xadvance + letterSpacing,
                nextWidth = curPen + _glyph.width;

            //we've hit our limit; we can't move onto the next glyph
            if (nextWidth >= width || nextPen >= width) break;

            //otherwise continue along our line
            curPen = nextPen;
            curWidth = nextWidth;
            lastGlyph = _glyph;
          }

          count++;
        }

        //make sure rightmost edge lines up with rendered glyphs
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      if (lastGlyph) curWidth += lastGlyph.xoffset;

      return {
        start: start,
        end: start + count,
        width: curWidth
      };
    }
  }, {
    key: 'pages',
    get: function get$$1() {
      return new Float32Array(this._pages, 0, this.glyphs.length * 4 * 1);
    }
  }, {
    key: 'positions',
    get: function get$$1() {
      return new Float32Array(this._positions, 0, this.glyphs.length * 4 * 2);
    }
  }, {
    key: 'uvs',
    get: function get$$1() {
      return new Float32Array(this._uvs, 0, this.glyphs.length * 4 * 2);
    }
  }, {
    key: 'font',
    get: function get$$1() {
      return this._opt.font;
    }
  }, {
    key: 'glyphs',
    get: function get$$1() {
      return this._glyphs;
    }
  }, {
    key: 'width',
    get: function get$$1() {
      return this._width;
    }
  }, {
    key: 'height',
    get: function get$$1() {
      return this._height;
    }
  }, {
    key: 'lineHeight',
    get: function get$$1() {
      return this._opt.lineHeight || this.font.common.lineHeight;
    }
  }, {
    key: 'baseline',
    get: function get$$1() {
      return this.font.common.base;
    }
  }, {
    key: 'descender',
    get: function get$$1() {
      return this.lineHeight - this.baseline;
    }
  }, {
    key: 'ascender',
    get: function get$$1() {
      return this.lineHeight - descender - this.xHeight;
    }
  }, {
    key: 'xHeight',
    get: function get$$1() {
      return this.font.common.xHeight;
    }
  }, {
    key: 'capHeight',
    get: function get$$1() {
      return this.font.common.capHeight;
    }
  }, {
    key: 'letterSpacing',
    get: function get$$1() {
      return this._opt.letterSpacing || 0;
    }
  }]);
  return TextLayout;
}();

var itemSize = 2;
var box = { min: [0, 0], max: [0, 0] };

function bounds(positions) {
		var count = positions.length / itemSize;
		box.min[0] = positions[0];
		box.min[1] = positions[1];
		box.max[0] = positions[0];
		box.max[1] = positions[1];

		for (var i = 0; i < count; i++) {
				var x = positions[i * itemSize + 0];
				var y = positions[i * itemSize + 1];
				box.min[0] = Math.min(x, box.min[0]);
				box.min[1] = Math.min(y, box.min[1]);
				box.max[0] = Math.max(x, box.max[0]);
				box.max[1] = Math.max(y, box.max[1]);
		}
}

var TextGeometryUtil = function () {
		function TextGeometryUtil() {
				classCallCheck(this, TextGeometryUtil);
		}

		createClass(TextGeometryUtil, [{
				key: "computeBox",


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

				value: function computeBox(positions, output) {
						bounds(positions);
						output.min.set(box.min[0], box.min[1], 0);
						output.max.set(box.max[0], box.max[1], 0);
				}
		}, {
				key: "computeSphere",
				value: function computeSphere(positions, output) {
						bounds(positions);
						var minX = box.min[0],
						    minY = box.min[1],
						    maxX = box.max[0],
						    maxY = box.max[1],
						    width = maxX - minX,
						    height = maxY - minY,
						    length = Math.sqrt(width * width + height * height);
						output.center.set(minX + width / 2, minY + height / 2, 0);
						output.radius = length / 2;
				}
		}]);
		return TextGeometryUtil;
}();

var TextGeometry = function (_BufferGeometry) {
	inherits(TextGeometry, _BufferGeometry);

	function TextGeometry(opt) {
		classCallCheck(this, TextGeometry);

		var _this = possibleConstructorReturn(this, (TextGeometry.__proto__ || Object.getPrototypeOf(TextGeometry)).call(this));

		if (typeof opt === 'string') {
			opt = { text: opt };
		}

		// use these as default values for any subsequent
		// calls to update()
		//THREE.js already polyfills assign.
		_this._opt = Object.assign({}, opt);

		_this.boundingBox = new THREE.Box3();

		// also do an initial setup...
		if (opt) _this.update(opt);
		return _this;
	}

	createClass(TextGeometry, [{
		key: 'update',
		value: function update(opt) {

			if (typeof opt === 'string') {
				opt = { text: opt };
			}

			// use constructor defaults
			opt = Object.assign({}, this._opt, opt);

			/*if (!opt.font) {
     throw new TypeError('must specify a { font } in options')
   }*/

			this.layout = new TextLayout(opt);

			// get vec2 texcoords
			var flipY = opt.flipY !== false,

			// the desired BMFont data
			font = opt.font,

			// determine texture size from font file
			//texWidth = font.common.scaleW,
			//texHeight = font.common.scaleH,
			glyphs = this.layout.glyphs;
			// get visible glyphs
			// glyphs = this.layout.glyphs.filter((glyph) => glyph.data.width * glyph.data.height > 0);
			// provide visible glyphs for convenience
			this.visibleGlyphs = glyphs;
			// get common vertex data
			//const positions = Vertices.positions(glyphs),
			//uvs = Vertices.uvs(glyphs, texWidth, texHeight, flipY);
			var indices = index({
				clockwise: true,
				type: 'uint16',
				count: glyphs.length
			});

			// update vertex data
			index$7.index(this, indices, 1, 'uint16');
			index$7.attr(this, 'position', this.layout.positions, 2);
			index$7.attr(this, 'uv', this.layout.uvs, 2);

			// update multipage data
			if (!opt.multipage && 'page' in this.attributes) {
				// disable multipage rendering
				this.removeAttribute('page');
			} else if (opt.multipage) {
				//const pages = Vertices.pages(glyphs);
				// enable multipage rendering
				index$7.attr(this, 'page', this.layout.pages, 1);
			}
		}
	}, {
		key: 'computeBoundingSphere',
		value: function computeBoundingSphere() {

			if (this.boundingSphere === null) {
				this.boundingSphere = new THREE.Sphere();
			}

			var positions = this.attributes.position.array,
			    itemSize = this.attributes.position.itemSize;

			if (!positions || !itemSize || positions.length < 2) {
				this.boundingSphere.radius = 0;
				this.boundingSphere.center.set(0, 0, 0);
				return;
			}

			TextGeometryUtil.computeSphere(positions, this.boundingSphere);

			/*if (isNaN(this.boundingSphere.radius)) {
     console.error('THREE.BufferGeometry.computeBoundingSphere(): ' +
       'Computed radius is NaN. The ' +
       '"position" attribute is likely to have NaN values.')
   }*/
		}
	}, {
		key: 'computeBoundingBox',
		value: function computeBoundingBox() {

			var bbox = this.boundingBox,
			    positions = this.attributes.position.array,
			    itemSize = this.attributes.position.itemSize;

			if (!positions || !itemSize || positions.length < 2) {
				bbox.makeEmpty();
				return;
			}

			TextGeometryUtil.computeBox(positions, bbox);
		}
	}]);
	return TextGeometry;
}(three_build_three_modules.BufferGeometry);

var TextBitmap = function () {
  function TextBitmap(config, renderer) {
    classCallCheck(this, TextBitmap);

    config.color = config.color || '#fff';
    config.lineHeight = config.lineHeight ? config.font.common.lineHeight + config.lineHeight : config.font.common.lineHeight;
    config.type = config.type || "msdf";
    this.config = config;
  }

  createClass(TextBitmap, [{
    key: 'init',
    value: function init(config) {
      var _this = this;

      var geometry = this.geometry = new TextGeometry(config); // text-bm-font

      //geometry.center();

      var texture = void 0;

      if (config.texture) {
        texture = config.texture;
        this.initTexture(texture, renderer);
      } else {
        var textureLoader = new THREE.TextureLoader();
        texture = textureLoader.load(config.imagePath, function () {
          _this.initTexture(texture, renderer);
        });
      }

      /*material = new THREE.RawShaderMaterial(sdfShader({
          side: THREE.DoubleSide,
          transparent: true,
          depthTest: false,
          map: texture,
          //depthWrite: false,
          color: config.color
      })),*/
      material = new THREE.RawShaderMaterial(sdfShader({
        side: THREE.DoubleSide,
        transparent: true,
        depthTest: false,
        map: texture,
        //depthWrite: false,
        color: config.color
      })), mesh = this.mesh = new THREE.Mesh(geometry, material), group = this.group = new THREE.Group();

      mesh.renderOrder = 1;
      mesh.rotation.x = Math.PI;

      this.update();

      var s = config.scale || 1;
      group.scale.set(s, s, s);

      group.add(mesh);

      if (config.hitbox) this.createHitBox();
    }
  }, {
    key: 'createHitBox',
    value: function createHitBox() {
      var boxGeo = new THREE.BoxGeometry(1, 1, 1),
          boxMat = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: config.showHitBox ? 1 : 0,
        wireframe: true
      }),
          hitBox = this.hitBox = new THREE.Mesh(boxGeo, boxMat);
      hitBox.mesh = this.mesh;

      this.group.add(hitBox);
    }
  }, {
    key: 'initTexture',
    value: function initTexture(texture, renderer) {
      texture.needsUpdate = true;
      texture.minFilter = THREE.LinearMipMapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    }
  }, {
    key: 'update',
    value: function update() {

      var geometry = this.geometry,
          mesh = this.mesh;

      geometry.update(this.config);

      // centering
      geometry.computeBoundingBox();
      mesh.position.x = -geometry.layout.width / 2;
      mesh.position.y = -(geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2; // valign center
      this.hitBox.scale.set(geometry.layout.width, geometry.layout.height, 1);
      // mesh.position.y = - ( geometry.boundingBox.max.y - geometry.boundingBox.min.y ); // valign top
      // this.hitBox.position.y = - geometry.layout.height / 2; // valign top

      this.height = geometry.layout.height * this.config.scale; // for html-like flow / positioning
    }
  }, {
    key: 'text',
    get: function get$$1() {
      return this.config.text;
    },
    set: function set$$1(value) {
      this.config.text = value;
      this.update();
    }
  }]);
  return TextBitmap;
}();

exports.MSDFShader = MSDFShader;
exports.SDFShader = SDFShader;
exports.TextGeometry = TextGeometry;
exports.TextBitmap = TextBitmap;
