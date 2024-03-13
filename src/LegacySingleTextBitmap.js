import TextBitmap from './LegacyTextBitmap';
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

	update() {
		super.update();
		this.position.x += this.config.xOffset;
		this.position.y += this.config.yOffset;
	}
}