import Scene = require('./Runtime/Scenes/Scene');
import PerspectiveCamera = require('./Runtime/Cameras/PerspectiveCamera');
import WebGLRenderer = require('./Runtime/Renderers/WebGLRenderer');
import BoxGeometry = require('./Runtime/Extras/Geometries/BoxGeometry');
import MeshBasicMaterial = require('./Runtime/Materials/MeshBasicMaterial');
import Mesh = require('./Runtime/Objects/Mesh');
var scene = new Scene();
var camera = new PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new BoxGeometry( 1, 1, 1 );
var material = new MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5; 

var render = function () {
	requestAnimationFrame( render );

	cube.rotation.x += 0.1;
	cube.rotation.y += 0.1;

	renderer.render(scene, camera);
};

render();
