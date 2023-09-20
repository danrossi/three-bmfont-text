import TextLayout from './layout/TextLayout';


import { BufferGeometry,  Box3, BufferAttribute } from 'three';


export default class TextGeometry extends BufferGeometry {
    
    constructor(opt) {
        super();
        //THREE.js already polyfills assign.
        this._opt = Object.assign({
            flipY: true
        }, opt);
        this.boundingBox = new Box3();
        this.update(opt.text);
    }

    creatTextLayout() {
        return new TextLayout(this._opt);
    }

    update(text) {
        const opt = this._opt;
        opt.text = text;
        this.layout = this.creatTextLayout();
        //set the current indices.
        this.setIndex(new BufferAttribute(this.layout.indices, 1));
        //buffer especially indices buffer is a little bigger to prevent detecting glyph length. Set a draw range just in case. 
        //this.setDrawRange(0, this.layout.drawRange);
        //set the positions and uvs
        const positions = new BufferAttribute(this.layout.positions, 3),
            uvs = new BufferAttribute(this.layout.uvs, 2);
        if (this.attributes.position) {
            this.attributes.position = positions;
            this.attributes.uv = uvs;
            this.index.needsUpdate = true;
            this.attributes.position.needsUpdate = true;
            this.attributes.uv.needsUpdate = true;
        } else {
            this.setAttribute('position', positions);
            this.setAttribute('uv', uvs);
        }


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