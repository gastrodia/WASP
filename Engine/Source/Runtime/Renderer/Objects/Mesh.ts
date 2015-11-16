import Object3D = require('../Core/Object3D');
import Geometry = require('../Core/Geometry');
import MeshBasicMaterial = require('../Materials/MeshBasicMaterial');
class Mesh extends Object3D{

  morphTargetBase = - 1;
  morphTargetInfluences = [];
  morphTargetDictionary = {};

  constructor(geometry,material){
    super();

  	this.type = 'Mesh';

  	this.geometry = geometry !== undefined ? geometry : new Geometry();
  	this.material = material !== undefined ? material : new MeshBasicMaterial( { color: Math.random() * 0xffffff } );

  	this.updateMorphTargets();
  }

  updateMorphTargets() {

  	if ( this.geometry.morphTargets !== undefined && this.geometry.morphTargets.length > 0 ) {

  		this.morphTargetBase = - 1;
  		this.morphTargetInfluences = [];
  		this.morphTargetDictionary = {};

  		for ( var m = 0, ml = this.geometry.morphTargets.length; m < ml; m ++ ) {

  			this.morphTargetInfluences.push( 0 );
  			this.morphTargetDictionary[ this.geometry.morphTargets[ m ].name ] = m;

  		}

  	}

  }

  getMorphTargetIndexByName( name ) {

  	if ( this.morphTargetDictionary[ name ] !== undefined ) {

  		return this.morphTargetDictionary[ name ];

  	}

  	console.warn( 'THREE.Mesh.getMorphTargetIndexByName: morph target ' + name + ' does not exist. Returning 0.' );

  	return 0;

  }

}

export = Mesh;
