import  * as THREE  from 'three';

export function fontLoader(opt, cb) {

      var r = new XMLHttpRequest();
      //r.open('GET', 'fnt/Arial.json');
      r.open('GET', opt.font);
      r.onreadystatechange = function() {
        if (r.readyState === 4 && r.status === 200) {
          var fontJson = JSON.parse(r.responseText);

          var texture = new THREE.TextureLoader().load(opt.image, function(){
              cb(fontJson, texture);
          });

        }
      };

      r.send();
}
