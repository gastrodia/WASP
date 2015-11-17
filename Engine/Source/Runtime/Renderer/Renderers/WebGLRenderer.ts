import Color = require('../Math/Color');
import Frustum = require('../Math/Frustum');
import Martix4 = require('../Math/Matrix4');
import Vector3 = require('../Math/Vector3');
import WebGLExtensions = require('./WebGL/WebGLExtensions');
import WebGLCapabilities = require('./WebGL/WebGLCapabilities');
import BufferGeometry = require('../Core/BufferGeometry');
import WebGLState = require('./WebGL/WebGLState');
import WebGLProperties = require('./WebGL/WebGLProperties');
import WebGLObjects = require('./WebGL/WebGLObjects');
import WebGLPrograms = require('./WebGL/WebGLPrograms');
import WebGLBufferRenderer = require('./WebGL/WebGLBufferRenderer');
import WebGLIndexedBufferRenderer = require('./WebGL/WebGLIndexedBufferRenderer');
import WebGLShadowMap = require('./WebGL/WebGLShadowMap');
import LensFlarePlugin = require('./WebGL/Plugins/LensFlarePlugin');
import SpritePlugin = require('./WebGL/Plugins/SpritePlugin');
import WebGLRenderTargetCube = require('./WebGLRenderTargetCube');
import MathUtil = require('../Math/MathUtil');
import Camera = require('../Cameras/Camera');

import Light = require('../Lights/Light');
import Sprite = require('../Objects/Sprite');
import LensFlare = require('../Objects/LensFlare');
import ImmediateRenderObject = require('../Objects/ImmediateRenderObject');
import Mesh = require('../Objects/Mesh');
import Line = require('../Objects/Line');
import Points = require('../Objects/Points');
import SkinnedMesh = require('../Objects/SkinnedMesh');
import MeshFaceMaterial = require('../Materials/MeshFaceMaterial');

import BlendingMode = require('./Const/BlendingMode');
import Scene = require('../Scenes/Scene');
import ShadingSideType = require('./Const/ShadingSideType');

var THREE:any;
class WebGLRenderer{

  private _canvas;
  private _context;
  private _width;
  private _height;
  private pixelRatio = 1;
  private _alpha;
  private _depth;
  private _stencil;
  private _antialias;
  private _premultipliedAlpha;
  private _preserveDrawingBuffer;
  private _clearColor:Color = new Color(0x000000);
  private _clearAlpha = 0;

  private lights = [];
  private opaqueObjects = [];
  private opaqueObjectsLastIndex = -1;
  private transparentObjects = [];
  private transparentObjectsLastIndex = -1;

  private morphInfluence = new Float32Array(8);

  private sprites = [];
  private lensFlares = [];

  public domElement = this._canvas;
  public context = null;

  //clearing
  private autoClear = true;
  private autoClearColor = true;
  private autoClearDepth = true;
  private autoClearStencil = true;

  //scene graph
  private sortObjects = true;

  //physically based shading
  private gammaFactor = 2.0;
  private gammaInput = false;
  private gammaOutput = false;

  //morphs
  private maxMorphTargets = 8;
  private maxMorphNormals = 4;

  //flags
  private autoScaleCubemaps = true;

  //internal
  private _currentProgram = null;
  private _currentFramebuffer = null;
  private _currentMaterialId = -1;
  private _currentGeometryProgram = '';
  private _currentCamera = null;

  private _usedTextureUnits = 0;
  private _viewportWidth :number;
  private _viewportHeight :number;
  private _viewportX = 0;
  private _viewportY = 0;

  private _currentWidth = 0;
  private _currentHeight = 0;

  //frustum
  private _frustum = new Frustum();

  //camera matrices cache
  private _projScreenMatrix = new Martix4();
  private _vector3 = new Vector3();

  //lights array cache
  private _direction = new Vector3();
  private _lightsNeedUpdate = true;

  private morphInfluences = new Float32Array( 8 );

  private bufferRenderer = new WebGLBufferRenderer( this._gl, this.extensions, this._infoRender );
	private indexedBufferRenderer = new WebGLIndexedBufferRenderer( this._gl, this.extensions, this._infoRender );

  private _lights = {
    ambient:[0,0,0],
    directional:{length:0,color:[],positions:[]},
    point:{length:0,colors:[],positions:[],distances:[],decays:{}},
    spot:{length:0,colors:[],positions:[],distances:{},directions:{},anglesCos: [], exponents: [], decays: [] },
    hemi:{length: 0, skyColors: [], groundColors: [], positions: [] }
  }

  private _infoMemory = {
    geometries: 0,
    textures: 0
  }

  private _infoRender = {
    calls: 0,
		vertices: 0,
		faces: 0,
		points: 0
  }

  private info = {
    render: this._infoRender,
		memory: this._infoMemory,
		programs: null
  }

  private _gl:WebGLRenderingContext;
  private state:WebGLState;
  constructor(parameters?:any){
    parameters = parameters || {};
    this._canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElement( 'canvas' );
     this._context = parameters.context !== undefined ? parameters.context : null;

     this._width = this._canvas.width;
    this._height = this._canvas.height;

    this.domElement = this._canvas;
    try{
      var attributes = {
			alpha: this._alpha,
			depth: this._depth,
			stencil: this._stencil,
			antialias: this._antialias,
			premultipliedAlpha: this._premultipliedAlpha,
			preserveDrawingBuffer: this._preserveDrawingBuffer
		};

    this._viewportWidth = this._canvas.width;
    this._viewportHeight = this._canvas.height;

		this._gl = this._context || this._canvas.getContext( 'webgl', attributes )
     || this._canvas.getContext( 'experimental-webgl', attributes );

		if ( this._gl === null ) {

			if ( this._canvas.getContext( 'webgl' ) !== null ) {

				throw 'Error creating WebGL context with your selected attributes.';

			} else {

				throw 'Error creating WebGL context.';

			}

		}

		this._canvas.addEventListener( 'webglcontextlost', this.onContextLost, false );
    }catch(error){
      console.log('webglcontextlost')
    }

    var extensions = new WebGLExtensions(this._gl);
    extensions.get( 'OES_texture_float' );
  	extensions.get( 'OES_texture_float_linear' );
  	extensions.get( 'OES_texture_half_float' );
  	extensions.get( 'OES_texture_half_float_linear' );
  	extensions.get( 'OES_standard_derivatives' );
  	extensions.get( 'ANGLE_instanced_arrays' );


	if ( extensions.get( 'OES_element_index_uint' ) ) {

	   BufferGeometry.MaxIndex = 4294967296;

	}

	var capabilities = new WebGLCapabilities( this._gl, extensions, parameters );

	this.state = new WebGLState( this._gl, extensions, this.paramThreeToGL );
	var properties = new WebGLProperties();
  this.properties = properties;
	var objects = new WebGLObjects( this._gl, properties, this.info );
  this.objects = objects;
	var programCache = new WebGLPrograms( this, capabilities );
  this.programCache = programCache;
	this.info.programs = programCache.programs;

	var bufferRenderer = new WebGLBufferRenderer( this._gl, extensions, this._infoRender );
	var indexedBufferRenderer = new WebGLIndexedBufferRenderer( this._gl, extensions, this._infoRender );


  this.context = this._gl;
	this.capabilities = capabilities;
	this.extensions = extensions;


  var shadowMap = new WebGLShadowMap( this, this.lights, objects );
  this.shadowMap = shadowMap;

  var spritePlugin = new SpritePlugin( this, this.sprites );
  this.spritePlugin = spritePlugin;
  var lensFlarePlugin = new LensFlarePlugin( this, this.lensFlares );
  this.lensFlarePlugin = lensFlarePlugin;

  }

  private capabilities:WebGLCapabilities;
  private extensions:WebGLExtensions;
  private shadowMap:WebGLShadowMap;
  private properties:WebGLProperties;
  private programCache:WebGLPrograms;
  private spritePlugin:SpritePlugin;
  private lensFlarePlugin:LensFlarePlugin;
  private objects:WebGLObjects;
  glClearColor(r:number,g:number,b:number,a:number){
    if(this._premultipliedAlpha === true){
      r *= a; g *= a; b *= a;
    }
    this._gl.clearColor(r,g,b,a);
  }

  getContext(){
    return this._gl;
  }

  getContextAttributes(){
    return this._gl.getContextAttributes();
  }

  forceContextLoss() {
		this.extensions.get( 'WEBGL_lose_context' ).loseContext();
	}

  getMaxAnisotropy(){
    var value;
    var extension = this.extensions.get( 'EXT_texture_filter_anisotropic' );

			if ( extension !== null ) {

				value = this._gl.getParameter( extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT );

			} else {

				value = 0;

			}

			return value;
  }

  getPrecision() {
		return this.capabilities.precision;
	}

  getPixelRatio() {
		return this.pixelRatio;
	}

  setPixelRatio( value ) {
		if ( value !== undefined ) this.pixelRatio = value;
	}

  resetGLState(){
    this._currentProgram = null;
    this._currentCamera = null;
    this._currentGeometryProgram = '';
    this._currentMaterialId = -1;
    this._lightsNeedUpdate = true;
    this.state.reset();
  }

  getSize() {
		return {
			width: this._width,
			height: this._height
		};
	}

  setSize( width, height, updateStyle?:boolean ) {

		this._width = width;
		this._height = height;

		this._canvas.width = width * this.pixelRatio;
		this._canvas.height = height * this.pixelRatio;

		if ( updateStyle !== false ) {

			this._canvas.style.width = width + 'px';
			this._canvas.style.height = height + 'px';

		}

		this.setViewport( 0, 0, width, height );

	};

  setViewport = function ( x, y, width, height ) {

		this._viewportX = x * this.pixelRatio;
		this._viewportY = y * this.pixelRatio;

		this._viewportWidth = width * this.pixelRatio;
		this._viewportHeight = height * this.pixelRatio;

		this._gl.viewport( this._viewportX, this._viewportY, this._viewportWidth, this._viewportHeight );

	}

  getViewport ( dimensions ) {

		dimensions.x = this._viewportX / this.pixelRatio;
		dimensions.y = this._viewportY / this.pixelRatio;

		dimensions.z = this._viewportWidth / this.pixelRatio;
		dimensions.w = this._viewportHeight / this.pixelRatio;

	}

  setScissor( x, y, width, height){
    this._gl.scissor(
      x * this.pixelRatio,
			y * this.pixelRatio,
			width * this.pixelRatio,
			height * this.pixelRatio
    );
  }

  enableScissorTest ( bool:boolean ) {
		this.state.setScissorTest( bool);
	};

  getClearColor(){
		return this._clearColor;
	};

  setClearColor = function ( color, alpha ) {
		this._clearColor.set( color );
		this._clearAlpha = alpha !== undefined ? alpha : 1;
		this.glClearColor( this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearAlpha );
	};

  getClearAlpha(){
    return this._clearAlpha;
  }

  setClearAlpha( alpha ) {
		this._clearAlpha = alpha;
		this.glClearColor( this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearAlpha );
	};

  clear( color, depth, stencil ) {
		var bits = 0;
		if ( color === undefined || color ) bits |= this._gl.COLOR_BUFFER_BIT;
		if ( depth === undefined || depth ) bits |= this._gl.DEPTH_BUFFER_BIT;
		if ( stencil === undefined || stencil ) bits |= this._gl.STENCIL_BUFFER_BIT;
		this._gl.clear( bits );
	};

