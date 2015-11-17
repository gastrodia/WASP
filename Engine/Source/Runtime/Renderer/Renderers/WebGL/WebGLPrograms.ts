import WebGLProgram = require('./WebGLProgram');
import PointLight = require('../../Lights/PointLight');
import SpotLight = require('../../Lights/SpotLight');
import DirectionalLight = require('../../Lights/DirectionalLight');
import SkinnedMesh = require('../../Objects/SkinnedMesh');
import HemisphereLight = require('../../Lights/HemisphereLight');
import ShadingSideType = require('../Const/ShadingSideType');
import ShadingType = require('../Const/ShadingType');
import FogExp2 = require('../../Scenes/FogExp2');
class WebGLPrograms{
  public programs = [];

  public shaderIDs = {
    MeshDepthMaterial: 'depth',
    MeshNormalMaterial: 'normal',
    MeshBasicMaterial: 'basic',
    MeshLambertMaterial: 'lambert',
    MeshPhongMaterial: 'phong',
    LineBasicMaterial: 'basic',
    LineDashedMaterial: 'dashed',
    PointsMaterial: 'points'
  };

  parameterNames = [
		"precision", "supportsVertexTextures", "map", "envMap", "envMapMode",
		"lightMap", "aoMap", "emissiveMap", "bumpMap", "normalMap", "displacementMap", "specularMap",
		"alphaMap", "combine", "vertexColors", "fog", "useFog", "fogExp",
		"flatShading", "sizeAttenuation", "logarithmicDepthBuffer", "skinning",
		"maxBones", "useVertexTexture", "morphTargets", "morphNormals",
		"maxMorphTargets", "maxMorphNormals", "maxDirLights", "maxPointLights",
		"maxSpotLights", "maxHemiLights", "maxShadows", "shadowMapEnabled", "pointLightShadows",
		"shadowMapType", "shadowMapDebug", "alphaTest", "metal", "doubleSided",
		"flipSided"
	];

  allocateBones ( object ) {

   if ( this.capabilities.floatVertexTextures && object && object.skeleton && object.skeleton.useVertexTexture ) {

     return 1024;

   } else {

     // default for when object is not specified
     // ( for example when prebuilding shader to be used with multiple objects )
     //
     //  - leave some extra space for other uniforms
     //  - limit here is ANGLE's 254 max uniform vectors
     //    (up to 54 should be safe)

     var nVertexUniforms = this.capabilities.maxVertexUniforms;
     var nVertexMatrices = Math.floor( ( nVertexUniforms - 20 ) / 4 );

     var maxBones = nVertexMatrices;

     if ( object !== undefined && object instanceof SkinnedMesh ) {

       maxBones = Math.min( object.skeleton.bones.length, maxBones );

       if ( maxBones < object.skeleton.bones.length ) {

         console.warn( 'WebGLRenderer: too many bones - ' + object.skeleton.bones.length + ', this GPU supports just ' + maxBones + ' (try OpenGL instead of ANGLE)' );

       }

     }

     return maxBones;

   }

 }

  constructor(public renderer, public capabilities ){

  }
  releaseProgram( program){
    if ( -- program.usedTimes === 0 ) {

    			// Remove from unordered set
    			var i = this.programs.indexOf( program );
    			this.programs[ i ] = this.programs[ this.programs.length - 1 ];
    			this.programs.pop();

    			// Free WebGL resources
    			program.destroy();

    		}

  }

  allocateLights( lights ) {

		var dirLights = 0;
		var pointLights = 0;
		var spotLights = 0;
		var hemiLights = 0;

		for ( var l = 0, ll = lights.length; l < ll; l ++ ) {

			var light = lights[ l ];

			if ( light.visible === false ) continue;

			if ( light instanceof DirectionalLight ) dirLights ++;
			if ( light instanceof PointLight ) pointLights ++;
			if ( light instanceof SpotLight ) spotLights ++;
			if ( light instanceof HemisphereLight ) hemiLights ++;

		}

		return { 'directional': dirLights, 'point': pointLights, 'spot': spotLights, 'hemi': hemiLights };

	}

	allocateShadows( lights ) {

		var maxShadows = 0;
		var pointLightShadows = 0;

		for ( var l = 0, ll = lights.length; l < ll; l ++ ) {

			var light = lights[ l ];

			if ( ! light.castShadow ) continue;

			if ( light instanceof SpotLight || light instanceof DirectionalLight ) maxShadows ++;
			if ( light instanceof PointLight ) {

				maxShadows ++;
				pointLightShadows ++;

			}

		}

		return { 'maxShadows': maxShadows, 'pointLightShadows': pointLightShadows };

	}

