export default class TextLayoutUtils {

  getGlyphById(font, id) {
    return font.charsmap[id] ? font.chars[font.charsmap[id]] : null;
  }

  getKerning(font, left, right) {
    const amount = font.kerningsmap[left + right];
    return amount >= -1 ? amount : 0;
  }

  static* range (begin, end, interval = 1) {
    for (let i = begin; i < end; i += interval) {
        yield i;
    }
  }

}
