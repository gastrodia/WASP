import Object3D = require('../Core/Object3D')
class Scene extends Object3D{
  type = 'Scene';
  fog = null;
  overrideMaterial = null;
  autoUpdate = true;

  copy(source, recursive ):Scene{

    	super.copy( this, source );

    	if ( source.fog !== null ) this.fog = source.fog.clone();
    	if ( source.overrideMaterial !== null ) this.overrideMaterial = source.overrideMaterial.clone();

    	this.autoUpdate = source.autoUpdate;
    	this.matrixAutoUpdate = source.matrixAutoUpdate;

    	return this;
  }
}

export = Scene;