  clearColor() {
		this._gl.clear( this._gl.COLOR_BUFFER_BIT );
	};

  clearDepth() {
		this._gl.clear( this._gl.DEPTH_BUFFER_BIT );
	};

  clearStencil() {
		this._gl.clear( this._gl.STENCIL_BUFFER_BIT );
	};

  clearTarget(renderTarget, color, depth, stencil){
    this.setRenderTarget( renderTarget );
		this.clear( color, depth, stencil );
  }

  dispose(){
    this._canvas.removeEventListener( 'webglcontextlost', this.onContextLost, false );
  }

  onContextLost(event){
    event.preventDefault();

    		this.resetGLState();
    		this.setDefaultGLState();

    		this.properties.clear();
  }

  setRenderTarget(renderTarget){

		var isCube = ( renderTarget instanceof WebGLRenderTargetCube );

		if ( renderTarget && this.properties.get( renderTarget ).__webglFramebuffer === undefined ) {

			var renderTargetProperties = this.properties.get( renderTarget );
			var textureProperties = this.properties.get( renderTarget.texture );

			if ( renderTarget.depthBuffer === undefined ) renderTarget.depthBuffer = true;
			if ( renderTarget.stencilBuffer === undefined ) renderTarget.stencilBuffer = true;

			renderTarget.addEventListener( 'dispose', this.onRenderTargetDispose );

			textureProperties.__webglTexture = this._gl.createTexture();

			this._infoMemory.textures ++;

			// Setup texture, create render and frame buffers

			var isTargetPowerOfTwo = this.isPowerOfTwo( renderTarget ),
				glFormat = this.paramThreeToGL( renderTarget.texture.format ),
				glType = this.paramThreeToGL( renderTarget.texture.type );

			if ( isCube ) {

				renderTargetProperties.__webglFramebuffer = [];
				renderTargetProperties.__webglRenderbuffer = [];

				this.state.bindTexture( this._gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture );

				this.setTextureParameters( this._gl.TEXTURE_CUBE_MAP, renderTarget.texture, isTargetPowerOfTwo );

				for ( var i = 0; i < 6; i ++ ) {

					renderTargetProperties.__webglFramebuffer[ i ] = this._gl.createFramebuffer();
					renderTargetProperties.__webglRenderbuffer[ i ] = this._gl.createRenderbuffer();
					this.state.texImage2D( this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType, null );

					this.setupFrameBuffer( renderTargetProperties.__webglFramebuffer[ i ], renderTarget, this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i );
					this.setupRenderBuffer( renderTargetProperties.__webglRenderbuffer[ i ], renderTarget );

				}

				if ( renderTarget.texture.generateMipmaps && isTargetPowerOfTwo ) this._gl.generateMipmap( this._gl.TEXTURE_CUBE_MAP );

			} else {

				renderTargetProperties.__webglFramebuffer = this._gl.createFramebuffer();

				if ( renderTarget.shareDepthFrom ) {

					renderTargetProperties.__webglRenderbuffer = renderTarget.shareDepthFrom.__webglRenderbuffer;

				} else {

					renderTargetProperties.__webglRenderbuffer = this._gl.createRenderbuffer();

				}

				this.state.bindTexture( this._gl.TEXTURE_2D, textureProperties.__webglTexture );
				this.setTextureParameters( this._gl.TEXTURE_2D, renderTarget.texture, isTargetPowerOfTwo );

				this.state.texImage2D( this._gl.TEXTURE_2D, 0, glFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType, null );

				this.setupFrameBuffer( renderTargetProperties.__webglFramebuffer, renderTarget, this._gl.TEXTURE_2D );

				if ( renderTarget.shareDepthFrom ) {

					if ( renderTarget.depthBuffer && ! renderTarget.stencilBuffer ) {

						this._gl.framebufferRenderbuffer( this._gl.FRAMEBUFFER, this._gl.DEPTH_ATTACHMENT, this._gl.RENDERBUFFER, renderTargetProperties.__webglRenderbuffer );

					} else if ( renderTarget.depthBuffer && renderTarget.stencilBuffer ) {

						this._gl.framebufferRenderbuffer( this._gl.FRAMEBUFFER, this._gl.DEPTH_STENCIL_ATTACHMENT, this._gl.RENDERBUFFER, renderTargetProperties.__webglRenderbuffer );

					}

				} else {

					this.setupRenderBuffer( renderTargetProperties.__webglRenderbuffer, renderTarget );

				}

				if ( renderTarget.texture.generateMipmaps && isTargetPowerOfTwo ) this._gl.generateMipmap( this._gl.TEXTURE_2D );

			}

			// Release everything

			if ( isCube ) {

				this.state.bindTexture( this._gl.TEXTURE_CUBE_MAP, null );

			} else {

				this.state.bindTexture( this._gl.TEXTURE_2D, null );

			}

			this._gl.bindRenderbuffer( this._gl.RENDERBUFFER, null );
			this._gl.bindFramebuffer( this._gl.FRAMEBUFFER, null );

		}

		var framebuffer, width, height, vx, vy;

		if ( renderTarget ) {

			var renderTargetProperties = this.properties.get( renderTarget );

			if ( isCube ) {

				framebuffer = renderTargetProperties.__webglFramebuffer[ renderTarget.activeCubeFace ];

			} else {

				framebuffer = renderTargetProperties.__webglFramebuffer;

			}

			width = renderTarget.width;
			height = renderTarget.height;

			vx = 0;
			vy = 0;

		} else {

			framebuffer = null;

			width = this._viewportWidth;
			height = this._viewportHeight;

			vx = this._viewportX;
			vy = this._viewportY;

		}

		if ( framebuffer !== this._currentFramebuffer ) {

			this._gl.bindFramebuffer( this._gl.FRAMEBUFFER, framebuffer );
			this._gl.viewport( vx, vy, width, height );

			this._currentFramebuffer = framebuffer;

		}

		if ( isCube ) {

			var textureProperties = this.properties.get( renderTarget.texture );
			this._gl.framebufferTexture2D( this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + renderTarget.activeCubeFace, textureProperties.__webglTexture, 0 );

		}

		this._currentWidth = width;
		this._currentHeight = height;
  }

  setDefaultGLState(){

		this.state.init();

		this._gl.viewport( this._viewportX, this._viewportY, this._viewportWidth, this._viewportHeight );

		this.glClearColor( this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearAlpha );
  }

  onTextureDispose( event ) {

		var texture = event.target;

		texture.removeEventListener( 'dispose', this.onTextureDispose );

		this.deallocateTexture( texture );

		this._infoMemory.textures --;


	}

  isPowerOfTwo( image ) {

		return MathUtil.isPowerOfTwo( image.width ) && MathUtil.isPowerOfTwo( image.height );

	}

  onRenderTargetDispose( event ) {

		var renderTarget = event.target;

		renderTarget.removeEventListener( 'dispose', this.onRenderTargetDispose );

		this.deallocateRenderTarget( renderTarget );

		this._infoMemory.textures --;

	}

  onMaterialDispose( event ) {

		var material = event.target;

		material.removeEventListener( 'dispose', this.onMaterialDispose );

		this.deallocateMaterial( material );

	}

  deallocateMaterial( material ) {
		this.releaseMaterialProgramReference( material );
		this.properties.delete( material );
	}

  releaseMaterialProgramReference( material ) {

		var programInfo = this.properties.get( material ).program;

		material.program = undefined;

		if ( programInfo !== undefined ) {

			this.programCache.releaseProgram( programInfo );

		}

	}

  deallocateTexture( texture ) {

  		var textureProperties = this.properties.get( texture );

  		if ( texture.image && textureProperties.__image__webglTextureCube ) {

  			// cube texture

  			this._gl.deleteTexture( textureProperties.__image__webglTextureCube );

  		} else {

  			// 2D texture

  			if ( textureProperties.__webglInit === undefined ) return;

  			this._gl.deleteTexture( textureProperties.__webglTexture );

  		}

  		// remove all webgl properties
  		this.properties.delete( texture );

  	}

    deallocateRenderTarget( renderTarget ) {

  		var renderTargetProperties = this.properties.get( renderTarget );
  		var textureProperties = this.properties.get( renderTarget.texture );

  		if ( ! renderTarget || textureProperties.__webglTexture === undefined ) return;

  		this._gl.deleteTexture( textureProperties.__webglTexture );

  		if ( renderTarget instanceof WebGLRenderTargetCube ) {

  			for ( var i = 0; i < 6; i ++ ) {

  				this._gl.deleteFramebuffer( renderTargetProperties.__webglFramebuffer[ i ] );
  				this._gl.deleteRenderbuffer( renderTargetProperties.__webglRenderbuffer[ i ] );

  			}

  		} else {

  			this._gl.deleteFramebuffer( renderTargetProperties.__webglFramebuffer );
  			this._gl.deleteRenderbuffer( renderTargetProperties.__webglRenderbuffer );

  		}

  		this.properties.delete( renderTarget.texture );
  		this.properties.delete( renderTarget );

  	}

