import WebGLGeometries = require('./WebGLGeometries');
import Geometry = require('../../Core/Geometry');
import InterleavedBufferAttribute = require('../../Core/InterleavedBufferAttribute');
import BufferAttribute = require('../../Core/BufferAttribute')
class WebGLObjects{
  geometries ;
  constructor(private gl, private properties,private info){
    this.geometries = new WebGLGeometries( gl, properties, info );
  }

  update( object ) {

		// TODO: Avoid updating twice (when using shadowMap). Maybe add frame counter.

		var geometry = this.geometries.get( object );

		if ( object.geometry instanceof Geometry ) {

			geometry.updateFromObject( object );

		}

		var index = geometry.index;
		var attributes = geometry.attributes;

		if ( index !== null ) {

			this.updateAttribute( index, this.gl.ELEMENT_ARRAY_BUFFER );

		}

		for ( var name in attributes ) {

			this.updateAttribute( attributes[ name ], this.gl.ARRAY_BUFFER );

		}

		// morph targets

		var morphAttributes = geometry.morphAttributes;

		for ( var name in morphAttributes ) {

			var array = morphAttributes[ name ];

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				this.updateAttribute( array[ i ], this.gl.ARRAY_BUFFER );

			}

		}

		return geometry;

	}

	updateAttribute( attribute, bufferType ) {

		var data = ( attribute instanceof InterleavedBufferAttribute ) ? attribute.data : attribute;

		var attributeProperties = this.properties.get( data );

		if ( attributeProperties.__webglBuffer === undefined ) {

			this.createBuffer( attributeProperties, data, bufferType );

		} else if ( attributeProperties.version !== data.version ) {

			this.updateBuffer( attributeProperties, data, bufferType );

		}

	}

	createBuffer( attributeProperties, data, bufferType ) {

    var gl = this.gl;

		attributeProperties.__webglBuffer = gl.createBuffer();
		gl.bindBuffer( bufferType, attributeProperties.__webglBuffer );

		var usage = data.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;

		gl.bufferData( bufferType, data.array, usage );

		attributeProperties.version = data.version;

	}

	updateBuffer( attributeProperties, data, bufferType ) {

    var gl = this.gl;

		gl.bindBuffer( bufferType, attributeProperties.__webglBuffer );

		if ( data.dynamic === false || data.updateRange.count === - 1 ) {

			// Not using update ranges

			gl.bufferSubData( bufferType, 0, data.array );

		} else if ( data.updateRange.count === 0 ) {

			console.error( 'THREE.WebGLObjects.updateBuffer: dynamic THREE.BufferAttribute marked as needsUpdate but updateRange.count is 0, ensure you are using set methods or updating manually.' );

		} else {

			gl.bufferSubData( bufferType, data.updateRange.offset * data.array.BYTES_PER_ELEMENT,
							  data.array.subarray( data.updateRange.offset, data.updateRange.offset + data.updateRange.count ) );

			data.updateRange.count = 0; // reset range

		}

		attributeProperties.version = data.version;

	}

	getAttributeBuffer( attribute ) {

		if ( attribute instanceof InterleavedBufferAttribute ) {

			return this.properties.get( attribute.data ).__webglBuffer;

		}

		return this.properties.get( attribute ).__webglBuffer;

	}

	getWireframeAttribute( geometry ) {

		var property = this.properties.get( geometry );

		if ( property.wireframe !== undefined ) {

			return property.wireframe;

		}

		var indices = [];

		var index = geometry.index;
		var attributes = geometry.attributes;
		var position = attributes.position;

		// console.time( 'wireframe' );

		if ( index !== null ) {

			var edges = {};
			var array = index.array;

			for ( var i = 0, l = array.length; i < l; i += 3 ) {

				var a = array[ i + 0 ];
				var b = array[ i + 1 ];
				var c = array[ i + 2 ];

				if ( this.checkEdge( edges, a, b ) ) indices.push( a, b );
				if ( this.checkEdge( edges, b, c ) ) indices.push( b, c );
				if ( this.checkEdge( edges, c, a ) ) indices.push( c, a );

			}

		} else {

			var array = attributes.position.array;

			for ( var i:number = 0, l:any = ( array.length / 3 ) - 1; i < l; i += 3 ) {

				var a:any = i + 0;
				var b:any = i + 1;
				var c:any = i + 2;

				indices.push( a, b, b, c, c, a );

			}

		}

		// console.timeEnd( 'wireframe' );

		var TypeArray = position.count > 65535 ? Uint32Array : Uint16Array;
		var attribute = new BufferAttribute( new TypeArray( indices ), 1 );

		this.updateAttribute( attribute, this.gl.ELEMENT_ARRAY_BUFFER );

		property.wireframe = attribute;

		return attribute;

	}

	checkEdge( edges, a, b ) {

		if ( a > b ) {

			var tmp = a;
			a = b;
			b = tmp;

		}

		var list = edges[ a ];

		if ( list === undefined ) {

			edges[ a ] = [ b ];
			return true;

		} else if ( list.indexOf( b ) === -1 ) {

			list.push( b );
			return true;

		}

		return false;

	}


}

export = WebGLObjects;
