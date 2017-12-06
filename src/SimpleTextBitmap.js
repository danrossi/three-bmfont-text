import TextBitmap from './TextBitmap';
import SimpleTextGeometry from './SimpleTextGeometry';

export default class SimpleTextBitmap extends TextBitmap {

	constructor(opt, renderer) {
		super(opt, renderer);
	}

	createGeometry() {
    	return new SimpleTextGeometry(this.config);
  	}
}