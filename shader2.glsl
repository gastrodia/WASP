precision highp float;
precision highp int;
#define SHADER_NAME MeshBasicMaterial
#define MAX_DIR_LIGHTS 0
#define MAX_POINT_LIGHTS 0
#define MAX_SPOT_LIGHTS 0
#define MAX_HEMI_LIGHTS 0
#define MAX_SHADOWS 0
#define GAMMA_FACTOR 2
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;

uniform vec3 diffuse;
uniform float opacity;
#define PI 3.14159 
#define PI2 6.28318 
#define RECIPROCAL_PI2 0.15915494 
#define LOG2 1.442695 
#define EPSILON 1e-6 
#define saturate(a) clamp( a, 0.0, 1.0 ) 
#define whiteCompliment(a) ( 1.0 - saturate( a ) ) 
vec3 transformDirection( in vec3 normal, in mat4 matrix ) { 
	return normalize( ( matrix * vec4( normal, 0.0 ) ).xyz ); 
} 
// http://en.wikibooks.org/wiki/GLSL_Programming/Applying_Matrix_Transformations 
vec3 inverseTransformDirection( in vec3 normal, in mat4 matrix ) { 
	return normalize( ( vec4( normal, 0.0 ) * matrix ).xyz ); 
} 
vec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) { 
	float distance = dot( planeNormal, point - pointOnPlane ); 
	return - distance * planeNormal + point; 
} 
float sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) { 
	return sign( dot( point - pointOnPlane, planeNormal ) ); 
} 
vec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) { 
	return lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) ) + pointOnLine; 
} 
float calcLightAttenuation( float lightDistance, float cutoffDistance, float decayExponent ) { 
	if ( decayExponent > 0.0 ) { 
	  return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent ); 
	} 
	return 1.0; 
} 
vec3 F_Schlick( in vec3 specularColor, in float dotLH ) { 
	// Original approximation by Christophe Schlick '94 
	//;float fresnel = pow( 1.0 - dotLH, 5.0 ); 
	// Optimized variant (presented by Epic at SIGGRAPH '13) 
	float fresnel = exp2( ( -5.55437 * dotLH - 6.98316 ) * dotLH ); 
	return ( 1.0 - specularColor ) * fresnel + specularColor; 
} 
float G_BlinnPhong_Implicit( /* in float dotNL, in float dotNV */ ) { 
	// geometry term is (n⋅l)(n⋅v) / 4(n⋅l)(n⋅v) 
	return 0.25; 
} 
float D_BlinnPhong( in float shininess, in float dotNH ) { 
	// factor of 1/PI in distribution term omitted 
	return ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess ); 
} 
vec3 BRDF_BlinnPhong( in vec3 specularColor, in float shininess, in vec3 normal, in vec3 lightDir, in vec3 viewDir ) { 
	vec3 halfDir = normalize( lightDir + viewDir ); 
	//float dotNL = saturate( dot( normal, lightDir ) ); 
	//float dotNV = saturate( dot( normal, viewDir ) ); 
	float dotNH = saturate( dot( normal, halfDir ) ); 
	float dotLH = saturate( dot( lightDir, halfDir ) ); 
	vec3 F = F_Schlick( specularColor, dotLH ); 
	float G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ ); 
	float D = D_BlinnPhong( shininess, dotNH ); 
	return F * G * D; 
} 
vec3 inputToLinear( in vec3 a ) { 
	#ifdef GAMMA_INPUT 
		return pow( a, vec3( float( GAMMA_FACTOR ) ) ); 
	#else 
		return a; 
	#endif 
} 
vec3 linearToOutput( in vec3 a ) { 
	#ifdef GAMMA_OUTPUT 
		return pow( a, vec3( 1.0 / float( GAMMA_FACTOR ) ) ); 
	#else 
		return a; 
	#endif 
} 

#ifdef USE_COLOR 
	varying vec3 vColor; 
#endif 

#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) 
	varying vec2 vUv; 
#endif 

#ifdef USE_MAP 
	uniform sampler2D map; 
#endif 

#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP ) 
	varying vec2 vUv2; 
#endif 

#ifdef USE_ALPHAMAP 
	uniform sampler2D alphaMap; 
#endif 

#ifdef USE_AOMAP 
	uniform sampler2D aoMap; 
	uniform float aoMapIntensity; 
#endif 

