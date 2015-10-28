import Object3D = require('../Core/Object3D');
import Matrix4 = require('../Math/Matrix4');
import Quaternion = require('../Math/Quaternion');
import Vector3 = require('../Math/Vector3');
class Camera extends Object3D{
  type = 'Camera';
  matrixWorldInverse = new Matrix4();
  projectionMatrix = new Matrix4();


  getWorldDirection(optionalTarget ){
    var quaternion = new Quaternion();
    var result = optionalTarget || new Vector3();

    		this.getWorldQuaternion( quaternion );

    		return result.set( 0, 0, - 1 ).applyQuaternion( quaternion );
  }

  lookAt(vector){
    var m1 = new Matrix4();
    m1.lookAt( this.position, vector, this.up );

  this.quaternion.setFromRotationMatrix( m1 );

  }

  clone () {

	return this.copy( this );

};

copy(source, recursive?:any) {

	super.copy( this, source );

	this.matrixWorldInverse.copy( source.matrixWorldInverse );
	this.projectionMatrix.copy( source.projectionMatrix );

	return this;

};
}



export = Camera;
