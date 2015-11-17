import BufferGeometry = require('../../Core/BufferGeometry');
import Geometry = require('../../Core/Geometry');
import InterleavedBufferAttribute = require('../../Core/InterleavedBufferAttribute');
class WebGLGeometries {
  geometries = {};
  constructor(private gl, private properties, private info ) {

  }

  get( object ) {

    var geometry = object.geometry;

    if ( this.geometries[ geometry.id ] !== undefined ) {

      return this.geometries[ geometry.id ];

    }

    geometry.addEventListener( 'dispose', this.onGeometryDispose );

    var buffergeometry;

    if ( geometry instanceof BufferGeometry ) {

      buffergeometry = geometry;

    } else if ( geometry instanceof Geometry ) {

      if ( geometry._bufferGeometry === undefined ) {

        geometry._bufferGeometry = new BufferGeometry().setFromObject( object );

      }

      buffergeometry = geometry._bufferGeometry;

    }

    this.geometries[ geometry.id ] = buffergeometry;

    this.info.memory.geometries ++;

    return buffergeometry;

  }

  onGeometryDispose( event ) {

		var geometry = event.target;
		var buffergeometry = this.geometries[ geometry.id ];

		this.deleteAttributes( buffergeometry.attributes );

		geometry.removeEventListener( 'dispose', this.onGeometryDispose );

		delete this.geometries[ geometry.id ];

		var property = this.properties.get( geometry );
		if ( property.wireframe ) this.deleteAttribute( property.wireframe );

		this.info.memory.geometries --;

	}

  getAttributeBuffer( attribute ) {

		if ( attribute instanceof InterleavedBufferAttribute ) {

			return this.properties.get( attribute.data ).__webglBuffer;

		}

		return this.properties.get( attribute ).__webglBuffer;

	}

  deleteAttribute( attribute ) {

		var buffer = this.getAttributeBuffer( attribute );

		if ( buffer !== undefined ) {

			this.gl.deleteBuffer( buffer );
			this.removeAttributeBuffer( attribute );

		}

	}

  deleteAttributes( attributes ) {

		for ( var name in attributes ) {

			this.deleteAttribute( attributes[ name ] );

		}

	}

  removeAttributeBuffer( attribute ) {

		if ( attribute instanceof InterleavedBufferAttribute ) {

			this.properties.delete( attribute.data );

		} else {

			this.properties.delete( attribute );

		}

	}



}

export = WebGLGeometries;
