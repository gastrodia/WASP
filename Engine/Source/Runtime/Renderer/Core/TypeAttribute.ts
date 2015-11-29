import BufferAttribute = require('./BufferAttribute');

declare var Uint8ClampedArray;

export class Int8Attribute extends BufferAttribute{
  constructor( array, itemSize ) {
      super( new Int8Array( array ), itemSize )
  };
}

export class Uint8Attribute extends BufferAttribute{
  constructor( array, itemSize ) {
      super( new Uint8Array( array ), itemSize )
  };
}

export class Uint8ClampedAttribute extends BufferAttribute{
  constructor( array, itemSize ) {
      super( new Uint8ClampedArray( array ), itemSize )
  }
}


export class Int16Attribute extends BufferAttribute {
  constructor( array, itemSize ) {
      super( new Int16Array( array ), itemSize )
  };
}

export class Uint16Attribute extends BufferAttribute{

  constructor( array, itemSize ) {
      super( new Uint16Array( array ), itemSize )
  };

};

export class Int32Attribute extends BufferAttribute{

  constructor( array, itemSize ) {
      super( new Int32Array( array ), itemSize )
  };

};

export class Uint32Attribute extends BufferAttribute{

  constructor( array, itemSize ) {
      super( new Uint32Array( array ), itemSize )
  };

};

export class Float32Attribute extends BufferAttribute{

  constructor( array, itemSize ) {
      super( new Float32Array( array ), itemSize )
  };

};

export class Float64Attribute extends BufferAttribute{

  constructor( array, itemSize ) {
      super( new Float64Array( array ), itemSize )
  };

};
