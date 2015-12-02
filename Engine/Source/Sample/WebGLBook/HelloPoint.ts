(function(){
  // HelloPint2.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' + // attribute variable
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';



class WaspRenderingContext{
  program ;

  constructor(public gl:WebGLRenderingContext){

  }
  loadShader(type, source) {
    // Create shader object
    var shader = this.gl.createShader(type);
    if (shader == null) {
      console.log('unable to create shader');
      return null;
    }

    // Set the shader program
    this.gl.shaderSource(shader, source);

    // Compile the shader
    this.gl.compileShader(shader);

    // Check the result of compilation
    var compiled = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
    if (!compiled) {
      var error = this.gl.getShaderInfoLog(shader);
      console.log('Failed to compile shader: ' + error);
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  createMyProgram(vshader, fshader) {
    // Create shader object
    var vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vshader);
    var fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fshader);
    if (!vertexShader || !fragmentShader) {
      return null;
    }

    // Create a program object
    var program = this.gl.createProgram();
    if (!program) {
      return null;
    }

    // Attach the shader objects
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);

    // Link the program object
    this.gl.linkProgram(program);

    // Check the result of linking
    var linked = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
    if (!linked) {
      var error = this.gl.getProgramInfoLog(program);
      console.log('Failed to link program: ' + error);
      this.gl.deleteProgram(program);
      this.gl.deleteShader(fragmentShader);
      this.gl.deleteShader(vertexShader);
      return null;
    }
    return program;
  }

  initShaders(vshader, fshader) {
    var program = this.createMyProgram(vshader, fshader);
    if (!program) {
      console.log('Failed to create program');
      return false;
    }

    this.gl.useProgram(program);
    this.program = program;

    return true;
  }


  static getWaspContext(canvas:HTMLCanvasElement):WaspRenderingContext{
     try{
       var gl:WaspRenderingContext = new WaspRenderingContext(canvas.getContext('experimental-webgl'))
     }catch(e){

     }
     if(!gl){
        alert("Could not initialise WebGL, sorry :-( ");
     }


     return gl;
 }

}





function main() {
  // Retrieve <canvas> element
  var canvas:HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('main');

  // Get the rendering context for WebGL
  var wasp:WaspRenderingContext = WaspRenderingContext.getWaspContext(canvas);

  // Initialize shaders
  wasp.initShaders(VSHADER_SOURCE, FSHADER_SOURCE)

  // Get the storage location of a_Position
  var a_Position = wasp.gl.getAttribLocation(wasp.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Pass vertex position to attribute variable
  wasp.gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);

  // Specify the color for clearing <canvas>
  wasp.gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  wasp.gl.clear(wasp.gl.COLOR_BUFFER_BIT);

  // Draw
  wasp.gl.drawArrays(wasp.gl.POINTS, 0, 1);
}

main();

})();