  paramThreeToGL ( p ){
    var extension;

		if ( p === THREE.RepeatWrapping ) return this._gl.REPEAT;
		if ( p === THREE.ClampToEdgeWrapping ) return this._gl.CLAMP_TO_EDGE;
		if ( p === THREE.MirroredRepeatWrapping ) return this._gl.MIRRORED_REPEAT;

		if ( p === THREE.NearestFilter ) return this._gl.NEAREST;
		if ( p === THREE.NearestMipMapNearestFilter ) return this._gl.NEAREST_MIPMAP_NEAREST;
		if ( p === THREE.NearestMipMapLinearFilter ) return this._gl.NEAREST_MIPMAP_LINEAR;

		if ( p === THREE.LinearFilter ) return this._gl.LINEAR;
		if ( p === THREE.LinearMipMapNearestFilter ) return this._gl.LINEAR_MIPMAP_NEAREST;
		if ( p === THREE.LinearMipMapLinearFilter ) return this._gl.LINEAR_MIPMAP_LINEAR;

		if ( p === THREE.UnsignedByteType ) return this._gl.UNSIGNED_BYTE;
		if ( p === THREE.UnsignedShort4444Type ) return this._gl.UNSIGNED_SHORT_4_4_4_4;
		if ( p === THREE.UnsignedShort5551Type ) return this._gl.UNSIGNED_SHORT_5_5_5_1;
		if ( p === THREE.UnsignedShort565Type ) return this._gl.UNSIGNED_SHORT_5_6_5;

		if ( p === THREE.ByteType ) return this._gl.BYTE;
		if ( p === THREE.ShortType ) return this._gl.SHORT;
		if ( p === THREE.UnsignedShortType ) return this._gl.UNSIGNED_SHORT;
		if ( p === THREE.IntType ) return this._gl.INT;
		if ( p === THREE.UnsignedIntType ) return this._gl.UNSIGNED_INT;
		if ( p === THREE.FloatType ) return this._gl.FLOAT;

		extension = this.extensions.get( 'OES_texture_half_float' );

		if ( extension !== null ) {

			if ( p === THREE.HalfFloatType ) return extension.HALF_FLOAT_OES;

		}

		if ( p === THREE.AlphaFormat ) return this._gl.ALPHA;
		if ( p === THREE.RGBFormat ) return this._gl.RGB;
		if ( p === THREE.RGBAFormat ) return this._gl.RGBA;
		if ( p === THREE.LuminanceFormat ) return this._gl.LUMINANCE;
		if ( p === THREE.LuminanceAlphaFormat ) return this._gl.LUMINANCE_ALPHA;

		if ( p === THREE.AddEquation ) return this._gl.FUNC_ADD;
		if ( p === THREE.SubtractEquation ) return this._gl.FUNC_SUBTRACT;
		if ( p === THREE.ReverseSubtractEquation ) return this._gl.FUNC_REVERSE_SUBTRACT;

		if ( p === THREE.ZeroFactor ) return this._gl.ZERO;
		if ( p === THREE.OneFactor ) return this._gl.ONE;
		if ( p === THREE.SrcColorFactor ) return this._gl.SRC_COLOR;
		if ( p === THREE.OneMinusSrcColorFactor ) return this._gl.ONE_MINUS_SRC_COLOR;
		if ( p === THREE.SrcAlphaFactor ) return this._gl.SRC_ALPHA;
		if ( p === THREE.OneMinusSrcAlphaFactor ) return this._gl.ONE_MINUS_SRC_ALPHA;
		if ( p === THREE.DstAlphaFactor ) return this._gl.DST_ALPHA;
		if ( p === THREE.OneMinusDstAlphaFactor ) return this._gl.ONE_MINUS_DST_ALPHA;

		if ( p === THREE.DstColorFactor ) return this._gl.DST_COLOR;
		if ( p === THREE.OneMinusDstColorFactor ) return this._gl.ONE_MINUS_DST_COLOR;
		if ( p === THREE.SrcAlphaSaturateFactor ) return this._gl.SRC_ALPHA_SATURATE;

		extension = this.extensions.get( 'WEBGL_compressed_texture_s3tc' );

		if ( extension !== null ) {

			if ( p === THREE.RGB_S3TC_DXT1_Format ) return extension.COMPRESSED_RGB_S3TC_DXT1_EXT;
			if ( p === THREE.RGBA_S3TC_DXT1_Format ) return extension.COMPRESSED_RGBA_S3TC_DXT1_EXT;
			if ( p === THREE.RGBA_S3TC_DXT3_Format ) return extension.COMPRESSED_RGBA_S3TC_DXT3_EXT;
			if ( p === THREE.RGBA_S3TC_DXT5_Format ) return extension.COMPRESSED_RGBA_S3TC_DXT5_EXT;

		}

		extension = this.extensions.get( 'WEBGL_compressed_texture_pvrtc' );

		if ( extension !== null ) {

			if ( p === THREE.RGB_PVRTC_4BPPV1_Format ) return extension.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
			if ( p === THREE.RGB_PVRTC_2BPPV1_Format ) return extension.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
			if ( p === THREE.RGBA_PVRTC_4BPPV1_Format ) return extension.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
			if ( p === THREE.RGBA_PVRTC_2BPPV1_Format ) return extension.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;

		}

		extension = this.extensions.get( 'EXT_blend_minmax' );

		if ( extension !== null ) {

			if ( p === THREE.MinEquation ) return extension.MIN_EXT;
			if ( p === THREE.MaxEquation ) return extension.MAX_EXT;

		}

		return 0;
  }

  setTextureParameters ( textureType, texture, isImagePowerOfTwo ) {

		var extension;

		if ( isImagePowerOfTwo ) {

			this._gl.texParameteri( textureType, this._gl.TEXTURE_WRAP_S, this.paramThreeToGL( texture.wrapS ) );
			this._gl.texParameteri( textureType, this._gl.TEXTURE_WRAP_T, this.paramThreeToGL( texture.wrapT ) );

			this._gl.texParameteri( textureType, this._gl.TEXTURE_MAG_FILTER, this.paramThreeToGL( texture.magFilter ) );
			this._gl.texParameteri( textureType, this._gl.TEXTURE_MIN_FILTER, this.paramThreeToGL( texture.minFilter ) );

		} else {

			this._gl.texParameteri( textureType, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE );
			this._gl.texParameteri( textureType, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE );

			if ( texture.wrapS !== THREE.ClampToEdgeWrapping || texture.wrapT !== THREE.ClampToEdgeWrapping ) {

				console.warn( 'THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping.', texture );

			}

			this._gl.texParameteri( textureType, this._gl.TEXTURE_MAG_FILTER, this.filterFallback( texture.magFilter ) );
			this._gl.texParameteri( textureType, this._gl.TEXTURE_MIN_FILTER, this.filterFallback( texture.minFilter ) );

			if ( texture.minFilter !== THREE.NearestFilter && texture.minFilter !== THREE.LinearFilter ) {

				console.warn( 'THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.', texture );

			}

		}

		extension = this.extensions.get( 'EXT_texture_filter_anisotropic' );

		if ( extension ) {

			if ( texture.type === THREE.FloatType && this.extensions.get( 'OES_texture_float_linear' ) === null ) return;
			if ( texture.type === THREE.HalfFloatType && this.extensions.get( 'OES_texture_half_float_linear' ) === null ) return;

			if ( texture.anisotropy > 1 || this.properties.get( texture ).__currentAnisotropy ) {

				this._gl.texParameterf( textureType, extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min( texture.anisotropy, this.getMaxAnisotropy() ) );
				this.properties.get( texture ).__currentAnisotropy = texture.anisotropy;

			}

		}

	}

  painterSortStable ( a, b ) {

  		if ( a.object.renderOrder !== b.object.renderOrder ) {

  			return a.object.renderOrder - b.object.renderOrder;

  		} else if ( a.material.id !== b.material.id ) {

  			return a.material.id - b.material.id;

  		} else if ( a.z !== b.z ) {

  			return a.z - b.z;

  		} else {

  			return a.id - b.id;

  		}

  	}


    reversePainterSortStable ( a, b ) {

   		if ( a.object.renderOrder !== b.object.renderOrder ) {

   			return a.object.renderOrder - b.object.renderOrder;

   		} if ( a.z !== b.z ) {

   			return b.z - a.z;

   		} else {

   			return a.id - b.id;

   		}

   	}

  render(scene:Scene, camera:Camera, renderTarget?:any, forceClear?:any ){


    		var fog = scene.fog;

    		// reset caching for this frame

    		this._currentGeometryProgram = '';
    		this._currentMaterialId = - 1;
    		this._currentCamera = null;
    		this._lightsNeedUpdate = true;

    		// update scene graph

    		if ( scene.autoUpdate === true ) scene.updateMatrixWorld();

    		// update camera matrices and frustum

    		if ( camera.parent === null ) camera.updateMatrixWorld();

    		camera.matrixWorldInverse.getInverse( camera.matrixWorld );

    		this._projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
    		this._frustum.setFromMatrix( this._projScreenMatrix );

    		this.lights.length = 0;

    		this.opaqueObjectsLastIndex = - 1;
    		this.transparentObjectsLastIndex = - 1;

    		this.sprites.length = 0;
    		this.lensFlares.length = 0;

    		this.projectObject( scene, camera );

    		this.opaqueObjects.length = this.opaqueObjectsLastIndex + 1;
    		this.transparentObjects.length = this.transparentObjectsLastIndex + 1;

    		if ( this.sortObjects === true ) {

    			this.opaqueObjects.sort( this.painterSortStable );
    			this.transparentObjects.sort( this.reversePainterSortStable );

    		}

    		//

    		this.shadowMap.render( scene );

    		//

    		this._infoRender.calls = 0;
    		this._infoRender.vertices = 0;
    		this._infoRender.faces = 0;
    		this._infoRender.points = 0;

    		this.setRenderTarget( renderTarget );

    		if ( this.autoClear || forceClear ) {

    			this.clear( this.autoClearColor, this.autoClearDepth, this.autoClearStencil );

    		}

    		//

    		if ( scene.overrideMaterial ) {

    			var overrideMaterial = scene.overrideMaterial;

    			this.renderObjects( this.opaqueObjects, camera, this.lights, fog, overrideMaterial );
    			this.renderObjects( this.transparentObjects, camera, this.lights, fog, overrideMaterial );

    		} else {

    			// opaque pass (front-to-back order)

    			this.state.setBlending( BlendingMode.NoBlending );
    			this.renderObjects( this.opaqueObjects, camera, this.lights, fog );

    			// transparent pass (back-to-front order)

    			this.renderObjects( this.transparentObjects, camera, this.lights, fog );

    		}

    		// custom render plugins (post pass)

    		this.spritePlugin.render( scene, camera );
    		this.lensFlarePlugin.render( scene, camera, this._currentWidth, this._currentHeight );

    		// Generate mipmap if we're using any kind of mipmap filtering

    		if ( renderTarget ) {

    			var texture = renderTarget.texture;
    			var isTargetPowerOfTwo = this.isPowerOfTwo( renderTarget );
    			if ( texture.generateMipmaps && isTargetPowerOfTwo && texture.minFilter !== THREE.NearestFilter && texture.minFilter !== THREE.LinearFilter ) {

    				 this.updateRenderTargetMipmap( renderTarget );

    			}

    		}

    		// Ensure depth buffer writing is enabled so it can be cleared on next render

    		this.state.setDepthTest( true );
    		this.state.setDepthWrite( true );
    		this.state.setColorWrite( true );

    		// _gl.finish();
  }

  updateRenderTargetMipmap( renderTarget ) {

		var target = renderTarget instanceof THREE.WebGLRenderTargetCube ? this._gl.TEXTURE_CUBE_MAP : this._gl.TEXTURE_2D;
		var texture = this.properties.get( renderTarget.texture ).__webglTexture;

		this.state.bindTexture( target, texture );
		this._gl.generateMipmap( target );
		this.state.bindTexture( target, null );

	}


  renderObjects( renderList, camera, lights, fog, overrideMaterial?:any ) {

  		for ( var i = 0, l = renderList.length; i < l; i ++ ) {

  			var renderItem = renderList[ i ];

  			var object = renderItem.object;
  			var geometry = renderItem.geometry;
  			var material = overrideMaterial === undefined ? renderItem.material : overrideMaterial;
  			var group = renderItem.group;

  			object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
  			object.normalMatrix.getNormalMatrix( object.modelViewMatrix );

  			if ( object instanceof ImmediateRenderObject ) {

  				this.setMaterial( material );

  				var program = this.setProgram( camera, lights, fog, material, object );

  				this._currentGeometryProgram = '';

  				object.render(  ( object ) =>{

  					this.renderBufferImmediate( object, program, material );

  				} );

  			} else {

  				this.renderBufferDirect( camera, lights, fog, geometry, material, object, group );

  			}

  		}

  	}

