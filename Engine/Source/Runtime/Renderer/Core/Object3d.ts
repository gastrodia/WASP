import MathUtils = require('../Math/MathUtil');
import Vector3 = require('../Math/Vector3');
import Matrix4 = require('../Math/Matrix4');
import Matrix3 = require('../Math/Matrix3');
import Euler = require('../Math/Euler');
import Quaternion = require('../Math/Quaternion');
import EventDispatcher = require('./EventDispatcher');
import Channels = require('./Channels');

class Object3D extends EventDispatcher{

static DefaultUp = new Vector3( 0, 1, 0 );
static DefaultMatrixAutoUpdate = true;

  static Object3DIdCount = 0;
  uuid;
  id;
  name;
  type;
  parent;
  channels;
  children;



	up;

  position ;

	rotation;
	quaternion ;
	scale ;
	modelViewMatrix;
	normalMatrix ;

  rotationAutoUpdate ;

  matrix;
  matrixWorld ;

  matrixAutoUpdate;
  matrixWorldNeedsUpdate;

  visible;

  castShadow ;
  receiveShadow ;
  frustumCulled  ;
  renderOrder;

  geometry;
  material;

  userData ;

constructor(){
  super();

  this.id = Object3D.Object3DIdCount ++;
  this.uuid = MathUtils.generateUUID();
  this.name = '';
  this.type = 'Object3D';
  this.parent = null;
  this.channels = new Channels();
  this.children = [];
  this.up = Object3D.DefaultUp.clone();

  this.channels = new Channels();

  var position = new Vector3();
  var rotation = new Euler();
  var quaternion = new Quaternion();
  var scale = new Vector3(1,1,1);



  this.position = position;
  this.rotation = rotation;
  this.quaternion = quaternion;
  this.scale = scale;
  this.modelViewMatrix = new Matrix4();
  this.normalMatrix = new Matrix3();

  this.rotationAutoUpdate = true;
  this.matrix = new Matrix4();

  this.matrixWorld = new Matrix4();
  this.matrixAutoUpdate = Object3D.DefaultMatrixAutoUpdate;
  this.matrixWorldNeedsUpdate = true;

  this.visible = true;
  this.castShadow = false;
  this.receiveShadow = false;
  this.frustumCulled = true;
  this.renderOrder = 0;
  this.userData = {};

  this.rotation.onChange( ()=>{
    this.quaternion.setFromEuler( this.rotation, false );
  } );
  this.quaternion.onChange( ()=>{
    this.rotation.setFromQuaternion( this.quaternion, undefined, false );
  } );
}

  get eulerOrder(){
    return   this.rotation.order;
  }

  set eulerOrder(value){
    this.rotation.order = value;
  }


	applyMatrix ( matrix ) {

		this.matrix.multiplyMatrices( matrix, this.matrix );

		this.matrix.decompose( this.position, this.quaternion, this.scale );

	}

  setRotationFromAxisAngle( axis, angle ) {

  		// assumes axis is normalized

  		this.quaternion.setFromAxisAngle( axis, angle );

  	}

    setRotationFromMatrix (m) {

  		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

  		this.quaternion.setFromRotationMatrix( m );

  	}

    setRotationFromQuaternion( q ) {

    		// assumes q is normalized

    		this.quaternion.copy( q );

    	}

      rotateOnAxis( axis, angle){
        var q1 = new Quaternion();
        q1.setFromAxisAngle( axis, angle );

  			this.quaternion.multiply( q1 );

  			return this;
      }

      rotateX(angle){
        var v1 = new Vector3( 1, 0, 0 );
        return this.rotateOnAxis(v1,angle);
      }

      rotateY(angle ) {
		      var v1 = new Vector3( 0, 1, 0 );
			    return this.rotateOnAxis( v1, angle );
	     }

       rotateZ(angle){
         var v1 = new Vector3( 0, 0, 1 );
         return this.rotateOnAxis( v1, angle );
       }

       translateOnAxis(axis, distance){
         var v1 = new Vector3();
         v1.copy( axis ).applyQuaternion( this.quaternion );

         			this.position.add( v1.multiplyScalar( distance ) );

         			return this;
       }

       translate( distance, axis ) {

    		console.warn( 'THREE.Object3D: .translate() has been removed. Use .translateOnAxis( axis, distance ) instead.' );
    		return this.translateOnAxis( axis, distance );

    	}

