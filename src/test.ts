import Wasp = require('./Wasp');
var camera = new Wasp.Camera();
var scene = new Wasp.Scene();
var renderer = new Wasp.Renderer();
renderer.render(scene, camera);
