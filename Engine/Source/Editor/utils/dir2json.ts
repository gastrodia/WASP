import fs = require('fs');
import path = require('path');

var prefixString = 'bgm/effect/'

export function dir2json(dir,callback:(json)=>void){
  var json:any = {};
  fs.readdir(dir,(err,files)=>{
    for(var i in files){
      var file = files[i];
      json[path.basename(file).split('.')[0]] = prefixString + file;
    }
    callback(json);
  })
}

export function load(){

  atom.commands.add('.tree-view .directory', 'wasp-editor:dir2json', (e) => {

    var dir = e.target.dataset.path;
    dir2json(dir,(json)=>{
        var str = JSON.stringify(json,null,4);
        console.log(str);
    });

  });
}
