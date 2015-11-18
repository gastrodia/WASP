import Geometry = require('./Geometry');
class DirectGeometry extends Geometry{
  id:number = Geometry.IdCount ++;
  fromGeometry(geometry){

  }
}

export = DirectGeometry;
