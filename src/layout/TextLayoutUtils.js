const newline = /\n/,
    newlineChar = '\n',
    whitespace = /\s/;

function idxOf(text, chr, start, end) {
    var idx = text.indexOf(chr, start)
    if (idx === -1 || idx > end) return end
    return idx
}

function isWhitespace(chr) {
    return whitespace.test(chr)
}

function greedy(measure, text, start, end, width) {
    //A greedy word wrapper based on LibGDX algorithm
    //https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java
    const lines = [];
    let testWidth = width;
    while (start < end && start < text.length) {
        //get next newline position
        let newLine = idxOf(text, newlineChar, start, end);
        //eat whitespace at start of line
        while (start < newLine) {
            if (!isWhitespace(text.charAt(start))) break;
            start++;
        }
        //determine visible # of glyphs for the available width
        const measured = measure(text, start, newLine, testWidth);
        let lineEnd = start + (measured.end - measured.start),
            nextStart = lineEnd + newlineChar.length;
        //if we had to cut the line before the next newline...
        if (lineEnd < newLine) {
            //find char to break on
            while (lineEnd > start) {
                if (isWhitespace(text.charAt(lineEnd))) break;
                lineEnd--;
            }
            if (lineEnd === start) {
                if (nextStart > start + newlineChar.length) nextStart--
                    lineEnd = nextStart; // If no characters to break, show all.
            } else {
                nextStart = lineEnd;
                //eat whitespace at end of line
                while (lineEnd > start) {
                    if (!isWhitespace(text.charAt(lineEnd - newlineChar.length))) break;
                    lineEnd--;
                }
            }
        }
        if (lineEnd >= start) {
            const result = measure(text, start, lineEnd, testWidth);
            lines.push(result);
        }
        start = nextStart;
    }
    return lines;
}

export default class TextLayoutUtils {

    static getGlyphById(font, id) {
        //assume for now every character has a mapping. 
        return font.chars[font.charsmap[id]];
    }

    static getKerning(font, left, right) {
        const amount = font.kerningsmap[left.id + left.index + right.id + right.index];
        return amount || 0;
    }

    //internalise wordwrap for future replacement
    static wordwrap(text, opt) {
        opt = opt || {};
        return greedy(opt.measure, text, opt.start || 0, opt.end || text.length, opt.width || 50);
    }
    /*
      static* range (begin, end, interval = 1) {
        for (let i = begin; i < end; i += interval) {
            yield i;
        }
      }*/
}