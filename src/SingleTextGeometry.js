import TextGeometry from './TextGeometry';
import SingleTextLayout from './layout/SingleTextLayout';

export default class SingleTextGeometry extends TextGeometry {
	
	constructor(opt) {
		super(opt);
	}

	creatTextLayout() {
		return new SingleTextLayout(this._opt);
	}
}