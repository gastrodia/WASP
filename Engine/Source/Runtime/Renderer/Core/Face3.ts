import Vector3 = require('../Math/Vector3');
import Color = require('../Math/Color');
class Face3{
  a;
  b;
  c;

  normal;
  vertexNormals;
  color;
  vertexColors;

  materialIndex;
  constructor( a, b, c, normal?:any, color?:any, materialIndex?:any){
    this.a = a;
  	this.b = b;
  	this.c = c;

  	this.normal = normal instanceof Vector3 ? normal : new Vector3();
  	this.vertexNormals = Array.isArray( normal ) ? normal : [];

  	this.color = color instanceof Color ? color : new Color();
  	this.vertexColors = Array.isArray( color ) ? color : [];

  	this.materialIndex = materialIndex !== undefined ? materialIndex : 0;
  }

  clone(){

  }

  copy( source ){
    this.a = source.a;
    		this.b = source.b;
    		this.c = source.c;

    		this.normal.copy( source.normal );
    		this.color.copy( source.color );

    		this.materialIndex = source.materialIndex;

    		for ( var i = 0, il = source.vertexNormals.length; i < il; i ++ ) {

    			this.vertexNormals[ i ] = source.vertexNormals[ i ].clone();

    		}

    		for ( var i = 0, il = source.vertexColors.length; i < il; i ++ ) {

    			this.vertexColors[ i ] = source.vertexColors[ i ].clone();

    		}

    		return this;
  }
}

export = Face3;