    initMaterial( material, lights, fog, object ) {

		var materialProperties = this.properties.get( material );

		var parameters = this.programCache.getParameters( material, lights, fog, object );
		var code = this.programCache.getProgramCode( material, parameters );

		var program = materialProperties.program;
		var programChange = true;

		if ( program === undefined ) {

			// new material
			material.addEventListener( 'dispose', this.onMaterialDispose );

		} else if ( program.code !== code ) {

			// changed glsl or parameters
			this.releaseMaterialProgramReference( material );

		} else if ( parameters.shaderID !== undefined ) {

			// same glsl and uniform list
			return;

		} else {

			// only rebuild uniform list
			programChange = false;

		}

		if ( programChange ) {

			if ( parameters.shaderID ) {

				var shader = THREE.ShaderLib[ parameters.shaderID ];

				materialProperties.__webglShader = {
					name: material.type,
					uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
					vertexShader: shader.vertexShader,
					fragmentShader: shader.fragmentShader
				};

			} else {

				materialProperties.__webglShader = {
					name: material.type,
					uniforms: material.uniforms,
					vertexShader: material.vertexShader,
					fragmentShader: material.fragmentShader
				};

			}

			material.__webglShader = materialProperties.__webglShader;

			program = this.programCache.acquireProgram( material, parameters, code );

			materialProperties.program = program;
			material.program = program;

		}

		var attributes = program.getAttributes();

		if ( material.morphTargets ) {

			material.numSupportedMorphTargets = 0;

			for ( var i = 0; i < this.maxMorphTargets; i ++ ) {

				if ( attributes[ 'morphTarget' + i ] >= 0 ) {

					material.numSupportedMorphTargets ++;

				}

			}

		}

		if ( material.morphNormals ) {

			material.numSupportedMorphNormals = 0;

			for ( i = 0; i < this.maxMorphNormals; i ++ ) {

				if ( attributes[ 'morphNormal' + i ] >= 0 ) {

					material.numSupportedMorphNormals ++;

				}

			}

		}

		materialProperties.uniformsList = [];

		var uniformLocations = materialProperties.program.getUniforms();

		for ( var u in materialProperties.__webglShader.uniforms ) {

			var location = uniformLocations[ u ];

			if ( location ) {

				materialProperties.uniformsList.push( [ materialProperties.__webglShader.uniforms[ u ], location ] );

			}

		}

	}

    renderBufferImmediate( object, program, material ) {

		this.state.initAttributes();

		var buffers = this.properties.get( object );

		if ( object.hasPositions && ! buffers.position ) buffers.position = this._gl.createBuffer();
		if ( object.hasNormals && ! buffers.normal ) buffers.normal = this._gl.createBuffer();
		if ( object.hasUvs && ! buffers.uv ) buffers.uv = this._gl.createBuffer();
		if ( object.hasColors && ! buffers.color ) buffers.color = this._gl.createBuffer();

		var attributes = program.getAttributes();

		if ( object.hasPositions ) {

			this._gl.bindBuffer( this._gl.ARRAY_BUFFER, buffers.position );
			this._gl.bufferData( this._gl.ARRAY_BUFFER, object.positionArray, this._gl.DYNAMIC_DRAW );

			this.state.enableAttribute( attributes.position );
			this._gl.vertexAttribPointer( attributes.position, 3, this._gl.FLOAT, false, 0, 0 );

		}

		if ( object.hasNormals ) {

			this._gl.bindBuffer( this._gl.ARRAY_BUFFER, buffers.normal );

			if ( material.type !== 'MeshPhongMaterial' && material.shading === THREE.FlatShading ) {

				for ( var i = 0, l = object.count * 3; i < l; i += 9 ) {

					var array = object.normalArray;

					var nx = ( array[ i + 0 ] + array[ i + 3 ] + array[ i + 6 ] ) / 3;
					var ny = ( array[ i + 1 ] + array[ i + 4 ] + array[ i + 7 ] ) / 3;
					var nz = ( array[ i + 2 ] + array[ i + 5 ] + array[ i + 8 ] ) / 3;

					array[ i + 0 ] = nx;
					array[ i + 1 ] = ny;
					array[ i + 2 ] = nz;

					array[ i + 3 ] = nx;
					array[ i + 4 ] = ny;
					array[ i + 5 ] = nz;

					array[ i + 6 ] = nx;
					array[ i + 7 ] = ny;
					array[ i + 8 ] = nz;

				}

			}

			this._gl.bufferData( this._gl.ARRAY_BUFFER, object.normalArray, this._gl.DYNAMIC_DRAW );

			this.state.enableAttribute( attributes.normal );

			this._gl.vertexAttribPointer( attributes.normal, 3, this._gl.FLOAT, false, 0, 0 );

		}

		if ( object.hasUvs && material.map ) {

			this._gl.bindBuffer( this._gl.ARRAY_BUFFER, buffers.uv );
			this._gl.bufferData( this._gl.ARRAY_BUFFER, object.uvArray, this._gl.DYNAMIC_DRAW );

			this.state.enableAttribute( attributes.uv );

			this._gl.vertexAttribPointer( attributes.uv, 2, this._gl.FLOAT, false, 0, 0 );

		}

		if ( object.hasColors && material.vertexColors !== THREE.NoColors ) {

			this._gl.bindBuffer( this._gl.ARRAY_BUFFER, buffers.color );
			this._gl.bufferData( this._gl.ARRAY_BUFFER, object.colorArray, this._gl.DYNAMIC_DRAW );

			this.state.enableAttribute( attributes.color );

			this._gl.vertexAttribPointer( attributes.color, 3, this._gl.FLOAT, false, 0, 0 );

		}

		this.state.disableUnusedAttributes();

		this._gl.drawArrays( this._gl.TRIANGLES, 0, object.count );

		object.count = 0;

	};

  setTexture( texture, slot ) {

		var textureProperties = this.properties.get( texture );

		if ( texture.version > 0 && textureProperties.__version !== texture.version ) {

			var image = texture.image;

			if ( image === undefined ) {

				console.warn( 'THREE.WebGLRenderer: Texture marked for update but image is undefined', texture );
				return;

			}

			if ( image.complete === false ) {

				console.warn( 'THREE.WebGLRenderer: Texture marked for update but image is incomplete', texture );
				return;

			}

			this.uploadTexture( textureProperties, texture, slot );

			return;

		}

		this.state.activeTexture( this._gl.TEXTURE0 + slot );
		this.state.bindTexture( this._gl.TEXTURE_2D, textureProperties.__webglTexture );

	};

  clampToMaxSize ( image, maxSize ) {

   if ( image.width > maxSize || image.height > maxSize ) {

     // Warning: Scaling through the canvas will only work with images that use
     // premultiplied alpha.

     var scale = maxSize / Math.max( image.width, image.height );

     var canvas = document.createElement( 'canvas' );
     canvas.width = Math.floor( image.width * scale );
     canvas.height = Math.floor( image.height * scale );

     var context = canvas.getContext( '2d' );
     context.drawImage( image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height );

     console.warn( 'THREE.WebGLRenderer: image is too big (' + image.width + 'x' + image.height + '). Resized to ' + canvas.width + 'x' + canvas.height, image );

     return canvas;

   }

   return image;

 }

 makePowerOfTwo( image ) {

		if ( image instanceof HTMLImageElement || image instanceof HTMLCanvasElement ) {

			var canvas = document.createElement( 'canvas' );
			canvas.width = THREE.Math.nearestPowerOfTwo( image.width );
			canvas.height = THREE.Math.nearestPowerOfTwo( image.height );

			var context = canvas.getContext( '2d' );
			context.drawImage( image, 0, 0, canvas.width, canvas.height );

			console.warn( 'THREE.WebGLRenderer: image is not power of two (' + image.width + 'x' + image.height + '). Resized to ' + canvas.width + 'x' + canvas.height, image );

			return canvas;

		}

		return image;

	}

 textureNeedsPowerOfTwo( texture ) {

		if ( texture.wrapS !== THREE.ClampToEdgeWrapping || texture.wrapT !== THREE.ClampToEdgeWrapping ) return true;
		if ( texture.minFilter !== THREE.NearestFilter && texture.minFilter !== THREE.LinearFilter ) return true;

		return false;

	}

  uploadTexture( textureProperties, texture, slot ) {

  if ( textureProperties.__webglInit === undefined ) {

    textureProperties.__webglInit = true;

    texture.addEventListener( 'dispose', this.onTextureDispose );

    textureProperties.__webglTexture = this._gl.createTexture();

    this._infoMemory.textures ++;

  }



  this.state.activeTexture( this._gl.TEXTURE0 + slot );
  this.state.bindTexture( this._gl.TEXTURE_2D, textureProperties.__webglTexture );

  this._gl.pixelStorei( this._gl.UNPACK_FLIP_Y_WEBGL, texture.flipY );
  this._gl.pixelStorei( this._gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha );
  this._gl.pixelStorei( this._gl.UNPACK_ALIGNMENT, texture.unpackAlignment );

  texture.image = this.clampToMaxSize( texture.image, this.capabilities.maxTextureSize );

  if ( this.textureNeedsPowerOfTwo( texture ) && this.isPowerOfTwo( texture.image ) === false ) {

    texture.image = this.makePowerOfTwo( texture.image );

  }

  var image = texture.image,
  isImagePowerOfTwo = this.isPowerOfTwo( image ),
  glFormat = this.paramThreeToGL( texture.format ),
  glType = this.paramThreeToGL( texture.type );

  this.setTextureParameters( this._gl.TEXTURE_2D, texture, isImagePowerOfTwo );

  var mipmap, mipmaps = texture.mipmaps;

  if ( texture instanceof THREE.DataTexture ) {

    // use manually created mipmaps if available
    // if there are no manual mipmaps
    // set 0 level mipmap and then use GL to generate other mipmap levels

    if ( mipmaps.length > 0 && isImagePowerOfTwo ) {

      for ( var i = 0, il = mipmaps.length; i < il; i ++ ) {

        mipmap = mipmaps[ i ];
        this.state.texImage2D( this._gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data );

      }

      texture.generateMipmaps = false;

    } else {

      this.state.texImage2D( this._gl.TEXTURE_2D, 0, glFormat, image.width, image.height, 0, glFormat, glType, image.data );

    }

  } else if ( texture instanceof THREE.CompressedTexture ) {

    for ( var i = 0, il = mipmaps.length; i < il; i ++ ) {

      mipmap = mipmaps[ i ];

      if ( texture.format !== THREE.RGBAFormat && texture.format !== THREE.RGBFormat ) {

        if ( this.state.getCompressedTextureFormats().indexOf( glFormat ) > - 1 ) {

          this.state.compressedTexImage2D( this._gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, mipmap.data );

        } else {

          console.warn( "THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()" );

        }

      } else {

        this.state.texImage2D( this._gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data );

      }

    }

  } else {

    // regular Texture (image, video, canvas)

    // use manually created mipmaps if available
    // if there are no manual mipmaps
    // set 0 level mipmap and then use GL to generate other mipmap levels

    if ( mipmaps.length > 0 && isImagePowerOfTwo ) {

      for ( var i = 0, il = mipmaps.length; i < il; i ++ ) {

        mipmap = mipmaps[ i ];
        this.state.texImage2D( this._gl.TEXTURE_2D, i, glFormat, glFormat, glType, mipmap );

      }

      texture.generateMipmaps = false;

    } else {

      this.state.texImage2D( this._gl.TEXTURE_2D, 0, glFormat, glFormat, glType, texture.image );

    }

  }

  if ( texture.generateMipmaps && isImagePowerOfTwo ) this._gl.generateMipmap( this._gl.TEXTURE_2D );

  textureProperties.__version = texture.version;

  if ( texture.onUpdate ) texture.onUpdate( texture );

}

refreshUniformsFog ( uniforms, fog ) {

		uniforms.fogColor.value = fog.color;

		if ( fog instanceof THREE.Fog ) {

			uniforms.fogNear.value = fog.near;
			uniforms.fogFar.value = fog.far;

		} else if ( fog instanceof THREE.FogExp2 ) {

			uniforms.fogDensity.value = fog.density;

		}

	}

