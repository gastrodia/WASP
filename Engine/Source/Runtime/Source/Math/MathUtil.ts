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

var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split( '' );
var uuid = new Array( 36 );
var rnd = 0, r;
export function generateUUID():string{
  for ( var i = 0; i < 36; i ++ ) {
		if ( i === 8 || i === 13 || i === 18 || i === 23 ) {
			uuid[ i ] = '-';
		} else if ( i === 14 ) {
			uuid[ i ] = '4';
		} else {
			if ( rnd <= 0x02 ) rnd = 0x2000000 + ( Math.random() * 0x1000000 ) | 0;
			r = rnd & 0xf;
			rnd = rnd >> 4;
			uuid[ i ] = chars[ ( i === 19 ) ? ( r & 0x3 ) | 0x8 : r ];
		}
	}
  return uuid.join( '' );
}

export function isPowerOfTwo( value ) {

  return ( value & ( value - 1 ) ) === 0 && value !== 0;

}

export function euclideanModulo( n, m ) {

		return ( ( n % m ) + m ) % m;

	}
