
export default class TextLayoutUtils {


  static getGlyphById(font, id) {
    //assume for now every character has a mapping. 
    return font.chars[font.charsmap[id]];
    //return font.charsmap[id] != null ? font.chars[font.charsmap[id]] : null;
  }

  static getKerning(font, left, right) {
    const amount = font.kerningsmap[left.id + left.index + right.id + right.index];
    return amount || 0;
  }
/*
  static* range (begin, end, interval = 1) {
    for (let i = begin; i < end; i += interval) {
        yield i;
    }
  }*/

}
