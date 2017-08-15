var TextGeometry = require('./index');
var TextBitmap = require('./lib/textbitmap');

function createTextGeometry (opt) {
  return new TextGeometry(opt);
}

function createTextBitmap (config, renderer) {
  return new TextBitmap(config, renderer);
}

module.exports.createTextGeometry = createTextGeometry;
module.exports.createTextBitmap = createTextBitmap;

window.createTextGeometry = createTextGeometry;
window.createTextBitmap = createTextBitmap;
 