#ifdef USE_ENVMAP 
	uniform float reflectivity; 
	#ifdef ENVMAP_TYPE_CUBE 
		uniform samplerCube envMap; 
	#else 
		uniform sampler2D envMap; 
	#endif 
	uniform float flipEnvMap; 
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) 
		uniform float refractionRatio; 
	#else 
		varying vec3 vReflect; 
	#endif 
#endif 

#ifdef USE_FOG 
	uniform vec3 fogColor; 
	#ifdef FOG_EXP2 
		uniform float fogDensity; 
	#else 
		uniform float fogNear; 
		uniform float fogFar; 
	#endif 
#endif 

#ifdef USE_SHADOWMAP 
	uniform sampler2D shadowMap[ MAX_SHADOWS ]; 
	uniform vec2 shadowMapSize[ MAX_SHADOWS ]; 
	uniform float shadowDarkness[ MAX_SHADOWS ]; 
	uniform float shadowBias[ MAX_SHADOWS ]; 
	varying vec4 vShadowCoord[ MAX_SHADOWS ]; 
	float unpackDepth( const in vec4 rgba_depth ) { 
		const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 ); 
		float depth = dot( rgba_depth, bit_shift ); 
		return depth; 
	} 
	#if defined(POINT_LIGHT_SHADOWS) 
		// adjustShadowValue1K() upacks the depth value stored in @textureData, adds @bias to it, and then 
		// comapres the result with @testDepth. If @testDepth is larger than or equal to that result, then 
		// @shadowValue is incremented by 1.0. 
		void adjustShadowValue1K( const float testDepth, const vec4 textureData, const float bias, inout float shadowValue ) { 
			const vec4 bitSh = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 ); 
			if ( testDepth >= dot( textureData, bitSh ) * 1000.0 + bias ) 
				shadowValue += 1.0; 
		} 
		// cubeToUV() maps a 3D direction vector suitable for cube texture mapping to a 2D 
		// vector suitable for 2D texture mapping. This code uses the following layout for the 
		// 2D texture: 
		// 
		// xzXZ 
		//  y Y 
		// 
		// Y - Positive y direction 
		// y - Negative y direction 
		// X - Positive x direction 
		// x - Negative x direction 
		// Z - Positive z direction 
		// z - Negative z direction 
		// 
		// Source and test bed: 
		// https://gist.github.com/tschw/da10c43c467ce8afd0c4 
		vec2 cubeToUV( vec3 v, float texelSizeY ) { 
			// Number of texels to avoid at the edge of each square 
			vec3 absV = abs( v ); 
			// Intersect unit cube 
			float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) ); 
			absV *= scaleToCube; 
			// Apply scale to avoid seams 
			// two texels less per square (one texel will do for NEAREST) 
			v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY ); 
			// Unwrap 
			// space: -1 ... 1 range for each square 
			// 
			// #X##		dim    := ( 4 , 2 ) 
			//  # #		center := ( 1 , 1 ) 
			vec2 planar = v.xy; 
			float almostATexel = 1.5 * texelSizeY; 
			float almostOne = 1.0 - almostATexel; 
			if ( absV.z >= almostOne ) { 
				if ( v.z > 0.0 ) 
					planar.x = 4.0 - v.x; 
			} else if ( absV.x >= almostOne ) { 
				float signX = sign( v.x ); 
				planar.x = v.z * signX + 2.0 * signX; 
			} else if ( absV.y >= almostOne ) { 
				float signY = sign( v.y ); 
				planar.x = v.x + 2.0 * signY + 2.0; 
				planar.y = v.z * signY - 2.0; 
			} 
			// Transform to UV space 
			// scale := 0.5 / dim 
			// translate := ( center + 0.5 ) / dim 
			return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 ); 
		} 
	#endif 
#endif 

#ifdef USE_SPECULARMAP 
	uniform sampler2D specularMap; 
#endif 

#ifdef USE_LOGDEPTHBUF 
	uniform float logDepthBufFC; 
	#ifdef USE_LOGDEPTHBUF_EXT 
		varying float vFragDepth; 
	#endif 
#endif 

