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

	var Vertices = function () {
		function Vertices() {
			classCallCheck(this, Vertices);
		}

		createClass(Vertices, null, [{
			key: "pages",
			value: function pages(glyph, _pages, i) {
				var id = glyph.page || 0;

				_pages[i++] = id;
				_pages[i++] = id;
				_pages[i++] = id;
				_pages[i++] = id;
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

		}, {
			key: "geomData",
			value: function geomData(glyphs, font, flipY) {

				var uvs = new Float32Array(glyphs.length * 8),
				    positions = new Float32Array(glyphs.length * 8);

				var indices = new Uint16Array(glyphs.length * 6);

				var i = 0,
				    indicesIndex = 0,
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
					positions[i] = x;
					uvs[i] = u0;

					positions[i + 1] = y;
					uvs[i + 1] = v1;

					// TL
					positions[i + 2] = x;
					uvs[i + 2] = u0;

					positions[i + 3] = heightPos;
					uvs[i + 3] = v0;

					// TR
					positions[i + 4] = widthPos;
					uvs[i + 4] = u1;

					positions[i + 5] = heightPos;
					uvs[i + 5] = v0;

					// BR
					positions[i + 6] = widthPos;
					uvs[i + 6] = u1;

					positions[i + 7] = y;
					uvs[i + 7] = v1;

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

		}]);
		return Vertices;
	}();

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var index$1 = createCommonjsModule(function (module) {
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

	var index_1 = index$1.lines;

	var immutable = extend;

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	function extend() {
	    var target = {};

	    for (var i = 0; i < arguments.length; i++) {
	        var source = arguments[i];

	        for (var key in source) {
	            if (hasOwnProperty.call(source, key)) {
	                target[key] = source[key];
	            }
	        }
	    }

	    return target
	}

	var index$3 = function numtype(num, def) {
		return typeof num === 'number'
			? num 
			: (typeof def === 'number' ? def : 0)
	};

	var X_HEIGHTS = ['x', 'e', 'a', 'o', 'n', 's', 'r', 'c', 'u', 'm', 'v', 'w', 'z'];
	var M_WIDTHS = ['m', 'w'];
	var CAP_HEIGHTS = ['H', 'I', 'N', 'E', 'F', 'K', 'L', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];


	var TAB_ID = '\t'.charCodeAt(0);
	var SPACE_ID = ' '.charCodeAt(0);
	var ALIGN_LEFT = 0;
	var ALIGN_CENTER = 1;
	var ALIGN_RIGHT = 2;

	var index = function createLayout(opt) {
	  return new TextLayout(opt)
	};

	function TextLayout(opt) {
	  this.glyphs = [];
	  this._measure = this.computeMetrics.bind(this);
	  this.update(opt);
	}

	TextLayout.prototype.update = function(opt) {
	  opt = immutable({
	    measure: this._measure
	  }, opt);
	  this._opt = opt;
	  this._opt.tabSize = index$3(this._opt.tabSize, 4);

	  if (!opt.font)
	    throw new Error('must provide a valid bitmap font')

	  var glyphs = this.glyphs;
	  var text = opt.text||''; 
	  var font = opt.font;
	  this._setupSpaceGlyphs(font);
	  
	  var lines = index$1.lines(text, opt);
	  var minWidth = opt.width || 0;

	  //clear glyphs
	  glyphs.length = 0;

	  //get max line width
	  var maxLineWidth = lines.reduce(function(prev, line) {
	    return Math.max(prev, line.width, minWidth)
	  }, 0);

	  //the pen position
	  var x = 0;
	  var y = 0;
	  var lineHeight = index$3(opt.lineHeight, font.common.lineHeight);
	  var baseline = font.common.base;
	  var descender = lineHeight-baseline;
	  var letterSpacing = opt.letterSpacing || 0;
	  var height = lineHeight * lines.length - descender;
	  var align = getAlignType(this._opt.align);

	  //draw text along baseline
	  y -= height;
	  
	  //the metrics for this text layout
	  this._width = maxLineWidth;
	  this._height = height;
	  this._descender = lineHeight - baseline;
	  this._baseline = baseline;
	  this._xHeight = getXHeight(font);
	  this._capHeight = getCapHeight(font);
	  this._lineHeight = lineHeight;
	  this._ascender = lineHeight - descender - this._xHeight;
	    
	  //layout each glyph
	  var self = this;
	  lines.forEach(function(line, lineIndex) {
	    var start = line.start;
	    var end = line.end;
	    var lineWidth = line.width;
	    var lastGlyph;
	    
	    //for each glyph in that line...
	    for (var i=start; i<end; i++) {
	      var id = text.charCodeAt(i);
	      var glyph = self.getGlyph(font, id);
	      if (glyph) {
	        if (lastGlyph) 
	          x += getKerning(font, lastGlyph.id, glyph.id);

	        var tx = x;
	        if (align === ALIGN_CENTER) 
	          tx += (maxLineWidth-lineWidth)/2;
	        else if (align === ALIGN_RIGHT)
	          tx += (maxLineWidth-lineWidth);

	        glyphs.push({
	          position: [tx, y],
	          data: glyph,
	          index: i,
	          line: lineIndex
	        });  

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
	};

	TextLayout.prototype._setupSpaceGlyphs = function(font) {
	  //These are fallbacks, when the font doesn't include
	  //' ' or '\t' glyphs
	  this._fallbackSpaceGlyph = null;
	  this._fallbackTabGlyph = null;

	  if (!font.chars || font.chars.length === 0)
	    return

	  //try to get space glyph
	  //then fall back to the 'm' or 'w' glyphs
	  //then fall back to the first glyph available
	  var space = getGlyphById(font, SPACE_ID) 
	          || getMGlyph(font) 
	          || font.chars[0];

	  //and create a fallback for tab
	  var tabWidth = this._opt.tabSize * space.xadvance;
	  this._fallbackSpaceGlyph = space;
	  this._fallbackTabGlyph = immutable(space, {
	    x: 0, y: 0, xadvance: tabWidth, id: TAB_ID, 
	    xoffset: 0, yoffset: 0, width: 0, height: 0
	  });
	};

	TextLayout.prototype.getGlyph = function(font, id) {
	  var glyph = getGlyphById(font, id);
	  if (glyph)
	    return glyph
	  else if (id === TAB_ID) 
	    return this._fallbackTabGlyph
	  else if (id === SPACE_ID) 
	    return this._fallbackSpaceGlyph
	  return null
	};

	TextLayout.prototype.computeMetrics = function(text, start, end, width) {
	  var letterSpacing = this._opt.letterSpacing || 0;
	  var font = this._opt.font;
	  var curPen = 0;
	  var curWidth = 0;
	  var count = 0;
	  var glyph;
	  var lastGlyph;

	  if (!font.chars || font.chars.length === 0) {
	    return {
	      start: start,
	      end: start,
	      width: 0
	    }
	  }

	  end = Math.min(text.length, end);
	  for (var i=start; i < end; i++) {
	    var id = text.charCodeAt(i);
	    var glyph = this.getGlyph(font, id);

	    if (glyph) {
	      //move pen forward
	      var xoff = glyph.xoffset;
	      var kern = lastGlyph ? getKerning(font, lastGlyph.id, glyph.id) : 0;
	      curPen += kern;

	      var nextPen = curPen + glyph.xadvance + letterSpacing;
	      var nextWidth = curPen + glyph.width;

	      //we've hit our limit; we can't move onto the next glyph
	      if (nextWidth >= width || nextPen >= width)
	        break

	      //otherwise continue along our line
	      curPen = nextPen;
	      curWidth = nextWidth;
	      lastGlyph = glyph;
	    }
	    count++;
	  }
	  
	  //make sure rightmost edge lines up with rendered glyphs
	  if (lastGlyph)
	    curWidth += lastGlyph.xoffset;

	  return {
	    start: start,
	    end: start + count,
	    width: curWidth
	  }
	}

	//getters for the private vars
	;['width', 'height', 
	  'descender', 'ascender',
	  'xHeight', 'baseline',
	  'capHeight',
	  'lineHeight' ].forEach(addGetter);

	function addGetter(name) {
	  Object.defineProperty(TextLayout.prototype, name, {
	    get: wrapper(name),
	    configurable: true
	  });
	}

	//create lookups for private vars
	function wrapper(name) {
	  return (new Function([
	    'return function '+name+'() {',
	    '  return this._'+name,
	    '}'
	  ].join('\n')))()
	}

	function getGlyphById(font, id) {
	  if (!font.chars || font.chars.length === 0)
	    return null

	  var glyphIdx = findChar(font.chars, id);
	  if (glyphIdx >= 0)
	    return font.chars[glyphIdx]
	  return null
	}

	function getXHeight(font) {
	  for (var i=0; i<X_HEIGHTS.length; i++) {
	    var id = X_HEIGHTS[i].charCodeAt(0);
	    var idx = findChar(font.chars, id);
	    if (idx >= 0) 
	      return font.chars[idx].height
	  }
	  return 0
	}

	function getMGlyph(font) {
	  for (var i=0; i<M_WIDTHS.length; i++) {
	    var id = M_WIDTHS[i].charCodeAt(0);
	    var idx = findChar(font.chars, id);
	    if (idx >= 0) 
	      return font.chars[idx]
	  }
	  return 0
	}

	function getCapHeight(font) {
	  for (var i=0; i<CAP_HEIGHTS.length; i++) {
	    var id = CAP_HEIGHTS[i].charCodeAt(0);
	    var idx = findChar(font.chars, id);
	    if (idx >= 0) 
	      return font.chars[idx].height
	  }
	  return 0
	}

	function getKerning(font, left, right) {
	  if (!font.kernings || font.kernings.length === 0)
	    return 0

	  var table = font.kernings;
	  for (var i=0; i<table.length; i++) {
	    var kern = table[i];
	    if (kern.first === left && kern.second === right)
	      return kern.amount
	  }
	  return 0
	}

	function getAlignType(align) {
	  if (align === 'center')
	    return ALIGN_CENTER
	  else if (align === 'right')
	    return ALIGN_RIGHT
	  return ALIGN_LEFT
	}

	function findChar (array, value, start) {
	  start = start || 0;
	  for (var i = start; i < array.length; i++) {
	    if (array[i].id === value) {
	      return i
	    }
	  }
	  return -1
	}

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

					/*static createIndices(count) {
	       
	       	const numIndices = count * 6,
	       	indices = new Uint16Array(numIndices);
	        //var indices = new Uint16Array(indicesArray, 0, 6);
	       //var indices = new Uint16Array(numIndices);
	    	    for (let i = 0, j = 0; i < numIndices; i += 6, j += 4) {
	            indices[i + 0] = j + 0;
	            indices[i + 1] = j + 1;
	            indices[i + 2] = j + 2;
	            indices[i + 3] = j + 0;
	            indices[i + 4] = j + 2;
	            indices[i + 5] = j + 3;
	    	        //console.log(i);
	            //console.log(j);
	        }
	        	return indices;
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

	//import * as vertices  from './vertices';
	//import TextLayout from './layout/TextLayout';
	//import * as THREE from 'three';

	var TextGeometry = function (_BufferGeometry) {
		inherits(TextGeometry, _BufferGeometry);

		function TextGeometry(opt) {
			classCallCheck(this, TextGeometry);

			//THREE.js already polyfills assign.
			var _this = possibleConstructorReturn(this, (TextGeometry.__proto__ || Object.getPrototypeOf(TextGeometry)).call(this));

			_this._opt = Object.assign({}, opt);

			_this.boundingBox = new three.Box3();

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

				//this.layout = new TextLayout(opt);

				this.layout = index(opt);

				// get vec2 texcoords
				var flipY = opt.flipY !== false,

				// the desired BMFont data
				font = opt.font,
				    glyphs = this.layout.glyphs;
				// get visible glyphs
				// glyphs = this.layout.glyphs.filter((glyph) => glyph.data.width * glyph.data.height > 0);
				// provide visible glyphs for convenience
				this.visibleGlyphs = glyphs;

				var data = Vertices.geomData(glyphs, font, flipY);

				this.setIndex(new three.BufferAttribute(data.index, 1));

				if (this.attributes.position) {

					this.attributes.position = new three.BufferAttribute(data.positions, 2);
					this.attributes.uv = new three.BufferAttribute(data.uvs, 2);

					this.index.needsUpdate = true;

					this.attributes.position.needsUpdate = true;
					this.attributes.uv.needsUpdate = true;
				} else {

					this.addAttribute('position', new three.BufferAttribute(data.positions, 2));
					this.addAttribute('uv', new three.BufferAttribute(data.uvs, 2));
				}

				// update multipage data
				if (!opt.multipage && 'page' in this.attributes) {
					// disable multipage rendering
					this.removeAttribute('page');
				} else if (opt.multipage) {
					var pages = Vertices.pages(glyphs);
					this.addAttribute('uv', new three.BufferAttribute(pages, 1));
					//const pages = Vertices.pages(glyphs);
					// enable multipage rendering
					//buffer.attr(this, 'page', this.layout.pages, 1);
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

	    this.init(config, renderer);
	  }

	  createClass(TextBitmap, [{
	    key: 'init',
	    value: function init(config, renderer) {

	      var geometry = this.geometry = new TextGeometry(config); // text-bm-font

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
	      return this.config.text;
	    },
	    set: function set$$1(value) {
	      this.config.text = value;
	      this.geometry.update(this.config);
	      this.update();
	    }
	  }]);
	  return TextBitmap;
	}();

	//export { OldTextGeometry } from './index.js';

	exports.TextBitmap = TextBitmap;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
