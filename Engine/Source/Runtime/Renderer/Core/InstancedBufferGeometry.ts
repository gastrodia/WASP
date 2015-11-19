import BufferGeometry = require('./BufferGeometry');
class InstancedBufferGeometry extends BufferGeometry{
  maxInstancedCount;
  constructor(){
    super();
    this.type = 'InstancedBufferGeometry';
	  this.maxInstancedCount = undefined;
  }

  addGroup( start, count, instances ) {

    	this.groups.push( {

    		start: start,
    		count: count,
    		instances: instances

    	} );
  }

  copy ( source ) {

	var index = source.index;

	if ( index !== null ) {

		this.setIndex( index.clone() );

	}

	var attributes = source.attributes;

	for ( var name in attributes ) {

		var attribute = attributes[ name ];
		this.addAttribute( name, attribute.clone() );

	}

	var groups = source.groups;

	for ( var i = 0, l = groups.length; i < l; i ++ ) {

		var group = groups[ i ];
		this.addGroup( group.start, group.count, group.instances );

	}

	return this;

}
}

export = InstancedBufferGeometry;
