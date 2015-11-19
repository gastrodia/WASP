import InterleavedBufferAttribute = require('../../Core/InterleavedBufferAttribute');
class WebGLBufferRenderer{
  mode;

	setMode( value ) {
		this.mode = value;
	}

  render( start, count ) {

		this._gl.drawArrays( this.mode, start, count );

		this._infoRender.calls ++;
		this._infoRender.vertices += count;
		if ( this.mode === this._gl.TRIANGLES ) this._infoRender.faces += count / 3;

	}

  renderInstances( geometry ) {

		var extension = this.extensions.get( 'ANGLE_instanced_arrays' );

		if ( extension === null ) {

			console.error( 'THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
			return;

		}

		var position = geometry.attributes.position;

		if ( position instanceof InterleavedBufferAttribute ) {

			extension.drawArraysInstancedANGLE( this.mode, 0, position.data.count, geometry.maxInstancedCount );

		} else {

			extension.drawArraysInstancedANGLE( this.mode, 0, position.count, geometry.maxInstancedCount );

		}

	}

  constructor(private _gl, private extensions,private _infoRender){

  }
}

export = WebGLBufferRenderer;
