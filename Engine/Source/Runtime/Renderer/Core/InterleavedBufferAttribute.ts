import MathUtil = require('../Math/MathUtil');
class InterleavedBufferAttribute{
  uuid = MathUtil.generateUUID();
  data;
  constructor(interleavedBuffer,public itemSize,public offset ){
    this.data = interleavedBuffer;
  }


  get count() {
		return this.data.array.length / this.data.stride;
	}




  	setX( index, x ) {

  		this.data.array[ index * this.data.stride + this.offset ] = x;

  		return this;

  	}

  	setY( index, y ) {

  		this.data.array[ index * this.data.stride + this.offset + 1 ] = y;

  		return this;

  	}

  	setZ( index, z ) {

  		this.data.array[ index * this.data.stride + this.offset + 2 ] = z;

  		return this;

  	}

  	setW( index, w ) {

  		this.data.array[ index * this.data.stride + this.offset + 3 ] = w;

  		return this;

  	}

  	getX( index ) {

  		return this.data.array[ index * this.data.stride + this.offset ];

  	}

  	getY( index ) {

  		return this.data.array[ index * this.data.stride + this.offset + 1 ];

  	}

  	getZ( index ) {

  		return this.data.array[ index * this.data.stride + this.offset + 2 ];

  	}

  	getW( index ) {

  		return this.data.array[ index * this.data.stride + this.offset + 3 ];

  	}

  	setXY( index, x, y ) {

  		index = index * this.data.stride + this.offset;

  		this.data.array[ index + 0 ] = x;
  		this.data.array[ index + 1 ] = y;

  		return this;

  	}

  	setXYZ( index, x, y, z ) {

  		index = index * this.data.stride + this.offset;

  		this.data.array[ index + 0 ] = x;
  		this.data.array[ index + 1 ] = y;
  		this.data.array[ index + 2 ] = z;

  		return this;

  	}

  	setXYZW( index, x, y, z, w ) {

  		index = index * this.data.stride + this.offset;

  		this.data.array[ index + 0 ] = x;
  		this.data.array[ index + 1 ] = y;
  		this.data.array[ index + 2 ] = z;
  		this.data.array[ index + 3 ] = w;

  		return this;

  	}
}




export = InterleavedBufferAttribute;
