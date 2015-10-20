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
}

export = Vector3;
