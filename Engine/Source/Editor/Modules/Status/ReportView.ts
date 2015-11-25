import sp = require('atom-space-pen-views');
import atomUtils = require('../../Atom/atomUtils');
import WOZLLA = require('wozllajs');
import fs = require('fs');
import React = require('react');
import ReactDOM = require('react-dom');
var ReportViewURI = "wasp-report-view:";
import Report = require('./Report');


export class ReportView<Options> extends sp.ScrollView {

  static content() {
        return this.div({ class: 'wasp-report-editor' }, () => {
        });

    }

    get $(): JQuery {
        return <any>this;
    }

    constructor(public filePath) {
        super();
        console.log('open report file:',this.filePath);
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
        var factory = React.createFactory(Report);
        ReactDOM.render(
                factory(),
                this.$.find('#application')[0]
        );
      },100);


    }



    getURI = () => atomUtils.uriForPath(ReportViewURI, this.filePath);
    getTitle = () => 'ReportView'
    getIconName = () => 'git-compare'

    static openUIFile(e){
     var filePath = e.target.dataset.path;
     atom.workspace.open(atomUtils.uriForPath(ReportViewURI, filePath), {searchAllPanes: true,filePath:filePath});
    }

    static openStatusView(e){

    }

    static load(){


      atom.commands.add('.tree-view .file .name[data-name$=\\.json]', 'wasp-editor:report-view', (e) => {
        ReportView.openUIFile(e);
      });

      atom.commands.add('atom-workspace', 'wasp-editor:status-view', (e) => {
        console.log('open status view!!!');
        ReportView.openStatusView(e);
      });


      atomUtils.registerOpener({
          commandSelector: 'atom-workspace',
          commandName: 'wasp:report-view',
          uriProtocol: ReportViewURI,
          onOpen: (data) => {
              return new ReportView(data.filePath);
          }
      });
    }
}
