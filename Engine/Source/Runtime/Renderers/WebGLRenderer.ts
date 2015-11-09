import Color = require('../Math/Color');
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
  private _premultipliedAlhpa;
  private _preserverDrawingBuffer;
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
  constructor(parametes){

  }
  setSize ( width, height, updateStyle?:any ) {

  }

  render(scene, camera, renderTarget?:any, forceClear?:any ){

  }
}

export = WebGLRenderer;
