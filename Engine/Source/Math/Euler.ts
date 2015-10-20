class Euler{

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
    return  this.order;
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

  setFromQuaternion(){

  }

  setFromVector3(){

  }

  reorder(){

  }

  equals(){

  }

  fromArray(){

  }

  toArray(){

  }

  toVector3(){

  }

  onChange(callback:Function){
    this.onChangeCallback = callback;
    return this;
  }


}

export = Euler;