void main() {
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	vec3 totalAmbientLight = vec3( 1.0 );
	vec3 shadowMask = vec3( 1.0 );
#if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT) 
	gl_FragDepthEXT = log2(vFragDepth) * logDepthBufFC * 0.5; 
#endif 

#ifdef USE_MAP 
	vec4 texelColor = texture2D( map, vUv ); 
	texelColor.xyz = inputToLinear( texelColor.xyz ); 
	diffuseColor *= texelColor; 
#endif 

#ifdef USE_COLOR 
	diffuseColor.rgb *= vColor; 
#endif 

#ifdef USE_ALPHAMAP 
	diffuseColor.a *= texture2D( alphaMap, vUv ).g; 
#endif 

#ifdef ALPHATEST 
	if ( diffuseColor.a < ALPHATEST ) discard; 
#endif 

float specularStrength; 
#ifdef USE_SPECULARMAP 
	vec4 texelSpecular = texture2D( specularMap, vUv ); 
	specularStrength = texelSpecular.r; 
#else 
	specularStrength = 1.0; 
#endif 

#ifdef USE_AOMAP 
	totalAmbientLight *= ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0; 
#endif 

#ifdef USE_SHADOWMAP 
	for ( int i = 0; i < MAX_SHADOWS; i ++ ) { 
		float texelSizeY =  1.0 / shadowMapSize[ i ].y; 
		float shadow = 0.0; 
#if defined( POINT_LIGHT_SHADOWS ) 
		// to save on uniform space, we use the sign of @shadowDarkness[ i ] to determine 
		// whether or not this light is a point light ( shadowDarkness[ i ] < 0 == point light) 
		bool isPointLight = shadowDarkness[ i ] < 0.0; 
		if ( isPointLight ) { 
			// get the real shadow darkness 
			float realShadowDarkness = abs( shadowDarkness[ i ] ); 
			// for point lights, the uniform @vShadowCoord is re-purposed to hold 
			// the distance from the light to the world-space position of the fragment. 
			vec3 lightToPosition = vShadowCoord[ i ].xyz; 
	#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) 
			// bd3D = base direction 3D 
			vec3 bd3D = normalize( lightToPosition ); 
			// dp = distance from light to fragment position 
			float dp = length( lightToPosition ); 
			// base measurement 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D, texelSizeY ) ), shadowBias[ i ], shadow ); 
			// Dr = disk radius 
	#if defined( SHADOWMAP_TYPE_PCF ) 
			const float Dr = 1.25; 
	#elif defined( SHADOWMAP_TYPE_PCF_SOFT ) 
			const float Dr = 2.25; 
	#endif 
			// os = offset scale 
			float os = Dr *  2.0 * texelSizeY; 
			const vec3 Gsd = vec3( - 1, 0, 1 ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zzz * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zxz * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xxz * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xzz * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zzx * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zxx * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xxx * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xzx * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zzy * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zxy * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xxy * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xzy * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zyz * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xyz * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.zyx * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.xyx * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.yzz * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.yxz * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.yxx * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D + Gsd.yzx * os, texelSizeY ) ), shadowBias[ i ], shadow ); 
			shadow *= realShadowDarkness * ( 1.0 / 21.0 ); 
	#else // no percentage-closer filtering: 
			vec3 bd3D = normalize( lightToPosition ); 
			float dp = length( lightToPosition ); 
			adjustShadowValue1K( dp, texture2D( shadowMap[ i ], cubeToUV( bd3D, texelSizeY ) ), shadowBias[ i ], shadow ); 
			shadow *= realShadowDarkness; 
	#endif 
		} else { 
#endif // POINT_LIGHT_SHADOWS 
			float texelSizeX =  1.0 / shadowMapSize[ i ].x; 
			vec3 shadowCoord = vShadowCoord[ i ].xyz / vShadowCoord[ i ].w; 
			// if ( something && something ) breaks ATI OpenGL shader compiler 
			// if ( all( something, something ) ) using this instead 
			bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 ); 
			bool inFrustum = all( inFrustumVec ); 
			bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 ); 
			bool frustumTest = all( frustumTestVec ); 
			if ( frustumTest ) { 
	#if defined( SHADOWMAP_TYPE_PCF ) 
				// Percentage-close filtering 
				// (9 pixel kernel) 
				// http://fabiensanglard.net/shadowmappingPCF/ 
				/* 
						// nested loops breaks shader compiler / validator on some ATI cards when using OpenGL 
						// must enroll loop manually 
					for ( float y = -1.25; y <= 1.25; y += 1.25 ) 
						for ( float x = -1.25; x <= 1.25; x += 1.25 ) { 
							vec4 rgbaDepth = texture2D( shadowMap[ i ], vec2( x * xPixelOffset, y * yPixelOffset ) + shadowCoord.xy ); 
									// doesn't seem to produce any noticeable visual difference compared to simple texture2D lookup 
									//vec4 rgbaDepth = texture2DProj( shadowMap[ i ], vec4( vShadowCoord[ i ].w * ( vec2( x * xPixelOffset, y * yPixelOffset ) + shadowCoord.xy ), 0.05, vShadowCoord[ i ].w ) ); 
							float fDepth = unpackDepth( rgbaDepth ); 
							if ( fDepth < shadowCoord.z ) 
								shadow += 1.0; 
					} 
					shadow /= 9.0; 
				*/ 
				shadowCoord.z += shadowBias[ i ]; 
				const float ShadowDelta = 1.0 / 9.0; 
				float xPixelOffset = texelSizeX; 
				float yPixelOffset = texelSizeY; 
				float dx0 = - 1.25 * xPixelOffset; 
				float dy0 = - 1.25 * yPixelOffset; 
				float dx1 = 1.25 * xPixelOffset; 
				float dy1 = 1.25 * yPixelOffset; 
				float fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) ); 
				if ( fDepth < shadowCoord.z ) shadow += ShadowDelta; 
				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) ); 
				if ( fDepth < shadowCoord.z ) shadow += ShadowDelta; 
				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) ); 
				if ( fDepth < shadowCoord.z ) shadow += ShadowDelta; 
				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) ); 
				if ( fDepth < shadowCoord.z ) shadow += ShadowDelta; 
				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) ); 
				if ( fDepth < shadowCoord.z ) shadow += ShadowDelta; 
				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) ); 
				if ( fDepth < shadowCoord.z ) shadow += ShadowDelta; 
				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) ); 
				if ( fDepth < shadowCoord.z ) shadow += ShadowDelta; 
				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) ); 
				if ( fDepth < shadowCoord.z ) shadow += ShadowDelta; 
				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) ); 
				if ( fDepth < shadowCoord.z ) shadow += ShadowDelta; 
				shadow *= shadowDarkness[ i ]; 
	#elif defined( SHADOWMAP_TYPE_PCF_SOFT ) 
				// Percentage-close filtering 
				// (9 pixel kernel) 
				// http://fabiensanglard.net/shadowmappingPCF/ 
				shadowCoord.z += shadowBias[ i ]; 
				float xPixelOffset = texelSizeX; 
				float yPixelOffset = texelSizeY; 
				float dx0 = - 1.0 * xPixelOffset; 
				float dy0 = - 1.0 * yPixelOffset; 
				float dx1 = 1.0 * xPixelOffset; 
				float dy1 = 1.0 * yPixelOffset; 
				mat3 shadowKernel; 
				mat3 depthKernel; 
				depthKernel[ 0 ][ 0 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) ); 
				depthKernel[ 0 ][ 1 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) ); 
				depthKernel[ 0 ][ 2 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) ); 
				depthKernel[ 1 ][ 0 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) ); 
				depthKernel[ 1 ][ 1 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) ); 
				depthKernel[ 1 ][ 2 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) ); 
				depthKernel[ 2 ][ 0 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) ); 
				depthKernel[ 2 ][ 1 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) ); 
				depthKernel[ 2 ][ 2 ] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) ); 
				vec3 shadowZ = vec3( shadowCoord.z ); 
				shadowKernel[ 0 ] = vec3( lessThan( depthKernel[ 0 ], shadowZ ) ); 
				shadowKernel[ 0 ] *= vec3( 0.25 ); 
				shadowKernel[ 1 ] = vec3( lessThan( depthKernel[ 1 ], shadowZ ) ); 
				shadowKernel[ 1 ] *= vec3( 0.25 ); 
				shadowKernel[ 2 ] = vec3( lessThan( depthKernel[ 2 ], shadowZ ) ); 
				shadowKernel[ 2 ] *= vec3( 0.25 ); 
				vec2 fractionalCoord = 1.0 - fract( shadowCoord.xy * shadowMapSize[ i ].xy ); 
				shadowKernel[ 0 ] = mix( shadowKernel[ 1 ], shadowKernel[ 0 ], fractionalCoord.x ); 
				shadowKernel[ 1 ] = mix( shadowKernel[ 2 ], shadowKernel[ 1 ], fractionalCoord.x ); 
				vec4 shadowValues; 
				shadowValues.x = mix( shadowKernel[ 0 ][ 1 ], shadowKernel[ 0 ][ 0 ], fractionalCoord.y ); 
				shadowValues.y = mix( shadowKernel[ 0 ][ 2 ], shadowKernel[ 0 ][ 1 ], fractionalCoord.y ); 
				shadowValues.z = mix( shadowKernel[ 1 ][ 1 ], shadowKernel[ 1 ][ 0 ], fractionalCoord.y ); 
				shadowValues.w = mix( shadowKernel[ 1 ][ 2 ], shadowKernel[ 1 ][ 1 ], fractionalCoord.y ); 
				shadow = dot( shadowValues, vec4( 1.0 ) ) * shadowDarkness[ i ]; 
	#else // no percentage-closer filtering: 
				shadowCoord.z += shadowBias[ i ]; 
				vec4 rgbaDepth = texture2D( shadowMap[ i ], shadowCoord.xy ); 
				float fDepth = unpackDepth( rgbaDepth ); 
				if ( fDepth < shadowCoord.z ) 
					shadow = shadowDarkness[ i ]; 
	#endif 
			} 
