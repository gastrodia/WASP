import Geometry = require('../../Core/Geometry');
import Vector3 = require('../../Math/Vector3');
import Vector2 = require('../../Math/Vector2');
import Face3 = require('../../Core/Face3');
class BoxGeometry extends Geometry{
  type = 'BoxGeometry';

  private parameters;
  private widthSegments;
  private heightSegments;
  private depthSegments;
  constructor( width, height, depth, widthSegments?:any, heightSegments?:any, depthSegments?:any ){
    super();

    this.parameters = {
  		width: width,
  		height: height,
  		depth: depth,
  		widthSegments: widthSegments,
  		heightSegments: heightSegments,
  		depthSegments: depthSegments
  	};

    this.widthSegments = widthSegments || 1;
    this.heightSegments = heightSegments || 1;
    this.depthSegments = depthSegments || 1;

    var width_half = width / 2;
  	var height_half = height / 2;
  	var depth_half = depth / 2;

    this.buildPlane( 'z', 'y', - 1, - 1, depth, height, width_half, 0 ); // px
	  this.buildPlane( 'z', 'y',   1, - 1, depth, height, - width_half, 1 ); // nx
	  this.buildPlane( 'x', 'z',   1,   1, width, depth, height_half, 2 ); // py
	  this.buildPlane( 'x', 'z',   1, - 1, width, depth, - height_half, 3 ); // ny
	  this.buildPlane( 'x', 'y',   1, - 1, width, height, depth_half, 4 ); // pz
	  this.buildPlane( 'x', 'y', - 1, - 1, width, height, - depth_half, 5 ); // nz

  }

  buildPlane( u, v, udir, vdir, width, height, depth, materialIndex ) {
    var scope = this;
		var w, ix, iy,
		gridX = scope.widthSegments,
		gridY = scope.heightSegments,
		width_half = width / 2,
		height_half = height / 2,
		offset = scope.vertices.length;

		if ( ( u === 'x' && v === 'y' ) || ( u === 'y' && v === 'x' ) ) {

			w = 'z';

		} else if ( ( u === 'x' && v === 'z' ) || ( u === 'z' && v === 'x' ) ) {

			w = 'y';
			gridY = scope.depthSegments;

		} else if ( ( u === 'z' && v === 'y' ) || ( u === 'y' && v === 'z' ) ) {

			w = 'x';
			gridX = scope.depthSegments;

		}

		var gridX1 = gridX + 1,
		gridY1 = gridY + 1,
		segment_width = width / gridX,
		segment_height = height / gridY,
		normal = new Vector3();

		normal[ w ] = depth > 0 ? 1 : - 1;

		for ( iy = 0; iy < gridY1; iy ++ ) {

			for ( ix = 0; ix < gridX1; ix ++ ) {

				var vector = new Vector3();
				vector[ u ] = ( ix * segment_width - width_half ) * udir;
				vector[ v ] = ( iy * segment_height - height_half ) * vdir;
				vector[ w ] = depth;

				scope.vertices.push( vector );

			}

		}

		for ( iy = 0; iy < gridY; iy ++ ) {

			for ( ix = 0; ix < gridX; ix ++ ) {

				var a = ix + gridX1 * iy;
				var b = ix + gridX1 * ( iy + 1 );
				var c = ( ix + 1 ) + gridX1 * ( iy + 1 );
				var d = ( ix + 1 ) + gridX1 * iy;

				var uva = new Vector2( ix / gridX, 1 - iy / gridY );
				var uvb = new Vector2( ix / gridX, 1 - ( iy + 1 ) / gridY );
				var uvc = new Vector2( ( ix + 1 ) / gridX, 1 - ( iy + 1 ) / gridY );
				var uvd = new Vector2( ( ix + 1 ) / gridX, 1 - iy / gridY );

				var face = new Face3( a + offset, b + offset, d + offset );
				face.normal.copy( normal );
				face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
				face.materialIndex = materialIndex;

				scope.faces.push( face );
				scope.faceVertexUvs[ 0 ].push( [ uva, uvb, uvd ] );

				face = new Face3( b + offset, c + offset, d + offset );
				face.normal.copy( normal );
				face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
				face.materialIndex = materialIndex;

				scope.faces.push( face );
				scope.faceVertexUvs[ 0 ].push( [ uvb.clone(), uvc, uvd.clone() ] );

			}

		}

	}

}


export = BoxGeometry;
