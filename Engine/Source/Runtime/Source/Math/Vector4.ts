import Matrix4 from './Matrix4';
import Matrix3 from './Matrix3';
import Quaternion from './Quaternion';
import * as MathUtil from './MathUtil';
export default class Vector4{
  constructor(
    public x:number = 0,
    public y:number = 0,
    public z:number = 0,
    public w:number = 1
  ){

  }

  set(x:number,y:number,z:number,w:number){
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }

  setX(x){
    this.x = x;
    return this;
  }

  setY(y){
    this.y = y;
    return this;
  }

  setZ(z){
    this.z = z;
    return this;
  }

  setW(w){
    this.w = w;
  }

  setComponent(index:number,value:number){
    switch(index){
      case 0: this.x = value;break;
      case 1: this.y = value;break;
      case 2: this.z = value;break;
      default: throw new Error('index is out of range: ' + index);
    }
  }

  getComponent(index){
    switch(index){
      case 0: return this.x;
      case 1: return this.y;
      case 2: return this.z;
      case 3: return this.w;
      default: throw new Error('index if out of range: ' + index);
    }
  }

  clone(){
    return new Vector4(this.x,this.y,this.z,this.w);
  }

  add(v:Vector4){
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    this.w += v.w;
    return this;
  }

  addScalar(s:number){
    this.x += s;
    this.y += s;
    this.z += s;
    this.w += s;
    return this;
  }

  addVectors(a:Vector4,b:Vector4){
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;
    this.w = a.w + b.w;
    return this;
  }

  addScaledVector(v:Vector4,s:number){
    this.x += v.x * s;
    this.y += v.y * s;
    this.z += v.z * s;
    this.w += v.w * s;
    return this;
  }

  sub(v:Vector4){
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    this.w -= v.w;
    return this;
  }

  subScalar(s:number){
    this.x -= s;
    this.y -= s;
    this.z -= s;
    this.w -= s;
    return this;
  }

  subVectors(a,b){
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
    this.w = a.w - b.w;
    return this;
  }

  multiplyScalar(scalar:number){
    if(isFinite(scalar)){
      this.x *= scalar;
      this.y *= scalar;
      this.z *= scalar;
      this.w *= scalar;
    }else{
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 0;
    }
    return this;
  }

  applyMatrix4(m){
    var x = this.x;
    var y = this.y;
    var z = this.z;
    var w = this.w;
    console.error('TODO');
  }

  divideScalar(scalar){
    return this.multiplyScalar(1/scalar);
  }

  setAxisAngleFromQuaternion(q:Quaternion){
    console.error('TODO');
  }

  setAxisAngleFromRotationMatrix(m:Matrix4){
    console.error('TODO');
  }

  min(v:Vector4){
    this.x = Math.min(this.x,v.x);
    this.y = Math.min(this.x,v.y);
    this.z = Math.min(this.z,v.z);
    this.w = Math.min(this.w,v.w);
    return this;
  }

  max(v:Vector4){
    this.x = Math.max(this.x,v.x);
    this.y = Math.max(this.y,v.y);
    this.z = Math.max(this.z,v.z);
    this.w = Math.max(this.w,v.w);
    return this;
  }

  clamp(min,max){
    this.x = Math.max( min.x, Math.min( max.x, this.x ) );
		this.y = Math.max( min.y, Math.min( max.y, this.y ) );
		this.z = Math.max( min.z, Math.min( max.z, this.z ) );
		this.w = Math.max( min.w, Math.min( max.w, this.w ) );
		return this;
  }

  clampScalar(minVal:number,maxVal:number){
    var min = new Vector4();
    var max = new Vector4();
    min.set( minVal, minVal, minVal, minVal );
		max.set( maxVal, maxVal, maxVal, maxVal );

    return this.clamp( min, max );
  }

  floor(){
    this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );
		this.z = Math.floor( this.z );
		this.w = Math.floor( this.w );

		return this;
  }

  ceil(){
    this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );
		this.z = Math.ceil( this.z );
		this.w = Math.ceil( this.w );

		return this;
  }

  round(){
    this.x = Math.round( this.x );
		this.y = Math.round( this.y );
		this.z = Math.round( this.z );
		this.w = Math.round( this.w );

		return this;
  }

  roundToZero(){
    this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
		this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
		this.z = ( this.z < 0 ) ? Math.ceil( this.z ) : Math.floor( this.z );
		this.w = ( this.w < 0 ) ? Math.ceil( this.w ) : Math.floor( this.w );

		return this;
  }

  negate(){
    this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;
		this.w = - this.w;

		return this;
  }

  dot(v:Vector4){
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  }

  length(){
    return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w );
  }

  lengthManhattan(){
    return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z ) + Math.abs( this.w );
  }

  normalize(){
    return this.divideScalar( this.length() );
  }

  setLength(){
    return this.multiplyScalar( length / this.length() );
  }

  lerp(v:Vector4,alpha:number){
    this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;
		this.z += ( v.z - this.z ) * alpha;
		this.w += ( v.w - this.w ) * alpha;

		return this;
  }

  lerpVectors(v1:Vector4,v2:Vector4,alpha){
    this.subVectors( v2, v1 ).multiplyScalar( alpha ).add( v1 );
		return this;
  }

  equals(v:Vector4){
    return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) && ( v.w === this.w ) );
  }

  fromArray(array,offset:number = 0){
		this.x = array[ offset ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];
		this.w = array[ offset + 3 ];
		return this;
  }

  toArray(array:Array<number> = [],offset:number = 0){
    array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;
		array[ offset + 3 ] = this.w;
		return array;
  }


    fromAttribute(attribute:{
      itemSize:number,
      array:Array<number>
    },index:number,offset:number = 0){
      index = index * attribute.itemSize + offset;

      		this.x = attribute.array[ index ];
      		this.y = attribute.array[ index + 1 ];
      		this.z = attribute.array[ index + 2 ];
      		this.w = attribute.array[ index + 3 ];

      return this;
    }

}
