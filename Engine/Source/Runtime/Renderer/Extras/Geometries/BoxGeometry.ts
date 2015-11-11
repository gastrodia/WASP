import Geometry = require('../../Core/Geometry');
class BoxGeometry extends Geometry{
  constructor( width, height, depth, widthSegments?:any, heightSegments?:any, depthSegments?:any ){
    super();
  }
}

export = BoxGeometry;