  setupLights ( lights, camera ) {

		var l, ll, light,
		r = 0, g = 0, b = 0,
		color, skyColor, groundColor,
		intensity,
		distance,

		zlights = this._lights,

		viewMatrix = camera.matrixWorldInverse,

		dirColors = (<any>zlights.directional).colors,
		dirPositions = zlights.directional.positions,

		pointColors = zlights.point.colors,
		pointPositions = zlights.point.positions,
		pointDistances = zlights.point.distances,
		pointDecays = zlights.point.decays,

		spotColors = zlights.spot.colors,
		spotPositions = zlights.spot.positions,
		spotDistances = zlights.spot.distances,
		spotDirections = zlights.spot.directions,
		spotAnglesCos = zlights.spot.anglesCos,
		spotExponents = zlights.spot.exponents,
		spotDecays = zlights.spot.decays,

		hemiSkyColors = zlights.hemi.skyColors,
		hemiGroundColors = zlights.hemi.groundColors,
		hemiPositions = zlights.hemi.positions,

		dirLength = 0,
		pointLength = 0,
		spotLength = 0,
		hemiLength = 0,

		dirCount = 0,
		pointCount = 0,
		spotCount = 0,
		hemiCount = 0,

		dirOffset = 0,
		pointOffset = 0,
		spotOffset = 0,
		hemiOffset = 0;

		for ( l = 0, ll = lights.length; l < ll; l ++ ) {

			light = lights[ l ];

			color = light.color;
			intensity = light.intensity;
			distance = light.distance;

			if ( light instanceof THREE.AmbientLight ) {

				if ( ! light.visible ) continue;

				r += color.r;
				g += color.g;
				b += color.b;

			} else if ( light instanceof THREE.DirectionalLight ) {

				dirCount += 1;

				if ( ! light.visible ) continue;

				this._direction.setFromMatrixPosition( light.matrixWorld );
				this._vector3.setFromMatrixPosition( light.target.matrixWorld );
				this._direction.sub( this._vector3 );
				this._direction.transformDirection( viewMatrix );

				dirOffset = dirLength * 3;

				dirPositions[ dirOffset + 0 ] = this._direction.x;
				dirPositions[ dirOffset + 1 ] = this._direction.y;
				dirPositions[ dirOffset + 2 ] = this._direction.z;

				this.setColorLinear( dirColors, dirOffset, color, intensity );

				dirLength += 1;

			} else if ( light instanceof THREE.PointLight ) {

				pointCount += 1;

				if ( ! light.visible ) continue;

				pointOffset = pointLength * 3;

				this.setColorLinear( pointColors, pointOffset, color, intensity );

				this._vector3.setFromMatrixPosition( light.matrixWorld );
				this._vector3.applyMatrix4( viewMatrix );

				pointPositions[ pointOffset + 0 ] = this._vector3.x;
				pointPositions[ pointOffset + 1 ] = this._vector3.y;
				pointPositions[ pointOffset + 2 ] = this._vector3.z;

				// distance is 0 if decay is 0, because there is no attenuation at all.
				pointDistances[ pointLength ] = distance;
				pointDecays[ pointLength ] = ( light.distance === 0 ) ? 0.0 : light.decay;

				pointLength += 1;

			} else if ( light instanceof THREE.SpotLight ) {

				spotCount += 1;

				if ( ! light.visible ) continue;

				spotOffset = spotLength * 3;

				this.setColorLinear( spotColors, spotOffset, color, intensity );

				this._direction.setFromMatrixPosition( light.matrixWorld );
				this._vector3.copy( this._direction ).applyMatrix4( viewMatrix );

				spotPositions[ spotOffset + 0 ] = this._vector3.x;
				spotPositions[ spotOffset + 1 ] = this._vector3.y;
				spotPositions[ spotOffset + 2 ] = this._vector3.z;

				spotDistances[ spotLength ] = distance;

				this._vector3.setFromMatrixPosition( light.target.matrixWorld );
				this._direction.sub( this._vector3 );
				this._direction.transformDirection( viewMatrix );

				spotDirections[ spotOffset + 0 ] = this._direction.x;
				spotDirections[ spotOffset + 1 ] = this._direction.y;
				spotDirections[ spotOffset + 2 ] = this._direction.z;

				spotAnglesCos[ spotLength ] = Math.cos( light.angle );
				spotExponents[ spotLength ] = light.exponent;
				spotDecays[ spotLength ] = ( light.distance === 0 ) ? 0.0 : light.decay;

				spotLength += 1;

			} else if ( light instanceof THREE.HemisphereLight ) {

				hemiCount += 1;

				if ( ! light.visible ) continue;

				this._direction.setFromMatrixPosition( light.matrixWorld );
				this._direction.transformDirection( viewMatrix );

				hemiOffset = hemiLength * 3;

				hemiPositions[ hemiOffset + 0 ] = this._direction.x;
				hemiPositions[ hemiOffset + 1 ] = this._direction.y;
				hemiPositions[ hemiOffset + 2 ] = this._direction.z;

				skyColor = light.color;
				groundColor = light.groundColor;

				this.setColorLinear( hemiSkyColors, hemiOffset, skyColor, intensity );
				this.setColorLinear( hemiGroundColors, hemiOffset, groundColor, intensity );

				hemiLength += 1;

			}

		}

		// null eventual remains from removed lights
		// (this is to avoid if in shader)

		for ( l = dirLength * 3, ll = Math.max( dirColors.length, dirCount * 3 ); l < ll; l ++ ) dirColors[ l ] = 0.0;
		for ( l = pointLength * 3, ll = Math.max( pointColors.length, pointCount * 3 ); l < ll; l ++ ) pointColors[ l ] = 0.0;
		for ( l = spotLength * 3, ll = Math.max( spotColors.length, spotCount * 3 ); l < ll; l ++ ) spotColors[ l ] = 0.0;
		for ( l = hemiLength * 3, ll = Math.max( hemiSkyColors.length, hemiCount * 3 ); l < ll; l ++ ) hemiSkyColors[ l ] = 0.0;
		for ( l = hemiLength * 3, ll = Math.max( hemiGroundColors.length, hemiCount * 3 ); l < ll; l ++ ) hemiGroundColors[ l ] = 0.0;

		zlights.directional.length = dirLength;
		zlights.point.length = pointLength;
		zlights.spot.length = spotLength;
		zlights.hemi.length = hemiLength;

		zlights.ambient[ 0 ] = r;
		zlights.ambient[ 1 ] = g;
		zlights.ambient[ 2 ] = b;

	}

  setColorLinear( array, offset, color, intensity ) {

		array[ offset + 0 ] = color.r * intensity;
		array[ offset + 1 ] = color.g * intensity;
		array[ offset + 2 ] = color.b * intensity;

	}

    setProgram( camera, lights, fog, material, object ) {

		this._usedTextureUnits = 0;

		var materialProperties = this.properties.get( material );

		if ( material.needsUpdate || ! materialProperties.program ) {

			this.initMaterial( material, lights, fog, object );
			material.needsUpdate = false;

		}

		var refreshProgram = false;
		var refreshMaterial = false;
		var refreshLights = false;

		var program = materialProperties.program,
			p_uniforms = program.getUniforms(),
			m_uniforms = materialProperties.__webglShader.uniforms;

		if ( program.id !== this._currentProgram ) {

			this._gl.useProgram( program.program );
			this._currentProgram = program.id;

			refreshProgram = true;
			refreshMaterial = true;
			refreshLights = true;

		}

		if ( material.id !== this._currentMaterialId ) {

			if ( this._currentMaterialId === - 1 ) refreshLights = true;
			this._currentMaterialId = material.id;

			refreshMaterial = true;

		}

		if ( refreshProgram || camera !== this._currentCamera ) {

			this._gl.uniformMatrix4fv( p_uniforms.projectionMatrix, false, camera.projectionMatrix.elements );

			if ( this.capabilities.logarithmicDepthBuffer ) {

				this._gl.uniform1f( p_uniforms.logDepthBufFC, 2.0 / ( Math.log( camera.far + 1.0 ) / Math.LN2 ) );

			}


			if ( camera !== this._currentCamera ) this._currentCamera = camera;

			// load material specific uniforms
			// (shader material also gets them for the sake of genericity)

			if ( material instanceof THREE.ShaderMaterial ||
				 material instanceof THREE.MeshPhongMaterial ||
				 material.envMap ) {

				if ( p_uniforms.cameraPosition !== undefined ) {

					this._vector3.setFromMatrixPosition( camera.matrixWorld );
					this._gl.uniform3f( p_uniforms.cameraPosition, this._vector3.x, this._vector3.y, this._vector3.z );

				}

			}

			if ( material instanceof THREE.MeshPhongMaterial ||
				 material instanceof THREE.MeshLambertMaterial ||
				 material instanceof THREE.MeshBasicMaterial ||
				 material instanceof THREE.ShaderMaterial ||
				 material.skinning ) {

				if ( p_uniforms.viewMatrix !== undefined ) {

					this._gl.uniformMatrix4fv( p_uniforms.viewMatrix, false, camera.matrixWorldInverse.elements );

				}

			}

		}

		// skinning uniforms must be set even if material didn't change
		// auto-setting of texture unit for bone texture must go before other textures
		// not sure why, but otherwise weird things happen

		if ( material.skinning ) {

			if ( object.bindMatrix && p_uniforms.bindMatrix !== undefined ) {

				this._gl.uniformMatrix4fv( p_uniforms.bindMatrix, false, object.bindMatrix.elements );

			}

			if ( object.bindMatrixInverse && p_uniforms.bindMatrixInverse !== undefined ) {

				this._gl.uniformMatrix4fv( p_uniforms.bindMatrixInverse, false, object.bindMatrixInverse.elements );

			}

			if ( this.capabilities.floatVertexTextures && object.skeleton && object.skeleton.useVertexTexture ) {

				if ( p_uniforms.boneTexture !== undefined ) {

					var textureUnit = this.getTextureUnit();

					this._gl.uniform1i( p_uniforms.boneTexture, textureUnit );
				  this.setTexture( object.skeleton.boneTexture, textureUnit );

				}

				if ( p_uniforms.boneTextureWidth !== undefined ) {

					this._gl.uniform1i( p_uniforms.boneTextureWidth, object.skeleton.boneTextureWidth );

				}

				if ( p_uniforms.boneTextureHeight !== undefined ) {

					this._gl.uniform1i( p_uniforms.boneTextureHeight, object.skeleton.boneTextureHeight );

				}

			} else if ( object.skeleton && object.skeleton.boneMatrices ) {

				if ( p_uniforms.boneGlobalMatrices !== undefined ) {

					this._gl.uniformMatrix4fv( p_uniforms.boneGlobalMatrices, false, object.skeleton.boneMatrices );

				}

			}

		}

		if ( refreshMaterial ) {

			// refresh uniforms common to several materials

			if ( fog && material.fog ) {

				this.refreshUniformsFog( m_uniforms, fog );

			}

			if ( material instanceof THREE.MeshPhongMaterial ||
				 material instanceof THREE.MeshLambertMaterial ||
				 material.lights ) {

				if ( this._lightsNeedUpdate ) {

					refreshLights = true;
					this.setupLights( lights, camera );
					this._lightsNeedUpdate = false;

				}

				if ( refreshLights ) {

					this.refreshUniformsLights( m_uniforms, this._lights );
					this.markUniformsLightsNeedsUpdate( m_uniforms, true );

				} else {

					this.markUniformsLightsNeedsUpdate( m_uniforms, false );

				}

			}

			if ( material instanceof THREE.MeshBasicMaterial ||
				 material instanceof THREE.MeshLambertMaterial ||
				 material instanceof THREE.MeshPhongMaterial ) {

				this.refreshUniformsCommon( m_uniforms, material );

			}

			// refresh single material specific uniforms

			if ( material instanceof THREE.LineBasicMaterial ) {

				this.refreshUniformsLine( m_uniforms, material );

			} else if ( material instanceof THREE.LineDashedMaterial ) {

				this.refreshUniformsLine( m_uniforms, material );
				this.refreshUniformsDash( m_uniforms, material );

			} else if ( material instanceof THREE.PointsMaterial ) {

				this.refreshUniformsParticle( m_uniforms, material );

			} else if ( material instanceof THREE.MeshPhongMaterial ) {

				this.refreshUniformsPhong( m_uniforms, material );

			} else if ( material instanceof THREE.MeshDepthMaterial ) {

				m_uniforms.mNear.value = camera.near;
				m_uniforms.mFar.value = camera.far;
				m_uniforms.opacity.value = material.opacity;

			} else if ( material instanceof THREE.MeshNormalMaterial ) {

				m_uniforms.opacity.value = material.opacity;

			}

			if ( object.receiveShadow && ! material._shadowPass ) {

				this.refreshUniformsShadow( m_uniforms, lights, camera );

			}

			// load common uniforms

			this.loadUniformsGeneric( materialProperties.uniformsList );

		}

		this.loadUniformsMatrices( p_uniforms, object );

		if ( p_uniforms.modelMatrix !== undefined ) {

			this._gl.uniformMatrix4fv( p_uniforms.modelMatrix, false, object.matrixWorld.elements );

		}

		return program;

	}

