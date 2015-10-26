import MathUitl = require('../Math/MathUtil');
import Channels = require('./Channels');
var Object3DIdCount = 0;

class Object3D{
  id:number = Object3DIdCount ++;
  uuid:string = MathUitl.generateUUID();
  name = '';
  type = 'Object3D';
  parent = null;
  channels = new Channels();

  constructor(){

  }

  lookAt(){

  }
}

export = Object3D;
