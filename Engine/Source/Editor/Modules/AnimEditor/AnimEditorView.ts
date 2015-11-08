import sp = require('atom-space-pen-views');
import atomUtils = require('../../Atom/atomUtils');
import WOZLLA = require('wozllajs');
import fs = require('fs');
export var AnimEidtorURI = "wasp-anim-editor:";



export class AnimEditorView<Options> extends sp.ScrollView {

  static content() {
        return this.div({ class: 'wasp-anim-editor' }, () => {
        });
    }

    get $(): JQuery {
        return <any>this;
    }

    constructor(public filePath) {
        super();
        console.log('open anim file:',this.filePath);
        this.init();
    }
    init() {
      var animFileContent:string = fs.readFileSync(this.filePath,'utf8');
      var anim = JSON.parse(animFileContent);
      var getOriginalOffset = function(){
        if(anim && anim.meta && anim.meta.offset){
          return anim.meta.offset;
        }else{
          return {x:0,y:0};
        }
      }

      var rootElement:any = this.$[0];
      var canvasHeight = 640;
      var canvasWidth = 1280;
      rootElement.innerHTML = `

      <div>
        <div style='position:relative'>
          <canvas id="application" width="${canvasWidth}" height="${canvasHeight}">

          </canvas>
          <div id="edit-tools-pos" style="
            position: absolute;
            top: ${canvasHeight/2-7}px;
            left:${canvasWidth/2 -7}px;
            width: 170px;
            height: 170px;
            background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKoAAACqCAMAAAAKqCSwAAAAgVBMVEUAAACtaGgAAAAAAAAAAAClY2MAAAADAAAEAAC4bm4AAAACAAADAAACAAADAAB/MQADAAADAAAKCwkDAAABenYCVlQGAQBaIgACQkBSHwCnY2MA//b/ZgCaXFyRi4nHbVgA1s7oXAAAtrAA7ubOUQCMVFQAmZSaPQDHjIy5ZVC2SAAdWcZyAAAAG3RSTlMA5CQxC9cExUDUGXxIaYz4s1baoPPa+sfz+MQ1to2JAAACyklEQVR42u3cyXLbMAyAYZSkKZeLVi9xyTSSrNiJ3/8BC9mOl5l2egwwg/9iH7+BRFInws/nFkApq4I2cI021cVVGZzlQFV+XNVRGQZUF9dpbMugzI3649ZiSakQizHtV7VHrIWL9PWr94JU7eYlpdSvirJxF+rrx8fva4lk+8M68KO+vVF+AfaPLwBSSS4r3/Yz9LKs7lQWmxUpqnVaK6e0dnY+Ag5F1AglSXWxq33j6y6688HaKAtEqars00v3kvpSgdFBGwtUqc6vU7/p09o7AGMM3FrMvX9+vi/OfT/V6m5MfRo7bWHun9Rf8O252O7Tvo0O/tKyyLlYApFMKMY01sGQp1rlVymltVeWOtU0BW4B+75uDHGq1eUhHYpVOpTa0qaaJe5Vta9xt1oa2lSr54Nq2XS1pz5VMPPxb5zWivq7+hD5zUqo/02owCGhYkIFDgkVEypwSKiYUIFDQsWEChwSKiZU4JBQMaECh4SKCRU4JFRMqMAhoWJCBQ4JFRMqcEiomFCBQ0LFhAocEiomVOCQUDGhAoeEigkVOCRUTKjAIaFiQgUOCRUTKnBIqJhQgUNCxYQKHBIqJlTgkFAxoQKHhIoJFTgkVEyowCGhYkIFDgkVEypwSKiYUIFDQsWEChwSKiZU4NCV+nxJI80u1OvVl42+Xn1Jsi+qCds8dbGb8nZJdKz3qXanXBVVPpbUpwquKYZhMwxFQ3Sod6pVvspDrrwiOtQ7FUyopzzVgepQH6igyipXpQKqPVCdR6p3QDWm1IjUSJNqnXJhpgb8Y8Fo33lNc1Xp6KNvc27xJyq0KrIfAKE67dpNzpt2d9rS3aTmdHnM0y7n3UT4OL1dJD/lcyfCO/85q2Kb54aW6MK/Z3VZZawqyR78t0woBhxqQfzxn1O+wqF6ugf/81h5DBVAlccj4a+px0yz3ZL97n/OuhAc+eX/B3tnjfTmc1XlAAAAAElFTkSuQmCC);
          "></div>
        </div>

        <div style="margin-top:10px;">
          &nbsp offsetX:  &nbsp<input type='number' id='offsetX' value='${getOriginalOffset().x}'></input>
          &nbsp&nbsp&nbsp offsetY: &nbsp<input type='number' id='offsetY' value='${getOriginalOffset().y}'></input>
          &nbsp&nbsp&nbsp <button id='saveBtn'>保存</button>
        <div>
      </div>

      `;
      setTimeout(()=>{
        var canvas = this.$.find('#application')[0];
        var $offsetX = this.$.find('#offsetX');
        var $offsetY = this.$.find('#offsetY');
        var $saveBtn = this.$.find('#saveBtn');





        var director = new WOZLLA.Director(canvas);
          director.start();

          var gameObject = director.createGameObject(true);
          gameObject.rectTransform.anchorMode = WOZLLA.RectTransform.ANCHOR_CENTER || WOZLLA.RectTransform.ANCHOR_MIDDLE;
          gameObject.rectTransform.relative = false;
          gameObject.rectTransform.px = getOriginalOffset().x;
          gameObject.rectTransform.py = getOriginalOffset().y;

          var spritRenderer = new WOZLLA.component.SpriteRenderer();
          spritRenderer.align.set(WOZLLA.ALIGN_CENTER);
          spritRenderer.valign.set(WOZLLA.VALIGN_MIDDLE);
          spritRenderer.spriteAtlas.set(this.filePath);
          //  spritRenderer.spriteAtlas.set('http://localhost/tswanba/tsv2_res/res/battle/skill/SK101101/shield.tt.json');
          gameObject.addComponent(spritRenderer);

          var spritAnimation = new WOZLLA.component.SpriteAnimation();
          spritAnimation.loop.set(true);
          gameObject.addComponent(spritAnimation);

          var getNumberOf = function($elem){
            if($elem.val()){
              return $elem.val() * 1;
            }else{
              return 0;
            }
          }

          $offsetX.on('input',()=>{
            gameObject.rectTransform.px = getNumberOf($offsetX)
          })
          $offsetY.on('input',()=>{
            gameObject.rectTransform.py = getNumberOf($offsetY);
          })
          $saveBtn.click(()=>{
            console.log(anim);
            var offset = {
              x:getNumberOf($offsetX),
              y:getNumberOf($offsetY)
            }
            anim.meta = anim.meta || {};
            anim.meta.offset = offset;
            fs.writeFileSync(this.filePath,JSON.stringify(anim,null,4));
          });

          gameObject.loadAssets(function() {
              gameObject.init();
              director.stage.addChild(gameObject);
          });

          director.scheduler.scheduleLoop(function() {
              gameObject.update();
          });
      },100);


    }



    getURI = () => atomUtils.uriForPath(AnimEidtorURI, this.filePath);
    getTitle = () => 'AnimEditor'
    getIconName = () => 'git-compare'

}