  loadUniformsMatrices ( uniforms, object ) {

		this._gl.uniformMatrix4fv( uniforms.modelViewMatrix, false, object.modelViewMatrix.elements );

		if ( uniforms.normalMatrix ) {

			this._gl.uniformMatrix3fv( uniforms.normalMatrix, false, object.normalMatrix.elements );

		}

	}

  loadUniformsGeneric ( uniforms ) {

   var texture, textureUnit;

   for ( var j = 0, jl = uniforms.length; j < jl; j ++ ) {

     var uniform = uniforms[ j ][ 0 ];

     // needsUpdate property is not added to all uniforms.
     if ( uniform.needsUpdate === false ) continue;

     var type = uniform.type;
     var value = uniform.value;
     var location = uniforms[ j ][ 1 ];
     var _gl = this._gl;
     switch ( type ) {

       case '1i':
         _gl.uniform1i( location, value );
         break;

       case '1f':
         _gl.uniform1f( location, value );
         break;

       case '2f':
         _gl.uniform2f( location, value[ 0 ], value[ 1 ] );
         break;

       case '3f':
         _gl.uniform3f( location, value[ 0 ], value[ 1 ], value[ 2 ] );
         break;

       case '4f':
         _gl.uniform4f( location, value[ 0 ], value[ 1 ], value[ 2 ], value[ 3 ] );
         break;

       case '1iv':
         _gl.uniform1iv( location, value );
         break;

       case '3iv':
         _gl.uniform3iv( location, value );
         break;

       case '1fv':
         _gl.uniform1fv( location, value );
         break;

       case '2fv':
         _gl.uniform2fv( location, value );
         break;

       case '3fv':
         _gl.uniform3fv( location, value );
         break;

       case '4fv':
         _gl.uniform4fv( location, value );
         break;

       case 'Matrix3fv':
         _gl.uniformMatrix3fv( location, false, value );
         break;

       case 'Matrix4fv':
         _gl.uniformMatrix4fv( location, false, value );
         break;

       //

       case 'i':

         // single integer
         _gl.uniform1i( location, value );

         break;

       case 'f':

         // single float
         _gl.uniform1f( location, value );

         break;

       case 'v2':

         // single THREE.Vector2
         _gl.uniform2f( location, value.x, value.y );

         break;

       case 'v3':

         // single THREE.Vector3
         _gl.uniform3f( location, value.x, value.y, value.z );

         break;

       case 'v4':

         // single THREE.Vector4
         _gl.uniform4f( location, value.x, value.y, value.z, value.w );

         break;

       case 'c':

         // single THREE.Color
         _gl.uniform3f( location, value.r, value.g, value.b );

         break;

       case 'iv1':

         // flat array of integers (JS or typed array)
         _gl.uniform1iv( location, value );

         break;

       case 'iv':

         // flat array of integers with 3 x N size (JS or typed array)
         _gl.uniform3iv( location, value );

         break;

       case 'fv1':

         // flat array of floats (JS or typed array)
         _gl.uniform1fv( location, value );

         break;

       case 'fv':

         // flat array of floats with 3 x N size (JS or typed array)
         _gl.uniform3fv( location, value );

         break;

       case 'v2v':

         // array of THREE.Vector2

         if ( uniform._array === undefined ) {

           uniform._array = new Float32Array( 2 * value.length );

         }

         for ( var i = 0, i2 = 0, il = value.length; i < il; i ++, i2 += 2 ) {

           uniform._array[ i2 + 0 ] = value[ i ].x;
           uniform._array[ i2 + 1 ] = value[ i ].y;

         }

         _gl.uniform2fv( location, uniform._array );

         break;

       case 'v3v':

         // array of THREE.Vector3

         if ( uniform._array === undefined ) {

           uniform._array = new Float32Array( 3 * value.length );

         }

         for ( var i = 0, i3 = 0, il = value.length; i < il; i ++, i3 += 3 ) {

           uniform._array[ i3 + 0 ] = value[ i ].x;
           uniform._array[ i3 + 1 ] = value[ i ].y;
           uniform._array[ i3 + 2 ] = value[ i ].z;

         }

         _gl.uniform3fv( location, uniform._array );

         break;

       case 'v4v':

         // array of THREE.Vector4

         if ( uniform._array === undefined ) {

           uniform._array = new Float32Array( 4 * value.length );

         }

         for ( var i = 0, i4 = 0, il = value.length; i < il; i ++, i4 += 4 ) {

           uniform._array[ i4 + 0 ] = value[ i ].x;
           uniform._array[ i4 + 1 ] = value[ i ].y;
           uniform._array[ i4 + 2 ] = value[ i ].z;
           uniform._array[ i4 + 3 ] = value[ i ].w;

         }

         _gl.uniform4fv( location, uniform._array );

         break;

       case 'm3':

         // single THREE.Matrix3
         _gl.uniformMatrix3fv( location, false, value.elements );

         break;

       case 'm3v':

         // array of THREE.Matrix3

         if ( uniform._array === undefined ) {

           uniform._array = new Float32Array( 9 * value.length );

         }

         for ( var i = 0, il = value.length; i < il; i ++ ) {

           value[ i ].flattenToArrayOffset( uniform._array, i * 9 );

         }

         _gl.uniformMatrix3fv( location, false, uniform._array );

         break;

       case 'm4':

         // single THREE.Matrix4
         _gl.uniformMatrix4fv( location, false, value.elements );

         break;

       case 'm4v':

         // array of THREE.Matrix4

         if ( uniform._array === undefined ) {

           uniform._array = new Float32Array( 16 * value.length );

         }

         for ( var i = 0, il = value.length; i < il; i ++ ) {

           value[ i ].flattenToArrayOffset( uniform._array, i * 16 );

         }

         _gl.uniformMatrix4fv( location, false, uniform._array );

         break;

       case 't':

         // single THREE.Texture (2d or cube)

         texture = value;
         textureUnit = this.getTextureUnit();

         _gl.uniform1i( location, textureUnit );

         if ( ! texture ) continue;

         if ( texture instanceof THREE.CubeTexture ||
            ( Array.isArray( texture.image ) && texture.image.length === 6 ) ) {

           // CompressedTexture can have Array in image :/

           this.setCubeTexture( texture, textureUnit );

         } else if ( texture instanceof THREE.WebGLRenderTargetCube ) {

           this.setCubeTextureDynamic( texture.texture, textureUnit );

         } else if ( texture instanceof THREE.WebGLRenderTarget ) {

           this.setTexture( texture.texture, textureUnit );

         } else {

           this.setTexture( texture, textureUnit );

         }

         break;

       case 'tv':

         // array of THREE.Texture (2d or cube)

         if ( uniform._array === undefined ) {

           uniform._array = [];

         }

         for ( var i = 0, il = uniform.value.length; i < il; i ++ ) {

           uniform._array[ i ] = this.getTextureUnit();

         }

         _gl.uniform1iv( location, uniform._array );

         for ( var i = 0, il = uniform.value.length; i < il; i ++ ) {

           texture = uniform.value[ i ];
           textureUnit = uniform._array[ i ];

           if ( ! texture ) continue;

           if ( texture instanceof THREE.CubeTexture ||
              ( texture.image instanceof Array && texture.image.length === 6 ) ) {

             // CompressedTexture can have Array in image :/

             this.setCubeTexture( texture, textureUnit );

           } else if ( texture instanceof THREE.WebGLRenderTarget ) {

             this.setTexture( texture.texture, textureUnit );

           } else if ( texture instanceof THREE.WebGLRenderTargetCube ) {

             this.setCubeTextureDynamic( texture.texture, textureUnit );

           } else {

             this.setTexture( texture, textureUnit );

           }

         }

         break;

       default:

         console.warn( 'THREE.WebGLRenderer: Unknown uniform type: ' + type );

     }

   }

 }

 setCubeTextureDynamic ( texture, slot ) {

 		this.state.activeTexture( this._gl.TEXTURE0 + slot );
 		this.state.bindTexture( this._gl.TEXTURE_CUBE_MAP, this.properties.get( texture ).__webglTexture );

 	}

