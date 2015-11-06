import sp = require('atom-space-pen-views');
import atomUtils = require('../../Atom/atomUtils');
import WOZLLA = require('wozllajs');
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
        this.init();
    }
    init() {
      var rootElement = this.$[0];
      rootElement.innerHTML = `
      <canvas id="application" width="500" height="500">

      </canvas>
      `;
      setTimeout(()=>{

        var director = new WOZLLA.Director(document.getElementById('application'));
          director.start();

          var gameObject = director.createGameObject();
          gameObject.transform.setPosition(250, 250);
          var textRenderer = new WOZLLA.component.TextRenderer();
          textRenderer.align.set(WOZLLA.ALIGN_CENTER);
          textRenderer.text.set('text中文');
          textRenderer.canvasStyle.fill = true;
          textRenderer.canvasStyle.fillColor = '#FFFFFF';
          textRenderer.canvasStyle.stroke = true;
          textRenderer.canvasStyle.strokeWidth = 3;
          textRenderer.canvasStyle.strokeColor = '#FF0000';

          gameObject.addComponent(textRenderer);
          gameObject.loadAssets(function() {
              gameObject.init();
              director.stage.addChild(gameObject);
          });

          director.scheduler.scheduleLoop(function() {
              gameObject.transform.rotation ++;
          });
      },100);


    }



    getURI = () => atomUtils.uriForPath(AnimEidtorURI, this.filePath);
    getTitle = () => 'AnimEditor'
    getIconName = () => 'git-compare'

}
