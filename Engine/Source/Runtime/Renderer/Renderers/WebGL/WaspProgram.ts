import ShadowMapType = require('../Const/ShadowMapType');
import MappingMode = require('../Const/MappingMode');
import TextureOperation = require('../Const/TextureOperation');
import RawShaderMaterial = require('../../Materials/RawShaderMaterial');
import WaspShader = require('./WaspShader');

class WaspProgram{
	static programIdCount = 0;
	cachedAttributes;

	gl;
	diagnostics;
	cachedUniforms;

	id:number;
	usedTimes:number;
	program;
	vertexShader;
	fragmentShader;


	constructor(private renderer, private code, private material, private parameters){
		var gl = renderer.context;
		this.gl = gl;

		var defines = material.defines;

		var vertexShader = material.__webglShader.vertexShader;
		var fragmentShader = material.__webglShader.fragmentShader;

		var shadowMapTypeDefine = 'SHADOWMAP_TYPE_BASIC';

		if ( parameters.shadowMapType === ShadowMapType.PCFShadowMap ) {

			shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF';

		} else if ( parameters.shadowMapType === ShadowMapType.PCFSoftShadowMap ) {

			shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF_SOFT';

		}

		var envMapTypeDefine = 'ENVMAP_TYPE_CUBE';
		var envMapModeDefine = 'ENVMAP_MODE_REFLECTION';
		var envMapBlendingDefine = 'ENVMAP_BLENDING_MULTIPLY';

		if ( parameters.envMap ) {

			switch ( material.envMap.mapping ) {

				case MappingMode.CubeReflectionMapping:
				case MappingMode.CubeRefractionMapping:
					envMapTypeDefine = 'ENVMAP_TYPE_CUBE';
					break;

				case MappingMode.EquirectangularReflectionMapping:
				case MappingMode.EquirectangularRefractionMapping:
					envMapTypeDefine = 'ENVMAP_TYPE_EQUIREC';
					break;

				case MappingMode.SphericalReflectionMapping:
					envMapTypeDefine = 'ENVMAP_TYPE_SPHERE';
					break;

			}

			switch ( material.envMap.mapping ) {

				case MappingMode.CubeRefractionMapping:
				case MappingMode.EquirectangularRefractionMapping:
					envMapModeDefine = 'ENVMAP_MODE_REFRACTION';
					break;

			}

			switch ( material.combine ) {

				case TextureOperation.MultiplyOperation:
					envMapBlendingDefine = 'ENVMAP_BLENDING_MULTIPLY';
					break;

				case TextureOperation.MixOperation:
					envMapBlendingDefine = 'ENVMAP_BLENDING_MIX';
					break;

				case TextureOperation.AddOperation:
					envMapBlendingDefine = 'ENVMAP_BLENDING_ADD';
					break;

			}

		}

		var gammaFactorDefine = ( renderer.gammaFactor > 0 ) ? renderer.gammaFactor : 1.0;

		// console.log( 'building new program ' );

		//

		var customDefines = this.generateDefines( defines );

		//

		var program = gl.createProgram();

		var prefixVertex, prefixFragment;

		if ( material instanceof RawShaderMaterial ) {

			prefixVertex = '';
			prefixFragment = '';

		} else {

			prefixVertex = [

				'precision ' + parameters.precision + ' float;',
				'precision ' + parameters.precision + ' int;',

				'#define SHADER_NAME ' + material.__webglShader.name,

				customDefines,

				parameters.supportsVertexTextures ? '#define VERTEX_TEXTURES' : '',

				renderer.gammaInput ? '#define GAMMA_INPUT' : '',
				renderer.gammaOutput ? '#define GAMMA_OUTPUT' : '',
				'#define GAMMA_FACTOR ' + gammaFactorDefine,

				'#define MAX_DIR_LIGHTS ' + parameters.maxDirLights,
				'#define MAX_POINT_LIGHTS ' + parameters.maxPointLights,
				'#define MAX_SPOT_LIGHTS ' + parameters.maxSpotLights,
				'#define MAX_HEMI_LIGHTS ' + parameters.maxHemiLights,

				'#define MAX_SHADOWS ' + parameters.maxShadows,

				'#define MAX_BONES ' + parameters.maxBones,

				parameters.map ? '#define USE_MAP' : '',
				parameters.envMap ? '#define USE_ENVMAP' : '',
				parameters.envMap ? '#define ' + envMapModeDefine : '',
				parameters.lightMap ? '#define USE_LIGHTMAP' : '',
				parameters.aoMap ? '#define USE_AOMAP' : '',
				parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '',
				parameters.bumpMap ? '#define USE_BUMPMAP' : '',
				parameters.normalMap ? '#define USE_NORMALMAP' : '',
				parameters.displacementMap && parameters.supportsVertexTextures ? '#define USE_DISPLACEMENTMAP' : '',
				parameters.specularMap ? '#define USE_SPECULARMAP' : '',
				parameters.alphaMap ? '#define USE_ALPHAMAP' : '',
				parameters.vertexColors ? '#define USE_COLOR' : '',

				parameters.flatShading ? '#define FLAT_SHADED' : '',

				parameters.skinning ? '#define USE_SKINNING' : '',
				parameters.useVertexTexture ? '#define BONE_TEXTURE' : '',

				parameters.morphTargets ? '#define USE_MORPHTARGETS' : '',
				parameters.morphNormals && parameters.flatShading === false ? '#define USE_MORPHNORMALS' : '',
				parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
				parameters.flipSided ? '#define FLIP_SIDED' : '',

				parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
				parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '',
				parameters.shadowMapDebug ? '#define SHADOWMAP_DEBUG' : '',
				parameters.pointLightShadows > 0 ? '#define POINT_LIGHT_SHADOWS' : '',

				parameters.sizeAttenuation ? '#define USE_SIZEATTENUATION' : '',

				parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
				parameters.logarithmicDepthBuffer && renderer.extensions.get( 'EXT_frag_depth' ) ? '#define USE_LOGDEPTHBUF_EXT' : '',


				'uniform mat4 modelMatrix;',
				'uniform mat4 modelViewMatrix;',
				'uniform mat4 projectionMatrix;',
				'uniform mat4 viewMatrix;',
				'uniform mat3 normalMatrix;',
				'uniform vec3 cameraPosition;',

				'attribute vec3 position;',
				'attribute vec3 normal;',
				'attribute vec2 uv;',

				'#ifdef USE_COLOR',

				'	attribute vec3 color;',

				'#endif',

				'#ifdef USE_MORPHTARGETS',

				'	attribute vec3 morphTarget0;',
				'	attribute vec3 morphTarget1;',
				'	attribute vec3 morphTarget2;',
				'	attribute vec3 morphTarget3;',

				'	#ifdef USE_MORPHNORMALS',

				'		attribute vec3 morphNormal0;',
				'		attribute vec3 morphNormal1;',
				'		attribute vec3 morphNormal2;',
				'		attribute vec3 morphNormal3;',

				'	#else',

				'		attribute vec3 morphTarget4;',
				'		attribute vec3 morphTarget5;',
				'		attribute vec3 morphTarget6;',
				'		attribute vec3 morphTarget7;',

				'	#endif',

				'#endif',

				'#ifdef USE_SKINNING',

				'	attribute vec4 skinIndex;',
				'	attribute vec4 skinWeight;',

				'#endif',

				'\n'

			].filter( this.filterEmptyLine ).join( '\n' );

			prefixFragment = [

				parameters.bumpMap || parameters.normalMap || parameters.flatShading || material.derivatives ? '#extension GL_OES_standard_derivatives : enable' : '',
				parameters.logarithmicDepthBuffer && renderer.extensions.get( 'EXT_frag_depth' ) ? '#extension GL_EXT_frag_depth : enable' : '',

				'precision ' + parameters.precision + ' float;',
				'precision ' + parameters.precision + ' int;',

				'#define SHADER_NAME ' + material.__webglShader.name,

				customDefines,

				'#define MAX_DIR_LIGHTS ' + parameters.maxDirLights,
				'#define MAX_POINT_LIGHTS ' + parameters.maxPointLights,
				'#define MAX_SPOT_LIGHTS ' + parameters.maxSpotLights,
				'#define MAX_HEMI_LIGHTS ' + parameters.maxHemiLights,

				'#define MAX_SHADOWS ' + parameters.maxShadows,

				parameters.alphaTest ? '#define ALPHATEST ' + parameters.alphaTest : '',

				renderer.gammaInput ? '#define GAMMA_INPUT' : '',
				renderer.gammaOutput ? '#define GAMMA_OUTPUT' : '',
				'#define GAMMA_FACTOR ' + gammaFactorDefine,

				( parameters.useFog && parameters.fog ) ? '#define USE_FOG' : '',
				( parameters.useFog && parameters.fogExp ) ? '#define FOG_EXP2' : '',

				parameters.map ? '#define USE_MAP' : '',
				parameters.envMap ? '#define USE_ENVMAP' : '',
				parameters.envMap ? '#define ' + envMapTypeDefine : '',
				parameters.envMap ? '#define ' + envMapModeDefine : '',
				parameters.envMap ? '#define ' + envMapBlendingDefine : '',
				parameters.lightMap ? '#define USE_LIGHTMAP' : '',
				parameters.aoMap ? '#define USE_AOMAP' : '',
				parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '',
				parameters.bumpMap ? '#define USE_BUMPMAP' : '',
				parameters.normalMap ? '#define USE_NORMALMAP' : '',
				parameters.specularMap ? '#define USE_SPECULARMAP' : '',
				parameters.alphaMap ? '#define USE_ALPHAMAP' : '',
				parameters.vertexColors ? '#define USE_COLOR' : '',

				parameters.flatShading ? '#define FLAT_SHADED' : '',

				parameters.metal ? '#define METAL' : '',
				parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
				parameters.flipSided ? '#define FLIP_SIDED' : '',

				parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
				parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '',
				parameters.shadowMapDebug ? '#define SHADOWMAP_DEBUG' : '',
				parameters.pointLightShadows > 0 ? '#define POINT_LIGHT_SHADOWS' : '',

				parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
				parameters.logarithmicDepthBuffer && renderer.extensions.get( 'EXT_frag_depth' ) ? '#define USE_LOGDEPTHBUF_EXT' : '',

				'uniform mat4 viewMatrix;',
				'uniform vec3 cameraPosition;',

				'\n'

			].filter( this.filterEmptyLine ).join( '\n' );

		}

		var vertexGlsl = prefixVertex + vertexShader;
		var fragmentGlsl = prefixFragment + fragmentShader;

		var glVertexShader = new WaspShader( gl, gl.VERTEX_SHADER, vertexGlsl );
		var glFragmentShader = new WaspShader( gl, gl.FRAGMENT_SHADER, fragmentGlsl );

		gl.attachShader( program, glVertexShader );
		gl.attachShader( program, glFragmentShader );

		// Force a particular attribute to index 0.

		if ( material.index0AttributeName !== undefined ) {

			gl.bindAttribLocation( program, 0, material.index0AttributeName );

		} else if ( parameters.morphTargets === true ) {

			// programs with morphTargets displace position out of attribute 0
			gl.bindAttribLocation( program, 0, 'position' );

		}

		gl.linkProgram( program );

		var programLog = gl.getProgramInfoLog( program );
		var vertexLog = gl.getShaderInfoLog( glVertexShader );
		var fragmentLog = gl.getShaderInfoLog( glFragmentShader );

		var runnable = true;
		var haveDiagnostics = true;

		if ( gl.getProgramParameter( program, gl.LINK_STATUS ) === false ) {

			runnable = false;

			console.error( 'THREE.WebGLProgram: shader error: ', gl.getError(), 'gl.VALIDATE_STATUS', gl.getProgramParameter( program, gl.VALIDATE_STATUS ), 'gl.getProgramInfoLog', programLog, vertexLog, fragmentLog );

		} else if ( programLog !== '' ) {

			console.warn( 'THREE.WebGLProgram: gl.getProgramInfoLog()', programLog );

		} else if ( vertexLog === '' || fragmentLog === '' ) {

			haveDiagnostics = false;

		}

		if ( haveDiagnostics ) {

			this.diagnostics = {

				runnable: runnable,
				material: material,

				programLog: programLog,

				vertexShader: {

					log: vertexLog,
					prefix: prefixVertex

				},

				fragmentShader: {

					log: fragmentLog,
					prefix: prefixFragment

				}

			};

		}

		// clean up

		gl.deleteShader( glVertexShader );
		gl.deleteShader( glFragmentShader );

		// set up caching for uniform locations

		var cachedUniforms;
		this.id = WaspProgram.programIdCount ++;
		this.code = code;
		this.usedTimes = 1;
		this.program = program;
		this.vertexShader = glVertexShader;
		this.fragmentShader = glFragmentShader;

		return this;
	}



