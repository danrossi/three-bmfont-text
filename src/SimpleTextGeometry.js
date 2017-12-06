import TextGeometry from './TextGeometry';
import SimpleTextLayout from './layout/SimpleTextLayout';

export default class SimpleTextGeometry extends TextGeometry {
	
	constructor(opt) {
		super(opt);
	}

	creatTextLayout() {
		return new SimpleTextLayout(this._opt);
	}
}