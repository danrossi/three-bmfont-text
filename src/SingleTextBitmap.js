import TextBitmap from './TextBitmap';
import SingleTextGeometry from './SingleTextGeometry';

export default class SingleTextBitmap extends TextBitmap {

	constructor(opt, renderer) {
		super(opt, renderer);
	}

	createGeometry() {
    	return new SingleTextGeometry(this.config);
  	}

  	rotateMesh() {
    }
}