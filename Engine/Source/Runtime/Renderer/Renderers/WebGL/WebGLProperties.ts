class WebGLProperties{
  properties = {};

	get( object ) {

		var uuid = object.uuid;
		var map = this.properties[ uuid ];

		if ( map === undefined ) {

			map = {};
			this.properties[ uuid ] = map;

		}

		return map;

	};

	delete( object ) {

		delete this.properties[ object.uuid ];

	};

	clear() {

		this.properties = {};

	};
}

export = WebGLProperties;
