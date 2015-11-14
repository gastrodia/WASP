var extensions = {};
class WebGLExtensions{

  constructor(private gl){

  }

  get(name){
    if ( extensions[ name ] !== undefined ) {

			return extensions[ name ];

		}

		var extension;

		switch ( name ) {

			case 'EXT_texture_filter_anisotropic':
				extension = this.gl.getExtension( 'EXT_texture_filter_anisotropic' ) || this.gl.getExtension( 'MOZ_EXT_texture_filter_anisotropic' ) || this.gl.getExtension( 'WEBKIT_EXT_texture_filter_anisotropic' );
				break;

			case 'WEBGL_compressed_texture_s3tc':
				extension = this.gl.getExtension( 'WEBGL_compressed_texture_s3tc' ) || this.gl.getExtension( 'MOZ_WEBGL_compressed_texture_s3tc' ) || this.gl.getExtension( 'WEBKIT_WEBGL_compressed_texture_s3tc' );
				break;

			case 'WEBGL_compressed_texture_pvrtc':
				extension = this.gl.getExtension( 'WEBGL_compressed_texture_pvrtc' ) || this.gl.getExtension( 'WEBKIT_WEBGL_compressed_texture_pvrtc' );
				break;

			default:
				extension = this.gl.getExtension( name );

		}

		if ( extension === null ) {

			console.warn( 'THREE.WebGLRenderer: ' + name + ' extension not supported.' );

		}

		extensions[ name ] = extension;

		return extension;

  }


}

export = WebGLExtensions;
