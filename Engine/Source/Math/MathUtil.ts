export function clamp(value,min,max){
  return Math.max(min,Math.min(max,value));
}
const degreeToRadiansFactor = Math.PI / 180;
export function degToRad(degrees){
  return degrees * degreeToRadiansFactor;
}

const radianToDegreesFactor = 180 / Math.PI;
export function 	radToDeg (radians ) {
  return radians * radianToDegreesFactor;
}
