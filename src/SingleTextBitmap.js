import TextBitmap from './TextBitmap';
import SingleTextGeometry from './SingleTextGeometry';

export default class SingleTextBitmap extends TextBitmap {

	constructor(opt, isWebGPU = false) {
		super(opt, isWebGPU);
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