import Color = require('../Math/Color');
import Vector2 = require('../Math/Vector2');
import Vector3 = require('../Math/Vector3');
import Vector4 = require('../Math/Vector4');
class BufferAttribute{
  array;
  itemSize;
  dynamic;
  updateRange;
  version;
  constructor(array, itemSize ?:any){
    this.array = array;
	this.itemSize = itemSize;

	this.dynamic = false;
	this.updateRange = { offset: 0, count: - 1 };

	this.version = 0;
  }

  position;

  get count() {

		return this.array.length / this.itemSize;

	}

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

	setDynamic( value ) {

		this.dynamic = value;

		return this;

	}

	copy( source ) {

		this.array = new source.array.constructor( source.array );
		this.itemSize = source.itemSize;

		this.dynamic = source.dynamic;

		return this;

	}

	copyAt( index1, attribute, index2 ) {

		index1 *= this.itemSize;
		index2 *= attribute.itemSize;

		for ( var i = 0, l = this.itemSize; i < l; i ++ ) {

			this.array[ index1 + i ] = attribute.array[ index2 + i ];

		}

		return this;

	}

	copyArray( array ) {

		this.array.set( array );

		return this;

	}

	copyColorsArray( colors ) {

		var array = this.array, offset = 0;

		for ( var i = 0, l = colors.length; i < l; i ++ ) {

			var color = colors[ i ];

			if ( color === undefined ) {

				console.warn( 'THREE.BufferAttribute.copyColorsArray(): color is undefined', i );
				color = new Color();

			}

			array[ offset ++ ] = color.r;
			array[ offset ++ ] = color.g;
			array[ offset ++ ] = color.b;

		}

		return this;

	}

	copyIndicesArray( indices ) {

		var array = this.array, offset = 0;

		for ( var i = 0, l = indices.length; i < l; i ++ ) {

			var index = indices[ i ];

			array[ offset ++ ] = index.a;
			array[ offset ++ ] = index.b;
			array[ offset ++ ] = index.c;

		}

		return this;

	}

	copyVector2sArray( vectors ) {

		var array = this.array, offset = 0;

		for ( var i = 0, l = vectors.length; i < l; i ++ ) {

			var vector = vectors[ i ];

			if ( vector === undefined ) {

				console.warn( 'THREE.BufferAttribute.copyVector2sArray(): vector is undefined', i );
				vector = new Vector2();

			}

			array[ offset ++ ] = vector.x;
			array[ offset ++ ] = vector.y;

		}

		return this;

	}

	copyVector3sArray( vectors ) {

		var array = this.array, offset = 0;

		for ( var i = 0, l = vectors.length; i < l; i ++ ) {

			var vector = vectors[ i ];

			if ( vector === undefined ) {

				console.warn( 'THREE.BufferAttribute.copyVector3sArray(): vector is undefined', i );
				vector = new Vector3();

			}

			array[ offset ++ ] = vector.x;
			array[ offset ++ ] = vector.y;
			array[ offset ++ ] = vector.z;

		}

		return this;

	}

	copyVector4sArray( vectors ) {

		var array = this.array, offset = 0;

		for ( var i = 0, l = vectors.length; i < l; i ++ ) {

			var vector = vectors[ i ];

			if ( vector === undefined ) {

				console.warn( 'THREE.BufferAttribute.copyVector4sArray(): vector is undefined', i );
				vector = new Vector4();

			}

			array[ offset ++ ] = vector.x;
			array[ offset ++ ] = vector.y;
			array[ offset ++ ] = vector.z;
			array[ offset ++ ] = vector.w;

		}

		return this;

	}

	set( value, offset ) {

		if ( offset === undefined ) offset = 0;

		this.array.set( value, offset );

		return this;

	}

	getX( index ) {

		return this.array[ index * this.itemSize ];

	}

	setX( index, x ) {

		this.array[ index * this.itemSize ] = x;

		return this;

	}

	getY( index ) {

		return this.array[ index * this.itemSize + 1 ];

	}

	setY( index, y ) {

		this.array[ index * this.itemSize + 1 ] = y;

		return this;

	}

	getZ ( index ) {

		return this.array[ index * this.itemSize + 2 ];

	}

	setZ( index, z ) {

		this.array[ index * this.itemSize + 2 ] = z;

		return this;

	}

	getW( index ) {

		return this.array[ index * this.itemSize + 3 ];

	}

	setW( index, w ) {

		this.array[ index * this.itemSize + 3 ] = w;

		return this;

	}

	setXY( index, x, y ) {

		index *= this.itemSize;

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;

		return this;

	}

	setXYZ( index, x, y, z ) {

		index *= this.itemSize;

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;

		return this;

	}

	setXYZW( index, x, y, z, w ) {

		index *= this.itemSize;

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;
		this.array[ index + 3 ] = w;

		return this;

	}

	clone() {

		return new (<any>this).constructor().copy( this );

	}
}
export = BufferAttribute;
