import Material = require('./Material');
import Color = require('../Math/Color');
import ColorsType = require('../Renderers/Const/ColorsType');
import ShadingType = require('../Renderers/Const/ShadingType');
import TextureOperation = require('../Renderers/Const/TextureOperation');
class MeshBasicMaterial extends Material{
  type = 'MeshBasicMaterial';
  color = new Color( 0xffffff );
  map = null;

	aoMap = null;
	aoMapIntensity = 1.0;

	specularMap = null;

	alphaMap = null;

	envMap = null;
	combine = TextureOperation.MultiplyOperation;
	reflectivity = 1;
	refractionRatio = 0.98;

	fog = true;

	shading = ShadingType.SmoothShading;

	wireframe = false;
	wireframeLinewidth = 1;
	wireframeLinecap = 'round';
	wireframeLinejoin = 'round';

  vertexColors = ColorsType.NoColors;

	skinning = false;
  morphTargets = false;
  constructor(parameters){
    super();
    this.setValues( parameters );
  }

  copy ( source ) {

	super.copy(source);

	this.color.copy( source.color );

	this.map = source.map;

	this.aoMap = source.aoMap;
	this.aoMapIntensity = source.aoMapIntensity;

	this.specularMap = source.specularMap;

	this.alphaMap = source.alphaMap;

	this.envMap = source.envMap;
	this.combine = source.combine;
	this.reflectivity = source.reflectivity;
	this.refractionRatio = source.refractionRatio;

	this.fog = source.fog;

	this.shading = source.shading;

	this.wireframe = source.wireframe;
	this.wireframeLinewidth = source.wireframeLinewidth;
	this.wireframeLinecap = source.wireframeLinecap;
	this.wireframeLinejoin = source.wireframeLinejoin;

	this.vertexColors = source.vertexColors;

	this.skinning = source.skinning;
	this.morphTargets = source.morphTargets;

	return this;

};
}

export = MeshBasicMaterial;
