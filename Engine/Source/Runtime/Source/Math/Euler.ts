
export default class Euler{

  static DefaultOrder = 'XYZ';

  private onChangeCallback:Function = ()=>{};

  constructor(
    private _x:number = 0,
    private _y:number = 0,
    private _z:number = 0,
    private _order:string = Euler.DefaultOrder
  ){

  }

  get x(){
    return this._x;
  }

  set x(value:number){
    this._x = value;
    this.onChangeCallback();
  }

  get y(){
    return this._y;
  }

  set y(value){
    this._y = value;
    this.onChangeCallback();
  }

  get z(){
    return   this._z;
  }

  set z(value){
    this.z = value;
    this.onChangeCallback();
  }

  get order(){
    return  this._order;
  }

  set order(value){
    this._order = value;
    this.onChangeCallback();
  }

  set(x,y,z,order){
    this._x = x;
    this._y = y;
    this._z = z;
    this._order = order || this._order;

    this.onChangeCallback();

    return this;
  }

  clone(){
    return new Euler(this._x,this._y,this._z,this._order);
  }

  copy(euler:Euler){
    this._x = euler.x;
    this._y = euler.y;
    this._z = euler.z;
    this._order = euler.order;

    this.onChangeCallback();

    return this;
  }

  setFromRotationMatrix(m,oder,update){

  }

  setFromQuaternion( q, order, update){

  }

  setFromVector3(){

  }

  reorder(){

  }

  equals(euler){
    return ( euler._x === this._x )
    && ( euler._y === this._y )
    && ( euler._z === this._z )
    && ( euler._order === this._order );
  }

  fromArray(array:Array<number|string>){
    this._x = <number>array[0];
    this._y = <number>array[1];
    this._x = <number>array[2];
    if( array[3] !== undefined){
      this._order = <string>array[3];
    }
  }

  toArray(array:Array<number|string> = [],offset:number = 0){
    array[offset] = this._x;
    array[offset + 1] = this._y;
    array[offset + 2] = this._z;
    array[offset + 3] = this._order;
    return array;
  }

  toVector3(){

  }

  onChange(callback:Function){
    this.onChangeCallback = callback;
    return this;
  }


}
