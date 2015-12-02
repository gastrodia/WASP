(function(){
  var gl:WebGLRenderingContext ;
  function webGLStart(){
    var canvas:HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('main');
    initGL(canvas);
  }


  function initGL(canvas:HTMLCanvasElement){
    try{
      gl = canvas.getContext('experimental-webgl')
    }catch(e){

    }
    if(!gl){
       alert("Could not initialise WebGL, sorry :-( ");
    }
  }

  function initShaders(){

  }

  function initBuffers(){

  }
})();
