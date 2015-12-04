import Vector3 from './Vector3';
import Matrix4 from './Matrix4';
export default class Matrix3{


  constructor(public elements:Float32Array =
    new Float32Array([
      1, 0, 0,
  		0, 1, 0,
  		0, 0, 1
    ])
  ){

  }

  set(
    n11:number,n12:number,n13:number,
    n21:number,n22:number,n23:number,
    n31:number,n32:number,n33:number
  ){
    var te = this.elements;
    te[0] = n11; te[3] = n21; te[6] = n13;
    te[1] = n21; te[4] = n22; te[7] = n23;
    te[2] = n31; te[5] = n32; te[8] = n33;
    return this;
  }

  identity(){
    this.set(
      1,0,0,
      0,1,0,
      0,0,1
    )
    return this;
  }

  clone(){
    return new Matrix3(this.elements);
  }

  copy(m:Matrix3){
    var me = m.elements;
    this.set(
      me[0],me[3],me[6],
      me[1],me[4],me[7],
      me[2],me[5],me[8]
    )
    return this
  }

  applyToVector3Array(buffer,offset:number = 0,length?:number){
    var v1 = new Vector3();
    if(length === undefined) length =  buffer.length / buffer.itemSize
    for(var i = 0,j = offset;i<length;i++,j++){
        v1.x = buffer.getX( j );
				v1.y = buffer.getY( j );
				v1.z = buffer.getZ( j );
				v1.applyMatrix3( this );
				buffer.setXYZ( v1.x, v1.y, v1.z );
    }
    return buffer;
  }


  multiplyScalar(s:number){
    var te = this.elements;
    te[0] *= s; te[3] *= s; te[6] *= s;
    te[1] *= s; te[4] *= s; te[7] *= s;
    te[2] *= s; te[5] *= s; te[8] *= s;
    return this;
  }

  determinant(){
    var te = this.elements;
    var a = te[0], b = te[1], c = te[2],
    d = te[3], e = te[4], f = te[5],
    g = te[6], h = te[7], i = te[8]
    return a*e*i - a*f*h - b*d*i + b*f*g + c*d*h - c*e*g;
  }

  getInverse(matrix:Matrix4,throwOnInvertible?:any):Matrix3{

    		// ( based on http://code.google.com/p/webgl-mjs/ )

    		var me = matrix.elements;
    		var te = this.elements;

    		te[ 0 ] =   me[ 10 ] * me[ 5 ] - me[ 6 ] * me[ 9 ];
    		te[ 1 ] = - me[ 10 ] * me[ 1 ] + me[ 2 ] * me[ 9 ];
    		te[ 2 ] =   me[ 6 ] * me[ 1 ] - me[ 2 ] * me[ 5 ];
    		te[ 3 ] = - me[ 10 ] * me[ 4 ] + me[ 6 ] * me[ 8 ];
    		te[ 4 ] =   me[ 10 ] * me[ 0 ] - me[ 2 ] * me[ 8 ];
    		te[ 5 ] = - me[ 6 ] * me[ 0 ] + me[ 2 ] * me[ 4 ];
    		te[ 6 ] =   me[ 9 ] * me[ 4 ] - me[ 5 ] * me[ 8 ];
    		te[ 7 ] = - me[ 9 ] * me[ 0 ] + me[ 1 ] * me[ 8 ];
    		te[ 8 ] =   me[ 5 ] * me[ 0 ] - me[ 1 ] * me[ 4 ];

    		var det = me[ 0 ] * te[ 0 ] + me[ 1 ] * te[ 3 ] + me[ 2 ] * te[ 6 ];

    		// no inverse

    		if ( det === 0 ) {

    			var msg = "Matrix3.getInverse(): can't invert matrix, determinant is 0";

    			if ( throwOnInvertible || false ) {

    				throw new Error( msg );

    			} else {

    				console.warn( msg );

    			}

    			this.identity();

    			return this;

    		}

    		this.multiplyScalar( 1.0 / det );

    		return this;
  }

  transpose(){
    var tmp, m = this.elements;
    tmp = m[ 1 ]; m[ 1 ] = m[ 3 ]; m[ 3 ] = tmp;
    tmp = m[ 2 ]; m[ 2 ] = m[ 6 ]; m[ 6 ] = tmp;
    tmp = m[ 5 ]; m[ 5 ] = m[ 7 ]; m[ 7 ] = tmp;
    return this;
  }

  flattenToArrayOffset(array, offset ){
    var te = this.elements;
		array[ offset ] = te[ 0 ];
		array[ offset + 1 ] = te[ 1 ];
		array[ offset + 2 ] = te[ 2 ];
		array[ offset + 3 ] = te[ 3 ];
		array[ offset + 4 ] = te[ 4 ];
		array[ offset + 5 ] = te[ 5 ];
		array[ offset + 6 ] = te[ 6 ];
		array[ offset + 7 ] = te[ 7 ];
		array[ offset + 8 ]  = te[ 8 ];
		return array;
  }

  getNormalMatrix(m:Matrix4){
    this.getInverse(m).transpose();
    return this;
  }

  transposeIntoArray(r){
    var m = this.elements;
		r[ 0 ] = m[ 0 ];
		r[ 1 ] = m[ 3 ];
		r[ 2 ] = m[ 6 ];
		r[ 3 ] = m[ 1 ];
		r[ 4 ] = m[ 4 ];
		r[ 5 ] = m[ 7 ];
		r[ 6 ] = m[ 2 ];
		r[ 7 ] = m[ 5 ];
		r[ 8 ] = m[ 8 ];
		return this;
  }

  fromArray(array){
    this.elements.set( array );
		return this;
  }

  toArray(){
    var te = this.elements;
		return [
			te[ 0 ], te[ 1 ], te[ 2 ],
			te[ 3 ], te[ 4 ], te[ 5 ],
			te[ 6 ], te[ 7 ], te[ 8 ]
		];
  }
}
