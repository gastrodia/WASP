import sp = require('atom-space-pen-views');
import atomUtils = require('../../Atom/atomUtils');
import WOZLLA = require('wozllajs');
import fs = require('fs');
import React = require('react');
import ReactDOM = require('react-dom');
export var UIEidtorURI = "wasp-ui-editor:";
import UIEditor = require('./UIEditor');


export class UIEditorView<Options> extends sp.ScrollView {

  static content() {
        return this.div({ class: 'wasp-ui-editor' }, () => {
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

      <div id="application">

      </div>

      `;
      setTimeout(()=>{
        var factory = React.createFactory(UIEditor);
        ReactDOM.render(
                factory(),
                this.$.find('#application')[0]
        );
      },100);


    }



    getURI = () => atomUtils.uriForPath(UIEidtorURI, this.filePath);
    getTitle = () => 'UIEditor'
    getIconName = () => 'git-compare'

}