 setCubeTexture ( texture, slot ) {

 		var textureProperties = this.properties.get( texture );

 		if ( texture.image.length === 6 ) {

 			if ( texture.version > 0 && textureProperties.__version !== texture.version ) {

 				if ( ! textureProperties.__image__webglTextureCube ) {

 					texture.addEventListener( 'dispose', this.onTextureDispose );

 					textureProperties.__image__webglTextureCube = this._gl.createTexture();

 					this._infoMemory.textures ++;

 				}

 				this.state.activeTexture( this._gl.TEXTURE0 + slot );
 				this.state.bindTexture( this._gl.TEXTURE_CUBE_MAP, textureProperties.__image__webglTextureCube );

 				this._gl.pixelStorei( this._gl.UNPACK_FLIP_Y_WEBGL, texture.flipY );

 				var isCompressed = texture instanceof THREE.CompressedTexture;
 				var isDataTexture = texture.image[ 0 ] instanceof THREE.DataTexture;

 				var cubeImage = [];

 				for ( var i = 0; i < 6; i ++ ) {

 					if ( this.autoScaleCubemaps && ! isCompressed && ! isDataTexture ) {

 						cubeImage[ i ] = this.clampToMaxSize( texture.image[ i ], this.capabilities.maxCubemapSize );

 					} else {

 						cubeImage[ i ] = isDataTexture ? texture.image[ i ].image : texture.image[ i ];

 					}

 				}

 				var image = cubeImage[ 0 ],
 				isImagePowerOfTwo = this.isPowerOfTwo( image ),
 				glFormat = this.paramThreeToGL( texture.format ),
 				glType = this.paramThreeToGL( texture.type );

 				this.setTextureParameters( this._gl.TEXTURE_CUBE_MAP, texture, isImagePowerOfTwo );

 				for ( var i = 0; i < 6; i ++ ) {

 					if ( ! isCompressed ) {

 						if ( isDataTexture ) {

 							this.state.texImage2D( this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glFormat, cubeImage[ i ].width, cubeImage[ i ].height, 0, glFormat, glType, cubeImage[ i ].data );

 						} else {

 							this.state.texImage2D( this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glFormat, glFormat, glType, cubeImage[ i ] );

 						}

 					} else {

 						var mipmap, mipmaps = cubeImage[ i ].mipmaps;

 						for ( var j = 0, jl = mipmaps.length; j < jl; j ++ ) {

 							mipmap = mipmaps[ j ];

 							if ( texture.format !== THREE.RGBAFormat && texture.format !== THREE.RGBFormat ) {

 								if ( this.state.getCompressedTextureFormats().indexOf( glFormat ) > - 1 ) {

 									this.state.compressedTexImage2D( this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glFormat, mipmap.width, mipmap.height, 0, mipmap.data );

 								} else {

 									console.warn( "THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setCubeTexture()" );

 								}

 							} else {

 								this.state.texImage2D( this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data );

 							}

 						}

 					}

 				}

 				if ( texture.generateMipmaps && isImagePowerOfTwo ) {

 					this._gl.generateMipmap( this._gl.TEXTURE_CUBE_MAP );

 				}

 				textureProperties.__version = texture.version;

 				if ( texture.onUpdate ) texture.onUpdate( texture );

 			} else {

 				this.state.activeTexture( this._gl.TEXTURE0 + slot );
 				this.state.bindTexture( this._gl.TEXTURE_CUBE_MAP, textureProperties.__image__webglTextureCube );

 			}

 		}

 	}

  refreshUniformsShadow ( uniforms, lights, camera ) {

		if ( uniforms.shadowMatrix ) {

			var j = 0;

			for ( var i = 0, il = lights.length; i < il; i ++ ) {

				var light = lights[ i ];

				if ( light.castShadow === true ) {

					if ( light instanceof THREE.PointLight || light instanceof THREE.SpotLight || light instanceof THREE.DirectionalLight ) {

						var shadow = light.shadow;

						if ( light instanceof THREE.PointLight ) {

							// for point lights we set the shadow matrix to be a translation-only matrix
							// equal to inverse of the light's position
							this._vector3.setFromMatrixPosition( light.matrixWorld ).negate();
							shadow.matrix.identity().setPosition( this._vector3 );

							// for point lights we set the sign of the shadowDarkness uniform to be negative
							uniforms.shadowDarkness.value[ j ] = - shadow.darkness;

						} else {

							uniforms.shadowDarkness.value[ j ] = shadow.darkness;

						}

						uniforms.shadowMatrix.value[ j ] = shadow.matrix;
						uniforms.shadowMap.value[ j ] = shadow.map;
						uniforms.shadowMapSize.value[ j ] = shadow.mapSize;
						uniforms.shadowBias.value[ j ] = shadow.bias;

						j ++;

					}

				}

			}

		}

	}

