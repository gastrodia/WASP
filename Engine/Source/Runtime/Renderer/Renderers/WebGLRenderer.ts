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
  private _viewportX = 0;
  private _viewportY = 0;
  private _viewportWidth = this._canvas.width;
  private _viewportHeight = this._canvas.height;
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

  private _gl;
  private state:WebGLState;
  constructor(parameters){
    try{
      var attributes = {
			alpha: this._alpha,
			depth: this._depth,
			stencil: this._stencil,
			antialias: this._antialias,
			premultipliedAlpha: this._premultipliedAlpha,
			preserveDrawingBuffer: this._preserveDrawingBuffer
		};

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
	var objects = new WebGLObjects( this._gl, properties, this.info );
	var programCache = new WebGLPrograms( this, capabilities );

	this.info.programs = programCache.programs;

	var bufferRenderer = new WebGLBufferRenderer( this._gl, extensions, this._infoRender );
	var indexedBufferRenderer = new WebGLIndexedBufferRenderer( this._gl, extensions, this._infoRender );
  }

  glClearColor(r:number,g:number,b:number,a:number){
    if(this._premultipliedAlpha === true){
      r *= a; g *= a; b *= a;
    }
    this._gl.clearColor(r,g,b,a);
  }

  resetGLState(){
    this._currentProgram = null;
    this._currentCamera = null;
    this._currentGeometryProgram = '';
    this._currentMaterialId = -1;
    this._lightsNeedUpdate = true;
    this.state.reset();
  }

  onContextLost(){

  }

  paramThreeToGL ( p ){

  }

  setSize ( width, height, updateStyle?:any ) {

  }

  render(scene, camera, renderTarget?:any, forceClear?:any ){

  }
}

export = WebGLRenderer;
