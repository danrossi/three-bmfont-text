import TextLayout from './layout/TextLayout';
import TextGeometryUtil from './util/TextGeometryUtil';
/*import {
    BufferGeometry,
    Box3,
    Sphere,
    BufferAttribute
} from 'three';*/


//import files directly for bundling with three.js
//bundling is flawed and need to find a better system. 

import { BufferGeometry } from '../../three.js/src/core/BufferGeometry';
import { Box3 } from '../../three.js/src/math/Box3';
import { Sphere } from '../../three.js/src/math/Sphere';
import { BufferAttribute } from '../../three.js/src/core/BufferAttribute';
import { LinearMipMapLinearFilter,LinearFilter, DoubleSide } from '../../three.js/src/constants';

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
        this.setDrawRange(0, this.layout.drawRange);
        //set the positions and uvs
        const positions = new BufferAttribute(this.layout.positions, 2),
            uvs = new BufferAttribute(this.layout.uvs, 2);
        if (this.attributes.position) {
            this.attributes.position = positions;
            this.attributes.uv = uvs;
            this.index.needsUpdate = true;
            this.attributes.position.needsUpdate = true;
            this.attributes.uv.needsUpdate = true;
        } else {
            this.addAttribute('position', positions);
            this.addAttribute('uv', uvs);
        }
        //multipage support if enabled
        if (opt.multipage) {
            const page = new BufferAttribute(this.layout.pages, 1);
            if (this.attributes.page) {
                this.attributes.page = page;
                this.attributes.page.needsUpdate = true;
            } else {
                // enable multipage rendering
                this.addAttribute('page', page);
            }
        }
    }

    computeBoundingSphere() {
        if (this.boundingSphere === null) {
            this.boundingSphere = new Sphere();
        }
        const positions = this.attributes.position.array,
            itemSize = this.attributes.position.itemSize;
        if (!positions || !itemSize || positions.length < 2) {
            this.boundingSphere.radius = 0
            this.boundingSphere.center.set(0, 0, 0)
            return;
        }
        TextGeometryUtil.computeSphere(positions, this.boundingSphere);
    }
    
    computeBoundingBox() {
        const bbox = this.boundingBox,
            positions = this.attributes.position.array,
            itemSize = this.attributes.position.itemSize;
        if (!positions || !itemSize || positions.length < 2) {
            bbox.makeEmpty();
            return
        }
        TextGeometryUtil.computeBox(positions, bbox);
    }
}