#ifdef SHADOWMAP_DEBUG 
			if ( inFrustum ) { 
				if ( i == 0 ) { 
					outgoingLight *= vec3( 1.0, 0.5, 0.0 ); 
				} else if ( i == 1 ) { 
					outgoingLight *= vec3( 0.0, 1.0, 0.8 ); 
				} else { 
					outgoingLight *= vec3( 0.0, 0.5, 1.0 ); 
				} 
			} 
#endif 
#if defined( POINT_LIGHT_SHADOWS ) 
		} 
#endif 
		shadowMask = shadowMask * vec3( 1.0 - shadow ); 
	} 
#endif 

	outgoingLight = diffuseColor.rgb * totalAmbientLight * shadowMask;
#ifdef USE_ENVMAP 
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) 
		vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition ); 
		// Transforming Normal Vectors with the Inverse Transformation 
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix ); 
		#ifdef ENVMAP_MODE_REFLECTION 
			vec3 reflectVec = reflect( cameraToVertex, worldNormal ); 
		#else 
			vec3 reflectVec = refract( cameraToVertex, worldNormal, refractionRatio ); 
		#endif 
	#else 
		vec3 reflectVec = vReflect; 
	#endif 
	#ifdef DOUBLE_SIDED 
		float flipNormal = ( float( gl_FrontFacing ) * 2.0 - 1.0 ); 
	#else 
		float flipNormal = 1.0; 
	#endif 
	#ifdef ENVMAP_TYPE_CUBE 
		vec4 envColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) ); 
	#elif defined( ENVMAP_TYPE_EQUIREC ) 
		vec2 sampleUV; 
		sampleUV.y = saturate( flipNormal * reflectVec.y * 0.5 + 0.5 ); 
		sampleUV.x = atan( flipNormal * reflectVec.z, flipNormal * reflectVec.x ) * RECIPROCAL_PI2 + 0.5; 
		vec4 envColor = texture2D( envMap, sampleUV ); 
	#elif defined( ENVMAP_TYPE_SPHERE ) 
		vec3 reflectView = flipNormal * normalize((viewMatrix * vec4( reflectVec, 0.0 )).xyz + vec3(0.0,0.0,1.0)); 
		vec4 envColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5 ); 
	#endif 
	envColor.xyz = inputToLinear( envColor.xyz ); 
	#ifdef ENVMAP_BLENDING_MULTIPLY 
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity ); 
	#elif defined( ENVMAP_BLENDING_MIX ) 
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity ); 
	#elif defined( ENVMAP_BLENDING_ADD ) 
		outgoingLight += envColor.xyz * specularStrength * reflectivity; 
	#endif 
#endif 

	outgoingLight = linearToOutput( outgoingLight ); 

#ifdef USE_FOG 
	#ifdef USE_LOGDEPTHBUF_EXT 
		float depth = gl_FragDepthEXT / gl_FragCoord.w; 
	#else 
		float depth = gl_FragCoord.z / gl_FragCoord.w; 
	#endif 
	#ifdef FOG_EXP2 
		float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * depth * depth * LOG2 ) ); 
	#else 
		float fogFactor = smoothstep( fogNear, fogFar, depth ); 
	#endif 
	outgoingLight = mix( outgoingLight, fogColor, fogFactor ); 
#endif 

	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
}
