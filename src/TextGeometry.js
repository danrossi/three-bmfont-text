import TextLayout from './layout/TextLayout';


import { BufferGeometry,  Box3, BufferAttribute } from 'three';


export default class TextGeometry extends BufferGeometry {
    
    constructor(opt) {
        super();
        //THREE.js already polyfills assign.
        this._opt = Object.assign({
            flipY: true,
            buffersLength: 100
        }, opt);
        this.boundingBox = new Box3();

   
        this.setIndex(new BufferAttribute(new Uint16Array(this._opt.buffersLength * 6), 1));
        this.setAttribute('position', new BufferAttribute(new Float32Array(this._opt.buffersLength * 12), 3));
        this.setAttribute('uv', new BufferAttribute(new Float32Array(this._opt.buffersLength * 8), 2));

        this.update(opt.text);
    }

    creatTextLayout() {
        return new TextLayout(this._opt, this);
    }

    update(text) {
        const opt = this._opt;
        opt.text = text;
        this.layout = this.creatTextLayout();
        //buffer especially indices buffer is a little bigger to prevent detecting glyph length. Set a draw range just in case. 
        this.setDrawRange(0, this.layout.drawRange);


        this.attributes.position.updateRanges = [{ start:  0, count: this.layout.drawRange }]; 
     
        this.attributes.uv.updateRanges = [{ start:  0, count: this.layout.uvOffset}]; 

        this.index.updateRanges = [{ start:  0, count: this.layout.indexOffset}];  
      

        this.index.needsUpdate = true;
        this.attributes.position.needsUpdate = true;
        this.attributes.uv.needsUpdate = true;


        //multipage support if enabled
        if (opt.multipage) {
            const page = new BufferAttribute(this.layout.pages, 1);
            if (this.attributes.page) {
                this.attributes.page = page;
                this.attributes.page.needsUpdate = true;
            } else {
                // enable multipage rendering
                this.setAttribute('page', page);
            }
        }
    }

    set minWidth(width) {
        this.layout.minWidth = width;
    }
}