  refreshUniformsPhong ( uniforms, material ) {

		uniforms.specular.value = material.specular;
		uniforms.shininess.value = Math.max( material.shininess, 1e-4 ); // to prevent pow( 0.0, 0.0 )

		if ( material.lightMap ) {

			uniforms.lightMap.value = material.lightMap;
			uniforms.lightMapIntensity.value = material.lightMapIntensity;

		}

		if ( material.emissiveMap ) {

			uniforms.emissiveMap.value = material.emissiveMap;

		}

		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;

		}

		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );

		}

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

	}

  refreshUniformsParticle ( uniforms, material ) {

		uniforms.psColor.value = material.color;
		uniforms.opacity.value = material.opacity;
		uniforms.size.value = material.size;
		uniforms.scale.value = this._canvas.height / 2.0; // TODO: Cache this.

		uniforms.map.value = material.map;

		if ( material.map !== null ) {

			var offset = material.map.offset;
			var repeat = material.map.repeat;

			uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

		}

	}

  refreshUniformsLine ( uniforms, material ) {

   uniforms.diffuse.value = material.color;
   uniforms.opacity.value = material.opacity;

 }

 refreshUniformsDash ( uniforms, material ) {

		uniforms.dashSize.value = material.dashSize;
		uniforms.totalSize.value = material.dashSize + material.gapSize;
		uniforms.scale.value = material.scale;

	}

  refreshUniformsCommon ( uniforms, material ) {

		uniforms.opacity.value = material.opacity;

		uniforms.diffuse.value = material.color;

		if ( material.emissive ) {

			uniforms.emissive.value = material.emissive;

		}

		uniforms.map.value = material.map;
		uniforms.specularMap.value = material.specularMap;
		uniforms.alphaMap.value = material.alphaMap;

		if ( material.aoMap ) {

			uniforms.aoMap.value = material.aoMap;
			uniforms.aoMapIntensity.value = material.aoMapIntensity;

		}

		// uv repeat and offset setting priorities
		// 1. color map
		// 2. specular map
		// 3. normal map
		// 4. bump map
		// 5. alpha map
		// 6. emissive map

		var uvScaleMap;

		if ( material.map ) {

			uvScaleMap = material.map;

		} else if ( material.specularMap ) {

			uvScaleMap = material.specularMap;

		} else if ( material.displacementMap ) {

			uvScaleMap = material.displacementMap;

		} else if ( material.normalMap ) {

			uvScaleMap = material.normalMap;

		} else if ( material.bumpMap ) {

			uvScaleMap = material.bumpMap;

		} else if ( material.alphaMap ) {

			uvScaleMap = material.alphaMap;

		} else if ( material.emissiveMap ) {

			uvScaleMap = material.emissiveMap;

		}

		if ( uvScaleMap !== undefined ) {

			if ( uvScaleMap instanceof THREE.WebGLRenderTarget ) uvScaleMap = uvScaleMap.texture;
			var offset = uvScaleMap.offset;
			var repeat = uvScaleMap.repeat;

			uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

		}

		uniforms.envMap.value = material.envMap;
		uniforms.flipEnvMap.value = ( material.envMap instanceof THREE.WebGLRenderTargetCube ) ? 1 : - 1;

		uniforms.reflectivity.value = material.reflectivity;
		uniforms.refractionRatio.value = material.refractionRatio;

	}

  markUniformsLightsNeedsUpdate ( uniforms, value ) {

		uniforms.ambientLightColor.needsUpdate = value;

		uniforms.directionalLightColor.needsUpdate = value;
		uniforms.directionalLightDirection.needsUpdate = value;

		uniforms.pointLightColor.needsUpdate = value;
		uniforms.pointLightPosition.needsUpdate = value;
		uniforms.pointLightDistance.needsUpdate = value;
		uniforms.pointLightDecay.needsUpdate = value;

		uniforms.spotLightColor.needsUpdate = value;
		uniforms.spotLightPosition.needsUpdate = value;
		uniforms.spotLightDistance.needsUpdate = value;
		uniforms.spotLightDirection.needsUpdate = value;
		uniforms.spotLightAngleCos.needsUpdate = value;
		uniforms.spotLightExponent.needsUpdate = value;
		uniforms.spotLightDecay.needsUpdate = value;

		uniforms.hemisphereLightSkyColor.needsUpdate = value;
		uniforms.hemisphereLightGroundColor.needsUpdate = value;
		uniforms.hemisphereLightDirection.needsUpdate = value;

	}


  refreshUniformsLights( uniforms, lights ) {

   uniforms.ambientLightColor.value = lights.ambient;

   uniforms.directionalLightColor.value = lights.directional.colors;
   uniforms.directionalLightDirection.value = lights.directional.positions;

   uniforms.pointLightColor.value = lights.point.colors;
   uniforms.pointLightPosition.value = lights.point.positions;
   uniforms.pointLightDistance.value = lights.point.distances;
   uniforms.pointLightDecay.value = lights.point.decays;

   uniforms.spotLightColor.value = lights.spot.colors;
   uniforms.spotLightPosition.value = lights.spot.positions;
   uniforms.spotLightDistance.value = lights.spot.distances;
   uniforms.spotLightDirection.value = lights.spot.directions;
   uniforms.spotLightAngleCos.value = lights.spot.anglesCos;
   uniforms.spotLightExponent.value = lights.spot.exponents;
   uniforms.spotLightDecay.value = lights.spot.decays;

   uniforms.hemisphereLightSkyColor.value = lights.hemi.skyColors;
   uniforms.hemisphereLightGroundColor.value = lights.hemi.groundColors;
   uniforms.hemisphereLightDirection.value = lights.hemi.positions;

 }

  getTextureUnit() {

		var textureUnit = this._usedTextureUnits;

		if ( textureUnit >= this.capabilities.maxTextures ) {

			console.warn( 'WebGLRenderer: trying to use ' + textureUnit + ' texture units while this GPU supports only ' + this.capabilities.maxTextures );

		}

		this._usedTextureUnits += 1;

		return textureUnit;

	}

  setMaterial( material ) {

		this.setMaterialFaces( material );

		if ( material.transparent === true ) {

			this.state.setBlending( material.blending, material.blendEquation, material.blendSrc, material.blendDst, material.blendEquationAlpha, material.blendSrcAlpha, material.blendDstAlpha );

		} else {

			this.state.setBlending( BlendingMode.NoBlending );

		}

		this.state.setDepthFunc( material.depthFunc );
		this.state.setDepthTest( material.depthTest );
		this.state.setDepthWrite( material.depthWrite );
		this.state.setColorWrite( material.colorWrite );
		this.state.setPolygonOffset( material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits );

	}

  setMaterialFaces( material ) {

		material.side !== ShadingSideType.DoubleSide ? this.state.enable( this._gl.CULL_FACE ) : this.state.disable( this._gl.CULL_FACE );
		this.state.setFlipSided( material.side === ShadingSideType.BackSide );

	}
  numericalSort ( a, b ) {

		return b[ 0 ] - a[ 0 ];

	}


    renderBufferDirect( camera, lights, fog, geometry, material, object, group ) {
      var _gl = this._gl;
		this.setMaterial( material );

		var program = this.setProgram( camera, lights, fog, material, object );

		var updateBuffers = false;
		var geometryProgram = geometry.id + '_' + program.id + '_' + material.wireframe;

		if ( geometryProgram !== this._currentGeometryProgram ) {

			this._currentGeometryProgram = geometryProgram;
			updateBuffers = true;

		}

		// morph targets

		var morphTargetInfluences = object.morphTargetInfluences;

		if ( morphTargetInfluences !== undefined ) {

			var activeInfluences = [];

			for ( var i = 0, l = morphTargetInfluences.length; i < l; i ++ ) {

				var influence = morphTargetInfluences[ i ];
				activeInfluences.push( [ influence, i ] );

			}

			activeInfluences.sort( this.numericalSort );

			if ( activeInfluences.length > 8 ) {

				activeInfluences.length = 8;

			}

			var morphAttributes = geometry.morphAttributes;

			for ( var i = 0, l:any = activeInfluences.length; i < l; i ++ ) {

				var influence = activeInfluences[ i ];
				this.morphInfluences[ i ] = influence[ 0 ];

				if ( influence[ 0 ] !== 0 ) {

					var index = influence[ 1 ];

					if ( material.morphTargets === true && morphAttributes.position ) geometry.addAttribute( 'morphTarget' + i, morphAttributes.position[ index ] );
					if ( material.morphNormals === true && morphAttributes.normal ) geometry.addAttribute( 'morphNormal' + i, morphAttributes.normal[ index ] );

				} else {

					if ( material.morphTargets === true ) geometry.removeAttribute( 'morphTarget' + i );
					if ( material.morphNormals === true ) geometry.removeAttribute( 'morphNormal' + i );

				}

			}

			var uniforms = program.getUniforms();

			if ( uniforms.morphTargetInfluences !== null ) {

				this._gl.uniform1fv( uniforms.morphTargetInfluences, this.morphInfluences );

			}

			updateBuffers = true;

		}

		//

		var index = geometry.index;
		var position = geometry.attributes.position;

		if ( material.wireframe === true ) {

			index = this.objects.getWireframeAttribute( geometry );

		}

		var renderer;

		if ( index !== null ) {

			renderer = this.indexedBufferRenderer;
			renderer.setIndex( index );

		} else {

			renderer = this.bufferRenderer;

		}

		if ( updateBuffers ) {

			this.setupVertexAttributes( material, program, geometry );

			if ( index !== null ) {

				_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, this.objects.getAttributeBuffer( index ) );

			}

		}

		//

		var dataStart = 0;
		var dataCount = Infinity;

		if ( index !== null ) {

			dataCount = index.count

		} else if ( position !== undefined ) {

			dataCount = position.count;

		}

		var rangeStart = geometry.drawRange.start;
		var rangeCount = geometry.drawRange.count;

		var groupStart = group !== null ? group.start : 0;
		var groupCount = group !== null ? group.count : Infinity;

		var drawStart = Math.max( dataStart, rangeStart, groupStart );
		var drawEnd = Math.min( dataStart + dataCount, rangeStart + rangeCount, groupStart + groupCount ) - 1;

		var drawCount = Math.max( 0, drawEnd - drawStart + 1 );

		//

		if ( object instanceof THREE.Mesh ) {

			if ( material.wireframe === true ) {

				this.state.setLineWidth( material.wireframeLinewidth * this.pixelRatio );
				renderer.setMode( this._gl.LINES );

			} else {

				renderer.setMode( this._gl.TRIANGLES );

			}

			if ( geometry instanceof THREE.InstancedBufferGeometry && geometry.maxInstancedCount > 0 ) {

				renderer.renderInstances( geometry );

			} else {

				renderer.render( drawStart, drawCount );

			}

		} else if ( object instanceof THREE.Line ) {

			var lineWidth = material.linewidth;

			if ( lineWidth === undefined ) lineWidth = 1; // Not using Line*Material

			this.state.setLineWidth( lineWidth * this.pixelRatio );

			if ( object instanceof THREE.LineSegments ) {

				renderer.setMode( _gl.LINES );

			} else {

				renderer.setMode( _gl.LINE_STRIP );

			}

			renderer.render( drawStart, drawCount );

		} else if ( object instanceof THREE.Points ) {

			renderer.setMode( _gl.POINTS );
			renderer.render( drawStart, drawCount );

		}

	}


  setupVertexAttributes( material, program, geometry, startIndex?:number ) {

		var extension;

    var _gl = this._gl;

		if ( geometry instanceof THREE.InstancedBufferGeometry ) {

			extension = this.extensions.get( 'ANGLE_instanced_arrays' );

			if ( extension === null ) {

				console.error( 'THREE.WebGLRenderer.setupVertexAttributes: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
				return;

			}

		}

		if ( startIndex === undefined ) startIndex = 0;

		this.state.initAttributes();

		var geometryAttributes = geometry.attributes;

		var programAttributes = program.getAttributes();

		var materialDefaultAttributeValues = material.defaultAttributeValues;

		for ( var name in programAttributes ) {

			var programAttribute = programAttributes[ name ];

			if ( programAttribute >= 0 ) {

				var geometryAttribute = geometryAttributes[ name ];

				if ( geometryAttribute !== undefined ) {

					var size = geometryAttribute.itemSize;
					var buffer = this.objects.getAttributeBuffer( geometryAttribute );

					if ( geometryAttribute instanceof THREE.InterleavedBufferAttribute ) {

						var data = geometryAttribute.data;
						var stride = data.stride;
						var offset = geometryAttribute.offset;

						if ( data instanceof THREE.InstancedInterleavedBuffer ) {

							this.state.enableAttributeAndDivisor( programAttribute, data.meshPerAttribute, extension );

							if ( geometry.maxInstancedCount === undefined ) {

								geometry.maxInstancedCount = data.meshPerAttribute * data.count;

							}

						} else {

							this.state.enableAttribute( programAttribute );

						}

						_gl.bindBuffer( _gl.ARRAY_BUFFER, buffer );
						_gl.vertexAttribPointer( programAttribute, size, _gl.FLOAT, false, stride * data.array.BYTES_PER_ELEMENT, ( startIndex * stride + offset ) * data.array.BYTES_PER_ELEMENT );

					} else {

						if ( geometryAttribute instanceof THREE.InstancedBufferAttribute ) {

							this.state.enableAttributeAndDivisor( programAttribute, geometryAttribute.meshPerAttribute, extension );

							if ( geometry.maxInstancedCount === undefined ) {

								geometry.maxInstancedCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;

							}

						} else {

							this.state.enableAttribute( programAttribute );

						}

						_gl.bindBuffer( _gl.ARRAY_BUFFER, buffer );
						_gl.vertexAttribPointer( programAttribute, size, _gl.FLOAT, false, 0, startIndex * size * 4 ); // 4 bytes per Float32

					}

				} else if ( materialDefaultAttributeValues !== undefined ) {

					var value = materialDefaultAttributeValues[ name ];

					if ( value !== undefined ) {

						switch ( value.length ) {

							case 2:
								_gl.vertexAttrib2fv( programAttribute, value );
								break;

							case 3:
								_gl.vertexAttrib3fv( programAttribute, value );
								break;

							case 4:
								_gl.vertexAttrib4fv( programAttribute, value );
								break;

							default:
								_gl.vertexAttrib1fv( programAttribute, value );

						}

					}

				}

			}

		}

		this.state.disableUnusedAttributes();

	}

  projectObject( object, camera ) {

		if ( object.visible === false ) return;

		if ( ( object.channels.mask & camera.channels.mask ) !== 0 ) {

			if ( object instanceof Light ) {

				this.lights.push( object );

			} else if ( object instanceof Sprite ) {

				this.sprites.push( object );

			} else if ( object instanceof LensFlare ) {

				this.lensFlares.push( object );

			} else if ( object instanceof ImmediateRenderObject ) {

				if ( this.sortObjects === true ) {

					this._vector3.setFromMatrixPosition( object.matrixWorld );
					this._vector3.applyProjection( this._projScreenMatrix );

				}

				this.pushRenderItem( object, null, object.material, this._vector3.z, null );

			} else if ( object instanceof Mesh || object instanceof Line || object instanceof Points ) {

				if ( object instanceof SkinnedMesh ) {

					object.skeleton.update();

				}

				if ( object.frustumCulled === false || this._frustum.intersectsObject( object ) === true ) {

					var material = object.material;

					if ( material.visible === true ) {

						if ( this.sortObjects === true ) {

							this._vector3.setFromMatrixPosition( object.matrixWorld );
							this._vector3.applyProjection( this._projScreenMatrix );

						}

						var geometry = this.objects.update( object );

						if ( material instanceof MeshFaceMaterial ) {

							var groups = geometry.groups;
							var materials = material.materials;

							for ( var i = 0, l = groups.length; i < l; i ++ ) {

								var group = groups[ i ];
								var groupMaterial = materials[ group.materialIndex ];

								if ( groupMaterial.visible === true ) {

									this.pushRenderItem( object, geometry, groupMaterial, this._vector3.z, group );

								}

							}

						} else {

							this.pushRenderItem( object, geometry, material, this._vector3.z, null );

						}

					}

				}

			}

		}

		var children = object.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			this.projectObject( children[ i ], camera );

		}

	}

  filterFallback ( f ) {

		if ( f === THREE.NearestFilter || f === THREE.NearestMipMapNearestFilter || f === THREE.NearestMipMapLinearFilter ) {

			return this._gl.NEAREST;

		}

		return this._gl.LINEAR;

	}

  pushRenderItem( object, geometry, material, z, group ) {

		var array, index;

		// allocate the next position in the appropriate array

		if ( material.transparent ) {

			array = this.transparentObjects;
			index = ++ this.transparentObjectsLastIndex;

		} else {

			array = this.opaqueObjects;
			index = ++ this.opaqueObjectsLastIndex;

		}

		// recycle existing render item or grow the array

		var renderItem = array[ index ];

		if ( renderItem !== undefined ) {

			renderItem.id = object.id;
			renderItem.object = object;
			renderItem.geometry = geometry;
			renderItem.material = material;
			renderItem.z = this._vector3.z;
			renderItem.group = group;

		} else {

			renderItem = {
				id: object.id,
				object: object,
				geometry: geometry,
				material: material,
				z: this._vector3.z,
				group: group
			};

			// assert( index === array.length );
			array.push( renderItem );

		}

	}

  setupFrameBuffer ( framebuffer, renderTarget, textureTarget ) {

		this._gl.bindFramebuffer( this._gl.FRAMEBUFFER, framebuffer );
		this._gl.framebufferTexture2D( this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, textureTarget, this.properties.get( renderTarget.texture ).__webglTexture, 0 );

	}

  setupRenderBuffer ( renderbuffer, renderTarget ) {

		this._gl.bindRenderbuffer( this._gl.RENDERBUFFER, renderbuffer );

		if ( renderTarget.depthBuffer && ! renderTarget.stencilBuffer ) {

			this._gl.renderbufferStorage( this._gl.RENDERBUFFER, this._gl.DEPTH_COMPONENT16, renderTarget.width, renderTarget.height );
			this._gl.framebufferRenderbuffer( this._gl.FRAMEBUFFER, this._gl.DEPTH_ATTACHMENT, this._gl.RENDERBUFFER, renderbuffer );

		/* For some reason this is not working. Defaulting to RGBA4.
		} else if ( ! renderTarget.depthBuffer && renderTarget.stencilBuffer ) {
			_gl.renderbufferStorage( _gl.RENDERBUFFER, _gl.STENCIL_INDEX8, renderTarget.width, renderTarget.height );
			_gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.STENCIL_ATTACHMENT, _gl.RENDERBUFFER, renderbuffer );
		*/

		} else if ( renderTarget.depthBuffer && renderTarget.stencilBuffer ) {

			this._gl.renderbufferStorage( this._gl.RENDERBUFFER, this._gl.DEPTH_STENCIL, renderTarget.width, renderTarget.height );
			this._gl.framebufferRenderbuffer( this._gl.FRAMEBUFFER, this._gl.DEPTH_STENCIL_ATTACHMENT, this._gl.RENDERBUFFER, renderbuffer );

		} else {

			this._gl.renderbufferStorage( this._gl.RENDERBUFFER, this._gl.RGBA4, renderTarget.width, renderTarget.height );

		}

	}

}

export = WebGLRenderer;
