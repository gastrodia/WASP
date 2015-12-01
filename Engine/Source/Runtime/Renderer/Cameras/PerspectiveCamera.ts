import Camera = require('./Camera');
import MathUtils = require('../Math/MathUtil');
class PerspectiveCamera extends Camera{
  type = 'PerspectiveCamera';

  zoom;

  fov;
  aspect;
  near;
  far;

  fullWidth;
  fullHeight;
  x;
  y;
  width;
  height;

  constructor( fov, aspect, near, far){
    super();
    this.zoom = 1;
    this.fov = fov !== undefined ? fov : 50;
    this.aspect = aspect !== undefined ? aspect : 1;
    this.near = near !== undefined ? near : 0.1;
    this.far = far !== undefined ? far : 2000;

    this.updateProjectionMatrix();
  }

  setLens( focalLength, frameHeight ) {

  	if ( frameHeight === undefined ) frameHeight = 24;

  	this.fov = 2 * MathUtils.radToDeg( Math.atan( frameHeight / ( focalLength * 2 ) ) );
  	this.updateProjectionMatrix();

  };

  setViewOffset ( fullWidth, fullHeight, x, y, width, height ) {

	this.fullWidth = fullWidth;
	this.fullHeight = fullHeight;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

	this.updateProjectionMatrix();

};

updateProjectionMatrix = function () {

	var fov = MathUtils.radToDeg( 2 * Math.atan( Math.tan( MathUtils.degToRad( this.fov ) * 0.5 ) / this.zoom ) );

	if ( this.fullWidth ) {

		var aspect = this.fullWidth / this.fullHeight;
		var top = Math.tan( MathUtils.degToRad( fov * 0.5 ) ) * this.near;
		var bottom = - top;
		var left = aspect * bottom;
		var right = aspect * top;
		var width = Math.abs( right - left );
		var height = Math.abs( top - bottom );

		this.projectionMatrix.makeFrustum(
			left + this.x * width / this.fullWidth,
			left + ( this.x + this.width ) * width / this.fullWidth,
			top - ( this.y + this.height ) * height / this.fullHeight,
			top - this.y * height / this.fullHeight,
			this.near,
			this.far
		);

	} else {

		this.projectionMatrix.makePerspective( fov, this.aspect, this.near, this.far );

	}

};


copy ( source ) {

	super.copy( this, source );

	this.fov = source.fov;
	this.aspect = source.aspect;
	this.near = source.near;
	this.far = source.far;

	this.zoom = source.zoom;

	return this;

};

toJSON( meta ) {

	var data = super.toJSON(meta );

	data.object.zoom = this.zoom;
	data.object.fov = this.fov;
	data.object.aspect = this.aspect;
	data.object.near = this.near;
	data.object.far = this.far;

	return data;

};

}


export = PerspectiveCamera;
