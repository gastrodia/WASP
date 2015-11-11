import {$} from "atom-space-pen-views";
import url = require('url');
import {AnimEditorView,AnimEidtorURI} from './Modules/AnimEditor/AnimEditorView';
import {UIEditorView,UIEidtorURI} from './Modules/UIEditor/UIEditorView';
import atomUtils = require("./atom/atomUtils");
export interface PackageState {
}

export function activate(state: PackageState) {

    atom.commands.add('.tree-view .file .name[data-name$=\\.json]', 'wasp-editor:openfile', (e) => {
      this.openfile(e);
    });

    atom.commands.add('.tree-view .file .name[data-name$=\\.ExportJson]', 'wasp-editor:openfile', (e) => {
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

    atom.commands.add('.tree-view .file .name[data-name$=\\.json]', 'wasp-editor:uieditor', (e) => {
      this.openUIFile(e);
    });


    atomUtils.registerOpener({
        commandSelector: 'atom-workspace',
        commandName: 'wasp:ui-editor',
        uriProtocol: UIEidtorURI,
        onOpen: (data) => {
            return new UIEditorView(data.filePath);
        }
    });
}

export function openUIFile(e){
  var filePath = e.target.dataset.path;
  atom.workspace.open(atomUtils.uriForPath(UIEidtorURI, filePath), {searchAllPanes: true,filePath:filePath});
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
