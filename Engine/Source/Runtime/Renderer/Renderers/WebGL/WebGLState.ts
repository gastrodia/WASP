import BlendingMode = require('../BlendingMode');
class WebGLState{
  constructor(gl, extensions, paramThreeToGL ){

  }

  reset(){

  }

  setScissorTest( bool:boolean){

  }

  init(){

  }

  bindTexture(webglType, webglTexture){

  }

  texImage2D(...args){

  }

  setDepthTest(bool?:boolean){

  }

  initAttributes(){

  }

  enableAttribute(attribute){

  }

  setDepthWrite(bool?:boolean){

  }

  disableUnusedAttributes(){

  }

  setColorWrite(bool?:boolean){

  }

  setBlending( blending:BlendingMode, blendEquation?:any, blendSrc?:any, blendDst?:any, blendEquationAlpha?:any, blendSrcAlpha?:any, blendDstAlpha?:any){

  }

  setDepthFunc (depthFunc){

  }

  enable(id){

  }

  disable(id){

  }

  setFlipSided(flipSided){

  }
  activeTexture(webglSlot ){

  }

  setLineWidth(width){

  }

  getCompressedTextureFormats():any{

  }

  compressedTexImage2D(...args) {

	}

  setPolygonOffset ( polygonOffset, factor, units ) {

  }

  enableAttributeAndDivisor( programAttribute, meshPerAttribute, extension ){

  }

}

export = WebGLState;
