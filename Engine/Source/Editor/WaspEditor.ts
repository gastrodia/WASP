import {$} from "atom-space-pen-views";
import url = require('url');
import {AnimEditorView,AnimEidtorURI} from './Modules/AnimEditor/AnimEditorView';
import atomUtils = require("./atom/atomUtils");
export interface PackageState {
}

export function activate(state: PackageState) {

    atom.commands.add('.tree-view .file .name[data-name$=\\.json]', 'wasp-editor:openfile', (e) => {
      this.openfile(e);
    });

    atomUtils.registerOpener({
        commandSelector: 'atom-workspace',
        commandName: 'wasp:anim-editor',
        uriProtocol: AnimEidtorURI,
        onOpen: (data) => {
            return new AnimEditorView(data.filePath);
        }
    });
} 

export function openfile(e){
  var filePath = e.target.dataset.path;
  atom.workspace.open(atomUtils.uriForPath(AnimEidtorURI, filePath), {searchAllPanes: true,filePath:filePath});
}

export function deactivate(){
  console.log('deactivate');
}

export function serialize(){
  console.log('serialize')
}

export function toggle(){
  console.log('toggle')
}