      translateX(distance ){
        var v1 = new Vector3( 1, 0, 0 );
        return this.translateOnAxis( v1, distance );
      }

      translateY( distance ){
                var v1 = new Vector3( 0, 1, 0 );
         this.translateOnAxis( v1, distance );
      }

      translateZ(distance){
        var v1 = new Vector3( 0, 0, 1 );
        return this.translateOnAxis( v1, distance );
      }
      localToWorld(vector){
        return vector.applyMatrix4( this.matrixWorld );
      }

      worldToLocal(vector){
	    var m1 = new Matrix4();
			return vector.applyMatrix4( m1.getInverse( this.matrixWorld ) );
      }

      lookAt(vector){
        var m1 = new Matrix4();
        m1.lookAt( vector, this.position, this.up );

			this.quaternion.setFromRotationMatrix( m1 );
      }

      add(object){
        if ( arguments.length > 1 ) {

        			for ( var i = 0; i < arguments.length; i ++ ) {

        				this.add( arguments[ i ] );

        			}

        			return this;

        		}

        		if ( object === this ) {

        			console.error( "Object3D.add: object can't be added as a child of itself.", object );
        			return this;

        		}

        		if ( object instanceof Object3D ) {

        			if ( object.parent !== null ) {

        				object.parent.remove( object );

        			}

        			object.parent = this;
        			object.dispatchEvent( { type: 'added' } );

        			this.children.push( object );

        		} else {

        			console.error( "Object3D.add: object not an instance of THREE.Object3D.", object );

        		}

        		return this;

      }

      remove ( object ) {

    		if ( arguments.length > 1 ) {

    			for ( var i = 0; i < arguments.length; i ++ ) {

    				this.remove( arguments[ i ] );

    			}

    		}

    		var index = this.children.indexOf( object );

    		if ( index !== - 1 ) {

    			object.parent = null;

    			object.dispatchEvent( { type: 'removed' } );

    			this.children.splice( index, 1 );

    		}

    	}
      getObjectById ( id ) {

      		return this.getObjectByProperty( 'id', id );

      	}

        getObjectByName ( name ) {

        		return this.getObjectByProperty( 'name', name );

        	}

          getObjectByProperty ( name, value ) {

		if ( this[ name ] === value ) return this;

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			var child = this.children[ i ];
			var object = child.getObjectByProperty( name, value );

			if ( object !== undefined ) {

				return object;

			}

		}

		return undefined;

	}

  getWorldPosition( optionalTarget ) {

		var result = optionalTarget || new Vector3();

		this.updateMatrixWorld( true );

		return result.setFromMatrixPosition( this.matrixWorld );

	}

  getWorldQuaternion( optionalTarget){
    var position = new Vector3();
    var scale = new Vector3();
    var result = optionalTarget || new Quaternion();

    			this.updateMatrixWorld( true );

    			this.matrixWorld.decompose( position, result, scale );

    			return result;
  }

  getWorldRotation( optionalTarget){
    var quaternion = new Quaternion();
    var result = optionalTarget || new Euler();

			this.getWorldQuaternion( quaternion );

			return result.setFromQuaternion( quaternion, this.rotation.order, false );
  }

  getWorldScale(optionalTarget){

    var position = new Vector3();
		var quaternion = new Quaternion();

			var result = optionalTarget || new Vector3();

			this.updateMatrixWorld( true );

			this.matrixWorld.decompose( position, quaternion, result );

			return result;
  }

  getWorldDirection(optionalTarget){

    		var quaternion = new Quaternion();

    			var result = optionalTarget || new Vector3();

    			this.getWorldQuaternion( quaternion );

    			return result.set( 0, 0, 1 ).applyQuaternion( quaternion );
  }

  raycast () {

  }

  traverse ( callback ) {

		callback( this );

		var children = this.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].traverse( callback );

		}

	}

  traverseVisible(callback){
    if ( this.visible === false ) return;

    		callback( this );

    		var children = this.children;

    		for ( var i = 0, l = children.length; i < l; i ++ ) {

    			children[ i ].traverseVisible( callback );

    		}
  }

  traverseAncestors( callback ) {

  		var parent = this.parent;

  		if ( parent !== null ) {

  			callback( parent );

  			parent.traverseAncestors( callback );

  		}

  	}

    updateMatrix () {

    		this.matrix.compose( this.position, this.quaternion, this.scale );

    		this.matrixWorldNeedsUpdate = true;

    	}

  updateMatrixWorld( force?:boolean ) {

  if ( this.matrixAutoUpdate === true ) this.updateMatrix();

  if ( this.matrixWorldNeedsUpdate === true || force === true ) {

    if ( this.parent === null ) {

      this.matrixWorld.copy( this.matrix );

    } else {

      this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

    }

    this.matrixWorldNeedsUpdate = false;

    force = true;

  }

  // update children

  for ( var i = 0, l = this.children.length; i < l; i ++ ) {

    this.children[ i ].updateMatrixWorld( force );

  }



}


