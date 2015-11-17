import Material = require('./Material');
import ShadingType = require('../Renderers/Const/ShadingType');
import ColorsType = require('../Renderers/Const/ColorsType');
import UniformsUtils = require('../Renderers/Shaders/UniformsUtils');
class ShaderMaterial extends Material{
      defines ;
      uniforms;
      vertexShader;
      fragmentShader;
      linewidth;
      fog;
      lights;
      skinning;
      morphTargets;
      morphNormals ;
      derivatives;
      defaultAttributeValues;
      index0AttributeName;

      attributes;
  constructor( parameters){
    super();


    this.type = 'ShaderMaterial';

  	this.defines = {};
  	this.uniforms = {};

  	this.vertexShader = 'void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}';
  	this.fragmentShader = 'void main() {\n\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}';

  	this.shading = ShadingType.SmoothShading;

  	this.linewidth = 1;

  	this.wireframe = false;
  	this.wireframeLinewidth = 1;

  	this.fog = false; // set to use scene fog

  	this.lights = false; // set to use scene lights

  	this.vertexColors = ColorsType.NoColors; // set to use "color" attribute stream

  	this.skinning = false; // set to use skinning attribute streams

  	this.morphTargets = false; // set to use morph targets
  	this.morphNormals = false; // set to use morph normals

  	this.derivatives = false; // set to use derivatives

  	// When rendered geometry doesn't include these attributes but the material does,
  	// use these default values in WebGL. This avoids errors when buffer data is missing.
  	this.defaultAttributeValues = {
  		'color': [ 1, 1, 1 ],
  		'uv': [ 0, 0 ],
  		'uv2': [ 0, 0 ]
  	};

  	this.index0AttributeName = undefined;

  	if ( parameters !== undefined ) {

  		if ( parameters.attributes !== undefined ) {

  			console.error( 'THREE.ShaderMaterial: attributes should now be defined in THREE.BufferGeometry instead.' );

  		}

  		this.setValues( parameters );

  	}
  }


  copy( source ) {

	super.copy( source );

	this.fragmentShader = source.fragmentShader;
	this.vertexShader = source.vertexShader;

	this.uniforms = UniformsUtils.clone( source.uniforms );

	this.attributes = source.attributes;
	this.defines = source.defines;

	this.shading = source.shading;

	this.wireframe = source.wireframe;
	this.wireframeLinewidth = source.wireframeLinewidth;

	this.fog = source.fog;

	this.lights = source.lights;

	this.vertexColors = source.vertexColors;

	this.skinning = source.skinning;

	this.morphTargets = source.morphTargets;
	this.morphNormals = source.morphNormals;

	this.derivatives = source.derivatives;

	return this;

};
 
toJSON( meta ) {

	var data = super.toJSON( meta );

	data.uniforms = this.uniforms;
	data.attributes = this.attributes;
	data.vertexShader = this.vertexShader;
	data.fragmentShader = this.fragmentShader;

	return data;

};
}

export = ShaderMaterial;
