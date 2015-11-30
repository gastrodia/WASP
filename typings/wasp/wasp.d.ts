declare module Wasp {
    var ajax: any;
}
declare module Wasp.Math {
  class Vector2{
    new(x: number, y: number)
    x:number;
    y:number;
    width:number;

    height:number;
    set(x:number,y:number):Vector2

    setX(x:number):Vector2

    setY(y:number):Vector2
    setComponent(index:number,value:number)
    getComponent(index:number):number

    clone():Vector2

    copy(v:Vector2):Vector2

    add(v:Vector2):Vector2
    addScalar(s:number):Vector2

    addVectors(a:Vector2,b:Vector2):Vector2

    addScaledVector(v:Vector2,s:number):Vector2
    sub(v:Vector2):Vector2

    subScalar(s:number):Vector2

    subVectors(a:Vector2,b:Vector2):Vector2
    multiply(v:Vector2):Vector2

    multiplyScalar(scalar:number)

    divide(v:Vector2)

    divideScalar(scalar:number)
    min(v:Vector2)

    max(v:Vector2)
    clamp(min:Vector2,max:Vector2):Vector2

    clampScalar(minVal:number,maxVal:number):Vector2
    clampLength(min:number,max:number):Vector2

    floor():Vector2

    ceil():Vector2

    round():Vector2

    roundToZero():Vector2

    negate():Vector2

    dot(v:Vector2):number
    lengthSq():number

    length():number

    lengthManhattan():number

    normalize():Vector2

    distanceTo(v:Vector2):number

    distanceToSquared(v:Vector2):number
    setLength(length:number):Vector2

    lerp(v:Vector2,alpha:number):Vector2

    lerpVectors(v1:Vector2,v2:Vector2,alpha:number)

    equals(v:Vector2):boolean

    fromArray(array:Array<number>,offset:number):Vector2

    toArray(array:Array<number>,offset:number):Array<number>

    fromAttribute(attribute:{
      itemSize:number,
      array:Array<number>
    },index:number,offset:number):Vector2

    rotateAround(center:Vector2,angle:number):Vector2

  }
}
