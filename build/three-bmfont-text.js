(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three')) :
	typeof define === 'function' && define.amd ? define(['exports', 'three'], factory) :
	(factory((global.BmFont = {}),global.THREE));
}(this, (function (exports,three) { 'use strict';

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

		createClass(BaseShader, null, [{
			key: 'uniforms',
			value: function uniforms(map, color, opacity) {
				return {
					opacity: { type: 'f', value: opacity },
					map: { type: 't', value: map || new three.Texture() },
					color: { type: 'c', value: new three.Color(color) }
				};
			}
		}, {
			key: 'discarOnAlphaTest',
			value: function discarOnAlphaTest(alphaTest) {
				return alphaTest > 0 ? ' if (gl_FragColor.a < ' + alphaTest + ') discard;' : "";
			}
		}, {
			key: 'createShader',
			value: function createShader(opt) {

				opt = opt || {};
				var shader = this,
				    color = opt.color,
				    map = opt.map,
				    precision = opt.precision,
				    opacity = typeof opt.opacity === 'number' ? opt.opacity : 1,
				    alphaTest = typeof opt.alphaTest === 'number' ? opt.alphaTest : 0.0001;

				// remove to satisfy r73
				delete opt.map;
				delete opt.color;
				delete opt.precision;
				delete opt.opacity;

				return Object.assign({
					uniforms: shader.uniforms(map, color, opacity),
					vertexShader: shader.vertexShader,
					fragmentShader: shader.fragmentShader(precision, alphaTest)
				}, opt);
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

	var BasicShader = function (_BaseShader) {
	  inherits(BasicShader, _BaseShader);

	  function BasicShader() {
	    classCallCheck(this, BasicShader);
	    return possibleConstructorReturn(this, (BasicShader.__proto__ || Object.getPrototypeOf(BasicShader)).apply(this, arguments));
	  }

	  createClass(BasicShader, null, [{
	    key: 'fragmentShader',
	    value: function fragmentShader(precision, alphaTest) {

	      var discard = BaseShader.discarOnAlphaTest(alphaTest);

	      return '\n      precision ' + (precision || 'highp') + ' float;\n      uniform float opacity;\n      uniform vec3 color;\n      uniform sampler2D map;\n      varying vec2 vUv;\n\n      void main() {\n        gl_FragColor = texture2D(map, vUv) * vec4(color, opacity);\n        ' + discard + '\n      }\n    ';
	    }
	  }]);
	  return BasicShader;
	}(BaseShader);

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var index = createCommonjsModule(function (module) {
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

	var index_1 = index.lines;

	var Vertices = function () {
		function Vertices() {
			classCallCheck(this, Vertices);
		}

		createClass(Vertices, null, [{
			key: "pages",
			value: function pages(glyph, _pages, pagesOffset) {
				var id = glyph.page || 0;

				_pages[pagesOffset] = id;
				_pages[pagesOffset + 1] = id;
				_pages[pagesOffset + 2] = id;
				_pages[pagesOffset + 3] = id;
			}
		}, {
			key: "uvs",
			value: function uvs(glyph, _uvs, offset, font, flipY) {

				var bw = glyph.x + glyph.width,
				    bh = glyph.y + glyph.height,
				    texWidth = font.common.scaleW,
				    texHeight = font.common.scaleH,

				// top left position
				u0 = glyph.x / texWidth,
				    u1 = bw / texWidth;

				var v1 = glyph.y / texHeight,
				    v0 = bh / texHeight;

				if (flipY) {
					v1 = (texHeight - glyph.y) / texHeight;
					v0 = (texHeight - bh) / texHeight;
				}

				// BL
				_uvs[offset] = u0;
				_uvs[offset + 1] = v1;
				// TL
				_uvs[offset + 2] = u0;
				_uvs[offset + 3] = v0;
				// TR
				_uvs[offset + 4] = u1;
				_uvs[offset + 5] = v0;
				// BR
				_uvs[offset + 6] = u1;
				_uvs[offset + 7] = v1;
			}
		}, {
			key: "index",
			value: function index(indices, indicesOffset, indicesValueOffset) {
				indices[indicesOffset] = indicesValueOffset;
				indices[indicesOffset + 1] = indicesValueOffset + 1;
				indices[indicesOffset + 2] = indicesValueOffset + 2;
				indices[indicesOffset + 3] = indicesValueOffset + 0;
				indices[indicesOffset + 4] = indicesValueOffset + 2;
				indices[indicesOffset + 5] = indicesValueOffset + 3;
			}
		}, {
			key: "geomData",
			value: function geomData(glyphs, font, flipY) {

				var uvs = new Float32Array(glyphs.length * 8),
				    positions = new Float32Array(glyphs.length * 8);

				var indices = new Uint16Array(glyphs.length * 6);

				var i = 0,
				    verticesOffset = 0,
				    uvOffset = 0,
				    indicesOffset = 0,
				    indicesValueIndex = 0;

				glyphs.forEach(function (glyph) {

					var bitmap = glyph.data;

					//uv data
					var width = bitmap.width,
					    height = bitmap.height,
					    bw = bitmap.x + width,
					    bh = bitmap.y + height,
					    texWidth = font.common.scaleW,
					    texHeight = font.common.scaleH,

					// top left position
					u0 = bitmap.x / texWidth,
					    u1 = bw / texWidth;

					var v1 = bitmap.y / texHeight,
					    v0 = bh / texHeight;

					if (flipY) {
						v1 = (texHeight - bitmap.y) / texHeight;
						v0 = (texHeight - bh) / texHeight;
					}

					//position data
					var x = glyph.position[0] + bitmap.xoffset,
					    y = glyph.position[1] + bitmap.yoffset,
					    heightPos = y + height,
					    widthPos = x + width;

					// BL
					positions[verticesOffset] = x;
					uvs[uvOffset] = u0;

					positions[verticesOffset + 1] = y;
					uvs[uvOffset + 1] = v1;

					//positions[verticesOffset+2] = 0;

					// TL
					positions[verticesOffset + 2] = x;
					uvs[uvOffset + 2] = u0;

					positions[verticesOffset + 3] = heightPos;
					uvs[uvOffset + 3] = v0;

					//positions[verticesOffset+5] = 0;

					// TR
					positions[verticesOffset + 4] = widthPos;
					uvs[uvOffset + 4] = u1;

					positions[verticesOffset + 5] = heightPos;
					uvs[uvOffset + 5] = v0;

					//positions[verticesOffset+8] = 0;

					// BR
					positions[verticesOffset + 6] = widthPos;
					uvs[uvOffset + 6] = u1;

					positions[verticesOffset + 7] = y;
					uvs[uvOffset + 7] = v1;

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
		}, {
			key: "positions",
			value: function positions(glyph, _positions, offset, tx, ty) {

				var x = tx + glyph.xoffset,
				    y = ty + glyph.yoffset,
				    w = glyph.width,
				    h = glyph.height;

				// BL
				_positions[offset] = x;
				_positions[offset + 1] = y;
				// TL
				_positions[offset + 2] = x;
				_positions[offset + 3] = y + h;
				// TR
				_positions[offset + 4] = x + w;
				_positions[offset + 5] = y + h;
				// BR
				_positions[offset + 6] = x + w;
				_positions[offset + 7] = y;
			}
		}]);
		return Vertices;
	}();

	var TextLayoutUtils = function () {
	  function TextLayoutUtils() {
	    classCallCheck(this, TextLayoutUtils);
	  }

	  createClass(TextLayoutUtils, null, [{
	    key: "getGlyphById",
	    value: function getGlyphById(font, id) {
	      return font.charsmap[id] ? font.chars[font.charsmap[id]] : null;
	    }
	  }, {
	    key: "getKerning",
	    value: function getKerning(font, left, right) {
	      var amount = font.kerningsmap[left.id + left.index + right.id + right.index];
	      return amount || 0;
	    }
	    /*
	      static* range (begin, end, interval = 1) {
	        for (let i = begin; i < end; i += interval) {
	            yield i;
	        }
	      }*/

	  }]);
	  return TextLayoutUtils;
	}();

	//import wrap from 'word-wrap';
	var TextLayout = function () {
	  function TextLayout(opt) {
	    classCallCheck(this, TextLayout);

	    this._glyphs = [];
	    this._positions = [];
	    this._uvs = [];
	    this._pages = [];
	    this._opt = opt;

	    this.update(opt);
	  }

	  createClass(TextLayout, [{
	    key: 'initBuffers',
	    value: function initBuffers(text) {
	      var bufferLength = text.length * 8;
	      this._positions = new Float32Array(bufferLength);
	      this._uvs = new Float32Array(bufferLength);
	      this._indices = new Uint16Array(text.length * 6);
	    }
	  }, {
	    key: 'update',
	    value: function update(opt, attributes) {
	      var _this = this;

	      opt.align = opt.align || "left";

	      this._opt.measure = function (text, start, end, width) {
	        return _this.computeMetrics(text, start, end, width);
	      };
	      this._opt.tabSize = this._opt.tabSize > 0 ? this._opt.tabSize : 4;

	      //const glyphs = this._glyphs,
	      var text = opt.text || '',
	          font = this.font,
	          lines = index.lines(text, this._opt),
	          minWidth = opt.width || 0,
	          lineHeight = this.lineHeight,
	          letterSpacing = this.letterSpacing;

	      var pages = this._pages,
	          positionOffset = 0,
	          indicesOffset = 0,
	          indicesValueOffset = 0,
	          pagesOffset = 0;

	      pages = [0, 0, 0, 0];

	      //init position, uv and indices buffers
	      this.initBuffers(text);

	      if (opt.multipage) this._pages = new Uint16Array(text.length * 4);

	      this._glyphCount = 0;

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
	        //for (let i of TextLayoutUtils.range(start, end, 1)) {
	        for (var i = start; i < end; i++) {

	          var glyph = TextLayoutUtils.getGlyphById(font, text.charCodeAt(i));

	          if (glyph) {

	            if (lastGlyph) {
	              x += TextLayoutUtils.getKerning(font, lastGlyph, glyph);
	            }

	            var tx = x;

	            tx += alignment;

	            //add visible glyphs determined by width and height
	            if (glyph.width * glyph.height > 0) {

	              _this._glyphCount++;

	              Vertices.positions(glyph, _this._positions, positionOffset, tx, y);
	              Vertices.uvs(glyph, _this._uvs, positionOffset, _this.font, _this._opt.flipY);
	              Vertices.index(_this._indices, indicesOffset, indicesValueOffset);
	              if (glyph.page) {

	                Vertices.pages(glyph, _this._pages, pagesOffset);

	                pagesOffset += 4;
	              }

	              indicesOffset += 6;
	              indicesValueOffset += 4;
	              positionOffset += 8;

	              _this._drawRange = positionOffset;
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
	      var letterSpacing = this.letterSpacing,
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

	      for (var i = start; i < Math.min(text.length, end); i++) {
	        //for (let i of TextLayoutUtils.range(start, Math.min(text.length, end), 1)) {

	        var _glyph = TextLayoutUtils.getGlyphById(font, text.charCodeAt(i));

	        if (_glyph) {
	          //move pen forward
	          var xoff = _glyph.xoffset,
	              kern = lastGlyph ? TextLayoutUtils.getKerning(font, lastGlyph, _glyph) : 0;
	          //kern1 = lastGlyph ? this.getKerning(font, lastGlyph.id, glyph.id) : 0;

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
	      return this._positions;
	    }
	  }, {
	    key: 'uvs',
	    get: function get$$1() {
	      return this._uvs;
	    }
	  }, {
	    key: 'indices',
	    get: function get$$1() {
	      return this._indices;
	    }
	  }, {
	    key: 'glyphCount',
	    get: function get$$1() {
	      return this._glyphCount;
	    }
	  }, {
	    key: 'drawRange',
	    get: function get$$1() {
	      return this._drawRange;
	    }
	  }, {
	    key: 'font',
	    get: function get$$1() {
	      return this._opt.font;
	    }

	    /*get glyphs() {
	      return this._glyphs;
	    }*/

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

			createClass(TextGeometryUtil, null, [{
					key: "computeBox",
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

			//THREE.js already polyfills assign.
			var _this = possibleConstructorReturn(this, (TextGeometry.__proto__ || Object.getPrototypeOf(TextGeometry)).call(this));

			_this._opt = Object.assign({
				flipY: true
			}, opt);

			_this.boundingBox = new three.Box3();

			_this.update(opt.text);
			return _this;
		}

		createClass(TextGeometry, [{
			key: 'creatTextLayout',
			value: function creatTextLayout() {
				return new TextLayout(this._opt);
			}
		}, {
			key: 'update',
			value: function update(text) {

				var opt = this._opt;
				opt.text = text;

				this.layout = this.creatTextLayout();

				//set the current indices.
				this.setIndex(new three.BufferAttribute(this.layout.indices, 1));

				//buffer especially indices buffer is a little bigger to prevent detecting glyph length. Set a draw range just in case. 
				this.setDrawRange(0, this.layout.drawRange);

				//set the positions and uvs
				var positions = new three.BufferAttribute(this.layout.positions, 2),
				    uvs = new three.BufferAttribute(this.layout.uvs, 2);

				if (this.attributes.position) {

					this.attributes.position = positions;
					this.attributes.uv = uvs;

					this.index.needsUpdate = true;
					this.attributes.position.needsUpdate = true;
					this.attributes.uv.needsUpdate = true;
				} else {

					this.addAttribute('position', positions);
					this.addAttribute('uv', uvs);
				}

				//multipage support if enabled
				if (opt.multipage) {

					var page = new three.BufferAttribute(this.layout.pages, 1);

					if (this.attributes.page) {
						this.attributes.page = page;
						this.attributes.page.needsUpdate = true;
					} else {
						// enable multipage rendering
						this.addAttribute('page', page);
					}
				}
			}
		}, {
			key: 'computeBoundingSphere',
			value: function computeBoundingSphere() {

				if (this.boundingSphere === null) {
					this.boundingSphere = new three.Sphere();
				}

				var positions = this.attributes.position.array,
				    itemSize = this.attributes.position.itemSize;

				if (!positions || !itemSize || positions.length < 2) {
					this.boundingSphere.radius = 0;
					this.boundingSphere.center.set(0, 0, 0);
					return;
				}

				TextGeometryUtil.computeSphere(positions, this.boundingSphere);
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
	}(three.BufferGeometry);

	var TextBitmap = function () {
	  function TextBitmap(config, renderer) {
	    classCallCheck(this, TextBitmap);

	    config.color = config.color || '#fff';
	    config.lineHeight = config.lineHeight ? config.font.common.lineHeight + config.lineHeight : config.font.common.lineHeight;
	    this.config = config;
	    this._text = null;

	    this.init(config, renderer);
	  }

	  createClass(TextBitmap, [{
	    key: 'createGeometry',
	    value: function createGeometry() {
	      return new TextGeometry(this.config);
	    }
	  }, {
	    key: 'init',
	    value: function init(config, renderer) {

	      var geometry = this.geometry = this.createGeometry(); // text-bm-font

	      var texture = config.texture;
	      this.initTexture(texture, renderer);

	      var material = new three.RawShaderMaterial(MSDFShader.createShader({
	        side: three.DoubleSide,
	        transparent: true,
	        depthTest: false,
	        map: texture,
	        //depthWrite: false,
	        color: config.color
	      })),
	          mesh = this.mesh = new three.Mesh(geometry, material),
	          group = this.group = new three.Group();

	      mesh.renderOrder = 1;
	      mesh.rotation.x = Math.PI;

	      var s = config.scale || 1;
	      group.scale.set(s, s, s);

	      group.add(mesh);

	      this.createHitBox(config);

	      this.update();

	      //if (config.hitbox) this.createHitBox();
	    }
	  }, {
	    key: 'createHitBox',
	    value: function createHitBox(config) {

	      var boxGeo = new three.BoxBufferGeometry(1, 1, 1),
	          boxMat = new three.RawShaderMaterial(BasicShader.createShader({
	        color: 0xff0000,
	        transparent: true,
	        opacity: config.showHitBox ? 1 : 0,
	        wireframe: true
	      })),

	      /*boxMat = new THREE.MeshBasicMaterial({
	        color: 0x000000,
	        transparent: false,
	        opacity: 1,
	        //opacity: config.showHitBox ? 1 : 0,
	        wireframe: true
	      }),*/
	      hitBox = this.hitBox = new three.Mesh(boxGeo, boxMat);
	      hitBox.mesh = this.mesh;

	      this.group.add(hitBox);
	    }
	  }, {
	    key: 'initTexture',
	    value: function initTexture(texture, renderer) {
	      texture.needsUpdate = true;
	      texture.minFilter = three.LinearMipMapLinearFilter;
	      texture.magFilter = three.LinearFilter;
	      texture.generateMipmaps = true;
	      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
	    }
	  }, {
	    key: 'update',
	    value: function update() {

	      var geometry = this.geometry,
	          mesh = this.mesh;

	      //geometry.update( this.config );

	      // centering
	      geometry.computeBoundingBox();
	      mesh.position.x = -geometry.layout.width / 2;
	      mesh.position.y = -(geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2; // valign center

	      this.hitBox.scale.set(geometry.layout.width, geometry.layout.height, 1);
	      // mesh.position.y = - ( geometry.boundingBox.max.y - geometry.boundingBox.min.y ); // valign top
	      this.hitBox.position.y = -geometry.layout.height / 2; // valign top

	      this.height = geometry.layout.height * this.config.scale; // for html-like flow / positioning
	    }
	  }, {
	    key: 'text',
	    get: function get$$1() {
	      return this._text;
	    },
	    set: function set$$1(value) {
	      this._text = value;
	      this.geometry.update(value);
	      this.update();
	    }
	  }]);
	  return TextBitmap;
	}();

	var SimpleTextLayout = function (_TextLayout) {
	  inherits(SimpleTextLayout, _TextLayout);

	  function SimpleTextLayout(opt) {
	    classCallCheck(this, SimpleTextLayout);
	    return possibleConstructorReturn(this, (SimpleTextLayout.__proto__ || Object.getPrototypeOf(SimpleTextLayout)).call(this, opt));
	  }

	  createClass(SimpleTextLayout, [{
	    key: 'update',
	    value: function update(opt, attributes) {
	      this._height = this.lineHeight - this.descender, this._width = opt.width;

	      var glyph = TextLayoutUtils.getGlyphById(opt.font, opt.text.charCodeAt(0)),
	          y = -this._height,
	          text = opt.text;

	      var x = 0;

	      this.initBuffers(text);

	      if (glyph.width * glyph.height > 0) {

	        x = this.getAlignment(glyph.width);

	        Vertices.positions(glyph, this._positions, 0, x, y);
	        Vertices.uvs(glyph, this._uvs, 0, this.font, this._opt.flipY);
	        Vertices.index(this._indices, 0, 0);

	        //set the draw range to 8 for a single character. 
	        this._drawRange = 8;
	      }
	    }
	  }]);
	  return SimpleTextLayout;
	}(TextLayout);

	var SimpleTextGeometry = function (_TextGeometry) {
		inherits(SimpleTextGeometry, _TextGeometry);

		function SimpleTextGeometry(opt) {
			classCallCheck(this, SimpleTextGeometry);
			return possibleConstructorReturn(this, (SimpleTextGeometry.__proto__ || Object.getPrototypeOf(SimpleTextGeometry)).call(this, opt));
		}

		createClass(SimpleTextGeometry, [{
			key: 'creatTextLayout',
			value: function creatTextLayout() {
				return new SimpleTextLayout(this._opt);
			}
		}]);
		return SimpleTextGeometry;
	}(TextGeometry);

	var SimpleTextBitmap = function (_TextBitmap) {
		inherits(SimpleTextBitmap, _TextBitmap);

		function SimpleTextBitmap(opt, renderer) {
			classCallCheck(this, SimpleTextBitmap);
			return possibleConstructorReturn(this, (SimpleTextBitmap.__proto__ || Object.getPrototypeOf(SimpleTextBitmap)).call(this, opt, renderer));
		}

		createClass(SimpleTextBitmap, [{
			key: 'createGeometry',
			value: function createGeometry() {
				return new SimpleTextGeometry(this.config);
			}
		}]);
		return SimpleTextBitmap;
	}(TextBitmap);

	exports.TextBitmap = TextBitmap;
	exports.SimpleTextBitmap = SimpleTextBitmap;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