toJSON ( meta ) {

		var isRootObject = ( meta === undefined );

		var output:any = {};

		// meta is a hash used to collect geometries, materials.
		// not providing it implies that this is the root object
		// being serialized.
		if ( isRootObject ) {

			// initialize meta obj
			meta = {
				geometries: {},
				materials: {},
				textures: {},
				images: {}
			};

			output.metadata = {
				version: 4.4,
				type: 'Object',
				generator: 'Object3D.toJSON'
			};

		}

		// standard Object3D serialization

		var object:any = {};

		object.uuid = this.uuid;
		object.type = this.type;

		if ( this.name !== '' ) object.name = this.name;
		if ( JSON.stringify( this.userData ) !== '{}' ) object.userData = this.userData;
		if ( this.castShadow === true ) object.castShadow = true;
		if ( this.receiveShadow === true ) object.receiveShadow = true;
		if ( this.visible === false ) object.visible = false;


		object.matrix = this.matrix.toArray();

		//

		if ( this.geometry !== undefined ) {

			if ( meta.geometries[ this.geometry.uuid ] === undefined ) {

				meta.geometries[ this.geometry.uuid ] = this.geometry.toJSON( meta );

			}

			object.geometry = this.geometry.uuid;

		}

		if ( this.material !== undefined ) {

			if ( meta.materials[ this.material.uuid ] === undefined ) {

				meta.materials[ this.material.uuid ] = this.material.toJSON( meta );

			}

			object.material = this.material.uuid;

		}

		//

		if ( this.children.length > 0 ) {

			object.children = [];

			for ( var i = 0; i < this.children.length; i ++ ) {

				object.children.push( this.children[ i ].toJSON( meta ).object );

			}

		}

		if ( isRootObject ) {

			var geometries = extractFromCache( meta.geometries );
			var materials = extractFromCache( meta.materials );
			var textures = extractFromCache( meta.textures );
			var images = extractFromCache( meta.images );

			if ( geometries.length > 0 ) output.geometries = geometries;
			if ( materials.length > 0 ) output.materials = materials;
			if ( textures.length > 0 ) output.textures = textures;
			if ( images.length > 0 ) output.images = images;

		}

		output.object = object;

		return output;

		// extract data from the cache hash
		// remove metadata on each item
		// and return as array
		function extractFromCache ( cache ) {

			var values = [];
			for ( var key in cache ) {

				var data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}
			return values;

		}

	}


  clone( recursive ) {

  		return new Object3D().copy( this, recursive );

  	}

    copy( source, recursive?:any ) :Object3D{

		if ( recursive === undefined ) recursive = true;

		this.name = source.name;

		this.up.copy( source.up );

		this.position.copy( source.position );
		this.quaternion.copy( source.quaternion );
		this.scale.copy( source.scale );

		this.rotationAutoUpdate = source.rotationAutoUpdate;

		this.matrix.copy( source.matrix );
		this.matrixWorld.copy( source.matrixWorld );

		this.matrixAutoUpdate = source.matrixAutoUpdate;
		this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

		this.visible = source.visible;

		this.castShadow = source.castShadow;
		this.receiveShadow = source.receiveShadow;

		this.frustumCulled = source.frustumCulled;
		this.renderOrder = source.renderOrder;

		this.userData = JSON.parse( JSON.stringify( source.userData ) );

		if ( recursive === true ) {

			for ( var i = 0; i < source.children.length; i ++ ) {

				var child = source.children[ i ];
				this.add( child.clone() );

			}

		}

		return this;

	}



}


export = Object3D;
