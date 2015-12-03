import Vector3 from './Vector3';
import Matrix3 from './Matrix3';
export default class Plane{
  constructor(public normal?:Vector3,public constant?:number){
    this.normal = ( normal !== undefined ) ? normal : new Vector3( 1, 0, 0 );
	  this.constant = ( constant !== undefined ) ? constant : 0;
  }

  set( normal, constant ) {

		this.normal.copy( normal );
		this.constant = constant;

		return this;

	}

	setComponents( x, y, z, w ) {
  		this.normal.set( x, y, z );
  		this.constant = w;
  		return this;
  	}

    setFromNormalAndCoplanarPoint( normal, point ) {
  		this.normal.copy( normal );
  		this.constant = - point.dot( this.normal );	// must be this.normal, not normal, as this.normal is normalized
  		return this;
  	}

  setFromCoplanarPoints:(a,b,c)=>Plane =
    (()=>{
      var v1 = new Vector3();
		  var v2 = new Vector3();
      return (a,b,c)=>{
        var normal = v1.subVectors( c, b ).cross( v2.subVectors( a, b ) ).normalize();
  			// Q: should an error be thrown if normal is zero (e.g. degenerate plane)?
  			this.setFromNormalAndCoplanarPoint( normal, a );
  			return this;
      }
    })();

    clone() {

  		return new (<any>this).constructor().copy( this );

  	}

	copy( plane ) {

		this.normal.copy( plane.normal );
		this.constant = plane.constant;

		return this;

	}

	normalize() {

		// Note: will lead to a divide by zero if the plane is invalid.

		var inverseNormalLength = 1.0 / this.normal.length();
		this.normal.multiplyScalar( inverseNormalLength );
		this.constant *= inverseNormalLength;

		return this;

	}

  negate() {

		this.constant *= - 1;
		this.normal.negate();

		return this;

	}

	distanceToPoint( point ) {

		return this.normal.dot( point ) + this.constant;

	}

	distanceToSphere( sphere ) {
		return this.distanceToPoint( sphere.center ) - sphere.radius;
	}

	projectPoint( point, optionalTarget ) {
		return this.orthoPoint( point, optionalTarget ).sub( point ).negate();
	}

  orthoPoint( point, optionalTarget ) {
		var perpendicularMagnitude = this.distanceToPoint( point );
		var result = optionalTarget || new Vector3();
		return result.copy( this.normal ).multiplyScalar( perpendicularMagnitude );
	}

	isIntersectionLine( line ) {
		// Note: this tests if a line intersects the plane, not whether it (or its end-points) are coplanar with it.
		var startSign = this.distanceToPoint( line.start );
		var endSign = this.distanceToPoint( line.end );
		return ( startSign < 0 && endSign > 0 ) || ( endSign < 0 && startSign > 0 );
	}

  intersectLine:( line, optionalTarget )=>Plane = ( () =>{

		var v1 = new Vector3();

		return  ( line, optionalTarget )=> {

			var result = optionalTarget || new Vector3();

			var direction = line.delta( v1 );

			var denominator = this.normal.dot( direction );

			if ( denominator === 0 ) {

				// line is coplanar, return origin
				if ( this.distanceToPoint( line.start ) === 0 ) {

					return result.copy( line.start );

				}

				// Unsure if this is the correct method to handle this case.
				return undefined;

			}

			var t = - ( line.start.dot( this.normal ) + this.constant ) / denominator;

			if ( t < 0 || t > 1 ) {

				return undefined;

			}

			return result.copy( direction ).multiplyScalar( t ).add( line.start );

		};

	})();


	coplanarPoint( optionalTarget ) {

		var result = optionalTarget || new Vector3();
		return result.copy( this.normal ).multiplyScalar( - this.constant );

	}

	applyMatrix4:(matrix, optionalNormalMatrix)=>Plane =
    (() =>{

  		var v1 = new Vector3();
  		var v2 = new Vector3();
  		var m1 = new Matrix3();

  		return  ( matrix, optionalNormalMatrix )=> {

  			// compute new normal based on theory here:
  			// http://www.songho.ca/opengl/gl_normaltransform.html
  			var normalMatrix = optionalNormalMatrix || m1.getNormalMatrix( matrix );
  			var newNormal = v1.copy( this.normal ).applyMatrix3( normalMatrix );

  			var newCoplanarPoint = this.coplanarPoint( v2 );
  			newCoplanarPoint.applyMatrix4( matrix );

  			this.setFromNormalAndCoplanarPoint( newNormal, newCoplanarPoint );

  			return this;

  		};

	   })()

	translate( offset ) {
		this.constant = this.constant - offset.dot( this.normal );
		return this;
	}

	equals( plane ) {
		return plane.normal.equals( this.normal ) && ( plane.constant === this.constant );
	}

}
