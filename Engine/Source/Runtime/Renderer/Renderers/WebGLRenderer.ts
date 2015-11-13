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
	var programCache = new WebGLPrograms( this, capabilities );

	this.info.programs = programCache.programs;

	var bufferRenderer = new WebGLBufferRenderer( this._gl, extensions, this._infoRender );
	var indexedBufferRenderer = new WebGLIndexedBufferRenderer( this._gl, extensions, this._infoRender );


  this.context = this._gl;
	this.capabilities = capabilities;
	this.extensions = extensions;


  var shadowMap = new WebGLShadowMap( this, this.lights, objects );
  this.shadowMap = shadowMap;

  var spritePlugin = new SpritePlugin( this, this.sprites );
	var lensFlarePlugin = new LensFlarePlugin( this, this.lensFlares );

  }

  private capabilities:WebGLCapabilities;
  private extensions:WebGLExtensions;
  private shadowMap:WebGLShadowMap;
  private properties:WebGLProperties;

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

  setSize( width, height, updateStyle ) {

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

  onTextureDispose( event ) {

		var texture = event.target;

		texture.removeEventListener( 'dispose', this.onTextureDispose );

		this.deallocateTexture( texture );

		this._infoMemory.textures --;


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

  }


  render(scene, camera, renderTarget?:any, forceClear?:any ){

  }
}

export = WebGLRenderer;
