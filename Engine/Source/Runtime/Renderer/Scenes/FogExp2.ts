import Color = require('../Math/Color');
class FogExp2{
  name;
  color;
  density;
  constructor ( color, density ){
    this.name = '';

	this.color = new Color( color );
	this.density = ( density !== undefined ) ? density : 0.00025;
  }

  clone = function () {

	return new FogExp2( this.color.getHex(), this.density );

}
}

export = FogExp2;