	generateDefines( defines ) {

		var chunks = [];

		for ( var name in defines ) {

			var value = defines[ name ];

			if ( value === false ) continue;

			chunks.push( '#define ' + name + ' ' + value );

		}

		return chunks.join( '\n' );

	}

	fetchUniformLocations( gl, program, identifiers?:any ) {

		var uniforms = {};

		var n = gl.getProgramParameter( program, gl.ACTIVE_UNIFORMS );

		for ( var i = 0; i < n; i ++ ) {

			var info = gl.getActiveUniform( program, i );
			var name = info.name;
			var location = gl.getUniformLocation( program, name );

			// console.log("THREE.WebGLProgram: ACTIVE UNIFORM:", name);

			var suffixPos = name.lastIndexOf( '[0]' );
			if ( suffixPos !== - 1 && suffixPos === name.length - 3 ) {

				uniforms[ name.substr( 0, suffixPos ) ] = location;

			}

			uniforms[ name ] = location;

		}

		return uniforms;

	}

	fetchAttributeLocations( gl, program, identifiers?:any ) {

		var attributes = {};

		var n = gl.getProgramParameter( program, gl.ACTIVE_ATTRIBUTES );

		for ( var i = 0; i < n; i ++ ) {

			var info = gl.getActiveAttrib( program, i );
			var name = info.name;

			// console.log("THREE.WebGLProgram: ACTIVE VERTEX ATTRIBUTE:", name, i );

			attributes[ name ] = gl.getAttribLocation( program, name );

		}

		return attributes;

	}

	filterEmptyLine( string ) {

		return string !== '';

	}

	getUniforms() {

		if ( this.cachedUniforms === undefined ) {

			this.cachedUniforms = this.fetchUniformLocations( this.gl, this.program );

		}

		return this.cachedUniforms;

	}

	getAttributes() {

		if ( this.cachedAttributes === undefined ) {

			this.cachedAttributes = this.fetchAttributeLocations( this.gl, this.program );

		}

		return this.cachedAttributes;

	};

	destroy() {

		this.gl.deleteProgram( this.program );
		this.program = undefined;

	}

}


export = WaspProgram;