  getParameters(material, lights, fog, object):any{
    var shaderID = this.shaderIDs[ material.type ];
    		// heuristics to create shader parameters according to lights in the scene
    		// (not to blow over maxLights budget)

    		var maxLightCount = this.allocateLights( lights );
    		var allocatedShadows = this.allocateShadows( lights );
    		var maxBones = this.allocateBones( object );
    		var precision = this.renderer.getPrecision();

    		if ( material.precision !== null ) {

    			precision = this.capabilities.getMaxPrecision( material.precision );

    			if ( precision !== material.precision ) {

    				console.warn( 'THREE.WebGLRenderer.initMaterial:', material.precision, 'not supported, using', precision, 'instead.' );

    			}

    		}

    		var parameters = {

    			shaderID: shaderID,

    			precision: precision,
    			supportsVertexTextures: this.capabilities.vertexTextures,

    			map: !! material.map,
    			envMap: !! material.envMap,
    			envMapMode: material.envMap && material.envMap.mapping,
    			lightMap: !! material.lightMap,
    			aoMap: !! material.aoMap,
    			emissiveMap: !! material.emissiveMap,
    			bumpMap: !! material.bumpMap,
    			normalMap: !! material.normalMap,
    			displacementMap: !! material.displacementMap,
    			specularMap: !! material.specularMap,
    			alphaMap: !! material.alphaMap,

    			combine: material.combine,

    			vertexColors: material.vertexColors,

    			fog: fog,
    			useFog: material.fog,
    			fogExp: fog instanceof FogExp2,

    			flatShading: material.shading === ShadingType.FlatShading,

    			sizeAttenuation: material.sizeAttenuation,
    			logarithmicDepthBuffer: this.capabilities.logarithmicDepthBuffer,

    			skinning: material.skinning,
    			maxBones: maxBones,
    			useVertexTexture: this.capabilities.floatVertexTextures && object && object.skeleton && object.skeleton.useVertexTexture,

    			morphTargets: material.morphTargets,
    			morphNormals: material.morphNormals,
    			maxMorphTargets: this.renderer.maxMorphTargets,
    			maxMorphNormals: this.renderer.maxMorphNormals,

    			maxDirLights: maxLightCount.directional,
    			maxPointLights: maxLightCount.point,
    			maxSpotLights: maxLightCount.spot,
    			maxHemiLights: maxLightCount.hemi,

    			maxShadows: allocatedShadows.maxShadows,
    			pointLightShadows: allocatedShadows.pointLightShadows,
    			shadowMapEnabled: this.renderer.shadowMap.enabled && object.receiveShadow && allocatedShadows.maxShadows > 0,
    			shadowMapType: this.renderer.shadowMap.type,
    			shadowMapDebug: this.renderer.shadowMap.debug,

    			alphaTest: material.alphaTest,
    			metal: material.metal,
    			doubleSided: material.side === ShadingSideType.DoubleSide,
    			flipSided: material.side === ShadingSideType.BackSide

    		};

    		return parameters;
  }

  acquireProgram(material, parameters, code){
    var program;

    		// Check if code has been already compiled
    		for ( var p = 0, pl = this.programs.length; p < pl; p ++ ) {

    			var programInfo = this.programs[ p ];

    			if ( programInfo.code === code ) {

    				program = programInfo;
    				++ program.usedTimes;

    				break;

    			}

    		}

    		if ( program === undefined ) {

    			program = new WebGLProgram( this.renderer, code, material, parameters );
    			this.programs.push( program );

    		}

    		return program;
  }

  getProgramCode(material, parameters){
    var chunks = [];

  		if ( parameters.shaderID ) {

  			chunks.push( parameters.shaderID );

  		} else {

  			chunks.push( material.fragmentShader );
  			chunks.push( material.vertexShader );

  		}

  		if ( material.defines !== undefined ) {

  			for ( var name in material.defines ) {

  				chunks.push( name );
  				chunks.push( material.defines[ name ] );

  			}

  		}

  		for ( var i = 0; i < this.parameterNames.length; i ++ ) {

  			var parameterName = this.parameterNames[ i ];
  			chunks.push( parameterName );
  			chunks.push( parameters[ parameterName ] );

  		}

  		return chunks.join();
  }
}

export = WebGLPrograms;
