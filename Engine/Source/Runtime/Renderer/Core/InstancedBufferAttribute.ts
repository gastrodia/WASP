import BufferAttribute = require('./BufferAttribute');
class InstancedBufferAttribute extends BufferAttribute{
  meshPerAttribute;
  constructor(array, itemSize, meshPerAttribute ){
    super(array, itemSize)
    this.meshPerAttribute = meshPerAttribute || 1;
  }

  copy( source ) {

  	super.copy(source );

  	this.meshPerAttribute = source.meshPerAttribute;

  	return this;

  };
}

export = InstancedBufferAttribute;
