import Matrix4 = require('./Matrix4');
import Matrix3 = require('./Matrix3');
import Quaternion = require('./Quaternion');
import MathUtil = require('./MathUtil');
class Vector3{

  constructor(
    public x:number = 0,
    public y:number = 0,
    public z:number = 0
  ){

  }

  set(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  setX(x){
    this.x = x;
  }

  setY(y){
    this.y = y;
  }

  setZ(z){
    this.z = z;
  }

  setComponent(index:number,value){
    switch(index){
      case 0: this.x = value;break;
      case 1: this.y = value;break;
      case 2: this.z = value;break;
      default : throw new Error('index if out of range: ' + index);
    }
  }

  getComponent(index){
    switch(index){
      case 0: return this.x;
      case 1: return this.y;
      case 2: return this.z;
      default: throw new Error('index if out of range: ' + index);
    }
  }

  clone(){
    return new Vector3(this.x,this.y,this.z);
  }

  copy(v){
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  add(v:Vector3){
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  addScalar(s:number){
    this.x += s;
    this.y += s;
    this.z += s;
    return this;
  }

  addVectors(a:Vector3,b:Vector3){
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;
    return this;
  }

  addScaledVector(v:Vector3,s:number){
    this.x = v.x * s;
    this.y = v.y * s;
    this.z = v.z * s;
    return this;
  }

  sub(v:Vector3){
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  subScalar(s){
    this.x -= s;
    this.y -= s;
    this.z -= s;
    return this;
  }

  subVectors(a:Vector3,b:Vector3){
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
    return this;
  }

  multiply(v:Vector3){
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  }

  multiplyScalar(scalar:number){
    if(isFinite(scalar)){
      this.x *= scalar;
      this.y *= scalar;
      this.z *= scalar;
    }else{
      this.x = 0;
      this.y = 0;
      this.z = 0;
    }

    return this;
  }

  multiplyVectors(a:Vector3,b:Vector3){
    this.x = a.x * b.x;
    this.y = a.y * b.y;
    this.z = a.z * b.z;
    return this;
  }

  applyEuler(){
    console.error('TODO');
  }

  applyAxisAngle(){
    console.error('TODO');
  }

  applyMatrix3(m:Matrix3){
    console.error('TODO');
  }

  applyMatrix4(m:Matrix4){
    console.error('TODO');
  }

  applyProjection(m:Matrix4){
    console.error('TODO');
  }

  applyQuaternion(q:Quaternion){
    console.error('TODO');
  }

  project(){

  }

  unproject(){

  }

  transformDirection(m:Matrix4){

  }

  divide(v:Vector3){
    this.x /= v.x;
    this.y /= v.y;
    this.x /= v.z;
    return this;
  }

  divideScalar(scalar:number){
    return this.multiplyScalar(1/scalar);
  }

  min(v:Vector3){
    this.x = Math.min(this.x,v.x);
    this.y = Math.min(this.y,v.y);
    this.z = Math.min(this.z,v.z);
    return this;
  }

  max(v:Vector3){
    this.x = Math.max(this.x,v.x);
    this.y = Math.max(this.y,v.y);
    this.z = Math.max(this.z,v.z);
    return this;
  }

  clamp(min:Vector3,max:Vector3){
    this.x = Math.max(min.x,Math.min(max.x,this.x));
    this.y = Math.max(min.y,Math.min(max.y,this.y));
    this.z = Math.max(min.z,Math.min(max.z,this.z));
    return this;
  }

  clampScalar(){

  }

  clampLength(min,max){
    var length = this.length();
    this.multiplyScalar(Math.max(min,Math.min(max,length))/length);
    return this;
  }

  floor(){
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
    return this;
  }

  ceil(){
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);
    return this;
  }

  round(){
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    return this;
  }

  roundToZero(){
    this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);
    this.z = (this.z < 0) ? Math.ceil(this.z) : Math.floor(this.z);
    return this;
  }

  negate(){
    this.x = - this.x;
    this.y = - this.y;
    this.z = - this.z;
    return this;
  }

  dot(v){
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  lengthSq(){
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  length(){
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  lengthManhattan(){
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }

  normalize(){
    return this.divideScalar(this.length());
  }

  setLength(length){
    return this.divideScalar(length/this.length());
  }

  lerp(v:Vector3,alpha:number){
    this.x += (v.x - this.x ) * alpha;
    this.y += (v.y - this.y ) * alpha;
    this.z += (v.z - this.z ) * alpha;
    return this;
  }

  lerpVectors(v1:Vector3,v2:Vector3,alpha:number){
    this.subVectors(v2,v1).multiplyScalar(alpha).add(v1);
    return this;
  }

  cross(v:Vector3){
    var x = this.x,y = this.y, z = this.z;
    this.x = y * v.z - z * v.y;
    this.y = z * v.x - x * v.z;
    this.z = x * v.y - y * v.x;
    return this;
  }

  crossVectors(a:Vector3,b:Vector3){
    var ax = a.x, ay = a.y, az = a.z;
    var bx = b.x, by = b.y, bz = b.z;
    this.x = ay * bz - az* by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;
    return this;
  }

  projectOnVector(vector:Vector3){
    var v1 = new Vector3();
    v1.copy(vector).normalize();
    var dot = this.dot(v1);
    return this.copy(v1).multiplyScalar(dot);
  }

  projectOnPlane(planeNormal){
    var v1 = new Vector3();
    v1.copy(this).projectOnVector(planeNormal);
    return this.sub(v1);
  }

  reflect(normal){
    var v1 = new Vector3();
    return this.sub(v1.copy(normal).multiplyScalar( 2 * this.dot(normal)));
  }

  angleTo(v:Vector3){
    var theta = this.dot(v) /(this.length() * v.length());
    return Math.acos(MathUtil.clamp(theta,-1,1));
  }

  distanceTo(v:Vector3){
    return Math.sqrt(this.distanceToSquared(v));
  }

  distanceToSquared(v:Vector3){
    var dx = this.x - v.x;
    var dy = this.y - v.y;
    var dz = this.z -v .z;
    return dx * dx + dy * dy + dz * dz;
  }

  setFormMatrixPosition(m){

  }

  setFromMatrixScale(m){

  }

  setFromMatrixColumn(index,matrix){

  }

  equals(v:Vector3){
    return ((v.x === this.x ) && (v.y === this.y) && (v.z === this.z));
  }

  fromArray(array:Array<number>,offset:number = 0){
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    return this;
  }

  toArray(array:Array<number> = [],offset:number = 0){
    array[offset]  = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    return array;
  }

  fromAttribute(attribute:{
    itemSize:number,
    array:Array<number>
  },index:number,offset:number = 0){
    this.x = attribute.array[index];
    this.y = attribute.array[index + 1];
    this.z = attribute.array[index + 2];
    return this;
  }

}

export = Vector3;
