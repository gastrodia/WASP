import MathUtil = require('../Math/MathUtil');
import ShadingSideType = require('../Renderers/Const/ShadingSideType');
import BlendingMode = require('../Renderers/Const/BlendingMode');
import BlendingFactor = require('../Renderers/Const/BlendingFactor');
import BlendEquation = require('../Renderers/Const/BlendEquation');
import DepthMode = require('../Renderers/Const/DepthMode');

import Color = require('../Math/Color');
import Texture = require('../Textures/Texture');
import Vector3 = require('../Math/Vector3');
import ShadingType = require('../Renderers/Const/ShadingType');
import ColorsType = require('../Renderers/Const/ColorsType');

import EventDispatcher = require('../Core/EventDispatcher');

class Material extends EventDispatcher{
  static IdCount = 0;
  uuid = MathUtil.generateUUID();
  name = '';
  type = 'Material';
  side = ShadingSideType.FrontSide;

  opacity = 1;
  transparent = false;

  blending = BlendingMode.NormalBlending;

  blendSrc = BlendingFactor.SrcAlphaFactor;
  blendDst = BlendingFactor.OneMinusSrcAlphaFactor;
  blendEquation = BlendEquation.AddEquation;
  blendSrcAlpha = null;
  blendDstAlpha = null;
  blendEquationAlpha = null;

  depthFunc = DepthMode.LessEqualDepth;
  depthTest = true;
  depthWrite = true;

  colorWrite = true;
  precision = null;

  polygonOffset = false;
  polygonOffsetFactor = 0;
  polygonOffsetUnits = 0;

  alphaTest = 0;
  overdraw = 0;
  visible = true;
  _needsUpdate = true;

  color ;


  get needsUpdate():boolean {

		return this._needsUpdate;

	}

	set needsUpdate ( value ) {

		if ( value === true ) this.update();

		this._needsUpdate = value;

	}

	setValues( values ) {

		if ( values === undefined ) return;

		for ( var key in values ) {

			var newValue = values[ key ];

			if ( newValue === undefined ) {

				console.warn( "THREE.Material: '" + key + "' parameter is undefined." );
				continue;

			}

			var currentValue = this[ key ];

			if ( currentValue === undefined ) {

				console.warn( "THREE." + this.type + ": '" + key + "' is not a property of this material." );
				continue;

			}

			if ( currentValue instanceof Color ) {

				currentValue.set( newValue );

			} else if ( currentValue instanceof Vector3 && newValue instanceof Vector3 ) {

				currentValue.copy( newValue );

			} else if ( key === 'overdraw' ) {

				// ensure overdraw is backwards-compatible with legacy boolean type
				this[ key ] = Number( newValue );

			} else {

				this[ key ] = newValue;

			}

		}

	}


  emissive;
  specular;
  shininess;
  map;
  alphaMap;
  lightMap;
  bumpMap;
  bumpScale;
  normalMap;
  normalScale;
  displacementMap;
  displacementScale;
  displacementBias;
  specularMap;
  envMap;
  reflectivity;

	toJSON( meta ) {

		var data:any = {
			metadata: {
				version: 4.4,
				type: 'Material',
				generator: 'Material.toJSON'
			}
		};

		// standard Material serialization
		data.uuid = this.uuid;
		data.type = this.type;
		if ( this.name !== '' ) data.name = this.name;

		if ( this.color instanceof Color ) data.color = this.color.getHex();
		if ( this.emissive instanceof Color ) data.emissive = this.emissive.getHex();
		if ( this.specular instanceof Color ) data.specular = this.specular.getHex();
		if ( this.shininess !== undefined ) data.shininess = this.shininess;

		if ( this.map instanceof Texture ) data.map = this.map.toJSON( meta ).uuid;
		if ( this.alphaMap instanceof Texture ) data.alphaMap = this.alphaMap.toJSON( meta ).uuid;
		if ( this.lightMap instanceof Texture ) data.lightMap = this.lightMap.toJSON( meta ).uuid;
		if ( this.bumpMap instanceof Texture ) {

			data.bumpMap = this.bumpMap.toJSON( meta ).uuid;
			data.bumpScale = this.bumpScale;

		}
		if ( this.normalMap instanceof Texture ) {

			data.normalMap = this.normalMap.toJSON( meta ).uuid;
			data.normalScale = this.normalScale; // Removed for now, causes issue in editor ui.js

		}
		if ( this.displacementMap instanceof Texture ) {

			data.displacementMap = this.displacementMap.toJSON( meta ).uuid;
			data.displacementScale = this.displacementScale;
			data.displacementBias = this.displacementBias;

		}
		if ( this.specularMap instanceof Texture ) data.specularMap = this.specularMap.toJSON( meta ).uuid;
		if ( this.envMap instanceof Texture ) {

			data.envMap = this.envMap.toJSON( meta ).uuid;
			data.reflectivity = this.reflectivity; // Scale behind envMap

		}

		if ( this.size !== undefined ) data.size = this.size;
		if ( this.sizeAttenuation !== undefined ) data.sizeAttenuation = this.sizeAttenuation;

		if ( this.vertexColors !== undefined && this.vertexColors !== ColorsType.NoColors ) data.vertexColors = this.vertexColors;
		if ( this.shading !== undefined && this.shading !== ShadingType.SmoothShading ) data.shading = this.shading;
		if ( this.blending !== undefined && this.blending !== BlendingMode.NormalBlending ) data.blending = this.blending;
		if ( this.side !== undefined && this.side !== ShadingSideType.FrontSide ) data.side = this.side;

		if ( this.opacity < 1 ) data.opacity = this.opacity;
		if ( this.transparent === true ) data.transparent = this.transparent;
		if ( this.alphaTest > 0 ) data.alphaTest = this.alphaTest;
		if ( this.wireframe === true ) data.wireframe = this.wireframe;
		if ( this.wireframeLinewidth > 1 ) data.wireframeLinewidth = this.wireframeLinewidth;

		return data;

	}
  size;
  sizeAttenuation;
  vertexColors;
  shading;
  wireframe;
  wireframeLinewidth;

	clone() {

	}

	copy( source ) {

		this.name = source.name;

		this.side = source.side;

		this.opacity = source.opacity;
		this.transparent = source.transparent;

		this.blending = source.blending;

		this.blendSrc = source.blendSrc;
		this.blendDst = source.blendDst;
		this.blendEquation = source.blendEquation;
		this.blendSrcAlpha = source.blendSrcAlpha;
		this.blendDstAlpha = source.blendDstAlpha;
		this.blendEquationAlpha = source.blendEquationAlpha;

		this.depthFunc = source.depthFunc;
		this.depthTest = source.depthTest;
		this.depthWrite = source.depthWrite;

		this.precision = source.precision;

		this.polygonOffset = source.polygonOffset;
		this.polygonOffsetFactor = source.polygonOffsetFactor;
		this.polygonOffsetUnits = source.polygonOffsetUnits;

		this.alphaTest = source.alphaTest;

		this.overdraw = source.overdraw;

		this.visible = source.visible;

		return this;

	}

	update() {

		this.dispatchEvent( { type: 'update' } );

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}







}

export = Material;
