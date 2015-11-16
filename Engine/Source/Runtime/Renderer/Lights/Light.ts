import Object3D = require('../Core/Object3D');
import Color = require('../Math/Color');
class Light extends Object3D{
  type = 'Light';
  color:Color;
  receiveShadow = undefined;

  shadow;

  constructor(color){
    super();
    this.color = new Color(color);
  }

  set shadowCameraFov(value){
    this.shadow.camera.fov = value;
  }

  set shadowCameraLeft(value){
    this.shadow.camera.left = value;
  }

  set shadowCameraRight(value){
      this.shadow.camera.right = value;
  }

  set shadowCameraTop(value){
    this.shadow.camera.top = value;
  }

  set shadowCameraBottom(value){
    this.shadow.camera.bottom = value;
  }

  set shadowCameraNear(value){
    this.shadow.camera.near = value;
  }

  set shadowCameraFar(value){
    this.shadow.camera.far = value;
  }

  set shadowBias(value){
    this.shadow.bias = value;
  }

  set shadowDarkness(value){
    this.shadow.darkness = value;
  }

  set shadowMapWidth(value){
    this.shadow.mapSize.width = value;
  }

  set shadowMapHeight(value){
    this.shadow.mapSize.height = value;
  }

  copy(source){
    super.copy(source);
    this.color.copy(source.color);
    return this;
  }

  toJson(meta){
    var data = Object3D.prototype.toJSON.call( this, meta );
    
  	data.object.color = this.color.getHex();
  	if ( this.groundColor !== undefined ) data.object.groundColor = this.groundColor.getHex();

  	if ( this.intensity !== undefined ) data.object.intensity = this.intensity;
  	if ( this.distance !== undefined ) data.object.distance = this.distance;
  	if ( this.angle !== undefined ) data.object.angle = this.angle;
  	if ( this.decay !== undefined ) data.object.decay = this.decay;
  	if ( this.exponent !== undefined ) data.object.exponent = this.exponent;

  	return data;
  }

  groundColor:Color = undefined;
  intensity;
  distance;
  angle;
  decay;
  exponent;

}

export = Light;
