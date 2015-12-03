

import Wasp from '../Wasp' ;

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

// Retrieve <canvas> element
var canvas:HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('main');

// Get the rendering context for WebGL
var wasp = Wasp.RenderingContext.getWaspContext(canvas);

// Initialize shaders
wasp.initShaders(VSHADER_SOURCE, FSHADER_SOURCE)

// Get the storage location of a_Position
var a_Position = wasp.gl.getAttribLocation(wasp.program, 'a_Position');
if (a_Position < 0) {
	console.log('Failed to get the storage location of a_Position');
}

// Pass vertex position to attribute variable
wasp.gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);

// Specify the color for clearing <canvas>
wasp.gl.clearColor(0.0, 0.0, 0.0, 1.0);

// Clear <canvas>
wasp.gl.clear(wasp.gl.COLOR_BUFFER_BIT);

// Draw
wasp.gl.drawArrays(wasp.gl.POINTS, 0, 1);
