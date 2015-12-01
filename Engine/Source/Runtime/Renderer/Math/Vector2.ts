export default class Vector2{
  constructor(public x: number = 0,public y: number = 0){

  }

  get width():number{
    return this.x;
  }

  set width(value:number){
     this.x = value;
  }

  get height():number{

    return this.y;
  }

  set height(value){
    this.y = value;
  }

  set(x:number,y:number):Vector2{
    this.x = x;
    this.y = y;
    return this;
  }

  setX(x:number):Vector2{
    this.x = x;
    return this;
  }

  setY(y:number):Vector2{
    this.y = y;
    return this;
  }

  setComponent(index:number,value:number){
    switch(index){
      case 0: this.x = value; break;
      case 1: this.y = value; break;
      default: throw new Error('index is out of range: ' + index);
    }
  }

  getComponent(index:number):number{
    switch(index){
      case 0: return this.x;
      case 1: return this.y;
      default: throw new Error('index is out of range: ' + index);
    }
  }

  clone():Vector2{
    return new Vector2(this.x,this.y);
  }

  copy(v:Vector2):Vector2{
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  add(v:Vector2):Vector2{
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  addScalar(s:number):Vector2{
    this.x += s;
    this.y += s;
    return this;
  }

  addVectors(a:Vector2,b:Vector2):Vector2{
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    return this;
  }

  addScaledVector(v:Vector2,s:number):Vector2{
    this.x += v.x * s;
    this.y += v.y * s;
    return this;
  }

  sub(v:Vector2):Vector2{
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  subScalar(s:number):Vector2{
    this.x -= s;
    this.y -= s;
    return this;
  }

  subVectors(a:Vector2,b:Vector2):Vector2{
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    return this;
  }

  multiply(v:Vector2):Vector2{
    this.x *= v.x;
    this.y *= v.x;
    return this;
  }

  multiplyScalar(scalar:number){
    if(isFinite(scalar)){
      this.x *= scalar;
      this.y *= scalar;
    }else{
      this.x = 0;
      this.y = 0;
    }
    return this;
  }

  divide(v:Vector2){
    this.x /= v.x;
    this.y /= v.y;
    return this;
  }

  divideScalar(scalar:number){
    return this.multiplyScalar(1/scalar);
  }

  min(v:Vector2){
    this.x = Math.min(this.x,v.x);
    this.y = Math.min(this.y,v.y);
    return this;
  }

  max(v:Vector2){
    this.x = Math.max(this.x,v.x);
    this.y = Math.max(this.y,v.y);
    return this;
  }

  clamp(min:Vector2,max:Vector2):Vector2{
    this.x = Math.max(min.x,Math.min(max.x,this.x));
    this.y = Math.max(min.y,Math.min(max.y,this.y));
    return this;
  }

  clampScalar(minVal:number,maxVal:number):Vector2{
    let min = new Vector2();
    let max = new Vector2();
    min.set(minVal,minVal);
    max.set(maxVal,maxVal);
    return  this.clamp(min,max);
  }

  clampLength(min:number,max:number):Vector2{
    var length = this.length();
    this.multiplyScalar(Math.max(min,Math.min(max,length))/length);
    return this;
  }

  floor():Vector2{
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  ceil():Vector2{
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  }

  round():Vector2{
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  roundToZero():Vector2{
    this.x = (this.x < 0 )? Math.ceil(this.x) : Math.floor(this.x);
    this.y = (this.y < 0 )? Math.ceil(this.y) : Math.floor(this.y);
    return this;
  }

  negate():Vector2{
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  dot(v:Vector2):number{
    return this.x * v.x + this.y * v.y;
  }

  lengthSq():number{
    return this.x * this.x + this.y * this.y;
  }

  length():number{
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  lengthManhattan():number{
    return Math.abs(this.x) + Math.abs(this.y);
  }

  normalize():Vector2{
    return this.divideScalar(this.length());
  }

  distanceTo(v:Vector2):number{
    return Math.sqrt(this.distanceToSquared(v));
  }

  distanceToSquared(v:Vector2):number{
    var dx = this.x - v.x, dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  setLength(length:number):Vector2{
    return this.multiplyScalar(length/this.length())
  }

  lerp(v:Vector2,alpha:number):Vector2{
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    return this;
  }

  lerpVectors(v1:Vector2,v2:Vector2,alpha:number):Vector2{
    this.subVectors(v2,v1).multiplyScalar(alpha).add(v1);
    return this;
  }

  equals(v:Vector2):boolean{
    return ((v.x === this.x) && (v.y === this.y));
  }

  fromArray(array:Array<number>,offset:number = 0):Vector2{
    this.x = array[offset];
    this.y = array[offset + 1];
    return this;
  }

  toArray(array:Array<number> = [],offset:number = 0):Array<number>{
    array[offset] = this.x;
    array[offset + 1] = this.y;
    return array;
  }

  fromAttribute(attribute:{
    itemSize:number,
    array:Array<number>
  },index:number,offset:number = 0):Vector2{
    index = index * attribute.itemSize + offset;
    this.x = attribute.array[index];
    this.y = attribute.array[index + 1];
    return this;
  }

  rotateAround(center:Vector2,angle:number):Vector2{
    var c = Math.cos(angle),s = Math.sin(angle);
    var x = this.x - center.x;
    var y = this.y - center.y;
    this.x = x * c - y * s + center.x;
    this.y = x * s + y * c + center.y;
    return this;
  }
}
