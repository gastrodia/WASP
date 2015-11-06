import sp = require('atom-space-pen-views');
import atomUtils = require('../atomUtils');
export var waspUIEditorURI = "wasp-ui:";



export class WaspEditorView<Options> extends sp.ScrollView {



  static content() {
        return this.div({ class: 'wasp-ui-editor' }, () => {
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
      console.log('wasp-ui-editor start render');
      var rootElement = this.$[0];
      rootElement.innerHTML = `
      <div id="application">
            <div class="loading">
              Loading...
            </div>
      </div>
      `;
      setTimeout(()=>{
        startMain();
      },100);


    }



    getURI = () => atomUtils.uriForPath(waspUIEditorURI, this.filePath);
    getTitle = () => 'WaspUIEditor'
    getIconName = () => 'git-compare'

}


export function startMain(){
console.log('ttt')
  var prefix = '../../../..';

  require(prefix + '/build/src/main');
}
