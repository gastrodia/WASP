/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Scene = __webpack_require__(1);
	var PerspectiveCamera = __webpack_require__(11);
	var WebGLRenderer = __webpack_require__(13);
	var BoxGeometry = __webpack_require__(151);
	var MeshBasicMaterial = __webpack_require__(24);
	var Mesh = __webpack_require__(23);
	var scene = new Scene();
	var camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	var renderer = new WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	var geometry = new BoxGeometry(1, 1, 1);
	var material = new MeshBasicMaterial({ color: 0x00ff00 });
	var cube = new Mesh(geometry, material);
	scene.add(cube);
	camera.position.z = 5;
	var render = function () {
	    requestAnimationFrame(render);
	    cube.rotation.x += 0.1;
	    cube.rotation.y += 0.1;
	    renderer.render(scene, camera);
	};
	render();
	//# sourceMappingURL=main.js.map

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Object3D = __webpack_require__(2);
	var Scene = (function (_super) {
	    __extends(Scene, _super);
	    function Scene() {
	        _super.apply(this, arguments);
	        this.type = 'Scene';
	        this.fog = null;
	        this.overrideMaterial = null;
	        this.autoUpdate = true;
	    }
	    Scene.prototype.copy = function (source, recursive) {
	        _super.prototype.copy.call(this, this, source);
	        if (source.fog !== null)
	            this.fog = source.fog.clone();
	        if (source.overrideMaterial !== null)
	            this.overrideMaterial = source.overrideMaterial.clone();
	        this.autoUpdate = source.autoUpdate;
	        this.matrixAutoUpdate = source.matrixAutoUpdate;
	        return this;
	    };
	    return Scene;
	})(Object3D);
	module.exports = Scene;
	//# sourceMappingURL=Scene.js.map

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var MathUtils = __webpack_require__(3);
	var Vector3 = __webpack_require__(4);
	var Matrix4 = __webpack_require__(5);
	var Matrix3 = __webpack_require__(8);
	var Euler = __webpack_require__(7);
	var Quaternion = __webpack_require__(6);
	var EventDispatcher = __webpack_require__(9);
	var Channels = __webpack_require__(10);
	var Object3D = (function (_super) {
	    __extends(Object3D, _super);
	    function Object3D() {
	        var _this = this;
	        _super.call(this);
	        this.id = Object3D.Object3DIdCount++;
	        this.uuid = MathUtils.generateUUID();
	        this.name = '';
	        this.type = 'Object3D';
	        this.parent = null;
	        this.channels = new Channels();
	        this.children = [];
	        this.up = Object3D.DefaultUp.clone();
	        this.channels = new Channels();
	        var position = new Vector3();
	        var rotation = new Euler();
	        var quaternion = new Quaternion();
	        var scale = new Vector3(1, 1, 1);
	        this.position = position;
	        this.rotation = rotation;
	        this.quaternion = quaternion;
	        this.scale = scale;
	        this.modelViewMatrix = new Matrix4();
	        this.normalMatrix = new Matrix3();
	        this.rotationAutoUpdate = true;
	        this.matrix = new Matrix4();
	        this.matrixWorld = new Matrix4();
	        this.matrixAutoUpdate = Object3D.DefaultMatrixAutoUpdate;
	        this.matrixWorldNeedsUpdate = true;
	        this.visible = true;
	        this.castShadow = false;
	        this.receiveShadow = false;
	        this.frustumCulled = true;
	        this.renderOrder = 0;
	        this.userData = {};
	        this.rotation.onChange(function () {
	            _this.quaternion.setFromEuler(_this.rotation, false);
	        });
	        this.quaternion.onChange(function () {
	            _this.rotation.setFromQuaternion(_this.quaternion, undefined, false);
	        });
	    }
	    Object.defineProperty(Object3D.prototype, "eulerOrder", {
	        get: function () {
	            return this.rotation.order;
	        },
	        set: function (value) {
	            this.rotation.order = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object3D.prototype.applyMatrix = function (matrix) {
	        this.matrix.multiplyMatrices(matrix, this.matrix);
	        this.matrix.decompose(this.position, this.quaternion, this.scale);
	    };
	    Object3D.prototype.setRotationFromAxisAngle = function (axis, angle) {
	        // assumes axis is normalized
	        this.quaternion.setFromAxisAngle(axis, angle);
	    };
	    Object3D.prototype.setRotationFromMatrix = function (m) {
	        // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
	        this.quaternion.setFromRotationMatrix(m);
	    };
	    Object3D.prototype.setRotationFromQuaternion = function (q) {
	        // assumes q is normalized
	        this.quaternion.copy(q);
	    };
	    Object3D.prototype.rotateOnAxis = function (axis, angle) {
	        var q1 = new Quaternion();
	        q1.setFromAxisAngle(axis, angle);
	        this.quaternion.multiply(q1);
	        return this;
	    };
	    Object3D.prototype.rotateX = function (angle) {
	        var v1 = new Vector3(1, 0, 0);
	        return this.rotateOnAxis(v1, angle);
	    };
	    Object3D.prototype.rotateY = function (angle) {
	        var v1 = new Vector3(0, 1, 0);
	        return this.rotateOnAxis(v1, angle);
	    };
	    Object3D.prototype.rotateZ = function (angle) {
	        var v1 = new Vector3(0, 0, 1);
	        return this.rotateOnAxis(v1, angle);
	    };
	    Object3D.prototype.translateOnAxis = function (axis, distance) {
	        var v1 = new Vector3();
	        v1.copy(axis).applyQuaternion(this.quaternion);
	        this.position.add(v1.multiplyScalar(distance));
	        return this;
	    };
	    Object3D.prototype.translate = function (distance, axis) {
	        console.warn('THREE.Object3D: .translate() has been removed. Use .translateOnAxis( axis, distance ) instead.');
	        return this.translateOnAxis(axis, distance);
	    };
	    Object3D.prototype.translateX = function (distance) {
	        var v1 = new Vector3(1, 0, 0);
	        return this.translateOnAxis(v1, distance);
	    };
	    Object3D.prototype.translateY = function (distance) {
	        var v1 = new Vector3(0, 1, 0);
	        this.translateOnAxis(v1, distance);
	    };
	    Object3D.prototype.translateZ = function (distance) {
	        var v1 = new Vector3(0, 0, 1);
	        return this.translateOnAxis(v1, distance);
	    };
	    Object3D.prototype.localToWorld = function (vector) {
	        return vector.applyMatrix4(this.matrixWorld);
	    };
	    Object3D.prototype.worldToLocal = function (vector) {
	        var m1 = new Matrix4();
	        return vector.applyMatrix4(m1.getInverse(this.matrixWorld));
	    };
	    Object3D.prototype.lookAt = function (vector) {
	        var m1 = new Matrix4();
	        m1.lookAt(vector, this.position, this.up);
	        this.quaternion.setFromRotationMatrix(m1);
	    };
	    Object3D.prototype.add = function (object) {
	        if (arguments.length > 1) {
	            for (var i = 0; i < arguments.length; i++) {
	                this.add(arguments[i]);
	            }
	            return this;
	        }
	        if (object === this) {
	            console.error("Object3D.add: object can't be added as a child of itself.", object);
	            return this;
	        }
	        if (object instanceof Object3D) {
	            if (object.parent !== null) {
	                object.parent.remove(object);
	            }
	            object.parent = this;
	            object.dispatchEvent({ type: 'added' });
	            this.children.push(object);
	        }
	        else {
	            console.error("Object3D.add: object not an instance of THREE.Object3D.", object);
	        }
	        return this;
	    };
	    Object3D.prototype.remove = function (object) {
	        if (arguments.length > 1) {
	            for (var i = 0; i < arguments.length; i++) {
	                this.remove(arguments[i]);
	            }
	        }
	        var index = this.children.indexOf(object);
	        if (index !== -1) {
	            object.parent = null;
	            object.dispatchEvent({ type: 'removed' });
	            this.children.splice(index, 1);
	        }
	    };
	    Object3D.prototype.getObjectById = function (id) {
	        return this.getObjectByProperty('id', id);
	    };
	    Object3D.prototype.getObjectByName = function (name) {
	        return this.getObjectByProperty('name', name);
	    };
	    Object3D.prototype.getObjectByProperty = function (name, value) {
	        if (this[name] === value)
	            return this;
	        for (var i = 0, l = this.children.length; i < l; i++) {
	            var child = this.children[i];
	            var object = child.getObjectByProperty(name, value);
	            if (object !== undefined) {
	                return object;
	            }
	        }
	        return undefined;
	    };
	    Object3D.prototype.getWorldPosition = function (optionalTarget) {
	        var result = optionalTarget || new Vector3();
	        this.updateMatrixWorld(true);
	        return result.setFromMatrixPosition(this.matrixWorld);
	    };
	    Object3D.prototype.getWorldQuaternion = function (optionalTarget) {
	        var position = new Vector3();
	        var scale = new Vector3();
	        var result = optionalTarget || new Quaternion();
	        this.updateMatrixWorld(true);
	        this.matrixWorld.decompose(position, result, scale);
	        return result;
	    };
	    Object3D.prototype.getWorldRotation = function (optionalTarget) {
	        var quaternion = new Quaternion();
	        var result = optionalTarget || new Euler();
	        this.getWorldQuaternion(quaternion);
	        return result.setFromQuaternion(quaternion, this.rotation.order, false);
	    };
	    Object3D.prototype.getWorldScale = function (optionalTarget) {
	        var position = new Vector3();
	        var quaternion = new Quaternion();
	        var result = optionalTarget || new Vector3();
	        this.updateMatrixWorld(true);
	        this.matrixWorld.decompose(position, quaternion, result);
	        return result;
	    };
	    Object3D.prototype.getWorldDirection = function (optionalTarget) {
	        var quaternion = new Quaternion();
	        var result = optionalTarget || new Vector3();
	        this.getWorldQuaternion(quaternion);
	        return result.set(0, 0, 1).applyQuaternion(quaternion);
	    };
	    Object3D.prototype.raycast = function () {
	    };
	    Object3D.prototype.traverse = function (callback) {
	        callback(this);
	        var children = this.children;
	        for (var i = 0, l = children.length; i < l; i++) {
	            children[i].traverse(callback);
	        }
	    };
	    Object3D.prototype.traverseVisible = function (callback) {
	        if (this.visible === false)
	            return;
	        callback(this);
	        var children = this.children;
	        for (var i = 0, l = children.length; i < l; i++) {
	            children[i].traverseVisible(callback);
	        }
	    };
	    Object3D.prototype.traverseAncestors = function (callback) {
	        var parent = this.parent;
	        if (parent !== null) {
	            callback(parent);
	            parent.traverseAncestors(callback);
	        }
	    };
	    Object3D.prototype.updateMatrix = function () {
	        this.matrix.compose(this.position, this.quaternion, this.scale);
	        this.matrixWorldNeedsUpdate = true;
	    };
	    Object3D.prototype.updateMatrixWorld = function (force) {
	        if (this.matrixAutoUpdate === true)
	            this.updateMatrix();
	        if (this.matrixWorldNeedsUpdate === true || force === true) {
	            if (this.parent === null) {
	                this.matrixWorld.copy(this.matrix);
	            }
	            else {
	                this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
	            }
	            this.matrixWorldNeedsUpdate = false;
	            force = true;
	        }
	        for (var i = 0, l = this.children.length; i < l; i++) {
	            this.children[i].updateMatrixWorld(force);
	        }
	    };
	    Object3D.prototype.toJSON = function (meta) {
	        var isRootObject = (meta === undefined);
	        var output = {};
	        if (isRootObject) {
	            meta = {
	                geometries: {},
	                materials: {},
	                textures: {},
	                images: {}
	            };
	            output.metadata = {
	                version: 4.4,
	                type: 'Object',
	                generator: 'Object3D.toJSON'
	            };
	        }
	        var object = {};
	        object.uuid = this.uuid;
	        object.type = this.type;
	        if (this.name !== '')
	            object.name = this.name;
	        if (JSON.stringify(this.userData) !== '{}')
	            object.userData = this.userData;
	        if (this.castShadow === true)
	            object.castShadow = true;
	        if (this.receiveShadow === true)
	            object.receiveShadow = true;
	        if (this.visible === false)
	            object.visible = false;
	        object.matrix = this.matrix.toArray();
	        if (this.geometry !== undefined) {
	            if (meta.geometries[this.geometry.uuid] === undefined) {
	                meta.geometries[this.geometry.uuid] = this.geometry.toJSON(meta);
	            }
	            object.geometry = this.geometry.uuid;
	        }
	        if (this.material !== undefined) {
	            if (meta.materials[this.material.uuid] === undefined) {
	                meta.materials[this.material.uuid] = this.material.toJSON(meta);
	            }
	            object.material = this.material.uuid;
	        }
	        if (this.children.length > 0) {
	            object.children = [];
	            for (var i = 0; i < this.children.length; i++) {
	                object.children.push(this.children[i].toJSON(meta).object);
	            }
	        }
	        if (isRootObject) {
	            var geometries = extractFromCache(meta.geometries);
	            var materials = extractFromCache(meta.materials);
	            var textures = extractFromCache(meta.textures);
	            var images = extractFromCache(meta.images);
	            if (geometries.length > 0)
	                output.geometries = geometries;
	            if (materials.length > 0)
	                output.materials = materials;
	            if (textures.length > 0)
	                output.textures = textures;
	            if (images.length > 0)
	                output.images = images;
	        }
	        output.object = object;
	        return output;
	        function extractFromCache(cache) {
	            var values = [];
	            for (var key in cache) {
	                var data = cache[key];
	                delete data.metadata;
	                values.push(data);
	            }
	            return values;
	        }
	    };
	    Object3D.prototype.clone = function (recursive) {
	        return new Object3D().copy(this, recursive);
	    };
	    Object3D.prototype.copy = function (source, recursive) {
	        if (recursive === undefined)
	            recursive = true;
	        this.name = source.name;
	        this.up.copy(source.up);
	        this.position.copy(source.position);
	        this.quaternion.copy(source.quaternion);
	        this.scale.copy(source.scale);
	        this.rotationAutoUpdate = source.rotationAutoUpdate;
	        this.matrix.copy(source.matrix);
	        this.matrixWorld.copy(source.matrixWorld);
	        this.matrixAutoUpdate = source.matrixAutoUpdate;
	        this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;
	        this.visible = source.visible;
	        this.castShadow = source.castShadow;
	        this.receiveShadow = source.receiveShadow;
	        this.frustumCulled = source.frustumCulled;
	        this.renderOrder = source.renderOrder;
	        this.userData = JSON.parse(JSON.stringify(source.userData));
	        if (recursive === true) {
	            for (var i = 0; i < source.children.length; i++) {
	                var child = source.children[i];
	                this.add(child.clone());
	            }
	        }
	        return this;
	    };
	    Object3D.DefaultUp = new Vector3(0, 1, 0);
	    Object3D.DefaultMatrixAutoUpdate = true;
	    Object3D.Object3DIdCount = 0;
	    return Object3D;
	})(EventDispatcher);
	module.exports = Object3D;
	//# sourceMappingURL=Object3D.js.map

/***/ },
/* 3 */
/***/ function(module, exports) {

	function clamp(value, min, max) {
	    return Math.max(min, Math.min(max, value));
	}
	exports.clamp = clamp;
	var degreeToRadiansFactor = Math.PI / 180;
	function degToRad(degrees) {
	    return degrees * degreeToRadiansFactor;
	}
	exports.degToRad = degToRad;
	var radianToDegreesFactor = 180 / Math.PI;
	function radToDeg(radians) {
	    return radians * radianToDegreesFactor;
	}
	exports.radToDeg = radToDeg;
	var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
	var uuid = new Array(36);
	var rnd = 0, r;
	function generateUUID() {
	    for (var i = 0; i < 36; i++) {
	        if (i === 8 || i === 13 || i === 18 || i === 23) {
	            uuid[i] = '-';
	        }
	        else if (i === 14) {
	            uuid[i] = '4';
	        }
	        else {
	            if (rnd <= 0x02)
	                rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
	            r = rnd & 0xf;
	            rnd = rnd >> 4;
	            uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
	        }
	    }
	    return uuid.join('');
	}
	exports.generateUUID = generateUUID;
	function isPowerOfTwo(value) {
	    return (value & (value - 1)) === 0 && value !== 0;
	}
	exports.isPowerOfTwo = isPowerOfTwo;
	function euclideanModulo(n, m) {
	    return ((n % m) + m) % m;
	}
	exports.euclideanModulo = euclideanModulo;
	//# sourceMappingURL=MathUtil.js.map

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var Matrix4 = __webpack_require__(5);
	var Quaternion = __webpack_require__(6);
	var MathUtil = __webpack_require__(3);
	var Euler = __webpack_require__(7);
	var Vector3 = (function () {
	    function Vector3(x, y, z) {
	        var _this = this;
	        if (x === void 0) { x = 0; }
	        if (y === void 0) { y = 0; }
	        if (z === void 0) { z = 0; }
	        this.x = x;
	        this.y = y;
	        this.z = z;
	        this.applyEuler = (function () {
	            var quaternion;
	            return function applyEuler(euler) {
	                if (euler instanceof Euler === false) {
	                    console.error('THREE.Vector3: .applyEuler() now expects a Euler rotation rather than a Vector3 and order.');
	                }
	                if (quaternion === undefined)
	                    quaternion = new Quaternion();
	                this.applyQuaternion(quaternion.setFromEuler(euler));
	                return this;
	            };
	        })();
	        this.applyAxisAngle = (function () {
	            var quaternion;
	            return function applyAxisAngle(axis, angle) {
	                if (quaternion === undefined)
	                    quaternion = new Quaternion();
	                this.applyQuaternion(quaternion.setFromAxisAngle(axis, angle));
	                return this;
	            };
	        })();
	        this.project = (function () {
	            var matrix;
	            return function (camera) {
	                if (matrix === undefined)
	                    matrix = new Matrix4();
	                matrix.multiplyMatrices(camera.projectionMatrix, matrix.getInverse(camera.matrixWorld));
	                return _this.applyProjection(matrix);
	            };
	        })();
	        this.unproject = (function () {
	            var matrix;
	            return function unproject(camera) {
	                if (matrix === undefined)
	                    matrix = new Matrix4();
	                matrix.multiplyMatrices(camera.matrixWorld, matrix.getInverse(camera.projectionMatrix));
	                return this.applyProjection(matrix);
	            };
	        })();
	        this.clampScalar = (function () {
	            var min, max;
	            return function (minVal, maxVal) {
	                if (min === undefined) {
	                    min = new Vector3();
	                    max = new Vector3();
	                }
	                min.set(minVal, minVal, minVal);
	                max.set(maxVal, maxVal, maxVal);
	                return _this.clamp(min, max);
	            };
	        })();
	    }
	    Vector3.prototype.set = function (x, y, z) {
	        this.x = x;
	        this.y = y;
	        this.z = z;
	        return this;
	    };
	    Vector3.prototype.setX = function (x) {
	        this.x = x;
	    };
	    Vector3.prototype.setY = function (y) {
	        this.y = y;
	    };
	    Vector3.prototype.setZ = function (z) {
	        this.z = z;
	    };
	    Vector3.prototype.setComponent = function (index, value) {
	        switch (index) {
	            case 0:
	                this.x = value;
	                break;
	            case 1:
	                this.y = value;
	                break;
	            case 2:
	                this.z = value;
	                break;
	            default: throw new Error('index if out of range: ' + index);
	        }
	    };
	    Vector3.prototype.getComponent = function (index) {
	        switch (index) {
	            case 0: return this.x;
	            case 1: return this.y;
	            case 2: return this.z;
	            default: throw new Error('index if out of range: ' + index);
	        }
	    };
	    Vector3.prototype.clone = function () {
	        return new Vector3(this.x, this.y, this.z);
	    };
	    Vector3.prototype.copy = function (v) {
	        this.x = v.x;
	        this.y = v.y;
	        this.z = v.z;
	        return this;
	    };
	    Vector3.prototype.add = function (v) {
	        this.x += v.x;
	        this.y += v.y;
	        this.z += v.z;
	        return this;
	    };
	    Vector3.prototype.addScalar = function (s) {
	        this.x += s;
	        this.y += s;
	        this.z += s;
	        return this;
	    };
	    Vector3.prototype.addVectors = function (a, b) {
	        this.x = a.x + b.x;
	        this.y = a.y + b.y;
	        this.z = a.z + b.z;
	        return this;
	    };
	    Vector3.prototype.addScaledVector = function (v, s) {
	        this.x = v.x * s;
	        this.y = v.y * s;
	        this.z = v.z * s;
	        return this;
	    };
	    Vector3.prototype.setFromMatrixPosition = function (m) {
	        this.x = m.elements[12];
	        this.y = m.elements[13];
	        this.z = m.elements[14];
	        return this;
	    };
	    Vector3.prototype.sub = function (v) {
	        this.x -= v.x;
	        this.y -= v.y;
	        this.z -= v.z;
	        return this;
	    };
	    Vector3.prototype.subScalar = function (s) {
	        this.x -= s;
	        this.y -= s;
	        this.z -= s;
	        return this;
	    };
	    Vector3.prototype.subVectors = function (a, b) {
	        this.x = a.x - b.x;
	        this.y = a.y - b.y;
	        this.z = a.z - b.z;
	        return this;
	    };
	    Vector3.prototype.multiply = function (v) {
	        this.x *= v.x;
	        this.y *= v.y;
	        this.z *= v.z;
	        return this;
	    };
	    Vector3.prototype.multiplyScalar = function (scalar) {
	        if (isFinite(scalar)) {
	            this.x *= scalar;
	            this.y *= scalar;
	            this.z *= scalar;
	        }
	        else {
	            this.x = 0;
	            this.y = 0;
	            this.z = 0;
	        }
	        return this;
	    };
	    Vector3.prototype.multiplyVectors = function (a, b) {
	        this.x = a.x * b.x;
	        this.y = a.y * b.y;
	        this.z = a.z * b.z;
	        return this;
	    };
	    Vector3.prototype.applyMatrix3 = function (m) {
	        var x = this.x;
	        var y = this.y;
	        var z = this.z;
	        var e = m.elements;
	        this.x = e[0] * x + e[3] * y + e[6] * z;
	        this.y = e[1] * x + e[4] * y + e[7] * z;
	        this.z = e[2] * x + e[5] * y + e[8] * z;
	        return this;
	    };
	    Vector3.prototype.applyMatrix4 = function (m) {
	        var x = this.x, y = this.y, z = this.z;
	        var e = m.elements;
	        this.x = e[0] * x + e[4] * y + e[8] * z + e[12];
	        this.y = e[1] * x + e[5] * y + e[9] * z + e[13];
	        this.z = e[2] * x + e[6] * y + e[10] * z + e[14];
	        return this;
	    };
	    Vector3.prototype.applyProjection = function (m) {
	        var x = this.x, y = this.y, z = this.z;
	        var e = m.elements;
	        var d = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
	        this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * d;
	        this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * d;
	        this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * d;
	        return this;
	    };
	    Vector3.prototype.applyQuaternion = function (q) {
	        var x = this.x;
	        var y = this.y;
	        var z = this.z;
	        var qx = q.x;
	        var qy = q.y;
	        var qz = q.z;
	        var qw = q.w;
	        var ix = qw * x + qy * z - qz * y;
	        var iy = qw * y + qz * x - qx * z;
	        var iz = qw * z + qx * y - qy * x;
	        var iw = -qx * x - qy * y - qz * z;
	        this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	        this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	        this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	        return this;
	    };
	    Vector3.prototype.transformDirection = function (m) {
	        var x = this.x, y = this.y, z = this.z;
	        var e = m.elements;
	        this.x = e[0] * x + e[4] * y + e[8] * z;
	        this.y = e[1] * x + e[5] * y + e[9] * z;
	        this.z = e[2] * x + e[6] * y + e[10] * z;
	        this.normalize();
	        return this;
	    };
	    Vector3.prototype.divide = function (v) {
	        this.x /= v.x;
	        this.y /= v.y;
	        this.x /= v.z;
	        return this;
	    };
	    Vector3.prototype.divideScalar = function (scalar) {
	        return this.multiplyScalar(1 / scalar);
	    };
	    Vector3.prototype.min = function (v) {
	        this.x = Math.min(this.x, v.x);
	        this.y = Math.min(this.y, v.y);
	        this.z = Math.min(this.z, v.z);
	        return this;
	    };
	    Vector3.prototype.max = function (v) {
	        this.x = Math.max(this.x, v.x);
	        this.y = Math.max(this.y, v.y);
	        this.z = Math.max(this.z, v.z);
	        return this;
	    };
	    Vector3.prototype.clamp = function (min, max) {
	        this.x = Math.max(min.x, Math.min(max.x, this.x));
	        this.y = Math.max(min.y, Math.min(max.y, this.y));
	        this.z = Math.max(min.z, Math.min(max.z, this.z));
	        return this;
	    };
	    Vector3.prototype.clampLength = function (min, max) {
	        var length = this.length();
	        this.multiplyScalar(Math.max(min, Math.min(max, length)) / length);
	        return this;
	    };
	    Vector3.prototype.floor = function () {
	        this.x = Math.floor(this.x);
	        this.y = Math.floor(this.y);
	        this.z = Math.floor(this.z);
	        return this;
	    };
	    Vector3.prototype.ceil = function () {
	        this.x = Math.ceil(this.x);
	        this.y = Math.ceil(this.y);
	        this.z = Math.ceil(this.z);
	        return this;
	    };
	    Vector3.prototype.round = function () {
	        this.x = Math.round(this.x);
	        this.y = Math.round(this.y);
	        this.z = Math.round(this.z);
	        return this;
	    };
	    Vector3.prototype.roundToZero = function () {
	        this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
	        this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);
	        this.z = (this.z < 0) ? Math.ceil(this.z) : Math.floor(this.z);
	        return this;
	    };
	    Vector3.prototype.negate = function () {
	        this.x = -this.x;
	        this.y = -this.y;
	        this.z = -this.z;
	        return this;
	    };
	    Vector3.prototype.dot = function (v) {
	        return this.x * v.x + this.y * v.y + this.z * v.z;
	    };
	    Vector3.prototype.lengthSq = function () {
	        return this.x * this.x + this.y * this.y + this.z * this.z;
	    };
	    Vector3.prototype.length = function () {
	        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	    };
	    Vector3.prototype.lengthManhattan = function () {
	        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
	    };
	    Vector3.prototype.normalize = function () {
	        return this.divideScalar(this.length());
	    };
	    Vector3.prototype.setLength = function (length) {
	        return this.divideScalar(length / this.length());
	    };
	    Vector3.prototype.lerp = function (v, alpha) {
	        this.x += (v.x - this.x) * alpha;
	        this.y += (v.y - this.y) * alpha;
	        this.z += (v.z - this.z) * alpha;
	        return this;
	    };
	    Vector3.prototype.lerpVectors = function (v1, v2, alpha) {
	        this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
	        return this;
	    };
	    Vector3.prototype.cross = function (v) {
	        var x = this.x, y = this.y, z = this.z;
	        this.x = y * v.z - z * v.y;
	        this.y = z * v.x - x * v.z;
	        this.z = x * v.y - y * v.x;
	        return this;
	    };
	    Vector3.prototype.crossVectors = function (a, b) {
	        var ax = a.x, ay = a.y, az = a.z;
	        var bx = b.x, by = b.y, bz = b.z;
	        this.x = ay * bz - az * by;
	        this.y = az * bx - ax * bz;
	        this.z = ax * by - ay * bx;
	        return this;
	    };
	    Vector3.prototype.projectOnVector = function (vector) {
	        var v1 = new Vector3();
	        v1.copy(vector).normalize();
	        var dot = this.dot(v1);
	        return this.copy(v1).multiplyScalar(dot);
	    };
	    Vector3.prototype.projectOnPlane = function (planeNormal) {
	        var v1 = new Vector3();
	        v1.copy(this).projectOnVector(planeNormal);
	        return this.sub(v1);
	    };
	    Vector3.prototype.reflect = function (normal) {
	        var v1 = new Vector3();
	        return this.sub(v1.copy(normal).multiplyScalar(2 * this.dot(normal)));
	    };
	    Vector3.prototype.angleTo = function (v) {
	        var theta = this.dot(v) / (this.length() * v.length());
	        return Math.acos(MathUtil.clamp(theta, -1, 1));
	    };
	    Vector3.prototype.distanceTo = function (v) {
	        return Math.sqrt(this.distanceToSquared(v));
	    };
	    Vector3.prototype.distanceToSquared = function (v) {
	        var dx = this.x - v.x;
	        var dy = this.y - v.y;
	        var dz = this.z - v.z;
	        return dx * dx + dy * dy + dz * dz;
	    };
	    Vector3.prototype.setFormMatrixPosition = function (m) {
	        this.x = m.elements[12];
	        this.y = m.elements[13];
	        this.z = m.elements[14];
	        return this;
	    };
	    Vector3.prototype.setFromMatrixScale = function (m) {
	        var sx = this.set(m.elements[0], m.elements[1], m.elements[2]).length();
	        var sy = this.set(m.elements[4], m.elements[5], m.elements[6]).length();
	        var sz = this.set(m.elements[8], m.elements[9], m.elements[10]).length();
	        this.x = sx;
	        this.y = sy;
	        this.z = sz;
	        return this;
	    };
	    Vector3.prototype.setFromMatrixColumn = function (index, matrix) {
	        var offset = index * 4;
	        var me = matrix.elements;
	        this.x = me[offset];
	        this.y = me[offset + 1];
	        this.z = me[offset + 2];
	        return this;
	    };
	    Vector3.prototype.equals = function (v) {
	        return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
	    };
	    Vector3.prototype.fromArray = function (array, offset) {
	        if (offset === void 0) { offset = 0; }
	        this.x = array[offset];
	        this.y = array[offset + 1];
	        this.z = array[offset + 2];
	        return this;
	    };
	    Vector3.prototype.toArray = function (array, offset) {
	        if (array === void 0) { array = []; }
	        if (offset === void 0) { offset = 0; }
	        array[offset] = this.x;
	        array[offset + 1] = this.y;
	        array[offset + 2] = this.z;
	        return array;
	    };
	    Vector3.prototype.fromAttribute = function (attribute, index, offset) {
	        if (offset === void 0) { offset = 0; }
	        this.x = attribute.array[index];
	        this.y = attribute.array[index + 1];
	        this.z = attribute.array[index + 2];
	        return this;
	    };
	    return Vector3;
	})();
	module.exports = Vector3;
	//# sourceMappingURL=Vector3.js.map

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var Vector3 = __webpack_require__(4);
	var MathUtil = __webpack_require__(3);
	var Matrix4 = (function () {
	    function Matrix4(elements) {
	        if (elements === void 0) { elements = new Float32Array([
	            1, 0, 0, 0,
	            0, 1, 0, 0,
	            0, 0, 1, 0,
	            0, 0, 0, 1
	        ]); }
	        this.elements = elements;
	    }
	    Matrix4.prototype.set = function (n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
	        var te = this.elements;
	        te[0] = n11;
	        te[4] = n12;
	        te[8] = n13;
	        te[12] = n14;
	        te[2] = n21;
	        te[5] = n22;
	        te[9] = n23;
	        te[13] = n24;
	        te[3] = n31;
	        te[6] = n32;
	        te[10] = n33;
	        te[14] = n34;
	        te[4] = n41;
	        te[7] = n42;
	        te[11] = n43;
	        te[15] = n44;
	        return this;
	    };
	    Matrix4.prototype.identity = function () {
	        this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
	        return this;
	    };
	    Matrix4.prototype.clone = function (m) {
	        return new Matrix4().fromArray(this.elements);
	    };
	    Matrix4.prototype.copy = function (m) {
	        this.elements.set(m.elements);
	        return this;
	    };
	    Matrix4.prototype.copyPosition = function (m) {
	        var te = this.elements;
	        var me = m.elements;
	        te[12] = me[12];
	        te[13] = me[13];
	        te[14] = me[14];
	        return this;
	    };
	    Matrix4.prototype.extractBasis = function (xAxis, yAxis, zAxis) {
	        var te = this.elements;
	        xAxis.set(te[0], te[1], te[2]);
	        yAxis.set(te[4], te[5], te[6]);
	        zAxis.set(te[8], te[9], te[10]);
	        return this;
	    };
	    Matrix4.prototype.makeBasis = function (xAxis, yAxis, zAxis) {
	        this.set(xAxis.x, yAxis.x, zAxis.x, 0, xAxis.y, yAxis.y, zAxis.y, 0, xAxis.z, yAxis.z, zAxis.z, 0, 0, 0, 0, 1);
	        return this;
	    };
	    Matrix4.prototype.extractRotation = function (m) {
	        var v1 = new Vector3();
	        var te = this.elements;
	        var me = m.elements;
	        var scaleX = 1 / v1.set(me[0], me[1], me[2]).length();
	        var scaleY = 1 / v1.set(me[4], me[5], me[6]).length();
	        var scaleZ = 1 / v1.set(me[8], me[9], me[10]).length();
	        te[0] = me[0] * scaleX;
	        te[1] = me[1] * scaleX;
	        te[2] = me[2] * scaleX;
	        te[4] = me[4] * scaleY;
	        te[5] = me[5] * scaleY;
	        te[6] = me[6] * scaleY;
	        te[8] = me[8] * scaleZ;
	        te[9] = me[9] * scaleZ;
	        te[10] = me[10] * scaleZ;
	        return this;
	    };
	    Matrix4.prototype.makeRotationFromEuler = function (euler) {
	        var te = this.elements;
	        var x = euler.x, y = euler.y, z = euler.z;
	        var a = Math.cos(x), b = Math.sin(x);
	        var c = Math.cos(y), d = Math.sin(y);
	        var e = Math.cos(z), f = Math.sin(z);
	        if (euler.order === 'XYZ') {
	            var ae = a * e, af = a * f, be = b * e, bf = b * f;
	            te[0] = c * e;
	            te[4] = -c * f;
	            te[8] = d;
	            te[1] = af + be * d;
	            te[5] = ae - bf * d;
	            te[9] = -b * c;
	            te[2] = bf - ae * d;
	            te[6] = be + af * d;
	            te[10] = a * c;
	        }
	        else if (euler.order === 'YXZ') {
	            var ce = c * e, cf = c * f, de = d * e, df = d * f;
	            te[0] = ce + df * b;
	            te[4] = de * b - cf;
	            te[8] = a * d;
	            te[1] = a * f;
	            te[5] = a * e;
	            te[9] = -b;
	            te[2] = cf * b - de;
	            te[6] = df + ce * b;
	            te[10] = a * c;
	        }
	        else if (euler.order === 'ZXY') {
	            var ce = c * e, cf = c * f, de = d * e, df = d * f;
	            te[0] = ce - df * b;
	            te[4] = -a * f;
	            te[8] = de + cf * b;
	            te[1] = cf + de * b;
	            te[5] = a * e;
	            te[9] = df - ce * b;
	            te[2] = -a * d;
	            te[6] = b;
	            te[10] = a * c;
	        }
	        else if (euler.order === 'ZYX') {
	            var ae = a * e, af = a * f, be = b * e, bf = b * f;
	            te[0] = c * e;
	            te[4] = be * d - af;
	            te[8] = ae * d + bf;
	            te[1] = c * f;
	            te[5] = bf * d + ae;
	            te[9] = af * d - be;
	            te[2] = -d;
	            te[6] = b * c;
	            te[10] = a * c;
	        }
	        else if (euler.order === 'YZX') {
	            var ac = a * c, ad = a * d, bc = b * c, bd = b * d;
	            te[0] = c * e;
	            te[4] = bd - ac * f;
	            te[8] = bc * f + ad;
	            te[1] = f;
	            te[5] = a * e;
	            te[9] = -b * e;
	            te[2] = -d * e;
	            te[6] = ad * f + bc;
	            te[10] = ac - bd * f;
	        }
	        else if (euler.order === 'XZY') {
	            var ac = a * c, ad = a * d, bc = b * c, bd = b * d;
	            te[0] = c * e;
	            te[4] = -f;
	            te[8] = d * e;
	            te[1] = ac * f + bd;
	            te[5] = a * e;
	            te[9] = ad * f - bc;
	            te[2] = bc * f - ad;
	            te[6] = b * e;
	            te[10] = bd * f + ac;
	        }
	        te[3] = 0;
	        te[7] = 0;
	        te[11] = 0;
	        te[12] = 0;
	        te[13] = 0;
	        te[14] = 0;
	        te[15] = 1;
	        return this;
	    };
	    Matrix4.prototype.makeRotationFromQuaternion = function (q) {
	        var te = this.elements;
	        var x = q.x, y = q.y, z = q.z, w = q.w;
	        var x2 = x + x, y2 = y + y, z2 = z + z;
	        var xx = x * x2, xy = x * y2, xz = x * z2;
	        var yy = y * y2, yz = y * z2, zz = z * z2;
	        var wx = w * x2, wy = w * y2, wz = w * z2;
	        te[0] = 1 - (yy + zz);
	        te[4] = xy - wz;
	        te[8] = xz + wy;
	        te[1] = xy + wz;
	        te[5] = 1 - (xx + zz);
	        te[9] = yz - wx;
	        te[2] = xz - wy;
	        te[6] = yz + wx;
	        te[10] = 1 - (xx + yy);
	        te[3] = 0;
	        te[7] = 0;
	        te[11] = 0;
	        te[12] = 0;
	        te[13] = 0;
	        te[14] = 0;
	        te[15] = 1;
	        return this;
	    };
	    Matrix4.prototype.lookAt = function (eye, target, up) {
	        var x = new Vector3();
	        var y = new Vector3();
	        var z = new Vector3();
	        var te = this.elements;
	        z.subVectors(eye, target).normalize();
	        if (z.lengthSq() === 0) {
	            z.z = 1;
	        }
	        x.crossVectors(up, z).normalize();
	        if (x.lengthSq() === 0) {
	            z.x += 0.0001;
	            x.crossVectors(up, z).normalize();
	        }
	        y.crossVectors(z, x);
	        te[0] = x.x;
	        te[4] = y.x;
	        te[8] = z.x;
	        te[1] = x.y;
	        te[5] = y.y;
	        te[9] = z.y;
	        te[2] = x.z;
	        te[6] = y.z;
	        te[10] = z.z;
	        return this;
	    };
	    Matrix4.prototype.multiplyMatrices = function (a, b) {
	        var ae = a.elements;
	        var be = b.elements;
	        var te = this.elements;
	        var a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
	        var a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
	        var a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
	        var a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];
	        var b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
	        var b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
	        var b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
	        var b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];
	        te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
	        te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
	        te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
	        te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
	        te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
	        te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
	        te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
	        te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
	        te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
	        te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
	        te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
	        te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
	        te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
	        te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
	        te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
	        te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
	        return this;
	    };
	    Matrix4.prototype.multiplyToArray = function (a, b, r) {
	        var te = this.elements;
	        this.multiplyMatrices(a, b);
	        r[0] = te[0];
	        r[1] = te[1];
	        r[2] = te[2];
	        r[3] = te[3];
	        r[4] = te[4];
	        r[5] = te[5];
	        r[6] = te[6];
	        r[7] = te[7];
	        r[8] = te[8];
	        r[9] = te[9];
	        r[10] = te[10];
	        r[11] = te[11];
	        r[12] = te[12];
	        r[13] = te[13];
	        r[14] = te[14];
	        r[15] = te[15];
	        return this;
	    };
	    Matrix4.prototype.multiplyScalar = function (s) {
	        var te = this.elements;
	        te[0] *= s;
	        te[4] *= s;
	        te[8] *= s;
	        te[12] *= s;
	        te[1] *= s;
	        te[5] *= s;
	        te[9] *= s;
	        te[13] *= s;
	        te[2] *= s;
	        te[6] *= s;
	        te[10] *= s;
	        te[14] *= s;
	        te[3] *= s;
	        te[7] *= s;
	        te[11] *= s;
	        te[15] *= s;
	        return this;
	    };
	    Matrix4.prototype.applyToVector3Array = function (array, offset, length) {
	        var v1 = new Vector3();
	        if (offset === undefined)
	            offset = 0;
	        if (length === undefined)
	            length = array.length;
	        for (var i = 0, j = offset; i < length; i += 3, j += 3) {
	            v1.fromArray(array, j);
	            v1.applyMatrix4(this);
	            v1.toArray(array, j);
	        }
	        return array;
	    };
	    Matrix4.prototype.applyToBuffer = function (buffer, offset, length) {
	        var v1 = new Vector3();
	        if (v1 === undefined)
	            v1 = new Vector3();
	        if (offset === undefined)
	            offset = 0;
	        if (length === undefined)
	            length = buffer.length / buffer.itemSize;
	        for (var i = 0, j = offset; i < length; i++, j++) {
	            v1.x = buffer.getX(j);
	            v1.y = buffer.getY(j);
	            v1.z = buffer.getZ(j);
	            v1.applyMatrix4(this);
	            buffer.setXYZ(v1.x, v1.y, v1.z);
	        }
	        return buffer;
	    };
	    Matrix4.prototype.determinant = function () {
	        var te = this.elements;
	        var n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
	        var n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
	        var n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
	        var n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];
	        return (n41 * (+n14 * n23 * n32
	            - n13 * n24 * n32
	            - n14 * n22 * n33
	            + n12 * n24 * n33
	            + n13 * n22 * n34
	            - n12 * n23 * n34) +
	            n42 * (+n11 * n23 * n34
	                - n11 * n24 * n33
	                + n14 * n21 * n33
	                - n13 * n21 * n34
	                + n13 * n24 * n31
	                - n14 * n23 * n31) +
	            n43 * (+n11 * n24 * n32
	                - n11 * n22 * n34
	                - n14 * n21 * n32
	                + n12 * n21 * n34
	                + n14 * n22 * n31
	                - n12 * n24 * n31) +
	            n44 * (-n13 * n22 * n31
	                - n11 * n23 * n32
	                + n11 * n22 * n33
	                + n13 * n21 * n32
	                - n12 * n21 * n33
	                + n12 * n23 * n31));
	    };
	    Matrix4.prototype.transpose = function () {
	        var te = this.elements;
	        var tmp;
	        tmp = te[1];
	        te[1] = te[4];
	        te[4] = tmp;
	        tmp = te[2];
	        te[2] = te[8];
	        te[8] = tmp;
	        tmp = te[6];
	        te[6] = te[9];
	        te[9] = tmp;
	        tmp = te[3];
	        te[3] = te[12];
	        te[12] = tmp;
	        tmp = te[7];
	        te[7] = te[13];
	        te[13] = tmp;
	        tmp = te[11];
	        te[11] = te[14];
	        te[14] = tmp;
	        return this;
	    };
	    Matrix4.prototype.flattenToArrayOffset = function (array, offset) {
	        var te = this.elements;
	        array[offset] = te[0];
	        array[offset + 1] = te[1];
	        array[offset + 2] = te[2];
	        array[offset + 3] = te[3];
	        array[offset + 4] = te[4];
	        array[offset + 5] = te[5];
	        array[offset + 6] = te[6];
	        array[offset + 7] = te[7];
	        array[offset + 8] = te[8];
	        array[offset + 9] = te[9];
	        array[offset + 10] = te[10];
	        array[offset + 11] = te[11];
	        array[offset + 12] = te[12];
	        array[offset + 13] = te[13];
	        array[offset + 14] = te[14];
	        array[offset + 15] = te[15];
	        return array;
	    };
	    Matrix4.prototype.getPosition = function () {
	        var v1 = new Vector3();
	        var te = this.elements;
	        return v1.set(te[12], te[13], te[14]);
	    };
	    Matrix4.prototype.setPosition = function (v) {
	        var te = this.elements;
	        te[12] = v.x;
	        te[13] = v.y;
	        te[14] = v.z;
	        return this;
	    };
	    Matrix4.prototype.getInverse = function (m, throwOnInvertible) {
	        var te = this.elements;
	        var me = m.elements;
	        var n11 = me[0], n12 = me[4], n13 = me[8], n14 = me[12];
	        var n21 = me[1], n22 = me[5], n23 = me[9], n24 = me[13];
	        var n31 = me[2], n32 = me[6], n33 = me[10], n34 = me[14];
	        var n41 = me[3], n42 = me[7], n43 = me[11], n44 = me[15];
	        te[0] = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
	        te[4] = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
	        te[8] = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
	        te[12] = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
	        te[1] = n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44;
	        te[5] = n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44;
	        te[9] = n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44;
	        te[13] = n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34;
	        te[2] = n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44;
	        te[6] = n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44;
	        te[10] = n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44;
	        te[14] = n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34;
	        te[3] = n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43;
	        te[7] = n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43;
	        te[11] = n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43;
	        te[15] = n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33;
	        var det = n11 * te[0] + n21 * te[4] + n31 * te[8] + n41 * te[12];
	        if (det === 0) {
	            var msg = "Matrix4.getInverse(): can't invert matrix, determinant is 0";
	            if (throwOnInvertible || false) {
	                throw new Error(msg);
	            }
	            else {
	                console.warn(msg);
	            }
	            this.identity();
	            return this;
	        }
	        this.multiplyScalar(1 / det);
	        return this;
	    };
	    Matrix4.prototype.scale = function (v) {
	        var te = this.elements;
	        var x = v.x, y = v.y, z = v.z;
	        te[0] *= x;
	        te[4] *= y;
	        te[8] *= z;
	        te[1] *= x;
	        te[5] *= y;
	        te[9] *= z;
	        te[2] *= x;
	        te[6] *= y;
	        te[10] *= z;
	        te[3] *= x;
	        te[7] *= y;
	        te[11] *= z;
	        return this;
	    };
	    Matrix4.prototype.getMaxScaleOnAxis = function () {
	        var te = this.elements;
	        var scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
	        var scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
	        var scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];
	        return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
	    };
	    Matrix4.prototype.makeTranslation = function (x, y, z) {
	        this.set(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
	        return this;
	    };
	    Matrix4.prototype.makeRotationX = function (theta) {
	        var c = Math.cos(theta), s = Math.sin(theta);
	        this.set(1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1);
	        return this;
	    };
	    Matrix4.prototype.makeRotationY = function (theta) {
	        var c = Math.cos(theta), s = Math.sin(theta);
	        this.set(c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1);
	        return this;
	    };
	    Matrix4.prototype.makeRotationZ = function (theta) {
	        var c = Math.cos(theta), s = Math.sin(theta);
	        this.set(c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
	        return this;
	    };
	    Matrix4.prototype.makeRotationAxis = function (axis, angle) {
	        // Based on http://www.gamedev.net/reference/articles/article1199.asp
	        var c = Math.cos(angle);
	        var s = Math.sin(angle);
	        var t = 1 - c;
	        var x = axis.x, y = axis.y, z = axis.z;
	        var tx = t * x, ty = t * y;
	        this.set(tx * x + c, tx * y - s * z, tx * z + s * y, 0, tx * y + s * z, ty * y + c, ty * z - s * x, 0, tx * z - s * y, ty * z + s * x, t * z * z + c, 0, 0, 0, 0, 1);
	        return this;
	    };
	    Matrix4.prototype.makeScale = function (x, y, z) {
	        this.set(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
	        return this;
	    };
	    Matrix4.prototype.compose = function (position, quaternion, scale) {
	        this.makeRotationFromQuaternion(quaternion);
	        this.scale(scale);
	        this.setPosition(position);
	        return this;
	    };
	    Matrix4.prototype.decompose = function (position, quaternion, scale) {
	        var vector = new Vector3();
	        var matrix = new Matrix4();
	        var te = this.elements;
	        var sx = vector.set(te[0], te[1], te[2]).length();
	        var sy = vector.set(te[4], te[5], te[6]).length();
	        var sz = vector.set(te[8], te[9], te[10]).length();
	        var det = this.determinant();
	        if (det < 0) {
	            sx = -sx;
	        }
	        position.x = te[12];
	        position.y = te[13];
	        position.z = te[14];
	        matrix.elements.set(this.elements);
	        var invSX = 1 / sx;
	        var invSY = 1 / sy;
	        var invSZ = 1 / sz;
	        matrix.elements[0] *= invSX;
	        matrix.elements[1] *= invSX;
	        matrix.elements[2] *= invSX;
	        matrix.elements[4] *= invSY;
	        matrix.elements[5] *= invSY;
	        matrix.elements[6] *= invSY;
	        matrix.elements[8] *= invSZ;
	        matrix.elements[9] *= invSZ;
	        matrix.elements[10] *= invSZ;
	        quaternion.setFromRotationMatrix(matrix);
	        scale.x = sx;
	        scale.y = sy;
	        scale.z = sz;
	        return this;
	    };
	    Matrix4.prototype.makeFrustum = function (left, right, bottom, top, near, far) {
	        var te = this.elements;
	        var x = 2 * near / (right - left);
	        var y = 2 * near / (top - bottom);
	        var a = (right + left) / (right - left);
	        var b = (top + bottom) / (top - bottom);
	        var c = -(far + near) / (far - near);
	        var d = -2 * far * near / (far - near);
	        te[0] = x;
	        te[4] = 0;
	        te[8] = a;
	        te[12] = 0;
	        te[1] = 0;
	        te[5] = y;
	        te[9] = b;
	        te[13] = 0;
	        te[2] = 0;
	        te[6] = 0;
	        te[10] = c;
	        te[14] = d;
	        te[3] = 0;
	        te[7] = 0;
	        te[11] = -1;
	        te[15] = 0;
	        return this;
	    };
	    Matrix4.prototype.makePerspective = function (fov, aspect, near, far) {
	        var ymax = near * Math.tan(MathUtil.degToRad(fov * 0.5));
	        var ymin = -ymax;
	        var xmin = ymin * aspect;
	        var xmax = ymax * aspect;
	        return this.makeFrustum(xmin, xmax, ymin, ymax, near, far);
	    };
	    Matrix4.prototype.makeOrthographic = function (left, right, top, bottom, near, far) {
	        var te = this.elements;
	        var w = right - left;
	        var h = top - bottom;
	        var p = far - near;
	        var x = (right + left) / w;
	        var y = (top + bottom) / h;
	        var z = (far + near) / p;
	        te[0] = 2 / w;
	        te[4] = 0;
	        te[8] = 0;
	        te[12] = -x;
	        te[1] = 0;
	        te[5] = 2 / h;
	        te[9] = 0;
	        te[13] = -y;
	        te[2] = 0;
	        te[6] = 0;
	        te[10] = -2 / p;
	        te[14] = -z;
	        te[3] = 0;
	        te[7] = 0;
	        te[11] = 0;
	        te[15] = 1;
	        return this;
	    };
	    Matrix4.prototype.equals = function (matrix) {
	        var te = this.elements;
	        var me = matrix.elements;
	        for (var i = 0; i < 16; i++) {
	            if (te[i] !== me[i])
	                return false;
	        }
	        return true;
	    };
	    Matrix4.prototype.fromArray = function (array) {
	        this.elements.set(array);
	        return this;
	    };
	    Matrix4.prototype.toArray = function () {
	        var te = this.elements;
	        return [
	            te[0], te[1], te[2], te[3],
	            te[4], te[5], te[6], te[7],
	            te[8], te[9], te[10], te[11],
	            te[12], te[13], te[14], te[15]
	        ];
	    };
	    return Matrix4;
	})();
	module.exports = Matrix4;
	//# sourceMappingURL=Matrix4.js.map

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var Vector3 = __webpack_require__(4);
	var Quaternion = (function () {
	    function Quaternion(x, y, z, w) {
	        this._x = x || 0;
	        this._y = y || 0;
	        this._z = z || 0;
	        this._w = (w !== undefined) ? w : 1;
	    }
	    Object.defineProperty(Quaternion.prototype, "x", {
	        get: function () {
	            return this._x;
	        },
	        set: function (value) {
	            this._x = value;
	            this.onChangeCallback();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Quaternion.prototype, "y", {
	        get: function () {
	            return this._y;
	        },
	        set: function (value) {
	            this._y = value;
	            this.onChangeCallback();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Quaternion.prototype, "z", {
	        get: function () {
	            return this._z;
	        },
	        set: function (value) {
	            this._z = value;
	            this.onChangeCallback();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Quaternion.prototype, "w", {
	        get: function () {
	            return this._w;
	        },
	        set: function (value) {
	            this._w = value;
	            this.onChangeCallback();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Quaternion.prototype.set = function (x, y, z, w) {
	        this._x = x;
	        this._y = y;
	        this._z = z;
	        this._w = w;
	        this.onChangeCallback();
	        return this;
	    };
	    Quaternion.prototype.clone = function () {
	        return new Quaternion(this._x, this._y, this._z, this._w);
	    };
	    Quaternion.prototype.copy = function (quaternion) {
	        this._x = quaternion.x;
	        this._y = quaternion.y;
	        this._z = quaternion.z;
	        this._w = quaternion.w;
	        this.onChangeCallback();
	        return this;
	    };
	    Quaternion.prototype.setFromEuler = function (euler, update) {
	        var c1 = Math.cos(euler.x / 2);
	        var c2 = Math.cos(euler.y / 2);
	        var c3 = Math.cos(euler.z / 2);
	        var s1 = Math.sin(euler.x / 2);
	        var s2 = Math.sin(euler.y / 2);
	        var s3 = Math.sin(euler.z / 2);
	        var order = euler.order;
	        if (order === 'XYZ') {
	            this._x = s1 * c2 * c3 + c1 * s2 * s3;
	            this._y = c1 * s2 * c3 - s1 * c2 * s3;
	            this._z = c1 * c2 * s3 + s1 * s2 * c3;
	            this._w = c1 * c2 * c3 - s1 * s2 * s3;
	        }
	        else if (order === 'YXZ') {
	            this._x = s1 * c2 * c3 + c1 * s2 * s3;
	            this._y = c1 * s2 * c3 - s1 * c2 * s3;
	            this._z = c1 * c2 * s3 - s1 * s2 * c3;
	            this._w = c1 * c2 * c3 + s1 * s2 * s3;
	        }
	        else if (order === 'ZXY') {
	            this._x = s1 * c2 * c3 - c1 * s2 * s3;
	            this._y = c1 * s2 * c3 + s1 * c2 * s3;
	            this._z = c1 * c2 * s3 + s1 * s2 * c3;
	            this._w = c1 * c2 * c3 - s1 * s2 * s3;
	        }
	        else if (order === 'ZYX') {
	            this._x = s1 * c2 * c3 - c1 * s2 * s3;
	            this._y = c1 * s2 * c3 + s1 * c2 * s3;
	            this._z = c1 * c2 * s3 - s1 * s2 * c3;
	            this._w = c1 * c2 * c3 + s1 * s2 * s3;
	        }
	        else if (order === 'YZX') {
	            this._x = s1 * c2 * c3 + c1 * s2 * s3;
	            this._y = c1 * s2 * c3 + s1 * c2 * s3;
	            this._z = c1 * c2 * s3 - s1 * s2 * c3;
	            this._w = c1 * c2 * c3 - s1 * s2 * s3;
	        }
	        else if (order === 'XZY') {
	            this._x = s1 * c2 * c3 - c1 * s2 * s3;
	            this._y = c1 * s2 * c3 - s1 * c2 * s3;
	            this._z = c1 * c2 * s3 + s1 * s2 * c3;
	            this._w = c1 * c2 * c3 + s1 * s2 * s3;
	        }
	        if (update !== false)
	            this.onChangeCallback();
	        return this;
	    };
	    Quaternion.prototype.setFromAxisAngle = function (axis, angle) {
	        var halfAngle = angle / 2, s = Math.sin(halfAngle);
	        this._x = axis.x * s;
	        this._y = axis.y * s;
	        this._z = axis.z * s;
	        this._w = Math.cos(halfAngle);
	        this.onChangeCallback();
	        return this;
	    };
	    Quaternion.prototype.setFromRotationMatrix = function (m) {
	        var te = m.elements, m11 = te[0], m12 = te[4], m13 = te[8], m21 = te[1], m22 = te[5], m23 = te[9], m31 = te[2], m32 = te[6], m33 = te[10], trace = m11 + m22 + m33, s;
	        if (trace > 0) {
	            s = 0.5 / Math.sqrt(trace + 1.0);
	            this._w = 0.25 / s;
	            this._x = (m32 - m23) * s;
	            this._y = (m13 - m31) * s;
	            this._z = (m21 - m12) * s;
	        }
	        else if (m11 > m22 && m11 > m33) {
	            s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
	            this._w = (m32 - m23) / s;
	            this._x = 0.25 * s;
	            this._y = (m12 + m21) / s;
	            this._z = (m13 + m31) / s;
	        }
	        else if (m22 > m33) {
	            s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
	            this._w = (m13 - m31) / s;
	            this._x = (m12 + m21) / s;
	            this._y = 0.25 * s;
	            this._z = (m23 + m32) / s;
	        }
	        else {
	            s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
	            this._w = (m21 - m12) / s;
	            this._x = (m13 + m31) / s;
	            this._y = (m23 + m32) / s;
	            this._z = 0.25 * s;
	        }
	        this.onChangeCallback();
	        return this;
	    };
	    Quaternion.prototype.setFromUnitVectors = function (vFrom, vTo) {
	        var EPS = 0.000001;
	        var v1 = new Vector3();
	        var r = vFrom.dot(vTo) + 1;
	        r = vFrom.dot(vTo) + 1;
	        if (r < EPS) {
	            r = 0;
	            if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
	                v1.set(-vFrom.y, vFrom.x, 0);
	            }
	            else {
	                v1.set(0, -vFrom.z, vFrom.y);
	            }
	        }
	        else {
	            v1.crossVectors(vFrom, vTo);
	        }
	        this._x = v1.x;
	        this._y = v1.y;
	        this._z = v1.z;
	        this._w = r;
	        this.normalize();
	        return this;
	    };
	    Quaternion.prototype.inverse = function () {
	        this.conjugate().normalize();
	        return this;
	    };
	    Quaternion.prototype.conjugate = function () {
	        this._x *= -1;
	        this._y *= -1;
	        this._z *= -1;
	        this.onChangeCallback();
	        return this;
	    };
	    Quaternion.prototype.dot = function (v) {
	        return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
	    };
	    Quaternion.prototype.lengthSq = function () {
	        return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
	    };
	    Quaternion.prototype.length = function () {
	        return Math.sqrt(this.lengthSq());
	    };
	    Quaternion.prototype.normalize = function () {
	        var l = this.length();
	        if (l === 0) {
	            this._x = 0;
	            this._y = 0;
	            this._z = 0;
	            this._w = 1;
	        }
	        else {
	            l = 1 / l;
	            this._x = this._x * l;
	            this._y = this._y * l;
	            this._z = this._z * l;
	            this._w = this._w * l;
	        }
	        this.onChangeCallback();
	        return this;
	    };
	    Quaternion.prototype.multiply = function (q) {
	        return this.multiplyQuaternions(this, q);
	    };
	    Quaternion.prototype.multiplyQuaternions = function (a, b) {
	        var qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
	        var qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;
	        this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
	        this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
	        this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
	        this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
	        this.onChangeCallback();
	        return this;
	    };
	    Quaternion.prototype.slerp = function (qb, t) {
	        if (t === 0)
	            return this;
	        if (t === 1)
	            return this.copy(qb);
	        var x = this._x, y = this._y, z = this._z, w = this._w;
	        var cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;
	        if (cosHalfTheta < 0) {
	            this._w = -qb._w;
	            this._x = -qb._x;
	            this._y = -qb._y;
	            this._z = -qb._z;
	            cosHalfTheta = -cosHalfTheta;
	        }
	        else {
	            this.copy(qb);
	        }
	        if (cosHalfTheta >= 1.0) {
	            this._w = w;
	            this._x = x;
	            this._y = y;
	            this._z = z;
	            return this;
	        }
	        var halfTheta = Math.acos(cosHalfTheta);
	        var sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
	        if (Math.abs(sinHalfTheta) < 0.001) {
	            this._w = 0.5 * (w + this._w);
	            this._x = 0.5 * (x + this._x);
	            this._y = 0.5 * (y + this._y);
	            this._z = 0.5 * (z + this._z);
	            return this;
	        }
	        var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta, ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
	        this._w = (w * ratioA + this._w * ratioB);
	        this._x = (x * ratioA + this._x * ratioB);
	        this._y = (y * ratioA + this._y * ratioB);
	        this._z = (z * ratioA + this._z * ratioB);
	        this.onChangeCallback();
	        return this;
	    };
	    Quaternion.prototype.equals = function (quaternion) {
	        return (quaternion._x === this._x) && (quaternion._y === this._y) && (quaternion._z === this._z) && (quaternion._w === this._w);
	    };
	    Quaternion.prototype.fromArray = function (array, offset) {
	        if (offset === undefined)
	            offset = 0;
	        this._x = array[offset];
	        this._y = array[offset + 1];
	        this._z = array[offset + 2];
	        this._w = array[offset + 3];
	        this.onChangeCallback();
	        return this;
	    };
	    Quaternion.prototype.toArray = function (array, offset) {
	        if (array === undefined)
	            array = [];
	        if (offset === undefined)
	            offset = 0;
	        array[offset] = this._x;
	        array[offset + 1] = this._y;
	        array[offset + 2] = this._z;
	        array[offset + 3] = this._w;
	        return array;
	    };
	    Quaternion.prototype.onChange = function (callback) {
	        this.onChangeCallback = callback;
	        return this;
	    };
	    Quaternion.prototype.onChangeCallback = function () {
	    };
	    Quaternion.slerp = function (qa, qb, qm, t) {
	        return qm.copy(qa).slerp(qb, t);
	    };
	    return Quaternion;
	})();
	module.exports = Quaternion;
	//# sourceMappingURL=Quaternion.js.map

/***/ },
/* 7 */
/***/ function(module, exports) {

	var Euler = (function () {
	    function Euler(_x, _y, _z, _order) {
	        if (_x === void 0) { _x = 0; }
	        if (_y === void 0) { _y = 0; }
	        if (_z === void 0) { _z = 0; }
	        if (_order === void 0) { _order = Euler.DefaultOrder; }
	        this._x = _x;
	        this._y = _y;
	        this._z = _z;
	        this._order = _order;
	        this.onChangeCallback = function () { };
	    }
	    Object.defineProperty(Euler.prototype, "x", {
	        get: function () {
	            return this._x;
	        },
	        set: function (value) {
	            this._x = value;
	            this.onChangeCallback();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Euler.prototype, "y", {
	        get: function () {
	            return this._y;
	        },
	        set: function (value) {
	            this._y = value;
	            this.onChangeCallback();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Euler.prototype, "z", {
	        get: function () {
	            return this._z;
	        },
	        set: function (value) {
	            this.z = value;
	            this.onChangeCallback();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Euler.prototype, "order", {
	        get: function () {
	            return this._order;
	        },
	        set: function (value) {
	            this._order = value;
	            this.onChangeCallback();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Euler.prototype.set = function (x, y, z, order) {
	        this._x = x;
	        this._y = y;
	        this._z = z;
	        this._order = order || this._order;
	        this.onChangeCallback();
	        return this;
	    };
	    Euler.prototype.clone = function () {
	        return new Euler(this._x, this._y, this._z, this._order);
	    };
	    Euler.prototype.copy = function (euler) {
	        this._x = euler.x;
	        this._y = euler.y;
	        this._z = euler.z;
	        this._order = euler.order;
	        this.onChangeCallback();
	        return this;
	    };
	    Euler.prototype.setFromRotationMatrix = function (m, oder, update) {
	    };
	    Euler.prototype.setFromQuaternion = function (q, order, update) {
	    };
	    Euler.prototype.setFromVector3 = function () {
	    };
	    Euler.prototype.reorder = function () {
	    };
	    Euler.prototype.equals = function (euler) {
	        return (euler._x === this._x)
	            && (euler._y === this._y)
	            && (euler._z === this._z)
	            && (euler._order === this._order);
	    };
	    Euler.prototype.fromArray = function (array) {
	        this._x = array[0];
	        this._y = array[1];
	        this._x = array[2];
	        if (array[3] !== undefined) {
	            this._order = array[3];
	        }
	    };
	    Euler.prototype.toArray = function (array, offset) {
	        if (array === void 0) { array = []; }
	        if (offset === void 0) { offset = 0; }
	        array[offset] = this._x;
	        array[offset + 1] = this._y;
	        array[offset + 2] = this._z;
	        array[offset + 3] = this._order;
	        return array;
	    };
	    Euler.prototype.toVector3 = function () {
	    };
	    Euler.prototype.onChange = function (callback) {
	        this.onChangeCallback = callback;
	        return this;
	    };
	    Euler.DefaultOrder = 'XYZ';
	    return Euler;
	})();
	module.exports = Euler;
	//# sourceMappingURL=Euler.js.map

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var Vector3 = __webpack_require__(4);
	var Matrix3 = (function () {
	    function Matrix3(elements) {
	        if (elements === void 0) { elements = new Float32Array([
	            1, 0, 0,
	            0, 1, 0,
	            0, 0, 1
	        ]); }
	        this.elements = elements;
	    }
	    Matrix3.prototype.set = function (n11, n12, n13, n21, n22, n23, n31, n32, n33) {
	        var te = this.elements;
	        te[0] = n11;
	        te[3] = n21;
	        te[6] = n13;
	        te[1] = n21;
	        te[4] = n22;
	        te[7] = n23;
	        te[2] = n31;
	        te[5] = n32;
	        te[8] = n33;
	        return this;
	    };
	    Matrix3.prototype.identity = function () {
	        this.set(1, 0, 0, 0, 1, 0, 0, 0, 1);
	        return this;
	    };
	    Matrix3.prototype.clone = function () {
	        return new Matrix3(this.elements);
	    };
	    Matrix3.prototype.copy = function (m) {
	        var me = m.elements;
	        this.set(me[0], me[3], me[6], me[1], me[4], me[7], me[2], me[5], me[8]);
	        return this;
	    };
	    Matrix3.prototype.applyToVector3Array = function (buffer, offset, length) {
	        if (offset === void 0) { offset = 0; }
	        var v1 = new Vector3();
	        if (length === undefined)
	            length = buffer.length / buffer.itemSize;
	        for (var i = 0, j = offset; i < length; i++, j++) {
	            v1.x = buffer.getX(j);
	            v1.y = buffer.getY(j);
	            v1.z = buffer.getZ(j);
	            v1.applyMatrix3(this);
	            buffer.setXYZ(v1.x, v1.y, v1.z);
	        }
	        return buffer;
	    };
	    Matrix3.prototype.multiplyScalar = function (s) {
	        var te = this.elements;
	        te[0] *= s;
	        te[3] *= s;
	        te[6] *= s;
	        te[1] *= s;
	        te[4] *= s;
	        te[7] *= s;
	        te[2] *= s;
	        te[5] *= s;
	        te[8] *= s;
	        return this;
	    };
	    Matrix3.prototype.determinant = function () {
	        var te = this.elements;
	        var a = te[0], b = te[1], c = te[2], d = te[3], e = te[4], f = te[5], g = te[6], h = te[7], i = te[8];
	        return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
	    };
	    Matrix3.prototype.getInverse = function (matrix, throwOnInvertible) {
	        // ( based on http://code.google.com/p/webgl-mjs/ )
	        var me = matrix.elements;
	        var te = this.elements;
	        te[0] = me[10] * me[5] - me[6] * me[9];
	        te[1] = -me[10] * me[1] + me[2] * me[9];
	        te[2] = me[6] * me[1] - me[2] * me[5];
	        te[3] = -me[10] * me[4] + me[6] * me[8];
	        te[4] = me[10] * me[0] - me[2] * me[8];
	        te[5] = -me[6] * me[0] + me[2] * me[4];
	        te[6] = me[9] * me[4] - me[5] * me[8];
	        te[7] = -me[9] * me[0] + me[1] * me[8];
	        te[8] = me[5] * me[0] - me[1] * me[4];
	        var det = me[0] * te[0] + me[1] * te[3] + me[2] * te[6];
	        if (det === 0) {
	            var msg = "Matrix3.getInverse(): can't invert matrix, determinant is 0";
	            if (throwOnInvertible || false) {
	                throw new Error(msg);
	            }
	            else {
	                console.warn(msg);
	            }
	            this.identity();
	            return this;
	        }
	        this.multiplyScalar(1.0 / det);
	        return this;
	    };
	    Matrix3.prototype.transpose = function () {
	        var tmp, m = this.elements;
	        tmp = m[1];
	        m[1] = m[3];
	        m[3] = tmp;
	        tmp = m[2];
	        m[2] = m[6];
	        m[6] = tmp;
	        tmp = m[5];
	        m[5] = m[7];
	        m[7] = tmp;
	        return this;
	    };
	    Matrix3.prototype.flattenToArrayOffset = function (array, offset) {
	        var te = this.elements;
	        array[offset] = te[0];
	        array[offset + 1] = te[1];
	        array[offset + 2] = te[2];
	        array[offset + 3] = te[3];
	        array[offset + 4] = te[4];
	        array[offset + 5] = te[5];
	        array[offset + 6] = te[6];
	        array[offset + 7] = te[7];
	        array[offset + 8] = te[8];
	        return array;
	    };
	    Matrix3.prototype.getNormalMatrix = function (m) {
	        this.getInverse(m).transpose();
	        return this;
	    };
	    Matrix3.prototype.transposeIntoArray = function (r) {
	        var m = this.elements;
	        r[0] = m[0];
	        r[1] = m[3];
	        r[2] = m[6];
	        r[3] = m[1];
	        r[4] = m[4];
	        r[5] = m[7];
	        r[6] = m[2];
	        r[7] = m[5];
	        r[8] = m[8];
	        return this;
	    };
	    Matrix3.prototype.fromArray = function (array) {
	        this.elements.set(array);
	        return this;
	    };
	    Matrix3.prototype.toArray = function () {
	        var te = this.elements;
	        return [
	            te[0], te[1], te[2],
	            te[3], te[4], te[5],
	            te[6], te[7], te[8]
	        ];
	    };
	    return Matrix3;
	})();
	module.exports = Matrix3;
	//# sourceMappingURL=Matrix3.js.map

/***/ },
/* 9 */
/***/ function(module, exports) {

	var EventDispatcher = (function () {
	    function EventDispatcher() {
	    }
	    EventDispatcher.prototype.addEventListener = function (type, listener) {
	        if (this._listeners === undefined)
	            this._listeners = {};
	        var listeners = this._listeners;
	        if (listeners[type] === undefined) {
	            listeners[type] = [];
	        }
	        if (listeners[type].indexOf(listener) === -1) {
	            listeners[type].push(listener);
	        }
	    };
	    EventDispatcher.prototype.hasEventListener = function (type, listener) {
	        if (this._listeners === undefined)
	            return false;
	        var listeners = this._listeners;
	        if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1) {
	            return true;
	        }
	        return false;
	    };
	    EventDispatcher.prototype.removeEventListener = function (type, listener) {
	        if (this._listeners === undefined)
	            return;
	        var listeners = this._listeners;
	        var listenerArray = listeners[type];
	        if (listenerArray !== undefined) {
	            var index = listenerArray.indexOf(listener);
	            if (index !== -1) {
	                listenerArray.splice(index, 1);
	            }
	        }
	    };
	    EventDispatcher.prototype.dispatchEvent = function (event) {
	        if (this._listeners === undefined)
	            return;
	        var listeners = this._listeners;
	        var listenerArray = listeners[event.type];
	        if (listenerArray !== undefined) {
	            event.target = this;
	            var array = [];
	            var length = listenerArray.length;
	            for (var i = 0; i < length; i++) {
	                array[i] = listenerArray[i];
	            }
	            for (var i = 0; i < length; i++) {
	                array[i].call(this, event);
	            }
	        }
	    };
	    return EventDispatcher;
	})();
	module.exports = EventDispatcher;
	//# sourceMappingURL=EventDispatcher.js.map

/***/ },
/* 10 */
/***/ function(module, exports) {

	var Channels = (function () {
	    function Channels() {
	        this.mask = 1;
	    }
	    Channels.prototype.set = function (channel) {
	        this.mask = 1 << channel;
	    };
	    Channels.prototype.enable = function (channel) {
	        this.mask |= 1 << channel;
	    };
	    Channels.prototype.toggle = function (channel) {
	        this.mask ^= 1 << channel;
	    };
	    Channels.prototype.disable = function (channel) {
	        this.mask &= ~(1 << channel);
	    };
	    return Channels;
	})();
	module.exports = Channels;
	//# sourceMappingURL=Channels.js.map

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Camera = __webpack_require__(12);
	var MathUtils = __webpack_require__(3);
	var PerspectiveCamera = (function (_super) {
	    __extends(PerspectiveCamera, _super);
	    function PerspectiveCamera(fov, aspect, near, far) {
	        _super.call(this);
	        this.type = 'PerspectiveCamera';
	        this.updateProjectionMatrix = function () {
	            var fov = MathUtils.radToDeg(2 * Math.atan(Math.tan(MathUtils.degToRad(this.fov) * 0.5) / this.zoom));
	            if (this.fullWidth) {
	                var aspect = this.fullWidth / this.fullHeight;
	                var top = Math.tan(MathUtils.degToRad(fov * 0.5)) * this.near;
	                var bottom = -top;
	                var left = aspect * bottom;
	                var right = aspect * top;
	                var width = Math.abs(right - left);
	                var height = Math.abs(top - bottom);
	                this.projectionMatrix.makeFrustum(left + this.x * width / this.fullWidth, left + (this.x + this.width) * width / this.fullWidth, top - (this.y + this.height) * height / this.fullHeight, top - this.y * height / this.fullHeight, this.near, this.far);
	            }
	            else {
	                this.projectionMatrix.makePerspective(fov, this.aspect, this.near, this.far);
	            }
	        };
	        this.zoom = 1;
	        this.fov = fov !== undefined ? fov : 50;
	        this.aspect = aspect !== undefined ? aspect : 1;
	        this.near = near !== undefined ? near : 0.1;
	        this.far = far !== undefined ? far : 2000;
	        this.updateProjectionMatrix();
	    }
	    PerspectiveCamera.prototype.setLens = function (focalLength, frameHeight) {
	        if (frameHeight === undefined)
	            frameHeight = 24;
	        this.fov = 2 * MathUtils.radToDeg(Math.atan(frameHeight / (focalLength * 2)));
	        this.updateProjectionMatrix();
	    };
	    ;
	    PerspectiveCamera.prototype.setViewOffset = function (fullWidth, fullHeight, x, y, width, height) {
	        this.fullWidth = fullWidth;
	        this.fullHeight = fullHeight;
	        this.x = x;
	        this.y = y;
	        this.width = width;
	        this.height = height;
	        this.updateProjectionMatrix();
	    };
	    ;
	    PerspectiveCamera.prototype.copy = function (source) {
	        _super.prototype.copy.call(this, this, source);
	        this.fov = source.fov;
	        this.aspect = source.aspect;
	        this.near = source.near;
	        this.far = source.far;
	        this.zoom = source.zoom;
	        return this;
	    };
	    ;
	    PerspectiveCamera.prototype.toJSON = function (meta) {
	        var data = _super.prototype.toJSON.call(this, meta);
	        data.object.zoom = this.zoom;
	        data.object.fov = this.fov;
	        data.object.aspect = this.aspect;
	        data.object.near = this.near;
	        data.object.far = this.far;
	        return data;
	    };
	    ;
	    return PerspectiveCamera;
	})(Camera);
	module.exports = PerspectiveCamera;
	//# sourceMappingURL=PerspectiveCamera.js.map

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Object3D = __webpack_require__(2);
	var Matrix4 = __webpack_require__(5);
	var Quaternion = __webpack_require__(6);
	var Vector3 = __webpack_require__(4);
	var Camera = (function (_super) {
	    __extends(Camera, _super);
	    function Camera() {
	        _super.apply(this, arguments);
	        this.type = 'Camera';
	        this.matrixWorldInverse = new Matrix4();
	        this.projectionMatrix = new Matrix4();
	    }
	    Camera.prototype.getWorldDirection = function (optionalTarget) {
	        var quaternion = new Quaternion();
	        var result = optionalTarget || new Vector3();
	        this.getWorldQuaternion(quaternion);
	        return result.set(0, 0, -1).applyQuaternion(quaternion);
	    };
	    Camera.prototype.lookAt = function (vector) {
	        var m1 = new Matrix4();
	        m1.lookAt(this.position, vector, this.up);
	        this.quaternion.setFromRotationMatrix(m1);
	    };
	    Camera.prototype.clone = function () {
	        return this.copy(this);
	    };
	    ;
	    Camera.prototype.copy = function (source, recursive) {
	        _super.prototype.copy.call(this, this, source);
	        this.matrixWorldInverse.copy(source.matrixWorldInverse);
	        this.projectionMatrix.copy(source.projectionMatrix);
	        return this;
	    };
	    ;
	    return Camera;
	})(Object3D);
	module.exports = Camera;
	//# sourceMappingURL=Camera.js.map

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var Color = __webpack_require__(14);
	var Frustum = __webpack_require__(15);
	var Matrix4 = __webpack_require__(5);
	var Vector3 = __webpack_require__(4);
	var WebGLExtensions = __webpack_require__(42);
	var WebGLCapabilities = __webpack_require__(43);
	var BufferGeometry = __webpack_require__(19);
	var WebGLState = __webpack_require__(44);
	var WebGLProperties = __webpack_require__(45);
	var WebGLObjects = __webpack_require__(46);
	var WebGLPrograms = __webpack_require__(48);
	var WebGLBufferRenderer = __webpack_require__(60);
	var WebGLIndexedBufferRenderer = __webpack_require__(61);
	var WebGLShadowMap = __webpack_require__(62);
	var LensFlarePlugin = __webpack_require__(63);
	var SpritePlugin = __webpack_require__(64);
	var WebGLRenderTargetCube = __webpack_require__(65);
	var MathUtil = __webpack_require__(3);
	var Light = __webpack_require__(66);
	var Sprite = __webpack_require__(67);
	var LensFlare = __webpack_require__(68);
	var ImmediateRenderObject = __webpack_require__(69);
	var Mesh = __webpack_require__(23);
	var Line = __webpack_require__(40);
	var Points = __webpack_require__(39);
	var SkinnedMesh = __webpack_require__(57);
	var MeshFaceMaterial = __webpack_require__(70);
	var BlendingMode = __webpack_require__(27);
	var ShadingSideType = __webpack_require__(26);
	var ShaderLib = __webpack_require__(72);
	var UniformsUtils = __webpack_require__(73);
	var ShaderMaterial = __webpack_require__(141);
	var MeshPhongMaterial = __webpack_require__(142);
	var MeshLambertMaterial = __webpack_require__(143);
	var MeshBasicMaterial = __webpack_require__(24);
	var LineBasicMaterial = __webpack_require__(144);
	var LineDashedMaterial = __webpack_require__(145);
	var PointsMaterial = __webpack_require__(146);
	var MeshDepthMaterial = __webpack_require__(147);
	var MeshNormalMaterial = __webpack_require__(148);
	var InstancedBufferGeometry = __webpack_require__(149);
	var InterleavedBufferAttribute = __webpack_require__(35);
	var InstancedBufferAttribute = __webpack_require__(150);
	var THREE = {};
	var WebGLRenderer = (function () {
	    function WebGLRenderer(parameters) {
	        this.setViewport = function (x, y, width, height) {
	            this._viewportX = x * this.pixelRatio;
	            this._viewportY = y * this.pixelRatio;
	            this._viewportWidth = width * this.pixelRatio;
	            this._viewportHeight = height * this.pixelRatio;
	            this._gl.viewport(this._viewportX, this._viewportY, this._viewportWidth, this._viewportHeight);
	        };
	        this.setClearColor = function (color, alpha) {
	            this._clearColor.set(color);
	            this._clearAlpha = alpha !== undefined ? alpha : 1;
	            this.glClearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearAlpha);
	        };
	        parameters = parameters || {};
	        this.parameters = parameters;
	        var _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElement('canvas');
	        var _context = parameters.context !== undefined ? parameters.context : null;
	        this._canvas = _canvas;
	        this._context = _context;
	        var _width = this._canvas.width;
	        var _height = this._canvas.height;
	        this._width = _width;
	        this._height = _height;
	        var pixelRatio = 1;
	        this.pixelRatio = pixelRatio;
	        var _alpha = parameters.alpha !== undefined ? parameters.alpha : false;
	        var _depth = parameters.depth !== undefined ? parameters.depth : true;
	        var _stencil = parameters.stencil !== undefined ? parameters.stencil : true;
	        var _antialias = parameters.antialias !== undefined ? parameters.antialias : false;
	        var _premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : true;
	        var _preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false;
	        this._alpha = _alpha;
	        this._depth = _depth;
	        this._stencil = _stencil;
	        this._antialias = _antialias;
	        this._premultipliedAlpha = _premultipliedAlpha;
	        this._preserveDrawingBuffer = _preserveDrawingBuffer;
	        var _clearColor = new Color(0x000000);
	        var _clearAlpha = 0;
	        this._clearColor = _clearColor;
	        this._clearAlpha = _clearAlpha;
	        var lights = [];
	        this.lights = lights;
	        var opaqueObjects = [];
	        var opaqueObjectsLastIndex = -1;
	        var transparentObjects = [];
	        var transparentObjectsLastIndex = -1;
	        this.opaqueObjects = opaqueObjects;
	        this.opaqueObjectsLastIndex = opaqueObjectsLastIndex;
	        this.transparentObjects = transparentObjects;
	        this.transparentObjectsLastIndex = transparentObjectsLastIndex;
	        var opaqueImmediateObjects = [];
	        var opaqueImmediateObjectsLastIndex = -1;
	        var transparentImmediateObjects = [];
	        var transparentImmediateObjectsLastIndex = -1;
	        this.opaqueImmediateObjects = opaqueImmediateObjects;
	        this.opaqueImmediateObjectsLastIndex = opaqueImmediateObjectsLastIndex;
	        this.transparentImmediateObjects = transparentImmediateObjects;
	        this.transparentImmediateObjectsLastIndex = transparentImmediateObjectsLastIndex;
	        var morphInfluences = new Float32Array(8);
	        this.morphInfluence = morphInfluences;
	        var sprites = [];
	        var lensFlares = [];
	        this.sprites = sprites;
	        this.lensFlares = lensFlares;
	        this.domElement = _canvas;
	        this.context = null;
	        this.autoClear = true;
	        this.autoClearColor = true;
	        this.autoClearDepth = true;
	        this.autoClearStencil = true;
	        this.sortObjects = true;
	        this.gammaFactor = 2.0;
	        this.gammaInput = false;
	        this.gammaOutput = false;
	        this.maxMorphTargets = 8;
	        this.maxMorphNormals = 4;
	        this.autoScaleCubemaps = true;
	        var _this = this;
	        this._currentProgram = null;
	        this._currentFramebuffer = null;
	        this._currentMaterialId = -1;
	        this._currentGeometryProgram = '';
	        this._currentCamera = null;
	        this._usedTextureUnits = 0;
	        this._viewportX = 0;
	        this._viewportY = 0;
	        this._viewportWidth = _canvas.width;
	        this._viewportHeight = _canvas.height;
	        this._currentWidth = 0;
	        this._currentHeight = 0;
	        this._frustum = new Frustum(),
	            this._projScreenMatrix = new Matrix4(),
	            this._vector3 = new Vector3(),
	            this._direction = new Vector3(),
	            this._lightsNeedUpdate = true,
	            this._lights = {
	                ambient: [0, 0, 0],
	                directional: { length: 0, colors: [], positions: [] },
	                point: { length: 0, colors: [], positions: [], distances: [], decays: [] },
	                spot: { length: 0, colors: [], positions: [], distances: [], directions: [], anglesCos: [], exponents: [], decays: [] },
	                hemi: { length: 0, skyColors: [], groundColors: [], positions: [] }
	            },
	            this._infoMemory = {
	                geometries: 0,
	                textures: 0
	            },
	            this._infoRender = {
	                calls: 0,
	                vertices: 0,
	                faces: 0,
	                points: 0
	            };
	        this.info = {
	            render: this._infoRender,
	            memory: this._infoMemory,
	            programs: null
	        };
	        var _gl;
	        try {
	            var attributes = {
	                alpha: this._alpha,
	                depth: this._depth,
	                stencil: this._stencil,
	                antialias: this._antialias,
	                premultipliedAlpha: this._premultipliedAlpha,
	                preserveDrawingBuffer: this._preserveDrawingBuffer
	            };
	            this._viewportWidth = this._canvas.width;
	            this._viewportHeight = this._canvas.height;
	            this._gl = this._context || this._canvas.getContext('webgl', attributes)
	                || this._canvas.getContext('experimental-webgl', attributes);
	            if (this._gl === null) {
	                if (this._canvas.getContext('webgl') !== null) {
	                    throw 'Error creating WebGL context with your selected attributes.';
	                }
	                else {
	                    throw 'Error creating WebGL context.';
	                }
	            }
	            this._canvas.addEventListener('webglcontextlost', this.onContextLost, false);
	        }
	        catch (error) {
	            console.log('webglcontextlost');
	        }
	        var extensions = new WebGLExtensions(this._gl);
	        extensions.get('OES_texture_float');
	        extensions.get('OES_texture_float_linear');
	        extensions.get('OES_texture_half_float');
	        extensions.get('OES_texture_half_float_linear');
	        extensions.get('OES_standard_derivatives');
	        extensions.get('ANGLE_instanced_arrays');
	        if (extensions.get('OES_element_index_uint')) {
	            BufferGeometry.MaxIndex = 4294967296;
	        }
	        var capabilities = new WebGLCapabilities(this._gl, extensions, parameters);
	        this.state = new WebGLState(this._gl, extensions, this.paramThreeToGL);
	        var properties = new WebGLProperties();
	        this.properties = properties;
	        var objects = new WebGLObjects(this._gl, properties, this.info);
	        this.objects = objects;
	        var programCache = new WebGLPrograms(this, capabilities);
	        this.programCache = programCache;
	        this.info.programs = programCache.programs;
	        var bufferRenderer = new WebGLBufferRenderer(this._gl, extensions, this._infoRender);
	        var indexedBufferRenderer = new WebGLIndexedBufferRenderer(this._gl, extensions, this._infoRender);
	        this.bufferRenderer = bufferRenderer;
	        this.indexedBufferRenderer = indexedBufferRenderer;
	        this.setDefaultGLState();
	        this.context = this._gl;
	        this.capabilities = capabilities;
	        this.extensions = extensions;
	        var shadowMap = new WebGLShadowMap(this, this.lights, objects);
	        this.shadowMap = shadowMap;
	        var spritePlugin = new SpritePlugin(this, this.sprites);
	        this.spritePlugin = spritePlugin;
	        var lensFlarePlugin = new LensFlarePlugin(this, this.lensFlares);
	        this.lensFlarePlugin = lensFlarePlugin;
	    }
	    WebGLRenderer.prototype.glClearColor = function (r, g, b, a) {
	        if (this._premultipliedAlpha === true) {
	            r *= a;
	            g *= a;
	            b *= a;
	        }
	        this._gl.clearColor(r, g, b, a);
	    };
	    WebGLRenderer.prototype.getContext = function () {
	        return this._gl;
	    };
	    WebGLRenderer.prototype.getContextAttributes = function () {
	        return this._gl.getContextAttributes();
	    };
	    WebGLRenderer.prototype.forceContextLoss = function () {
	        this.extensions.get('WEBGL_lose_context').loseContext();
	    };
	    WebGLRenderer.prototype.getMaxAnisotropy = function () {
	        var value;
	        var extension = this.extensions.get('EXT_texture_filter_anisotropic');
	        if (extension !== null) {
	            value = this._gl.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
	        }
	        else {
	            value = 0;
	        }
	        return value;
	    };
	    WebGLRenderer.prototype.getPrecision = function () {
	        return this.capabilities.precision;
	    };
	    WebGLRenderer.prototype.getPixelRatio = function () {
	        return this.pixelRatio;
	    };
	    WebGLRenderer.prototype.setPixelRatio = function (value) {
	        if (value !== undefined)
	            this.pixelRatio = value;
	    };
	    WebGLRenderer.prototype.resetGLState = function () {
	        this._currentProgram = null;
	        this._currentCamera = null;
	        this._currentGeometryProgram = '';
	        this._currentMaterialId = -1;
	        this._lightsNeedUpdate = true;
	        this.state.reset();
	    };
	    WebGLRenderer.prototype.getSize = function () {
	        return {
	            width: this._width,
	            height: this._height
	        };
	    };
	    WebGLRenderer.prototype.setSize = function (width, height, updateStyle) {
	        this._width = width;
	        this._height = height;
	        this._canvas.width = width * this.pixelRatio;
	        this._canvas.height = height * this.pixelRatio;
	        if (updateStyle !== false) {
	            this._canvas.style.width = width + 'px';
	            this._canvas.style.height = height + 'px';
	        }
	        this.setViewport(0, 0, width, height);
	    };
	    ;
	    WebGLRenderer.prototype.getViewport = function (dimensions) {
	        dimensions.x = this._viewportX / this.pixelRatio;
	        dimensions.y = this._viewportY / this.pixelRatio;
	        dimensions.z = this._viewportWidth / this.pixelRatio;
	        dimensions.w = this._viewportHeight / this.pixelRatio;
	    };
	    WebGLRenderer.prototype.setScissor = function (x, y, width, height) {
	        this._gl.scissor(x * this.pixelRatio, y * this.pixelRatio, width * this.pixelRatio, height * this.pixelRatio);
	    };
	    WebGLRenderer.prototype.enableScissorTest = function (bool) {
	        this.state.setScissorTest(bool);
	    };
	    ;
	    WebGLRenderer.prototype.getClearColor = function () {
	        return this._clearColor;
	    };
	    ;
	    WebGLRenderer.prototype.getClearAlpha = function () {
	        return this._clearAlpha;
	    };
	    WebGLRenderer.prototype.setClearAlpha = function (alpha) {
	        this._clearAlpha = alpha;
	        this.glClearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearAlpha);
	    };
	    ;
	    WebGLRenderer.prototype.clear = function (color, depth, stencil) {
	        var bits = 0;
	        if (color === undefined || color)
	            bits |= this._gl.COLOR_BUFFER_BIT;
	        if (depth === undefined || depth)
	            bits |= this._gl.DEPTH_BUFFER_BIT;
	        if (stencil === undefined || stencil)
	            bits |= this._gl.STENCIL_BUFFER_BIT;
	        this._gl.clear(bits);
	    };
	    ;
	    WebGLRenderer.prototype.clearColor = function () {
	        this._gl.clear(this._gl.COLOR_BUFFER_BIT);
	    };
	    ;
	    WebGLRenderer.prototype.clearDepth = function () {
	        this._gl.clear(this._gl.DEPTH_BUFFER_BIT);
	    };
	    ;
	    WebGLRenderer.prototype.clearStencil = function () {
	        this._gl.clear(this._gl.STENCIL_BUFFER_BIT);
	    };
	    ;
	    WebGLRenderer.prototype.clearTarget = function (renderTarget, color, depth, stencil) {
	        this.setRenderTarget(renderTarget);
	        this.clear(color, depth, stencil);
	    };
	    WebGLRenderer.prototype.dispose = function () {
	        this._canvas.removeEventListener('webglcontextlost', this.onContextLost, false);
	    };
	    WebGLRenderer.prototype.onContextLost = function (event) {
	        event.preventDefault();
	        this.resetGLState();
	        this.setDefaultGLState();
	        this.properties.clear();
	    };
	    WebGLRenderer.prototype.setRenderTarget = function (renderTarget) {
	        var isCube = (renderTarget instanceof WebGLRenderTargetCube);
	        if (renderTarget && this.properties.get(renderTarget).__webglFramebuffer === undefined) {
	            var renderTargetProperties = this.properties.get(renderTarget);
	            var textureProperties = this.properties.get(renderTarget.texture);
	            if (renderTarget.depthBuffer === undefined)
	                renderTarget.depthBuffer = true;
	            if (renderTarget.stencilBuffer === undefined)
	                renderTarget.stencilBuffer = true;
	            renderTarget.addEventListener('dispose', this.onRenderTargetDispose);
	            textureProperties.__webglTexture = this._gl.createTexture();
	            this._infoMemory.textures++;
	            var isTargetPowerOfTwo = this.isPowerOfTwo(renderTarget), glFormat = this.paramThreeToGL(renderTarget.texture.format), glType = this.paramThreeToGL(renderTarget.texture.type);
	            if (isCube) {
	                renderTargetProperties.__webglFramebuffer = [];
	                renderTargetProperties.__webglRenderbuffer = [];
	                this.state.bindTexture(this._gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture);
	                this.setTextureParameters(this._gl.TEXTURE_CUBE_MAP, renderTarget.texture, isTargetPowerOfTwo);
	                for (var i = 0; i < 6; i++) {
	                    renderTargetProperties.__webglFramebuffer[i] = this._gl.createFramebuffer();
	                    renderTargetProperties.__webglRenderbuffer[i] = this._gl.createRenderbuffer();
	                    this.state.texImage2D(this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType, null);
	                    this.setupFrameBuffer(renderTargetProperties.__webglFramebuffer[i], renderTarget, this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i);
	                    this.setupRenderBuffer(renderTargetProperties.__webglRenderbuffer[i], renderTarget);
	                }
	                if (renderTarget.texture.generateMipmaps && isTargetPowerOfTwo)
	                    this._gl.generateMipmap(this._gl.TEXTURE_CUBE_MAP);
	            }
	            else {
	                renderTargetProperties.__webglFramebuffer = this._gl.createFramebuffer();
	                if (renderTarget.shareDepthFrom) {
	                    renderTargetProperties.__webglRenderbuffer = renderTarget.shareDepthFrom.__webglRenderbuffer;
	                }
	                else {
	                    renderTargetProperties.__webglRenderbuffer = this._gl.createRenderbuffer();
	                }
	                this.state.bindTexture(this._gl.TEXTURE_2D, textureProperties.__webglTexture);
	                this.setTextureParameters(this._gl.TEXTURE_2D, renderTarget.texture, isTargetPowerOfTwo);
	                this.state.texImage2D(this._gl.TEXTURE_2D, 0, glFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType, null);
	                this.setupFrameBuffer(renderTargetProperties.__webglFramebuffer, renderTarget, this._gl.TEXTURE_2D);
	                if (renderTarget.shareDepthFrom) {
	                    if (renderTarget.depthBuffer && !renderTarget.stencilBuffer) {
	                        this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_ATTACHMENT, this._gl.RENDERBUFFER, renderTargetProperties.__webglRenderbuffer);
	                    }
	                    else if (renderTarget.depthBuffer && renderTarget.stencilBuffer) {
	                        this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_STENCIL_ATTACHMENT, this._gl.RENDERBUFFER, renderTargetProperties.__webglRenderbuffer);
	                    }
	                }
	                else {
	                    this.setupRenderBuffer(renderTargetProperties.__webglRenderbuffer, renderTarget);
	                }
	                if (renderTarget.texture.generateMipmaps && isTargetPowerOfTwo)
	                    this._gl.generateMipmap(this._gl.TEXTURE_2D);
	            }
	            if (isCube) {
	                this.state.bindTexture(this._gl.TEXTURE_CUBE_MAP, null);
	            }
	            else {
	                this.state.bindTexture(this._gl.TEXTURE_2D, null);
	            }
	            this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, null);
	            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
	        }
	        var framebuffer, width, height, vx, vy;
	        if (renderTarget) {
	            var renderTargetProperties = this.properties.get(renderTarget);
	            if (isCube) {
	                framebuffer = renderTargetProperties.__webglFramebuffer[renderTarget.activeCubeFace];
	            }
	            else {
	                framebuffer = renderTargetProperties.__webglFramebuffer;
	            }
	            width = renderTarget.width;
	            height = renderTarget.height;
	            vx = 0;
	            vy = 0;
	        }
	        else {
	            framebuffer = null;
	            width = this._viewportWidth;
	            height = this._viewportHeight;
	            vx = this._viewportX;
	            vy = this._viewportY;
	        }
	        if (framebuffer !== this._currentFramebuffer) {
	            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, framebuffer);
	            this._gl.viewport(vx, vy, width, height);
	            this._currentFramebuffer = framebuffer;
	        }
	        if (isCube) {
	            var textureProperties = this.properties.get(renderTarget.texture);
	            this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + renderTarget.activeCubeFace, textureProperties.__webglTexture, 0);
	        }
	        this._currentWidth = width;
	        this._currentHeight = height;
	    };
	    WebGLRenderer.prototype.setDefaultGLState = function () {
	        this.state.init();
	        this._gl.viewport(this._viewportX, this._viewportY, this._viewportWidth, this._viewportHeight);
	        this.glClearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearAlpha);
	    };
	    WebGLRenderer.prototype.onTextureDispose = function (event) {
	        var texture = event.target;
	        texture.removeEventListener('dispose', this.onTextureDispose);
	        this.deallocateTexture(texture);
	        this._infoMemory.textures--;
	    };
	    WebGLRenderer.prototype.isPowerOfTwo = function (image) {
	        return MathUtil.isPowerOfTwo(image.width) && MathUtil.isPowerOfTwo(image.height);
	    };
	    WebGLRenderer.prototype.onRenderTargetDispose = function (event) {
	        var renderTarget = event.target;
	        renderTarget.removeEventListener('dispose', this.onRenderTargetDispose);
	        this.deallocateRenderTarget(renderTarget);
	        this._infoMemory.textures--;
	    };
	    WebGLRenderer.prototype.onMaterialDispose = function (event) {
	        var material = event.target;
	        material.removeEventListener('dispose', this.onMaterialDispose);
	        this.deallocateMaterial(material);
	    };
	    WebGLRenderer.prototype.deallocateMaterial = function (material) {
	        this.releaseMaterialProgramReference(material);
	        this.properties.delete(material);
	    };
	    WebGLRenderer.prototype.releaseMaterialProgramReference = function (material) {
	        var programInfo = this.properties.get(material).program;
	        material.program = undefined;
	        if (programInfo !== undefined) {
	            this.programCache.releaseProgram(programInfo);
	        }
	    };
	    WebGLRenderer.prototype.deallocateTexture = function (texture) {
	        var textureProperties = this.properties.get(texture);
	        if (texture.image && textureProperties.__image__webglTextureCube) {
	            this._gl.deleteTexture(textureProperties.__image__webglTextureCube);
	        }
	        else {
	            if (textureProperties.__webglInit === undefined)
	                return;
	            this._gl.deleteTexture(textureProperties.__webglTexture);
	        }
	        this.properties.delete(texture);
	    };
	    WebGLRenderer.prototype.deallocateRenderTarget = function (renderTarget) {
	        var renderTargetProperties = this.properties.get(renderTarget);
	        var textureProperties = this.properties.get(renderTarget.texture);
	        if (!renderTarget || textureProperties.__webglTexture === undefined)
	            return;
	        this._gl.deleteTexture(textureProperties.__webglTexture);
	        if (renderTarget instanceof WebGLRenderTargetCube) {
	            for (var i = 0; i < 6; i++) {
	                this._gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer[i]);
	                this._gl.deleteRenderbuffer(renderTargetProperties.__webglRenderbuffer[i]);
	            }
	        }
	        else {
	            this._gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer);
	            this._gl.deleteRenderbuffer(renderTargetProperties.__webglRenderbuffer);
	        }
	        this.properties.delete(renderTarget.texture);
	        this.properties.delete(renderTarget);
	    };
	    WebGLRenderer.prototype.paramThreeToGL = function (p) {
	        var extension;
	        if (p === THREE.RepeatWrapping)
	            return this._gl.REPEAT;
	        if (p === THREE.ClampToEdgeWrapping)
	            return this._gl.CLAMP_TO_EDGE;
	        if (p === THREE.MirroredRepeatWrapping)
	            return this._gl.MIRRORED_REPEAT;
	        if (p === THREE.NearestFilter)
	            return this._gl.NEAREST;
	        if (p === THREE.NearestMipMapNearestFilter)
	            return this._gl.NEAREST_MIPMAP_NEAREST;
	        if (p === THREE.NearestMipMapLinearFilter)
	            return this._gl.NEAREST_MIPMAP_LINEAR;
	        if (p === THREE.LinearFilter)
	            return this._gl.LINEAR;
	        if (p === THREE.LinearMipMapNearestFilter)
	            return this._gl.LINEAR_MIPMAP_NEAREST;
	        if (p === THREE.LinearMipMapLinearFilter)
	            return this._gl.LINEAR_MIPMAP_LINEAR;
	        if (p === THREE.UnsignedByteType)
	            return this._gl.UNSIGNED_BYTE;
	        if (p === THREE.UnsignedShort4444Type)
	            return this._gl.UNSIGNED_SHORT_4_4_4_4;
	        if (p === THREE.UnsignedShort5551Type)
	            return this._gl.UNSIGNED_SHORT_5_5_5_1;
	        if (p === THREE.UnsignedShort565Type)
	            return this._gl.UNSIGNED_SHORT_5_6_5;
	        if (p === THREE.ByteType)
	            return this._gl.BYTE;
	        if (p === THREE.ShortType)
	            return this._gl.SHORT;
	        if (p === THREE.UnsignedShortType)
	            return this._gl.UNSIGNED_SHORT;
	        if (p === THREE.IntType)
	            return this._gl.INT;
	        if (p === THREE.UnsignedIntType)
	            return this._gl.UNSIGNED_INT;
	        if (p === THREE.FloatType)
	            return this._gl.FLOAT;
	        extension = this.extensions.get('OES_texture_half_float');
	        if (extension !== null) {
	            if (p === THREE.HalfFloatType)
	                return extension.HALF_FLOAT_OES;
	        }
	        if (p === THREE.AlphaFormat)
	            return this._gl.ALPHA;
	        if (p === THREE.RGBFormat)
	            return this._gl.RGB;
	        if (p === THREE.RGBAFormat)
	            return this._gl.RGBA;
	        if (p === THREE.LuminanceFormat)
	            return this._gl.LUMINANCE;
	        if (p === THREE.LuminanceAlphaFormat)
	            return this._gl.LUMINANCE_ALPHA;
	        if (p === THREE.AddEquation)
	            return this._gl.FUNC_ADD;
	        if (p === THREE.SubtractEquation)
	            return this._gl.FUNC_SUBTRACT;
	        if (p === THREE.ReverseSubtractEquation)
	            return this._gl.FUNC_REVERSE_SUBTRACT;
	        if (p === THREE.ZeroFactor)
	            return this._gl.ZERO;
	        if (p === THREE.OneFactor)
	            return this._gl.ONE;
	        if (p === THREE.SrcColorFactor)
	            return this._gl.SRC_COLOR;
	        if (p === THREE.OneMinusSrcColorFactor)
	            return this._gl.ONE_MINUS_SRC_COLOR;
	        if (p === THREE.SrcAlphaFactor)
	            return this._gl.SRC_ALPHA;
	        if (p === THREE.OneMinusSrcAlphaFactor)
	            return this._gl.ONE_MINUS_SRC_ALPHA;
	        if (p === THREE.DstAlphaFactor)
	            return this._gl.DST_ALPHA;
	        if (p === THREE.OneMinusDstAlphaFactor)
	            return this._gl.ONE_MINUS_DST_ALPHA;
	        if (p === THREE.DstColorFactor)
	            return this._gl.DST_COLOR;
	        if (p === THREE.OneMinusDstColorFactor)
	            return this._gl.ONE_MINUS_DST_COLOR;
	        if (p === THREE.SrcAlphaSaturateFactor)
	            return this._gl.SRC_ALPHA_SATURATE;
	        extension = this.extensions.get('WEBGL_compressed_texture_s3tc');
	        if (extension !== null) {
	            if (p === THREE.RGB_S3TC_DXT1_Format)
	                return extension.COMPRESSED_RGB_S3TC_DXT1_EXT;
	            if (p === THREE.RGBA_S3TC_DXT1_Format)
	                return extension.COMPRESSED_RGBA_S3TC_DXT1_EXT;
	            if (p === THREE.RGBA_S3TC_DXT3_Format)
	                return extension.COMPRESSED_RGBA_S3TC_DXT3_EXT;
	            if (p === THREE.RGBA_S3TC_DXT5_Format)
	                return extension.COMPRESSED_RGBA_S3TC_DXT5_EXT;
	        }
	        extension = this.extensions.get('WEBGL_compressed_texture_pvrtc');
	        if (extension !== null) {
	            if (p === THREE.RGB_PVRTC_4BPPV1_Format)
	                return extension.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
	            if (p === THREE.RGB_PVRTC_2BPPV1_Format)
	                return extension.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
	            if (p === THREE.RGBA_PVRTC_4BPPV1_Format)
	                return extension.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
	            if (p === THREE.RGBA_PVRTC_2BPPV1_Format)
	                return extension.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
	        }
	        extension = this.extensions.get('EXT_blend_minmax');
	        if (extension !== null) {
	            if (p === THREE.MinEquation)
	                return extension.MIN_EXT;
	            if (p === THREE.MaxEquation)
	                return extension.MAX_EXT;
	        }
	        return 0;
	    };
	    WebGLRenderer.prototype.setTextureParameters = function (textureType, texture, isImagePowerOfTwo) {
	        var extension;
	        if (isImagePowerOfTwo) {
	            this._gl.texParameteri(textureType, this._gl.TEXTURE_WRAP_S, this.paramThreeToGL(texture.wrapS));
	            this._gl.texParameteri(textureType, this._gl.TEXTURE_WRAP_T, this.paramThreeToGL(texture.wrapT));
	            this._gl.texParameteri(textureType, this._gl.TEXTURE_MAG_FILTER, this.paramThreeToGL(texture.magFilter));
	            this._gl.texParameteri(textureType, this._gl.TEXTURE_MIN_FILTER, this.paramThreeToGL(texture.minFilter));
	        }
	        else {
	            this._gl.texParameteri(textureType, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
	            this._gl.texParameteri(textureType, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);
	            if (texture.wrapS !== THREE.ClampToEdgeWrapping || texture.wrapT !== THREE.ClampToEdgeWrapping) {
	                console.warn('THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping.', texture);
	            }
	            this._gl.texParameteri(textureType, this._gl.TEXTURE_MAG_FILTER, this.filterFallback(texture.magFilter));
	            this._gl.texParameteri(textureType, this._gl.TEXTURE_MIN_FILTER, this.filterFallback(texture.minFilter));
	            if (texture.minFilter !== THREE.NearestFilter && texture.minFilter !== THREE.LinearFilter) {
	                console.warn('THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.', texture);
	            }
	        }
	        extension = this.extensions.get('EXT_texture_filter_anisotropic');
	        if (extension) {
	            if (texture.type === THREE.FloatType && this.extensions.get('OES_texture_float_linear') === null)
	                return;
	            if (texture.type === THREE.HalfFloatType && this.extensions.get('OES_texture_half_float_linear') === null)
	                return;
	            if (texture.anisotropy > 1 || this.properties.get(texture).__currentAnisotropy) {
	                this._gl.texParameterf(textureType, extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(texture.anisotropy, this.getMaxAnisotropy()));
	                this.properties.get(texture).__currentAnisotropy = texture.anisotropy;
	            }
	        }
	    };
	    WebGLRenderer.prototype.painterSortStable = function (a, b) {
	        if (a.object.renderOrder !== b.object.renderOrder) {
	            return a.object.renderOrder - b.object.renderOrder;
	        }
	        else if (a.material.id !== b.material.id) {
	            return a.material.id - b.material.id;
	        }
	        else if (a.z !== b.z) {
	            return a.z - b.z;
	        }
	        else {
	            return a.id - b.id;
	        }
	    };
	    WebGLRenderer.prototype.reversePainterSortStable = function (a, b) {
	        if (a.object.renderOrder !== b.object.renderOrder) {
	            return a.object.renderOrder - b.object.renderOrder;
	        }
	        if (a.z !== b.z) {
	            return b.z - a.z;
	        }
	        else {
	            return a.id - b.id;
	        }
	    };
	    WebGLRenderer.prototype.render = function (scene, camera, renderTarget, forceClear) {
	        var fog = scene.fog;
	        this._currentGeometryProgram = '';
	        this._currentMaterialId = -1;
	        this._currentCamera = null;
	        this._lightsNeedUpdate = true;
	        if (scene.autoUpdate === true)
	            scene.updateMatrixWorld();
	        if (camera.parent === null)
	            camera.updateMatrixWorld();
	        camera.matrixWorldInverse.getInverse(camera.matrixWorld);
	        this._projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
	        this._frustum.setFromMatrix(this._projScreenMatrix);
	        this.lights.length = 0;
	        this.opaqueObjectsLastIndex = -1;
	        this.transparentObjectsLastIndex = -1;
	        this.sprites.length = 0;
	        this.lensFlares.length = 0;
	        this.projectObject(scene, camera);
	        this.opaqueObjects.length = this.opaqueObjectsLastIndex + 1;
	        this.transparentObjects.length = this.transparentObjectsLastIndex + 1;
	        if (this.sortObjects === true) {
	            this.opaqueObjects.sort(this.painterSortStable);
	            this.transparentObjects.sort(this.reversePainterSortStable);
	        }
	        this.shadowMap.render(scene);
	        this._infoRender.calls = 0;
	        this._infoRender.vertices = 0;
	        this._infoRender.faces = 0;
	        this._infoRender.points = 0;
	        this.setRenderTarget(renderTarget);
	        if (this.autoClear || forceClear) {
	            this.clear(this.autoClearColor, this.autoClearDepth, this.autoClearStencil);
	        }
	        if (scene.overrideMaterial) {
	            var overrideMaterial = scene.overrideMaterial;
	            this.renderObjects(this.opaqueObjects, camera, this.lights, fog, overrideMaterial);
	            this.renderObjects(this.transparentObjects, camera, this.lights, fog, overrideMaterial);
	        }
	        else {
	            this.state.setBlending(BlendingMode.NoBlending);
	            this.renderObjects(this.opaqueObjects, camera, this.lights, fog);
	            this.renderObjects(this.transparentObjects, camera, this.lights, fog);
	        }
	        this.spritePlugin.render(scene, camera);
	        this.lensFlarePlugin.render(scene, camera, this._currentWidth, this._currentHeight);
	        if (renderTarget) {
	            var texture = renderTarget.texture;
	            var isTargetPowerOfTwo = this.isPowerOfTwo(renderTarget);
	            if (texture.generateMipmaps && isTargetPowerOfTwo && texture.minFilter !== THREE.NearestFilter && texture.minFilter !== THREE.LinearFilter) {
	                this.updateRenderTargetMipmap(renderTarget);
	            }
	        }
	        this.state.setDepthTest(true);
	        this.state.setDepthWrite(true);
	        this.state.setColorWrite(true);
	    };
	    WebGLRenderer.prototype.updateRenderTargetMipmap = function (renderTarget) {
	        var target = renderTarget instanceof WebGLRenderTargetCube ? this._gl.TEXTURE_CUBE_MAP : this._gl.TEXTURE_2D;
	        var texture = this.properties.get(renderTarget.texture).__webglTexture;
	        this.state.bindTexture(target, texture);
	        this._gl.generateMipmap(target);
	        this.state.bindTexture(target, null);
	    };
	    WebGLRenderer.prototype.renderObjects = function (renderList, camera, lights, fog, overrideMaterial) {
	        var _this = this;
	        for (var i = 0, l = renderList.length; i < l; i++) {
	            var renderItem = renderList[i];
	            var object = renderItem.object;
	            var geometry = renderItem.geometry;
	            var material = overrideMaterial === undefined ? renderItem.material : overrideMaterial;
	            var group = renderItem.group;
	            object.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld);
	            object.normalMatrix.getNormalMatrix(object.modelViewMatrix);
	            if (object instanceof ImmediateRenderObject) {
	                this.setMaterial(material);
	                var program = this.setProgram(camera, lights, fog, material, object);
	                this._currentGeometryProgram = '';
	                object.render(function (object) {
	                    _this.renderBufferImmediate(object, program, material);
	                });
	            }
	            else {
	                this.renderBufferDirect(camera, lights, fog, geometry, material, object, group);
	            }
	        }
	    };
	    WebGLRenderer.prototype.initMaterial = function (material, lights, fog, object) {
	        var materialProperties = this.properties.get(material);
	        var parameters = this.programCache.getParameters(material, lights, fog, object);
	        var code = this.programCache.getProgramCode(material, parameters);
	        var program = materialProperties.program;
	        var programChange = true;
	        if (program === undefined) {
	            material.addEventListener('dispose', this.onMaterialDispose);
	        }
	        else if (program.code !== code) {
	            this.releaseMaterialProgramReference(material);
	        }
	        else if (parameters.shaderID !== undefined) {
	            return;
	        }
	        else {
	            programChange = false;
	        }
	        if (programChange) {
	            if (parameters.shaderID) {
	                var shader = ShaderLib[parameters.shaderID];
	                materialProperties.__webglShader = {
	                    name: material.type,
	                    uniforms: UniformsUtils.clone(shader.uniforms),
	                    vertexShader: shader.vertexShader,
	                    fragmentShader: shader.fragmentShader
	                };
	            }
	            else {
	                materialProperties.__webglShader = {
	                    name: material.type,
	                    uniforms: material.uniforms,
	                    vertexShader: material.vertexShader,
	                    fragmentShader: material.fragmentShader
	                };
	            }
	            material.__webglShader = materialProperties.__webglShader;
	            program = this.programCache.acquireProgram(material, parameters, code);
	            materialProperties.program = program;
	            material.program = program;
	        }
	        var attributes = program.getAttributes();
	        if (material.morphTargets) {
	            material.numSupportedMorphTargets = 0;
	            for (var i = 0; i < this.maxMorphTargets; i++) {
	                if (attributes['morphTarget' + i] >= 0) {
	                    material.numSupportedMorphTargets++;
	                }
	            }
	        }
	        if (material.morphNormals) {
	            material.numSupportedMorphNormals = 0;
	            for (i = 0; i < this.maxMorphNormals; i++) {
	                if (attributes['morphNormal' + i] >= 0) {
	                    material.numSupportedMorphNormals++;
	                }
	            }
	        }
	        materialProperties.uniformsList = [];
	        var uniformLocations = materialProperties.program.getUniforms();
	        for (var u in materialProperties.__webglShader.uniforms) {
	            var location = uniformLocations[u];
	            if (location) {
	                materialProperties.uniformsList.push([materialProperties.__webglShader.uniforms[u], location]);
	            }
	        }
	    };
	    WebGLRenderer.prototype.renderBufferImmediate = function (object, program, material) {
	        this.state.initAttributes();
	        var buffers = this.properties.get(object);
	        if (object.hasPositions && !buffers.position)
	            buffers.position = this._gl.createBuffer();
	        if (object.hasNormals && !buffers.normal)
	            buffers.normal = this._gl.createBuffer();
	        if (object.hasUvs && !buffers.uv)
	            buffers.uv = this._gl.createBuffer();
	        if (object.hasColors && !buffers.color)
	            buffers.color = this._gl.createBuffer();
	        var attributes = program.getAttributes();
	        if (object.hasPositions) {
	            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffers.position);
	            this._gl.bufferData(this._gl.ARRAY_BUFFER, object.positionArray, this._gl.DYNAMIC_DRAW);
	            this.state.enableAttribute(attributes.position);
	            this._gl.vertexAttribPointer(attributes.position, 3, this._gl.FLOAT, false, 0, 0);
	        }
	        if (object.hasNormals) {
	            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffers.normal);
	            if (material.type !== 'MeshPhongMaterial' && material.shading === THREE.FlatShading) {
	                for (var i = 0, l = object.count * 3; i < l; i += 9) {
	                    var array = object.normalArray;
	                    var nx = (array[i + 0] + array[i + 3] + array[i + 6]) / 3;
	                    var ny = (array[i + 1] + array[i + 4] + array[i + 7]) / 3;
	                    var nz = (array[i + 2] + array[i + 5] + array[i + 8]) / 3;
	                    array[i + 0] = nx;
	                    array[i + 1] = ny;
	                    array[i + 2] = nz;
	                    array[i + 3] = nx;
	                    array[i + 4] = ny;
	                    array[i + 5] = nz;
	                    array[i + 6] = nx;
	                    array[i + 7] = ny;
	                    array[i + 8] = nz;
	                }
	            }
	            this._gl.bufferData(this._gl.ARRAY_BUFFER, object.normalArray, this._gl.DYNAMIC_DRAW);
	            this.state.enableAttribute(attributes.normal);
	            this._gl.vertexAttribPointer(attributes.normal, 3, this._gl.FLOAT, false, 0, 0);
	        }
	        if (object.hasUvs && material.map) {
	            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffers.uv);
	            this._gl.bufferData(this._gl.ARRAY_BUFFER, object.uvArray, this._gl.DYNAMIC_DRAW);
	            this.state.enableAttribute(attributes.uv);
	            this._gl.vertexAttribPointer(attributes.uv, 2, this._gl.FLOAT, false, 0, 0);
	        }
	        if (object.hasColors && material.vertexColors !== THREE.NoColors) {
	            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffers.color);
	            this._gl.bufferData(this._gl.ARRAY_BUFFER, object.colorArray, this._gl.DYNAMIC_DRAW);
	            this.state.enableAttribute(attributes.color);
	            this._gl.vertexAttribPointer(attributes.color, 3, this._gl.FLOAT, false, 0, 0);
	        }
	        this.state.disableUnusedAttributes();
	        console.log(this._gl.TRIANGLES, 0, object.count);
	        this._gl.drawArrays(this._gl.TRIANGLES, 0, object.count);
	        object.count = 0;
	    };
	    ;
	    WebGLRenderer.prototype.setTexture = function (texture, slot) {
	        var textureProperties = this.properties.get(texture);
	        if (texture.version > 0 && textureProperties.__version !== texture.version) {
	            var image = texture.image;
	            if (image === undefined) {
	                console.warn('THREE.WebGLRenderer: Texture marked for update but image is undefined', texture);
	                return;
	            }
	            if (image.complete === false) {
	                console.warn('THREE.WebGLRenderer: Texture marked for update but image is incomplete', texture);
	                return;
	            }
	            this.uploadTexture(textureProperties, texture, slot);
	            return;
	        }
	        this.state.activeTexture(this._gl.TEXTURE0 + slot);
	        this.state.bindTexture(this._gl.TEXTURE_2D, textureProperties.__webglTexture);
	    };
	    ;
	    WebGLRenderer.prototype.clampToMaxSize = function (image, maxSize) {
	        if (image.width > maxSize || image.height > maxSize) {
	            var scale = maxSize / Math.max(image.width, image.height);
	            var canvas = document.createElement('canvas');
	            canvas.width = Math.floor(image.width * scale);
	            canvas.height = Math.floor(image.height * scale);
	            var context = canvas.getContext('2d');
	            context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
	            console.warn('THREE.WebGLRenderer: image is too big (' + image.width + 'x' + image.height + '). Resized to ' + canvas.width + 'x' + canvas.height, image);
	            return canvas;
	        }
	        return image;
	    };
	    WebGLRenderer.prototype.makePowerOfTwo = function (image) {
	        if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement) {
	            var canvas = document.createElement('canvas');
	            canvas.width = THREE.Math.nearestPowerOfTwo(image.width);
	            canvas.height = THREE.Math.nearestPowerOfTwo(image.height);
	            var context = canvas.getContext('2d');
	            context.drawImage(image, 0, 0, canvas.width, canvas.height);
	            console.warn('THREE.WebGLRenderer: image is not power of two (' + image.width + 'x' + image.height + '). Resized to ' + canvas.width + 'x' + canvas.height, image);
	            return canvas;
	        }
	        return image;
	    };
	    WebGLRenderer.prototype.textureNeedsPowerOfTwo = function (texture) {
	        if (texture.wrapS !== THREE.ClampToEdgeWrapping || texture.wrapT !== THREE.ClampToEdgeWrapping)
	            return true;
	        if (texture.minFilter !== THREE.NearestFilter && texture.minFilter !== THREE.LinearFilter)
	            return true;
	        return false;
	    };
	    WebGLRenderer.prototype.uploadTexture = function (textureProperties, texture, slot) {
	        if (textureProperties.__webglInit === undefined) {
	            textureProperties.__webglInit = true;
	            texture.addEventListener('dispose', this.onTextureDispose);
	            textureProperties.__webglTexture = this._gl.createTexture();
	            this._infoMemory.textures++;
	        }
	        this.state.activeTexture(this._gl.TEXTURE0 + slot);
	        this.state.bindTexture(this._gl.TEXTURE_2D, textureProperties.__webglTexture);
	        this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
	        this._gl.pixelStorei(this._gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
	        this._gl.pixelStorei(this._gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
	        texture.image = this.clampToMaxSize(texture.image, this.capabilities.maxTextureSize);
	        if (this.textureNeedsPowerOfTwo(texture) && this.isPowerOfTwo(texture.image) === false) {
	            texture.image = this.makePowerOfTwo(texture.image);
	        }
	        var image = texture.image, isImagePowerOfTwo = this.isPowerOfTwo(image), glFormat = this.paramThreeToGL(texture.format), glType = this.paramThreeToGL(texture.type);
	        this.setTextureParameters(this._gl.TEXTURE_2D, texture, isImagePowerOfTwo);
	        var mipmap, mipmaps = texture.mipmaps;
	        if (texture instanceof THREE.DataTexture) {
	            if (mipmaps.length > 0 && isImagePowerOfTwo) {
	                for (var i = 0, il = mipmaps.length; i < il; i++) {
	                    mipmap = mipmaps[i];
	                    this.state.texImage2D(this._gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data);
	                }
	                texture.generateMipmaps = false;
	            }
	            else {
	                this.state.texImage2D(this._gl.TEXTURE_2D, 0, glFormat, image.width, image.height, 0, glFormat, glType, image.data);
	            }
	        }
	        else if (texture instanceof THREE.CompressedTexture) {
	            for (var i = 0, il = mipmaps.length; i < il; i++) {
	                mipmap = mipmaps[i];
	                if (texture.format !== THREE.RGBAFormat && texture.format !== THREE.RGBFormat) {
	                    if (this.state.getCompressedTextureFormats().indexOf(glFormat) > -1) {
	                        this.state.compressedTexImage2D(this._gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, mipmap.data);
	                    }
	                    else {
	                        console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
	                    }
	                }
	                else {
	                    this.state.texImage2D(this._gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data);
	                }
	            }
	        }
	        else {
	            if (mipmaps.length > 0 && isImagePowerOfTwo) {
	                for (var i = 0, il = mipmaps.length; i < il; i++) {
	                    mipmap = mipmaps[i];
	                    this.state.texImage2D(this._gl.TEXTURE_2D, i, glFormat, glFormat, glType, mipmap);
	                }
	                texture.generateMipmaps = false;
	            }
	            else {
	                this.state.texImage2D(this._gl.TEXTURE_2D, 0, glFormat, glFormat, glType, texture.image);
	            }
	        }
	        if (texture.generateMipmaps && isImagePowerOfTwo)
	            this._gl.generateMipmap(this._gl.TEXTURE_2D);
	        textureProperties.__version = texture.version;
	        if (texture.onUpdate)
	            texture.onUpdate(texture);
	    };
	    WebGLRenderer.prototype.refreshUniformsFog = function (uniforms, fog) {
	        uniforms.fogColor.value = fog.color;
	        if (fog instanceof THREE.Fog) {
	            uniforms.fogNear.value = fog.near;
	            uniforms.fogFar.value = fog.far;
	        }
	        else if (fog instanceof THREE.FogExp2) {
	            uniforms.fogDensity.value = fog.density;
	        }
	    };
	    WebGLRenderer.prototype.setupLights = function (lights, camera) {
	        var l, ll, light, r = 0, g = 0, b = 0, color, skyColor, groundColor, intensity, distance, zlights = this._lights, viewMatrix = camera.matrixWorldInverse, dirColors = zlights.directional.colors, dirPositions = zlights.directional.positions, pointColors = zlights.point.colors, pointPositions = zlights.point.positions, pointDistances = zlights.point.distances, pointDecays = zlights.point.decays, spotColors = zlights.spot.colors, spotPositions = zlights.spot.positions, spotDistances = zlights.spot.distances, spotDirections = zlights.spot.directions, spotAnglesCos = zlights.spot.anglesCos, spotExponents = zlights.spot.exponents, spotDecays = zlights.spot.decays, hemiSkyColors = zlights.hemi.skyColors, hemiGroundColors = zlights.hemi.groundColors, hemiPositions = zlights.hemi.positions, dirLength = 0, pointLength = 0, spotLength = 0, hemiLength = 0, dirCount = 0, pointCount = 0, spotCount = 0, hemiCount = 0, dirOffset = 0, pointOffset = 0, spotOffset = 0, hemiOffset = 0;
	        for (l = 0, ll = lights.length; l < ll; l++) {
	            light = lights[l];
	            color = light.color;
	            intensity = light.intensity;
	            distance = light.distance;
	            if (light instanceof THREE.AmbientLight) {
	                if (!light.visible)
	                    continue;
	                r += color.r;
	                g += color.g;
	                b += color.b;
	            }
	            else if (light instanceof THREE.DirectionalLight) {
	                dirCount += 1;
	                if (!light.visible)
	                    continue;
	                this._direction.setFromMatrixPosition(light.matrixWorld);
	                this._vector3.setFromMatrixPosition(light.target.matrixWorld);
	                this._direction.sub(this._vector3);
	                this._direction.transformDirection(viewMatrix);
	                dirOffset = dirLength * 3;
	                dirPositions[dirOffset + 0] = this._direction.x;
	                dirPositions[dirOffset + 1] = this._direction.y;
	                dirPositions[dirOffset + 2] = this._direction.z;
	                this.setColorLinear(dirColors, dirOffset, color, intensity);
	                dirLength += 1;
	            }
	            else if (light instanceof THREE.PointLight) {
	                pointCount += 1;
	                if (!light.visible)
	                    continue;
	                pointOffset = pointLength * 3;
	                this.setColorLinear(pointColors, pointOffset, color, intensity);
	                this._vector3.setFromMatrixPosition(light.matrixWorld);
	                this._vector3.applyMatrix4(viewMatrix);
	                pointPositions[pointOffset + 0] = this._vector3.x;
	                pointPositions[pointOffset + 1] = this._vector3.y;
	                pointPositions[pointOffset + 2] = this._vector3.z;
	                pointDistances[pointLength] = distance;
	                pointDecays[pointLength] = (light.distance === 0) ? 0.0 : light.decay;
	                pointLength += 1;
	            }
	            else if (light instanceof THREE.SpotLight) {
	                spotCount += 1;
	                if (!light.visible)
	                    continue;
	                spotOffset = spotLength * 3;
	                this.setColorLinear(spotColors, spotOffset, color, intensity);
	                this._direction.setFromMatrixPosition(light.matrixWorld);
	                this._vector3.copy(this._direction).applyMatrix4(viewMatrix);
	                spotPositions[spotOffset + 0] = this._vector3.x;
	                spotPositions[spotOffset + 1] = this._vector3.y;
	                spotPositions[spotOffset + 2] = this._vector3.z;
	                spotDistances[spotLength] = distance;
	                this._vector3.setFromMatrixPosition(light.target.matrixWorld);
	                this._direction.sub(this._vector3);
	                this._direction.transformDirection(viewMatrix);
	                spotDirections[spotOffset + 0] = this._direction.x;
	                spotDirections[spotOffset + 1] = this._direction.y;
	                spotDirections[spotOffset + 2] = this._direction.z;
	                spotAnglesCos[spotLength] = Math.cos(light.angle);
	                spotExponents[spotLength] = light.exponent;
	                spotDecays[spotLength] = (light.distance === 0) ? 0.0 : light.decay;
	                spotLength += 1;
	            }
	            else if (light instanceof THREE.HemisphereLight) {
	                hemiCount += 1;
	                if (!light.visible)
	                    continue;
	                this._direction.setFromMatrixPosition(light.matrixWorld);
	                this._direction.transformDirection(viewMatrix);
	                hemiOffset = hemiLength * 3;
	                hemiPositions[hemiOffset + 0] = this._direction.x;
	                hemiPositions[hemiOffset + 1] = this._direction.y;
	                hemiPositions[hemiOffset + 2] = this._direction.z;
	                skyColor = light.color;
	                groundColor = light.groundColor;
	                this.setColorLinear(hemiSkyColors, hemiOffset, skyColor, intensity);
	                this.setColorLinear(hemiGroundColors, hemiOffset, groundColor, intensity);
	                hemiLength += 1;
	            }
	        }
	        for (l = dirLength * 3, ll = Math.max(dirColors.length, dirCount * 3); l < ll; l++)
	            dirColors[l] = 0.0;
	        for (l = pointLength * 3, ll = Math.max(pointColors.length, pointCount * 3); l < ll; l++)
	            pointColors[l] = 0.0;
	        for (l = spotLength * 3, ll = Math.max(spotColors.length, spotCount * 3); l < ll; l++)
	            spotColors[l] = 0.0;
	        for (l = hemiLength * 3, ll = Math.max(hemiSkyColors.length, hemiCount * 3); l < ll; l++)
	            hemiSkyColors[l] = 0.0;
	        for (l = hemiLength * 3, ll = Math.max(hemiGroundColors.length, hemiCount * 3); l < ll; l++)
	            hemiGroundColors[l] = 0.0;
	        zlights.directional.length = dirLength;
	        zlights.point.length = pointLength;
	        zlights.spot.length = spotLength;
	        zlights.hemi.length = hemiLength;
	        zlights.ambient[0] = r;
	        zlights.ambient[1] = g;
	        zlights.ambient[2] = b;
	    };
	    WebGLRenderer.prototype.setColorLinear = function (array, offset, color, intensity) {
	        array[offset + 0] = color.r * intensity;
	        array[offset + 1] = color.g * intensity;
	        array[offset + 2] = color.b * intensity;
	    };
	    WebGLRenderer.prototype.setProgram = function (camera, lights, fog, material, object) {
	        this._usedTextureUnits = 0;
	        var materialProperties = this.properties.get(material);
	        if (material.needsUpdate || !materialProperties.program) {
	            this.initMaterial(material, lights, fog, object);
	            material.needsUpdate = false;
	        }
	        var refreshProgram = false;
	        var refreshMaterial = false;
	        var refreshLights = false;
	        var program = materialProperties.program, p_uniforms = program.getUniforms(), m_uniforms = materialProperties.__webglShader.uniforms;
	        if (program.id !== this._currentProgram) {
	            this._gl.useProgram(program.program);
	            this._currentProgram = program.id;
	            refreshProgram = true;
	            refreshMaterial = true;
	            refreshLights = true;
	        }
	        if (material.id !== this._currentMaterialId) {
	            if (this._currentMaterialId === -1)
	                refreshLights = true;
	            this._currentMaterialId = material.id;
	            refreshMaterial = true;
	        }
	        if (refreshProgram || camera !== this._currentCamera) {
	            this._gl.uniformMatrix4fv(p_uniforms.projectionMatrix, false, camera.projectionMatrix.elements);
	            if (this.capabilities.logarithmicDepthBuffer) {
	                this._gl.uniform1f(p_uniforms.logDepthBufFC, 2.0 / (Math.log(camera.far + 1.0) / Math.LN2));
	            }
	            if (camera !== this._currentCamera)
	                this._currentCamera = camera;
	            if (material instanceof ShaderMaterial ||
	                material instanceof MeshPhongMaterial ||
	                material.envMap) {
	                if (p_uniforms.cameraPosition !== undefined) {
	                    this._vector3.setFromMatrixPosition(camera.matrixWorld);
	                    this._gl.uniform3f(p_uniforms.cameraPosition, this._vector3.x, this._vector3.y, this._vector3.z);
	                }
	            }
	            if (material instanceof MeshPhongMaterial ||
	                material instanceof MeshLambertMaterial ||
	                material instanceof MeshBasicMaterial ||
	                material instanceof ShaderMaterial ||
	                material.skinning) {
	                if (p_uniforms.viewMatrix !== undefined) {
	                    this._gl.uniformMatrix4fv(p_uniforms.viewMatrix, false, camera.matrixWorldInverse.elements);
	                }
	            }
	        }
	        if (material.skinning) {
	            if (object.bindMatrix && p_uniforms.bindMatrix !== undefined) {
	                this._gl.uniformMatrix4fv(p_uniforms.bindMatrix, false, object.bindMatrix.elements);
	            }
	            if (object.bindMatrixInverse && p_uniforms.bindMatrixInverse !== undefined) {
	                this._gl.uniformMatrix4fv(p_uniforms.bindMatrixInverse, false, object.bindMatrixInverse.elements);
	            }
	            if (this.capabilities.floatVertexTextures && object.skeleton && object.skeleton.useVertexTexture) {
	                if (p_uniforms.boneTexture !== undefined) {
	                    var textureUnit = this.getTextureUnit();
	                    this._gl.uniform1i(p_uniforms.boneTexture, textureUnit);
	                    this.setTexture(object.skeleton.boneTexture, textureUnit);
	                }
	                if (p_uniforms.boneTextureWidth !== undefined) {
	                    this._gl.uniform1i(p_uniforms.boneTextureWidth, object.skeleton.boneTextureWidth);
	                }
	                if (p_uniforms.boneTextureHeight !== undefined) {
	                    this._gl.uniform1i(p_uniforms.boneTextureHeight, object.skeleton.boneTextureHeight);
	                }
	            }
	            else if (object.skeleton && object.skeleton.boneMatrices) {
	                if (p_uniforms.boneGlobalMatrices !== undefined) {
	                    this._gl.uniformMatrix4fv(p_uniforms.boneGlobalMatrices, false, object.skeleton.boneMatrices);
	                }
	            }
	        }
	        if (refreshMaterial) {
	            if (fog && material.fog) {
	                this.refreshUniformsFog(m_uniforms, fog);
	            }
	            if (material instanceof MeshPhongMaterial ||
	                material instanceof MeshLambertMaterial ||
	                material.lights) {
	                if (this._lightsNeedUpdate) {
	                    refreshLights = true;
	                    this.setupLights(lights, camera);
	                    this._lightsNeedUpdate = false;
	                }
	                if (refreshLights) {
	                    this.refreshUniformsLights(m_uniforms, this._lights);
	                    this.markUniformsLightsNeedsUpdate(m_uniforms, true);
	                }
	                else {
	                    this.markUniformsLightsNeedsUpdate(m_uniforms, false);
	                }
	            }
	            if (material instanceof MeshBasicMaterial ||
	                material instanceof MeshLambertMaterial ||
	                material instanceof MeshPhongMaterial) {
	                this.refreshUniformsCommon(m_uniforms, material);
	            }
	            if (material instanceof LineBasicMaterial) {
	                this.refreshUniformsLine(m_uniforms, material);
	            }
	            else if (material instanceof LineDashedMaterial) {
	                this.refreshUniformsLine(m_uniforms, material);
	                this.refreshUniformsDash(m_uniforms, material);
	            }
	            else if (material instanceof PointsMaterial) {
	                this.refreshUniformsParticle(m_uniforms, material);
	            }
	            else if (material instanceof MeshPhongMaterial) {
	                this.refreshUniformsPhong(m_uniforms, material);
	            }
	            else if (material instanceof MeshDepthMaterial) {
	                m_uniforms.mNear.value = camera.near;
	                m_uniforms.mFar.value = camera.far;
	                m_uniforms.opacity.value = material.opacity;
	            }
	            else if (material instanceof MeshNormalMaterial) {
	                m_uniforms.opacity.value = material.opacity;
	            }
	            if (object.receiveShadow && !material._shadowPass) {
	                this.refreshUniformsShadow(m_uniforms, lights, camera);
	            }
	            this.loadUniformsGeneric(materialProperties.uniformsList);
	        }
	        this.loadUniformsMatrices(p_uniforms, object);
	        if (p_uniforms.modelMatrix !== undefined) {
	            this._gl.uniformMatrix4fv(p_uniforms.modelMatrix, false, object.matrixWorld.elements);
	        }
	        return program;
	    };
	    WebGLRenderer.prototype.loadUniformsMatrices = function (uniforms, object) {
	        this._gl.uniformMatrix4fv(uniforms.modelViewMatrix, false, object.modelViewMatrix.elements);
	        if (uniforms.normalMatrix) {
	            this._gl.uniformMatrix3fv(uniforms.normalMatrix, false, object.normalMatrix.elements);
	        }
	    };
	    WebGLRenderer.prototype.loadUniformsGeneric = function (uniforms) {
	        var texture, textureUnit;
	        for (var j = 0, jl = uniforms.length; j < jl; j++) {
	            var uniform = uniforms[j][0];
	            if (uniform.needsUpdate === false)
	                continue;
	            var type = uniform.type;
	            var value = uniform.value;
	            var location = uniforms[j][1];
	            var _gl = this._gl;
	            switch (type) {
	                case '1i':
	                    _gl.uniform1i(location, value);
	                    break;
	                case '1f':
	                    _gl.uniform1f(location, value);
	                    break;
	                case '2f':
	                    _gl.uniform2f(location, value[0], value[1]);
	                    break;
	                case '3f':
	                    _gl.uniform3f(location, value[0], value[1], value[2]);
	                    break;
	                case '4f':
	                    _gl.uniform4f(location, value[0], value[1], value[2], value[3]);
	                    break;
	                case '1iv':
	                    _gl.uniform1iv(location, value);
	                    break;
	                case '3iv':
	                    _gl.uniform3iv(location, value);
	                    break;
	                case '1fv':
	                    _gl.uniform1fv(location, value);
	                    break;
	                case '2fv':
	                    _gl.uniform2fv(location, value);
	                    break;
	                case '3fv':
	                    _gl.uniform3fv(location, value);
	                    break;
	                case '4fv':
	                    _gl.uniform4fv(location, value);
	                    break;
	                case 'Matrix3fv':
	                    _gl.uniformMatrix3fv(location, false, value);
	                    break;
	                case 'Matrix4fv':
	                    _gl.uniformMatrix4fv(location, false, value);
	                    break;
	                case 'i':
	                    _gl.uniform1i(location, value);
	                    break;
	                case 'f':
	                    _gl.uniform1f(location, value);
	                    break;
	                case 'v2':
	                    _gl.uniform2f(location, value.x, value.y);
	                    break;
	                case 'v3':
	                    _gl.uniform3f(location, value.x, value.y, value.z);
	                    break;
	                case 'v4':
	                    _gl.uniform4f(location, value.x, value.y, value.z, value.w);
	                    break;
	                case 'c':
	                    _gl.uniform3f(location, value.r, value.g, value.b);
	                    break;
	                case 'iv1':
	                    _gl.uniform1iv(location, value);
	                    break;
	                case 'iv':
	                    _gl.uniform3iv(location, value);
	                    break;
	                case 'fv1':
	                    _gl.uniform1fv(location, value);
	                    break;
	                case 'fv':
	                    _gl.uniform3fv(location, value);
	                    break;
	                case 'v2v':
	                    if (uniform._array === undefined) {
	                        uniform._array = new Float32Array(2 * value.length);
	                    }
	                    for (var i = 0, i2 = 0, il = value.length; i < il; i++, i2 += 2) {
	                        uniform._array[i2 + 0] = value[i].x;
	                        uniform._array[i2 + 1] = value[i].y;
	                    }
	                    _gl.uniform2fv(location, uniform._array);
	                    break;
	                case 'v3v':
	                    if (uniform._array === undefined) {
	                        uniform._array = new Float32Array(3 * value.length);
	                    }
	                    for (var i = 0, i3 = 0, il = value.length; i < il; i++, i3 += 3) {
	                        uniform._array[i3 + 0] = value[i].x;
	                        uniform._array[i3 + 1] = value[i].y;
	                        uniform._array[i3 + 2] = value[i].z;
	                    }
	                    _gl.uniform3fv(location, uniform._array);
	                    break;
	                case 'v4v':
	                    if (uniform._array === undefined) {
	                        uniform._array = new Float32Array(4 * value.length);
	                    }
	                    for (var i = 0, i4 = 0, il = value.length; i < il; i++, i4 += 4) {
	                        uniform._array[i4 + 0] = value[i].x;
	                        uniform._array[i4 + 1] = value[i].y;
	                        uniform._array[i4 + 2] = value[i].z;
	                        uniform._array[i4 + 3] = value[i].w;
	                    }
	                    _gl.uniform4fv(location, uniform._array);
	                    break;
	                case 'm3':
	                    _gl.uniformMatrix3fv(location, false, value.elements);
	                    break;
	                case 'm3v':
	                    if (uniform._array === undefined) {
	                        uniform._array = new Float32Array(9 * value.length);
	                    }
	                    for (var i = 0, il = value.length; i < il; i++) {
	                        value[i].flattenToArrayOffset(uniform._array, i * 9);
	                    }
	                    _gl.uniformMatrix3fv(location, false, uniform._array);
	                    break;
	                case 'm4':
	                    _gl.uniformMatrix4fv(location, false, value.elements);
	                    break;
	                case 'm4v':
	                    if (uniform._array === undefined) {
	                        uniform._array = new Float32Array(16 * value.length);
	                    }
	                    for (var i = 0, il = value.length; i < il; i++) {
	                        value[i].flattenToArrayOffset(uniform._array, i * 16);
	                    }
	                    _gl.uniformMatrix4fv(location, false, uniform._array);
	                    break;
	                case 't':
	                    texture = value;
	                    textureUnit = this.getTextureUnit();
	                    _gl.uniform1i(location, textureUnit);
	                    if (!texture)
	                        continue;
	                    if (texture instanceof THREE.CubeTexture ||
	                        (Array.isArray(texture.image) && texture.image.length === 6)) {
	                        this.setCubeTexture(texture, textureUnit);
	                    }
	                    else if (texture instanceof WebGLRenderTargetCube) {
	                        this.setCubeTextureDynamic(texture.texture, textureUnit);
	                    }
	                    else if (texture instanceof THREE.WebGLRenderTarget) {
	                        this.setTexture(texture.texture, textureUnit);
	                    }
	                    else {
	                        this.setTexture(texture, textureUnit);
	                    }
	                    break;
	                case 'tv':
	                    if (uniform._array === undefined) {
	                        uniform._array = [];
	                    }
	                    for (var i = 0, il = uniform.value.length; i < il; i++) {
	                        uniform._array[i] = this.getTextureUnit();
	                    }
	                    _gl.uniform1iv(location, uniform._array);
	                    for (var i = 0, il = uniform.value.length; i < il; i++) {
	                        texture = uniform.value[i];
	                        textureUnit = uniform._array[i];
	                        if (!texture)
	                            continue;
	                        if (texture instanceof THREE.CubeTexture ||
	                            (texture.image instanceof Array && texture.image.length === 6)) {
	                            this.setCubeTexture(texture, textureUnit);
	                        }
	                        else if (texture instanceof THREE.WebGLRenderTarget) {
	                            this.setTexture(texture.texture, textureUnit);
	                        }
	                        else if (texture instanceof WebGLRenderTargetCube) {
	                            this.setCubeTextureDynamic(texture.texture, textureUnit);
	                        }
	                        else {
	                            this.setTexture(texture, textureUnit);
	                        }
	                    }
	                    break;
	                default:
	                    console.warn('THREE.WebGLRenderer: Unknown uniform type: ' + type);
	            }
	        }
	    };
	    WebGLRenderer.prototype.setCubeTextureDynamic = function (texture, slot) {
	        this.state.activeTexture(this._gl.TEXTURE0 + slot);
	        this.state.bindTexture(this._gl.TEXTURE_CUBE_MAP, this.properties.get(texture).__webglTexture);
	    };
	    WebGLRenderer.prototype.setCubeTexture = function (texture, slot) {
	        var textureProperties = this.properties.get(texture);
	        if (texture.image.length === 6) {
	            if (texture.version > 0 && textureProperties.__version !== texture.version) {
	                if (!textureProperties.__image__webglTextureCube) {
	                    texture.addEventListener('dispose', this.onTextureDispose);
	                    textureProperties.__image__webglTextureCube = this._gl.createTexture();
	                    this._infoMemory.textures++;
	                }
	                this.state.activeTexture(this._gl.TEXTURE0 + slot);
	                this.state.bindTexture(this._gl.TEXTURE_CUBE_MAP, textureProperties.__image__webglTextureCube);
	                this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
	                var isCompressed = texture instanceof THREE.CompressedTexture;
	                var isDataTexture = texture.image[0] instanceof THREE.DataTexture;
	                var cubeImage = [];
	                for (var i = 0; i < 6; i++) {
	                    if (this.autoScaleCubemaps && !isCompressed && !isDataTexture) {
	                        cubeImage[i] = this.clampToMaxSize(texture.image[i], this.capabilities.maxCubemapSize);
	                    }
	                    else {
	                        cubeImage[i] = isDataTexture ? texture.image[i].image : texture.image[i];
	                    }
	                }
	                var image = cubeImage[0], isImagePowerOfTwo = this.isPowerOfTwo(image), glFormat = this.paramThreeToGL(texture.format), glType = this.paramThreeToGL(texture.type);
	                this.setTextureParameters(this._gl.TEXTURE_CUBE_MAP, texture, isImagePowerOfTwo);
	                for (var i = 0; i < 6; i++) {
	                    if (!isCompressed) {
	                        if (isDataTexture) {
	                            this.state.texImage2D(this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glFormat, cubeImage[i].width, cubeImage[i].height, 0, glFormat, glType, cubeImage[i].data);
	                        }
	                        else {
	                            this.state.texImage2D(this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glFormat, glFormat, glType, cubeImage[i]);
	                        }
	                    }
	                    else {
	                        var mipmap, mipmaps = cubeImage[i].mipmaps;
	                        for (var j = 0, jl = mipmaps.length; j < jl; j++) {
	                            mipmap = mipmaps[j];
	                            if (texture.format !== THREE.RGBAFormat && texture.format !== THREE.RGBFormat) {
	                                if (this.state.getCompressedTextureFormats().indexOf(glFormat) > -1) {
	                                    this.state.compressedTexImage2D(this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glFormat, mipmap.width, mipmap.height, 0, mipmap.data);
	                                }
	                                else {
	                                    console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setCubeTexture()");
	                                }
	                            }
	                            else {
	                                this.state.texImage2D(this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data);
	                            }
	                        }
	                    }
	                }
	                if (texture.generateMipmaps && isImagePowerOfTwo) {
	                    this._gl.generateMipmap(this._gl.TEXTURE_CUBE_MAP);
	                }
	                textureProperties.__version = texture.version;
	                if (texture.onUpdate)
	                    texture.onUpdate(texture);
	            }
	            else {
	                this.state.activeTexture(this._gl.TEXTURE0 + slot);
	                this.state.bindTexture(this._gl.TEXTURE_CUBE_MAP, textureProperties.__image__webglTextureCube);
	            }
	        }
	    };
	    WebGLRenderer.prototype.refreshUniformsShadow = function (uniforms, lights, camera) {
	        if (uniforms.shadowMatrix) {
	            var j = 0;
	            for (var i = 0, il = lights.length; i < il; i++) {
	                var light = lights[i];
	                if (light.castShadow === true) {
	                    if (light instanceof THREE.PointLight || light instanceof THREE.SpotLight || light instanceof THREE.DirectionalLight) {
	                        var shadow = light.shadow;
	                        if (light instanceof THREE.PointLight) {
	                            this._vector3.setFromMatrixPosition(light.matrixWorld).negate();
	                            shadow.matrix.identity().setPosition(this._vector3);
	                            uniforms.shadowDarkness.value[j] = -shadow.darkness;
	                        }
	                        else {
	                            uniforms.shadowDarkness.value[j] = shadow.darkness;
	                        }
	                        uniforms.shadowMatrix.value[j] = shadow.matrix;
	                        uniforms.shadowMap.value[j] = shadow.map;
	                        uniforms.shadowMapSize.value[j] = shadow.mapSize;
	                        uniforms.shadowBias.value[j] = shadow.bias;
	                        j++;
	                    }
	                }
	            }
	        }
	    };
	    WebGLRenderer.prototype.refreshUniformsPhong = function (uniforms, material) {
	        uniforms.specular.value = material.specular;
	        uniforms.shininess.value = Math.max(material.shininess, 1e-4);
	        if (material.lightMap) {
	            uniforms.lightMap.value = material.lightMap;
	            uniforms.lightMapIntensity.value = material.lightMapIntensity;
	        }
	        if (material.emissiveMap) {
	            uniforms.emissiveMap.value = material.emissiveMap;
	        }
	        if (material.bumpMap) {
	            uniforms.bumpMap.value = material.bumpMap;
	            uniforms.bumpScale.value = material.bumpScale;
	        }
	        if (material.normalMap) {
	            uniforms.normalMap.value = material.normalMap;
	            uniforms.normalScale.value.copy(material.normalScale);
	        }
	        if (material.displacementMap) {
	            uniforms.displacementMap.value = material.displacementMap;
	            uniforms.displacementScale.value = material.displacementScale;
	            uniforms.displacementBias.value = material.displacementBias;
	        }
	    };
	    WebGLRenderer.prototype.refreshUniformsParticle = function (uniforms, material) {
	        uniforms.psColor.value = material.color;
	        uniforms.opacity.value = material.opacity;
	        uniforms.size.value = material.size;
	        uniforms.scale.value = this._canvas.height / 2.0;
	        uniforms.map.value = material.map;
	        if (material.map !== null) {
	            var offset = material.map.offset;
	            var repeat = material.map.repeat;
	            uniforms.offsetRepeat.value.set(offset.x, offset.y, repeat.x, repeat.y);
	        }
	    };
	    WebGLRenderer.prototype.refreshUniformsLine = function (uniforms, material) {
	        uniforms.diffuse.value = material.color;
	        uniforms.opacity.value = material.opacity;
	    };
	    WebGLRenderer.prototype.refreshUniformsDash = function (uniforms, material) {
	        uniforms.dashSize.value = material.dashSize;
	        uniforms.totalSize.value = material.dashSize + material.gapSize;
	        uniforms.scale.value = material.scale;
	    };
	    WebGLRenderer.prototype.refreshUniformsCommon = function (uniforms, material) {
	        uniforms.opacity.value = material.opacity;
	        uniforms.diffuse.value = material.color;
	        if (material.emissive) {
	            uniforms.emissive.value = material.emissive;
	        }
	        uniforms.map.value = material.map;
	        uniforms.specularMap.value = material.specularMap;
	        uniforms.alphaMap.value = material.alphaMap;
	        if (material.aoMap) {
	            uniforms.aoMap.value = material.aoMap;
	            uniforms.aoMapIntensity.value = material.aoMapIntensity;
	        }
	        var uvScaleMap;
	        if (material.map) {
	            uvScaleMap = material.map;
	        }
	        else if (material.specularMap) {
	            uvScaleMap = material.specularMap;
	        }
	        else if (material.displacementMap) {
	            uvScaleMap = material.displacementMap;
	        }
	        else if (material.normalMap) {
	            uvScaleMap = material.normalMap;
	        }
	        else if (material.bumpMap) {
	            uvScaleMap = material.bumpMap;
	        }
	        else if (material.alphaMap) {
	            uvScaleMap = material.alphaMap;
	        }
	        else if (material.emissiveMap) {
	            uvScaleMap = material.emissiveMap;
	        }
	        if (uvScaleMap !== undefined) {
	            if (uvScaleMap instanceof THREE.WebGLRenderTarget)
	                uvScaleMap = uvScaleMap.texture;
	            var offset = uvScaleMap.offset;
	            var repeat = uvScaleMap.repeat;
	            uniforms.offsetRepeat.value.set(offset.x, offset.y, repeat.x, repeat.y);
	        }
	        uniforms.envMap.value = material.envMap;
	        uniforms.flipEnvMap.value = (material.envMap instanceof WebGLRenderTargetCube) ? 1 : -1;
	        uniforms.reflectivity.value = material.reflectivity;
	        uniforms.refractionRatio.value = material.refractionRatio;
	    };
	    WebGLRenderer.prototype.markUniformsLightsNeedsUpdate = function (uniforms, value) {
	        uniforms.ambientLightColor.needsUpdate = value;
	        uniforms.directionalLightColor.needsUpdate = value;
	        uniforms.directionalLightDirection.needsUpdate = value;
	        uniforms.pointLightColor.needsUpdate = value;
	        uniforms.pointLightPosition.needsUpdate = value;
	        uniforms.pointLightDistance.needsUpdate = value;
	        uniforms.pointLightDecay.needsUpdate = value;
	        uniforms.spotLightColor.needsUpdate = value;
	        uniforms.spotLightPosition.needsUpdate = value;
	        uniforms.spotLightDistance.needsUpdate = value;
	        uniforms.spotLightDirection.needsUpdate = value;
	        uniforms.spotLightAngleCos.needsUpdate = value;
	        uniforms.spotLightExponent.needsUpdate = value;
	        uniforms.spotLightDecay.needsUpdate = value;
	        uniforms.hemisphereLightSkyColor.needsUpdate = value;
	        uniforms.hemisphereLightGroundColor.needsUpdate = value;
	        uniforms.hemisphereLightDirection.needsUpdate = value;
	    };
	    WebGLRenderer.prototype.refreshUniformsLights = function (uniforms, lights) {
	        uniforms.ambientLightColor.value = lights.ambient;
	        uniforms.directionalLightColor.value = lights.directional.colors;
	        uniforms.directionalLightDirection.value = lights.directional.positions;
	        uniforms.pointLightColor.value = lights.point.colors;
	        uniforms.pointLightPosition.value = lights.point.positions;
	        uniforms.pointLightDistance.value = lights.point.distances;
	        uniforms.pointLightDecay.value = lights.point.decays;
	        uniforms.spotLightColor.value = lights.spot.colors;
	        uniforms.spotLightPosition.value = lights.spot.positions;
	        uniforms.spotLightDistance.value = lights.spot.distances;
	        uniforms.spotLightDirection.value = lights.spot.directions;
	        uniforms.spotLightAngleCos.value = lights.spot.anglesCos;
	        uniforms.spotLightExponent.value = lights.spot.exponents;
	        uniforms.spotLightDecay.value = lights.spot.decays;
	        uniforms.hemisphereLightSkyColor.value = lights.hemi.skyColors;
	        uniforms.hemisphereLightGroundColor.value = lights.hemi.groundColors;
	        uniforms.hemisphereLightDirection.value = lights.hemi.positions;
	    };
	    WebGLRenderer.prototype.getTextureUnit = function () {
	        var textureUnit = this._usedTextureUnits;
	        if (textureUnit >= this.capabilities.maxTextures) {
	            console.warn('WebGLRenderer: trying to use ' + textureUnit + ' texture units while this GPU supports only ' + this.capabilities.maxTextures);
	        }
	        this._usedTextureUnits += 1;
	        return textureUnit;
	    };
	    WebGLRenderer.prototype.setMaterial = function (material) {
	        this.setMaterialFaces(material);
	        if (material.transparent === true) {
	            this.state.setBlending(material.blending, material.blendEquation, material.blendSrc, material.blendDst, material.blendEquationAlpha, material.blendSrcAlpha, material.blendDstAlpha);
	        }
	        else {
	            this.state.setBlending(BlendingMode.NoBlending);
	        }
	        this.state.setDepthFunc(material.depthFunc);
	        this.state.setDepthTest(material.depthTest);
	        this.state.setDepthWrite(material.depthWrite);
	        this.state.setColorWrite(material.colorWrite);
	        this.state.setPolygonOffset(material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits);
	    };
	    WebGLRenderer.prototype.setMaterialFaces = function (material) {
	        material.side !== ShadingSideType.DoubleSide ? this.state.enable(this._gl.CULL_FACE) : this.state.disable(this._gl.CULL_FACE);
	        this.state.setFlipSided(material.side === ShadingSideType.BackSide);
	    };
	    WebGLRenderer.prototype.numericalSort = function (a, b) {
	        return b[0] - a[0];
	    };
	    WebGLRenderer.prototype.renderBufferDirect = function (camera, lights, fog, geometry, material, object, group) {
	        var _gl = this._gl;
	        this.setMaterial(material);
	        var program = this.setProgram(camera, lights, fog, material, object);
	        var updateBuffers = false;
	        var geometryProgram = geometry.id + '_' + program.id + '_' + material.wireframe;
	        if (geometryProgram !== this._currentGeometryProgram) {
	            this._currentGeometryProgram = geometryProgram;
	            updateBuffers = true;
	        }
	        var morphTargetInfluences = object.morphTargetInfluences;
	        if (morphTargetInfluences !== undefined) {
	            var activeInfluences = [];
	            for (var i = 0, l = morphTargetInfluences.length; i < l; i++) {
	                var influence = morphTargetInfluences[i];
	                activeInfluences.push([influence, i]);
	            }
	            activeInfluences.sort(this.numericalSort);
	            if (activeInfluences.length > 8) {
	                activeInfluences.length = 8;
	            }
	            var morphAttributes = geometry.morphAttributes;
	            for (var i = 0, l = activeInfluences.length; i < l; i++) {
	                var influence = activeInfluences[i];
	                this.morphInfluences[i] = influence[0];
	                if (influence[0] !== 0) {
	                    var index = influence[1];
	                    if (material.morphTargets === true && morphAttributes.position)
	                        geometry.addAttribute('morphTarget' + i, morphAttributes.position[index]);
	                    if (material.morphNormals === true && morphAttributes.normal)
	                        geometry.addAttribute('morphNormal' + i, morphAttributes.normal[index]);
	                }
	                else {
	                    if (material.morphTargets === true)
	                        geometry.removeAttribute('morphTarget' + i);
	                    if (material.morphNormals === true)
	                        geometry.removeAttribute('morphNormal' + i);
	                }
	            }
	            var uniforms = program.getUniforms();
	            if (uniforms.morphTargetInfluences !== null) {
	                this._gl.uniform1fv(uniforms.morphTargetInfluences, this.morphInfluences);
	            }
	            updateBuffers = true;
	        }
	        var index = geometry.index;
	        var position = geometry.attributes.position;
	        if (material.wireframe === true) {
	            index = this.objects.getWireframeAttribute(geometry);
	        }
	        var renderer;
	        if (index !== null) {
	            renderer = this.indexedBufferRenderer;
	            renderer.setIndex(index);
	        }
	        else {
	            renderer = this.bufferRenderer;
	        }
	        if (updateBuffers) {
	            this.setupVertexAttributes(material, program, geometry);
	            if (index !== null) {
	                _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, this.objects.getAttributeBuffer(index));
	            }
	        }
	        var dataStart = 0;
	        var dataCount = Infinity;
	        if (index !== null) {
	            dataCount = index.count;
	        }
	        else if (position !== undefined) {
	            dataCount = position.count;
	        }
	        var rangeStart = geometry.drawRange.start;
	        var rangeCount = geometry.drawRange.count;
	        var groupStart = group !== null ? group.start : 0;
	        var groupCount = group !== null ? group.count : Infinity;
	        var drawStart = Math.max(dataStart, rangeStart, groupStart);
	        var drawEnd = Math.min(dataStart + dataCount, rangeStart + rangeCount, groupStart + groupCount) - 1;
	        var drawCount = Math.max(0, drawEnd - drawStart + 1);
	        if (object instanceof Mesh) {
	            if (material.wireframe === true) {
	                this.state.setLineWidth(material.wireframeLinewidth * this.pixelRatio);
	                renderer.setMode(this._gl.LINES);
	            }
	            else {
	                renderer.setMode(this._gl.TRIANGLES);
	            }
	            if (geometry instanceof InstancedBufferGeometry && geometry.maxInstancedCount > 0) {
	                renderer.renderInstances(geometry);
	            }
	            else {
	                renderer.render(drawStart, drawCount);
	            }
	        }
	        else if (object instanceof THREE.Line) {
	            var lineWidth = material.linewidth;
	            if (lineWidth === undefined)
	                lineWidth = 1;
	            this.state.setLineWidth(lineWidth * this.pixelRatio);
	            if (object instanceof THREE.LineSegments) {
	                renderer.setMode(_gl.LINES);
	            }
	            else {
	                renderer.setMode(_gl.LINE_STRIP);
	            }
	            renderer.render(drawStart, drawCount);
	        }
	        else if (object instanceof THREE.Points) {
	            renderer.setMode(_gl.POINTS);
	            renderer.render(drawStart, drawCount);
	        }
	    };
	    WebGLRenderer.prototype.setupVertexAttributes = function (material, program, geometry, startIndex) {
	        var extension;
	        var _gl = this._gl;
	        if (geometry instanceof InstancedBufferGeometry) {
	            extension = this.extensions.get('ANGLE_instanced_arrays');
	            if (extension === null) {
	                console.error('THREE.WebGLRenderer.setupVertexAttributes: using InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.');
	                return;
	            }
	        }
	        if (startIndex === undefined)
	            startIndex = 0;
	        this.state.initAttributes();
	        var geometryAttributes = geometry.attributes;
	        var programAttributes = program.getAttributes();
	        var materialDefaultAttributeValues = material.defaultAttributeValues;
	        for (var name in programAttributes) {
	            var programAttribute = programAttributes[name];
	            if (programAttribute >= 0) {
	                var geometryAttribute = geometryAttributes[name];
	                if (geometryAttribute !== undefined) {
	                    var size = geometryAttribute.itemSize;
	                    var buffer = this.objects.getAttributeBuffer(geometryAttribute);
	                    if (geometryAttribute instanceof InterleavedBufferAttribute) {
	                        var data = geometryAttribute.data;
	                        var stride = data.stride;
	                        var offset = geometryAttribute.offset;
	                        if (data instanceof THREE.InstancedInterleavedBuffer) {
	                            this.state.enableAttributeAndDivisor(programAttribute, data.meshPerAttribute, extension);
	                            if (geometry.maxInstancedCount === undefined) {
	                                geometry.maxInstancedCount = data.meshPerAttribute * data.count;
	                            }
	                        }
	                        else {
	                            this.state.enableAttribute(programAttribute);
	                        }
	                        _gl.bindBuffer(_gl.ARRAY_BUFFER, buffer);
	                        _gl.vertexAttribPointer(programAttribute, size, _gl.FLOAT, false, stride * data.array.BYTES_PER_ELEMENT, (startIndex * stride + offset) * data.array.BYTES_PER_ELEMENT);
	                    }
	                    else {
	                        if (geometryAttribute instanceof InstancedBufferAttribute) {
	                            this.state.enableAttributeAndDivisor(programAttribute, geometryAttribute.meshPerAttribute, extension);
	                            if (geometry.maxInstancedCount === undefined) {
	                                geometry.maxInstancedCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;
	                            }
	                        }
	                        else {
	                            this.state.enableAttribute(programAttribute);
	                        }
	                        _gl.bindBuffer(_gl.ARRAY_BUFFER, buffer);
	                        _gl.vertexAttribPointer(programAttribute, size, _gl.FLOAT, false, 0, startIndex * size * 4);
	                    }
	                }
	                else if (materialDefaultAttributeValues !== undefined) {
	                    var value = materialDefaultAttributeValues[name];
	                    if (value !== undefined) {
	                        switch (value.length) {
	                            case 2:
	                                _gl.vertexAttrib2fv(programAttribute, value);
	                                break;
	                            case 3:
	                                _gl.vertexAttrib3fv(programAttribute, value);
	                                break;
	                            case 4:
	                                _gl.vertexAttrib4fv(programAttribute, value);
	                                break;
	                            default:
	                                _gl.vertexAttrib1fv(programAttribute, value);
	                        }
	                    }
	                }
	            }
	        }
	        this.state.disableUnusedAttributes();
	    };
	    WebGLRenderer.prototype.projectObject = function (object, camera) {
	        if (object.visible === false)
	            return;
	        if ((object.channels.mask & camera.channels.mask) !== 0) {
	            if (object instanceof Light) {
	                this.lights.push(object);
	            }
	            else if (object instanceof Sprite) {
	                this.sprites.push(object);
	            }
	            else if (object instanceof LensFlare) {
	                this.lensFlares.push(object);
	            }
	            else if (object instanceof ImmediateRenderObject) {
	                if (this.sortObjects === true) {
	                    this._vector3.setFromMatrixPosition(object.matrixWorld);
	                    this._vector3.applyProjection(this._projScreenMatrix);
	                }
	                this.pushRenderItem(object, null, object.material, this._vector3.z, null);
	            }
	            else if (object instanceof Mesh || object instanceof Line || object instanceof Points) {
	                if (object instanceof SkinnedMesh) {
	                    object.skeleton.update();
	                }
	                if (object.frustumCulled === false || this._frustum.intersectsObject(object) === true) {
	                    var material = object.material;
	                    if (material.visible === true) {
	                        if (this.sortObjects === true) {
	                            this._vector3.setFromMatrixPosition(object.matrixWorld);
	                            this._vector3.applyProjection(this._projScreenMatrix);
	                        }
	                        var geometry = this.objects.update(object);
	                        if (material instanceof MeshFaceMaterial) {
	                            var groups = geometry.groups;
	                            var materials = material.materials;
	                            for (var i = 0, l = groups.length; i < l; i++) {
	                                var group = groups[i];
	                                var groupMaterial = materials[group.materialIndex];
	                                if (groupMaterial.visible === true) {
	                                    this.pushRenderItem(object, geometry, groupMaterial, this._vector3.z, group);
	                                }
	                            }
	                        }
	                        else {
	                            this.pushRenderItem(object, geometry, material, this._vector3.z, null);
	                        }
	                    }
	                }
	            }
	        }
	        var children = object.children;
	        for (var i = 0, l = children.length; i < l; i++) {
	            this.projectObject(children[i], camera);
	        }
	    };
	    WebGLRenderer.prototype.filterFallback = function (f) {
	        if (f === THREE.NearestFilter || f === THREE.NearestMipMapNearestFilter || f === THREE.NearestMipMapLinearFilter) {
	            return this._gl.NEAREST;
	        }
	        return this._gl.LINEAR;
	    };
	    WebGLRenderer.prototype.pushRenderItem = function (object, geometry, material, z, group) {
	        var array, index;
	        if (material.transparent) {
	            array = this.transparentObjects;
	            index = ++this.transparentObjectsLastIndex;
	        }
	        else {
	            array = this.opaqueObjects;
	            index = ++this.opaqueObjectsLastIndex;
	        }
	        var renderItem = array[index];
	        if (renderItem !== undefined) {
	            renderItem.id = object.id;
	            renderItem.object = object;
	            renderItem.geometry = geometry;
	            renderItem.material = material;
	            renderItem.z = this._vector3.z;
	            renderItem.group = group;
	        }
	        else {
	            renderItem = {
	                id: object.id,
	                object: object,
	                geometry: geometry,
	                material: material,
	                z: this._vector3.z,
	                group: group
	            };
	            array.push(renderItem);
	        }
	    };
	    WebGLRenderer.prototype.setupFrameBuffer = function (framebuffer, renderTarget, textureTarget) {
	        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, framebuffer);
	        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, textureTarget, this.properties.get(renderTarget.texture).__webglTexture, 0);
	    };
	    WebGLRenderer.prototype.setupRenderBuffer = function (renderbuffer, renderTarget) {
	        this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, renderbuffer);
	        if (renderTarget.depthBuffer && !renderTarget.stencilBuffer) {
	            this._gl.renderbufferStorage(this._gl.RENDERBUFFER, this._gl.DEPTH_COMPONENT16, renderTarget.width, renderTarget.height);
	            this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_ATTACHMENT, this._gl.RENDERBUFFER, renderbuffer);
	        }
	        else if (renderTarget.depthBuffer && renderTarget.stencilBuffer) {
	            this._gl.renderbufferStorage(this._gl.RENDERBUFFER, this._gl.DEPTH_STENCIL, renderTarget.width, renderTarget.height);
	            this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_STENCIL_ATTACHMENT, this._gl.RENDERBUFFER, renderbuffer);
	        }
	        else {
	            this._gl.renderbufferStorage(this._gl.RENDERBUFFER, this._gl.RGBA4, renderTarget.width, renderTarget.height);
	        }
	    };
	    return WebGLRenderer;
	})();
	module.exports = WebGLRenderer;
	//# sourceMappingURL=WebGLRenderer.js.map

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var MathUtil = __webpack_require__(3);
	var ColorKeywords = { 'aliceblue': 0xF0F8FF, 'antiquewhite': 0xFAEBD7, 'aqua': 0x00FFFF, 'aquamarine': 0x7FFFD4, 'azure': 0xF0FFFF,
	    'beige': 0xF5F5DC, 'bisque': 0xFFE4C4, 'black': 0x000000, 'blanchedalmond': 0xFFEBCD, 'blue': 0x0000FF, 'blueviolet': 0x8A2BE2,
	    'brown': 0xA52A2A, 'burlywood': 0xDEB887, 'cadetblue': 0x5F9EA0, 'chartreuse': 0x7FFF00, 'chocolate': 0xD2691E, 'coral': 0xFF7F50,
	    'cornflowerblue': 0x6495ED, 'cornsilk': 0xFFF8DC, 'crimson': 0xDC143C, 'cyan': 0x00FFFF, 'darkblue': 0x00008B, 'darkcyan': 0x008B8B,
	    'darkgoldenrod': 0xB8860B, 'darkgray': 0xA9A9A9, 'darkgreen': 0x006400, 'darkgrey': 0xA9A9A9, 'darkkhaki': 0xBDB76B, 'darkmagenta': 0x8B008B,
	    'darkolivegreen': 0x556B2F, 'darkorange': 0xFF8C00, 'darkorchid': 0x9932CC, 'darkred': 0x8B0000, 'darksalmon': 0xE9967A, 'darkseagreen': 0x8FBC8F,
	    'darkslateblue': 0x483D8B, 'darkslategray': 0x2F4F4F, 'darkslategrey': 0x2F4F4F, 'darkturquoise': 0x00CED1, 'darkviolet': 0x9400D3,
	    'deeppink': 0xFF1493, 'deepskyblue': 0x00BFFF, 'dimgray': 0x696969, 'dimgrey': 0x696969, 'dodgerblue': 0x1E90FF, 'firebrick': 0xB22222,
	    'floralwhite': 0xFFFAF0, 'forestgreen': 0x228B22, 'fuchsia': 0xFF00FF, 'gainsboro': 0xDCDCDC, 'ghostwhite': 0xF8F8FF, 'gold': 0xFFD700,
	    'goldenrod': 0xDAA520, 'gray': 0x808080, 'green': 0x008000, 'greenyellow': 0xADFF2F, 'grey': 0x808080, 'honeydew': 0xF0FFF0, 'hotpink': 0xFF69B4,
	    'indianred': 0xCD5C5C, 'indigo': 0x4B0082, 'ivory': 0xFFFFF0, 'khaki': 0xF0E68C, 'lavender': 0xE6E6FA, 'lavenderblush': 0xFFF0F5, 'lawngreen': 0x7CFC00,
	    'lemonchiffon': 0xFFFACD, 'lightblue': 0xADD8E6, 'lightcoral': 0xF08080, 'lightcyan': 0xE0FFFF, 'lightgoldenrodyellow': 0xFAFAD2, 'lightgray': 0xD3D3D3,
	    'lightgreen': 0x90EE90, 'lightgrey': 0xD3D3D3, 'lightpink': 0xFFB6C1, 'lightsalmon': 0xFFA07A, 'lightseagreen': 0x20B2AA, 'lightskyblue': 0x87CEFA,
	    'lightslategray': 0x778899, 'lightslategrey': 0x778899, 'lightsteelblue': 0xB0C4DE, 'lightyellow': 0xFFFFE0, 'lime': 0x00FF00, 'limegreen': 0x32CD32,
	    'linen': 0xFAF0E6, 'magenta': 0xFF00FF, 'maroon': 0x800000, 'mediumaquamarine': 0x66CDAA, 'mediumblue': 0x0000CD, 'mediumorchid': 0xBA55D3,
	    'mediumpurple': 0x9370DB, 'mediumseagreen': 0x3CB371, 'mediumslateblue': 0x7B68EE, 'mediumspringgreen': 0x00FA9A, 'mediumturquoise': 0x48D1CC,
	    'mediumvioletred': 0xC71585, 'midnightblue': 0x191970, 'mintcream': 0xF5FFFA, 'mistyrose': 0xFFE4E1, 'moccasin': 0xFFE4B5, 'navajowhite': 0xFFDEAD,
	    'navy': 0x000080, 'oldlace': 0xFDF5E6, 'olive': 0x808000, 'olivedrab': 0x6B8E23, 'orange': 0xFFA500, 'orangered': 0xFF4500, 'orchid': 0xDA70D6,
	    'palegoldenrod': 0xEEE8AA, 'palegreen': 0x98FB98, 'paleturquoise': 0xAFEEEE, 'palevioletred': 0xDB7093, 'papayawhip': 0xFFEFD5, 'peachpuff': 0xFFDAB9,
	    'peru': 0xCD853F, 'pink': 0xFFC0CB, 'plum': 0xDDA0DD, 'powderblue': 0xB0E0E6, 'purple': 0x800080, 'red': 0xFF0000, 'rosybrown': 0xBC8F8F,
	    'royalblue': 0x4169E1, 'saddlebrown': 0x8B4513, 'salmon': 0xFA8072, 'sandybrown': 0xF4A460, 'seagreen': 0x2E8B57, 'seashell': 0xFFF5EE,
	    'sienna': 0xA0522D, 'silver': 0xC0C0C0, 'skyblue': 0x87CEEB, 'slateblue': 0x6A5ACD, 'slategray': 0x708090, 'slategrey': 0x708090, 'snow': 0xFFFAFA,
	    'springgreen': 0x00FF7F, 'steelblue': 0x4682B4, 'tan': 0xD2B48C, 'teal': 0x008080, 'thistle': 0xD8BFD8, 'tomato': 0xFF6347, 'turquoise': 0x40E0D0,
	    'violet': 0xEE82EE, 'wheat': 0xF5DEB3, 'white': 0xFFFFFF, 'whitesmoke': 0xF5F5F5, 'yellow': 0xFFFF00, 'yellowgreen': 0x9ACD32 };
	var Color = (function () {
	    function Color() {
	        var _this = this;
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i - 0] = arguments[_i];
	        }
	        this.r = 1;
	        this.g = 1;
	        this.b = 1;
	        this.setHSL = (function () {
	            function hue2rgb(p, q, t) {
	                if (t < 0)
	                    t += 1;
	                if (t > 1)
	                    t -= 1;
	                if (t < 1 / 6)
	                    return p + (q - p) * 6 * t;
	                if (t < 1 / 2)
	                    return q;
	                if (t < 2 / 3)
	                    return p + (q - p) * 6 * (2 / 3 - t);
	                return p;
	            }
	            return function (h, s, l) {
	                h = MathUtil.euclideanModulo(h, 1);
	                s = MathUtil.clamp(s, 0, 1);
	                l = MathUtil.clamp(l, 0, 1);
	                if (s === 0) {
	                    _this.r = _this.g = _this.b = l;
	                }
	                else {
	                    var p = l <= 0.5 ? l * (1 + s) : l + s - (l * s);
	                    var q = (2 * l) - p;
	                    _this.r = hue2rgb(q, p, h + 1 / 3);
	                    _this.g = hue2rgb(q, p, h);
	                    _this.b = hue2rgb(q, p, h - 1 / 3);
	                }
	                return _this;
	            };
	        })();
	        this.setStyle = function (style) {
	            function handleAlpha(string) {
	                if (string === undefined)
	                    return;
	                if (parseFloat(string) < 1) {
	                    console.warn('THREE.Color: Alpha component of ' + style + ' will be ignored.');
	                }
	            }
	            var m;
	            if (m = /^((?:rgb|hsl)a?)\(\s*([^\)]*)\)/.exec(style)) {
	                var color;
	                var name = m[1];
	                var components = m[2];
	                switch (name) {
	                    case 'rgb':
	                    case 'rgba':
	                        if (color = /^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(components)) {
	                            _this.r = Math.min(255, parseInt(color[1], 10)) / 255;
	                            _this.g = Math.min(255, parseInt(color[2], 10)) / 255;
	                            _this.b = Math.min(255, parseInt(color[3], 10)) / 255;
	                            handleAlpha(color[5]);
	                            return _this;
	                        }
	                        if (color = /^(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(components)) {
	                            _this.r = Math.min(100, parseInt(color[1], 10)) / 100;
	                            _this.g = Math.min(100, parseInt(color[2], 10)) / 100;
	                            _this.b = Math.min(100, parseInt(color[3], 10)) / 100;
	                            handleAlpha(color[5]);
	                            return _this;
	                        }
	                        break;
	                    case 'hsl':
	                    case 'hsla':
	                        if (color = /^([0-9]*\.?[0-9]+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(components)) {
	                            var h = parseFloat(color[1]) / 360;
	                            var s = parseInt(color[2], 10) / 100;
	                            var l = parseInt(color[3], 10) / 100;
	                            handleAlpha(color[5]);
	                            return _this.setHSL(h, s, l);
	                        }
	                        break;
	                }
	            }
	            else if (m = /^\#([A-Fa-f0-9]+)$/.exec(style)) {
	                var hex = m[1];
	                var size = hex.length;
	                if (size === 3) {
	                    _this.r = parseInt(hex.charAt(0) + hex.charAt(0), 16) / 255;
	                    _this.g = parseInt(hex.charAt(1) + hex.charAt(1), 16) / 255;
	                    _this.b = parseInt(hex.charAt(2) + hex.charAt(2), 16) / 255;
	                    return _this;
	                }
	                else if (size === 6) {
	                    _this.r = parseInt(hex.charAt(0) + hex.charAt(1), 16) / 255;
	                    _this.g = parseInt(hex.charAt(2) + hex.charAt(3), 16) / 255;
	                    _this.b = parseInt(hex.charAt(4) + hex.charAt(5), 16) / 255;
	                    return _this;
	                }
	            }
	            if (style && style.length > 0) {
	                var hex = ColorKeywords[style];
	                if (hex !== undefined) {
	                    _this.setHex(hex);
	                }
	                else {
	                    console.warn('THREE.Color: Unknown color ' + style);
	                }
	            }
	            return _this;
	        };
	        if (args.length === 3) {
	            return this.fromArray(arguments);
	        }
	        return this.set(args[0]);
	    }
	    Color.prototype.set = function (value) {
	        if (value instanceof Color) {
	            this.copy(value);
	        }
	        else if (typeof value === 'number') {
	            this.setHex(value);
	        }
	        else if (typeof value === 'string') {
	            this.setStyle(value);
	        }
	        return this;
	    };
	    Color.prototype.setHex = function (hex) {
	        hex = Math.floor(hex);
	        this.r = (hex >> 16 & 255) / 255;
	        this.g = (hex >> 8 & 255) / 255;
	        this.b = (hex & 255) / 255;
	        return this;
	    };
	    Color.prototype.setRGB = function (r, g, b) {
	        this.r = r;
	        this.g = g;
	        this.b = b;
	        return this;
	    };
	    Color.prototype.clone = function () {
	        return new this.constructor(this.r, this.g, this.b);
	    };
	    Color.prototype.copy = function (color) {
	        this.r = color.r;
	        this.g = color.g;
	        this.b = color.b;
	        return this;
	    };
	    Color.prototype.copyGammaToLinear = function (color, gammaFactor) {
	        if (gammaFactor === undefined)
	            gammaFactor = 2.0;
	        this.r = Math.pow(color.r, gammaFactor);
	        this.g = Math.pow(color.g, gammaFactor);
	        this.b = Math.pow(color.b, gammaFactor);
	        return this;
	    };
	    Color.prototype.copyLinearToGamma = function (color, gammaFactor) {
	        if (gammaFactor === undefined)
	            gammaFactor = 2.0;
	        var safeInverse = (gammaFactor > 0) ? (1.0 / gammaFactor) : 1.0;
	        this.r = Math.pow(color.r, safeInverse);
	        this.g = Math.pow(color.g, safeInverse);
	        this.b = Math.pow(color.b, safeInverse);
	        return this;
	    };
	    Color.prototype.convertGammaToLinear = function () {
	        var r = this.r, g = this.g, b = this.b;
	        this.r = r * r;
	        this.g = g * g;
	        this.b = b * b;
	        return this;
	    };
	    Color.prototype.convertLinearToGamma = function () {
	        this.r = Math.sqrt(this.r);
	        this.g = Math.sqrt(this.g);
	        this.b = Math.sqrt(this.b);
	        return this;
	    };
	    Color.prototype.getHex = function () {
	        return (this.r * 255) << 16 ^ (this.g * 255) << 8 ^ (this.b * 255) << 0;
	    };
	    Color.prototype.getHexString = function () {
	        return ('000000' + this.getHex().toString(16)).slice(-6);
	    };
	    Color.prototype.getHSL = function (optionalTarget) {
	        // h,s,l ranges are in 0.0 - 1.0
	        var hsl = optionalTarget || { h: 0, s: 0, l: 0 };
	        var r = this.r, g = this.g, b = this.b;
	        var max = Math.max(r, g, b);
	        var min = Math.min(r, g, b);
	        var hue, saturation;
	        var lightness = (min + max) / 2.0;
	        if (min === max) {
	            hue = 0;
	            saturation = 0;
	        }
	        else {
	            var delta = max - min;
	            saturation = lightness <= 0.5 ? delta / (max + min) : delta / (2 - max - min);
	            switch (max) {
	                case r:
	                    hue = (g - b) / delta + (g < b ? 6 : 0);
	                    break;
	                case g:
	                    hue = (b - r) / delta + 2;
	                    break;
	                case b:
	                    hue = (r - g) / delta + 4;
	                    break;
	            }
	            hue /= 6;
	        }
	        hsl.h = hue;
	        hsl.s = saturation;
	        hsl.l = lightness;
	        return hsl;
	    };
	    Color.prototype.getStyle = function () {
	        return 'rgb(' + ((this.r * 255) | 0) + ',' + ((this.g * 255) | 0) + ',' + ((this.b * 255) | 0) + ')';
	    };
	    Color.prototype.offsetHSL = function (h, s, l) {
	        var hsl = this.getHSL();
	        hsl.h += h;
	        hsl.s += s;
	        hsl.l += l;
	        this.setHSL(hsl.h, hsl.s, hsl.l);
	        return this;
	    };
	    Color.prototype.add = function (color) {
	        this.r += color.r;
	        this.g += color.g;
	        this.b += color.b;
	        return this;
	    };
	    Color.prototype.addColors = function (color1, color2) {
	        this.r = color1.r + color2.r;
	        this.g = color1.g + color2.g;
	        this.b = color1.b + color2.b;
	        return this;
	    };
	    Color.prototype.addScalar = function (s) {
	        this.r += s;
	        this.g += s;
	        this.b += s;
	        return this;
	    };
	    Color.prototype.multiply = function (color) {
	        this.r *= color.r;
	        this.g *= color.g;
	        this.b *= color.b;
	        return this;
	    };
	    Color.prototype.multiplyScalar = function (s) {
	        this.r *= s;
	        this.g *= s;
	        this.b *= s;
	        return this;
	    };
	    Color.prototype.lerp = function (color, alpha) {
	        this.r += (color.r - this.r) * alpha;
	        this.g += (color.g - this.g) * alpha;
	        this.b += (color.b - this.b) * alpha;
	        return this;
	    };
	    Color.prototype.equals = function (c) {
	        return (c.r === this.r) && (c.g === this.g) && (c.b === this.b);
	    };
	    Color.prototype.fromArray = function (array, offset) {
	        if (offset === undefined)
	            offset = 0;
	        this.r = array[offset];
	        this.g = array[offset + 1];
	        this.b = array[offset + 2];
	        return this;
	    };
	    Color.prototype.toArray = function (array, offset) {
	        if (array === undefined)
	            array = [];
	        if (offset === undefined)
	            offset = 0;
	        array[offset] = this.r;
	        array[offset + 1] = this.g;
	        array[offset + 2] = this.b;
	        return array;
	    };
	    return Color;
	})();
	module.exports = Color;
	//# sourceMappingURL=Color.js.map

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var Plane = __webpack_require__(16);
	var Vector3 = __webpack_require__(4);
	var Sphere = __webpack_require__(17);
	var Frustum = (function () {
	    function Frustum(p0, p1, p2, p3, p4, p5) {
	        this.planes = [
	            (p0 !== undefined) ? p0 : new Plane(),
	            (p1 !== undefined) ? p1 : new Plane(),
	            (p2 !== undefined) ? p2 : new Plane(),
	            (p3 !== undefined) ? p3 : new Plane(),
	            (p4 !== undefined) ? p4 : new Plane(),
	            (p5 !== undefined) ? p5 : new Plane()
	        ];
	    }
	    Frustum.prototype.set = function (p0, p1, p2, p3, p4, p5) {
	        var planes = this.planes;
	        planes[0].copy(p0);
	        planes[1].copy(p1);
	        planes[2].copy(p2);
	        planes[3].copy(p3);
	        planes[4].copy(p4);
	        planes[5].copy(p5);
	        return this;
	    };
	    Frustum.prototype.clone = function () {
	    };
	    Frustum.prototype.copy = function (frustum) {
	        var planes = this.planes;
	        for (var i = 0; i < 6; i++) {
	            planes[i].copy(frustum.planes[i]);
	        }
	        return this;
	    };
	    Frustum.prototype.setFromMatrix = function (m) {
	        var planes = this.planes;
	        var me = m.elements;
	        var me0 = me[0], me1 = me[1], me2 = me[2], me3 = me[3];
	        var me4 = me[4], me5 = me[5], me6 = me[6], me7 = me[7];
	        var me8 = me[8], me9 = me[9], me10 = me[10], me11 = me[11];
	        var me12 = me[12], me13 = me[13], me14 = me[14], me15 = me[15];
	        planes[0].setComponents(me3 - me0, me7 - me4, me11 - me8, me15 - me12).normalize();
	        planes[1].setComponents(me3 + me0, me7 + me4, me11 + me8, me15 + me12).normalize();
	        planes[2].setComponents(me3 + me1, me7 + me5, me11 + me9, me15 + me13).normalize();
	        planes[3].setComponents(me3 - me1, me7 - me5, me11 - me9, me15 - me13).normalize();
	        planes[4].setComponents(me3 - me2, me7 - me6, me11 - me10, me15 - me14).normalize();
	        planes[5].setComponents(me3 + me2, me7 + me6, me11 + me10, me15 + me14).normalize();
	        return this;
	    };
	    Frustum.prototype.intersectsObject = function (object) {
	        var sphere = new Sphere();
	        var geometry = object.geometry;
	        if (geometry.boundingSphere === null)
	            geometry.computeBoundingSphere();
	        sphere.copy(geometry.boundingSphere);
	        sphere.applyMatrix4(object.matrixWorld);
	        return this.intersectsSphere(sphere);
	    };
	    ;
	    Frustum.prototype.intersectsSphere = function (sphere) {
	        var planes = this.planes;
	        var center = sphere.center;
	        var negRadius = -sphere.radius;
	        for (var i = 0; i < 6; i++) {
	            var distance = planes[i].distanceToPoint(center);
	            if (distance < negRadius) {
	                return false;
	            }
	        }
	        return true;
	    };
	    Frustum.prototype.intersectsBox = function (box) {
	        var p1 = new Vector3(), p2 = new Vector3();
	        var planes = this.planes;
	        for (var i = 0; i < 6; i++) {
	            var plane = planes[i];
	            p1.x = plane.normal.x > 0 ? box.min.x : box.max.x;
	            p2.x = plane.normal.x > 0 ? box.max.x : box.min.x;
	            p1.y = plane.normal.y > 0 ? box.min.y : box.max.y;
	            p2.y = plane.normal.y > 0 ? box.max.y : box.min.y;
	            p1.z = plane.normal.z > 0 ? box.min.z : box.max.z;
	            p2.z = plane.normal.z > 0 ? box.max.z : box.min.z;
	            var d1 = plane.distanceToPoint(p1);
	            var d2 = plane.distanceToPoint(p2);
	            if (d1 < 0 && d2 < 0) {
	                return false;
	            }
	        }
	        return true;
	    };
	    ;
	    Frustum.prototype.containsPoint = function (point) {
	        var planes = this.planes;
	        for (var i = 0; i < 6; i++) {
	            if (planes[i].distanceToPoint(point) < 0) {
	                return false;
	            }
	        }
	        return true;
	    };
	    return Frustum;
	})();
	module.exports = Frustum;
	//# sourceMappingURL=Frustum.js.map

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var Vector3 = __webpack_require__(4);
	var Matrix3 = __webpack_require__(8);
	var Plane = (function () {
	    function Plane(normal, constant) {
	        var _this = this;
	        this.normal = normal;
	        this.constant = constant;
	        this.setFromCoplanarPoints = (function () {
	            var v1 = new Vector3();
	            var v2 = new Vector3();
	            return function (a, b, c) {
	                var normal = v1.subVectors(c, b).cross(v2.subVectors(a, b)).normalize();
	                _this.setFromNormalAndCoplanarPoint(normal, a);
	                return _this;
	            };
	        })();
	        this.intersectLine = (function () {
	            var v1 = new Vector3();
	            return function (line, optionalTarget) {
	                var result = optionalTarget || new Vector3();
	                var direction = line.delta(v1);
	                var denominator = _this.normal.dot(direction);
	                if (denominator === 0) {
	                    if (_this.distanceToPoint(line.start) === 0) {
	                        return result.copy(line.start);
	                    }
	                    return undefined;
	                }
	                var t = -(line.start.dot(_this.normal) + _this.constant) / denominator;
	                if (t < 0 || t > 1) {
	                    return undefined;
	                }
	                return result.copy(direction).multiplyScalar(t).add(line.start);
	            };
	        })();
	        this.applyMatrix4 = (function () {
	            var v1 = new Vector3();
	            var v2 = new Vector3();
	            var m1 = new Matrix3();
	            return function (matrix, optionalNormalMatrix) {
	                var normalMatrix = optionalNormalMatrix || m1.getNormalMatrix(matrix);
	                var newNormal = v1.copy(_this.normal).applyMatrix3(normalMatrix);
	                var newCoplanarPoint = _this.coplanarPoint(v2);
	                newCoplanarPoint.applyMatrix4(matrix);
	                _this.setFromNormalAndCoplanarPoint(newNormal, newCoplanarPoint);
	                return _this;
	            };
	        })();
	        this.normal = (normal !== undefined) ? normal : new Vector3(1, 0, 0);
	        this.constant = (constant !== undefined) ? constant : 0;
	    }
	    Plane.prototype.set = function (normal, constant) {
	        this.normal.copy(normal);
	        this.constant = constant;
	        return this;
	    };
	    Plane.prototype.setComponents = function (x, y, z, w) {
	        this.normal.set(x, y, z);
	        this.constant = w;
	        return this;
	    };
	    Plane.prototype.setFromNormalAndCoplanarPoint = function (normal, point) {
	        this.normal.copy(normal);
	        this.constant = -point.dot(this.normal);
	        return this;
	    };
	    Plane.prototype.clone = function () {
	        return new this.constructor().copy(this);
	    };
	    Plane.prototype.copy = function (plane) {
	        this.normal.copy(plane.normal);
	        this.constant = plane.constant;
	        return this;
	    };
	    Plane.prototype.normalize = function () {
	        // Note: will lead to a divide by zero if the plane is invalid.
	        var inverseNormalLength = 1.0 / this.normal.length();
	        this.normal.multiplyScalar(inverseNormalLength);
	        this.constant *= inverseNormalLength;
	        return this;
	    };
	    Plane.prototype.negate = function () {
	        this.constant *= -1;
	        this.normal.negate();
	        return this;
	    };
	    Plane.prototype.distanceToPoint = function (point) {
	        return this.normal.dot(point) + this.constant;
	    };
	    Plane.prototype.distanceToSphere = function (sphere) {
	        return this.distanceToPoint(sphere.center) - sphere.radius;
	    };
	    Plane.prototype.projectPoint = function (point, optionalTarget) {
	        return this.orthoPoint(point, optionalTarget).sub(point).negate();
	    };
	    Plane.prototype.orthoPoint = function (point, optionalTarget) {
	        var perpendicularMagnitude = this.distanceToPoint(point);
	        var result = optionalTarget || new Vector3();
	        return result.copy(this.normal).multiplyScalar(perpendicularMagnitude);
	    };
	    Plane.prototype.isIntersectionLine = function (line) {
	        var startSign = this.distanceToPoint(line.start);
	        var endSign = this.distanceToPoint(line.end);
	        return (startSign < 0 && endSign > 0) || (endSign < 0 && startSign > 0);
	    };
	    Plane.prototype.coplanarPoint = function (optionalTarget) {
	        var result = optionalTarget || new Vector3();
	        return result.copy(this.normal).multiplyScalar(-this.constant);
	    };
	    Plane.prototype.translate = function (offset) {
	        this.constant = this.constant - offset.dot(this.normal);
	        return this;
	    };
	    Plane.prototype.equals = function (plane) {
	        return plane.normal.equals(this.normal) && (plane.constant === this.constant);
	    };
	    return Plane;
	})();
	module.exports = Plane;
	//# sourceMappingURL=Plane.js.map

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var Vector3 = __webpack_require__(4);
	var Box3 = __webpack_require__(18);
	var Sphere = (function () {
	    function Sphere(center, radius) {
	        this.center = (center !== undefined) ? center : new Vector3();
	        this.radius = (radius !== undefined) ? radius : 0;
	    }
	    Sphere.prototype.set = function (center, radius) {
	        this.center.copy(center);
	        this.radius = radius;
	        return this;
	    };
	    Sphere.prototype.setFromPoints = function (points, optionalCenter) {
	        var box = new Box3();
	        var center = this.center;
	        if (optionalCenter !== undefined) {
	            center.copy(optionalCenter);
	        }
	        else {
	            box.setFromPoints(points).center(center);
	        }
	        var maxRadiusSq = 0;
	        for (var i = 0, il = points.length; i < il; i++) {
	            maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(points[i]));
	        }
	        this.radius = Math.sqrt(maxRadiusSq);
	        return this;
	    };
	    ;
	    Sphere.prototype.clone = function () {
	        return new this.constructor().copy(this);
	    };
	    Sphere.prototype.copy = function (sphere) {
	        this.center.copy(sphere.center);
	        this.radius = sphere.radius;
	        return this;
	    };
	    Sphere.prototype.empty = function () {
	        return (this.radius <= 0);
	    };
	    Sphere.prototype.containsPoint = function (point) {
	        return (point.distanceToSquared(this.center) <= (this.radius * this.radius));
	    };
	    Sphere.prototype.distanceToPoint = function (point) {
	        return (point.distanceTo(this.center) - this.radius);
	    };
	    Sphere.prototype.intersectsSphere = function (sphere) {
	        var radiusSum = this.radius + sphere.radius;
	        return sphere.center.distanceToSquared(this.center) <= (radiusSum * radiusSum);
	    };
	    Sphere.prototype.clampPoint = function (point, optionalTarget) {
	        var deltaLengthSq = this.center.distanceToSquared(point);
	        var result = optionalTarget || new Vector3();
	        result.copy(point);
	        if (deltaLengthSq > (this.radius * this.radius)) {
	            result.sub(this.center).normalize();
	            result.multiplyScalar(this.radius).add(this.center);
	        }
	        return result;
	    };
	    Sphere.prototype.getBoundingBox = function (optionalTarget) {
	        var box = optionalTarget || new Box3();
	        box.set(this.center, this.center);
	        box.expandByScalar(this.radius);
	        return box;
	    };
	    Sphere.prototype.applyMatrix4 = function (matrix) {
	        this.center.applyMatrix4(matrix);
	        this.radius = this.radius * matrix.getMaxScaleOnAxis();
	        return this;
	    };
	    Sphere.prototype.translate = function (offset) {
	        this.center.add(offset);
	        return this;
	    };
	    Sphere.prototype.equals = function (sphere) {
	        return sphere.center.equals(this.center) && (sphere.radius === this.radius);
	    };
	    return Sphere;
	})();
	module.exports = Sphere;
	//# sourceMappingURL=Sphere.js.map

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var Vector3 = __webpack_require__(4);
	var Sphere = __webpack_require__(17);
	var BufferGeometry = __webpack_require__(19);
	var Box3 = (function () {
	    function Box3(min, max) {
	        var _this = this;
	        this.setFromCenterAndSize = (function () {
	            var v1 = new Vector3();
	            _this.min = 1;
	            return function (center, size) {
	                var halfSize = v1.copy(size).multiplyScalar(0.5);
	                _this.min.copy(center).sub(halfSize);
	                _this.max.copy(center).add(halfSize);
	                return _this;
	            };
	        })();
	        this.setFromObject = (function () {
	            var v1 = new Vector3();
	            return function (object) {
	                var scope = _this;
	                object.updateMatrixWorld(true);
	                _this.makeEmpty();
	                object.traverse(function (node) {
	                    var geometry = node.geometry;
	                    if (geometry !== undefined) {
	                        var Geometry = __webpack_require__(20);
	                        if (geometry instanceof Geometry) {
	                            var vertices = geometry.vertices;
	                            for (var i = 0, il = vertices.length; i < il; i++) {
	                                v1.copy(vertices[i]);
	                                v1.applyMatrix4(node.matrixWorld);
	                                scope.expandByPoint(v1);
	                            }
	                        }
	                        else if (geometry instanceof BufferGeometry && geometry.attributes['position'] !== undefined) {
	                            var positions = geometry.attributes['position'].array;
	                            for (var i = 0, il = positions.length; i < il; i += 3) {
	                                v1.set(positions[i], positions[i + 1], positions[i + 2]);
	                                v1.applyMatrix4(node.matrixWorld);
	                                scope.expandByPoint(v1);
	                            }
	                        }
	                    }
	                });
	                return _this;
	            };
	        })();
	        this.distanceToPoint = (function () {
	            var v1 = new Vector3();
	            return function (point) {
	                var clampedPoint = v1.copy(point).clamp(this.min, this.max);
	                return clampedPoint.sub(point).length();
	            };
	        })();
	        this.getBoundingSphere = (function () {
	            var v1 = new Vector3();
	            return function (optionalTarget) {
	                var result = optionalTarget || new Sphere();
	                result.center = _this.center();
	                result.radius = _this.size(v1).length() * 0.5;
	                return result;
	            };
	        })();
	        this.applyMatrix4 = (function () {
	            var points = [
	                new Vector3(),
	                new Vector3(),
	                new Vector3(),
	                new Vector3(),
	                new Vector3(),
	                new Vector3(),
	                new Vector3(),
	                new Vector3()
	            ];
	            return function (matrix) {
	                points[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(matrix);
	                points[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(matrix);
	                points[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(matrix);
	                points[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(matrix);
	                points[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(matrix);
	                points[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(matrix);
	                points[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(matrix);
	                points[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(matrix);
	                this.makeEmpty();
	                this.setFromPoints(points);
	                return this;
	            };
	        })();
	        this.min = (min !== undefined) ? min : new Vector3(Infinity, Infinity, Infinity);
	        this.max = (max !== undefined) ? max : new Vector3(-Infinity, -Infinity, -Infinity);
	    }
	    Box3.prototype.set = function (min, max) {
	        this.min.copy(min);
	        this.max.copy(max);
	        return this;
	    };
	    Box3.prototype.setFromPoints = function (points) {
	        this.makeEmpty();
	        for (var i = 0, il = points.length; i < il; i++) {
	            this.expandByPoint(points[i]);
	        }
	        return this;
	    };
	    Box3.prototype.clone = function () {
	        return new this.constructor().copy(this);
	    };
	    Box3.prototype.copy = function (box) {
	        this.min.copy(box.min);
	        this.max.copy(box.max);
	        return this;
	    };
	    Box3.prototype.makeEmpty = function () {
	        this.min.x = this.min.y = this.min.z = Infinity;
	        this.max.x = this.max.y = this.max.z = -Infinity;
	        return this;
	    };
	    Box3.prototype.empty = function () {
	        return (this.max.x < this.min.x) || (this.max.y < this.min.y) || (this.max.z < this.min.z);
	    };
	    Box3.prototype.center = function (optionalTarget) {
	        var result = optionalTarget || new Vector3();
	        return result.addVectors(this.min, this.max).multiplyScalar(0.5);
	    };
	    Box3.prototype.size = function (optionalTarget) {
	        var result = optionalTarget || new Vector3();
	        return result.subVectors(this.max, this.min);
	    };
	    Box3.prototype.expandByPoint = function (point) {
	        this.min.min(point);
	        this.max.max(point);
	        return this;
	    };
	    Box3.prototype.expandByVector = function (vector) {
	        this.min.sub(vector);
	        this.max.add(vector);
	        return this;
	    };
	    Box3.prototype.expandByScalar = function (scalar) {
	        this.min.addScalar(-scalar);
	        this.max.addScalar(scalar);
	        return this;
	    };
	    Box3.prototype.containsPoint = function (point) {
	        if (point.x < this.min.x || point.x > this.max.x ||
	            point.y < this.min.y || point.y > this.max.y ||
	            point.z < this.min.z || point.z > this.max.z) {
	            return false;
	        }
	        return true;
	    };
	    Box3.prototype.containsBox = function (box) {
	        if ((this.min.x <= box.min.x) && (box.max.x <= this.max.x) &&
	            (this.min.y <= box.min.y) && (box.max.y <= this.max.y) &&
	            (this.min.z <= box.min.z) && (box.max.z <= this.max.z)) {
	            return true;
	        }
	        return false;
	    };
	    Box3.prototype.getParameter = function (point, optionalTarget) {
	        // This can potentially have a divide by zero if the box
	        // has a size dimension of 0.
	        var result = optionalTarget || new Vector3();
	        return result.set((point.x - this.min.x) / (this.max.x - this.min.x), (point.y - this.min.y) / (this.max.y - this.min.y), (point.z - this.min.z) / (this.max.z - this.min.z));
	    };
	    Box3.prototype.isIntersectionBox = function (box) {
	        // using 6 splitting planes to rule out intersections.
	        if (box.max.x < this.min.x || box.min.x > this.max.x ||
	            box.max.y < this.min.y || box.min.y > this.max.y ||
	            box.max.z < this.min.z || box.min.z > this.max.z) {
	            return false;
	        }
	        return true;
	    };
	    Box3.prototype.clampPoint = function (point, optionalTarget) {
	        var result = optionalTarget || new Vector3();
	        return result.copy(point).clamp(this.min, this.max);
	    };
	    Box3.prototype.intersect = function (box) {
	        this.min.max(box.min);
	        this.max.min(box.max);
	        return this;
	    };
	    Box3.prototype.union = function (box) {
	        this.min.min(box.min);
	        this.max.max(box.max);
	        return this;
	    };
	    Box3.prototype.translate = function (offset) {
	        this.min.add(offset);
	        this.max.add(offset);
	        return this;
	    };
	    ;
	    Box3.prototype.equals = function (box) {
	        return box.min.equals(this.min) && box.max.equals(this.max);
	    };
	    return Box3;
	})();
	module.exports = Box3;
	//# sourceMappingURL=Box3.js.map

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var EventDispatcher = __webpack_require__(9);
	var MathUtil = __webpack_require__(3);
	var Geometry = __webpack_require__(20);
	var InterleavedBufferAttribute = __webpack_require__(35);
	var BufferAttribute = __webpack_require__(36);
	var TypeAttribute = __webpack_require__(38);
	var Object3D = __webpack_require__(2);
	var Points = __webpack_require__(39);
	var Line = __webpack_require__(40);
	var Matrix3 = __webpack_require__(8);
	var Matrix4 = __webpack_require__(5);
	var Vector3 = __webpack_require__(4);
	var Mesh = __webpack_require__(23);
	var DirectGeometry = __webpack_require__(41);
	var BufferGeometry = (function (_super) {
	    __extends(BufferGeometry, _super);
	    function BufferGeometry() {
	        _super.apply(this, arguments);
	        this['id'] = Geometry.IdCount++;
	        this.uuid = MathUtil.generateUUID();
	        this.name = '';
	        this.type = 'BufferGeometry';
	        this.index = null;
	        this.attributes = {};
	        this.morphAttributes = {};
	        this.groups = [];
	        this.boundingBox = null;
	        this.boundingSphere = null;
	        this.drawRange = { start: 0, count: Infinity };
	        this.rotateX = (function () {
	            // rotate geometry around world x-axis
	            var m1;
	            return function rotateX(angle) {
	                if (m1 === undefined)
	                    m1 = new Matrix4();
	                m1.makeRotationX(angle);
	                this.applyMatrix(m1);
	                return this;
	            };
	        })();
	        this.rotateY = (function () {
	            // rotate geometry around world y-axis
	            var m1;
	            return function rotateY(angle) {
	                if (m1 === undefined)
	                    m1 = new Matrix4();
	                m1.makeRotationY(angle);
	                this.applyMatrix(m1);
	                return this;
	            };
	        })();
	        this.rotateZ = (function () {
	            // rotate geometry around world z-axis
	            var m1;
	            return function rotateZ(angle) {
	                if (m1 === undefined)
	                    m1 = new Matrix4();
	                m1.makeRotationZ(angle);
	                this.applyMatrix(m1);
	                return this;
	            };
	        })();
	        this.translate = (function () {
	            // translate geometry
	            var m1;
	            return function translate(x, y, z) {
	                if (m1 === undefined)
	                    m1 = new Matrix4();
	                m1.makeTranslation(x, y, z);
	                this.applyMatrix(m1);
	                return this;
	            };
	        })();
	        this.scale = (function () {
	            // scale geometry
	            var m1;
	            return function scale(x, y, z) {
	                if (m1 === undefined)
	                    m1 = new Matrix4();
	                m1.makeScale(x, y, z);
	                this.applyMatrix(m1);
	                return this;
	            };
	        })();
	        this.lookAt = (function () {
	            var obj;
	            return function lookAt(vector) {
	                if (obj === undefined)
	                    obj = new Object3D();
	                obj.lookAt(vector);
	                obj.updateMatrix();
	                this.applyMatrix(obj.matrix);
	            };
	        })();
	        this.computeBoundingBox = (function () {
	            var vector = new Vector3();
	            return function () {
	                if (this.boundingBox === null) {
	                    var Box3 = __webpack_require__(18);
	                    this.boundingBox = new Box3();
	                }
	                var positions = this.attributes.position.array;
	                if (positions) {
	                    var bb = this.boundingBox;
	                    bb.makeEmpty();
	                    for (var i = 0, il = positions.length; i < il; i += 3) {
	                        vector.fromArray(positions, i);
	                        bb.expandByPoint(vector);
	                    }
	                }
	                if (positions === undefined || positions.length === 0) {
	                    this.boundingBox.min.set(0, 0, 0);
	                    this.boundingBox.max.set(0, 0, 0);
	                }
	                if (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) {
	                    console.error('THREE.BufferGeometry.computeBoundingBox: Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
	                }
	            };
	        })();
	        this.computeBoundingSphere = (function () {
	            var Box3 = __webpack_require__(18);
	            var box = new Box3();
	            var vector = new Vector3();
	            return function () {
	                if (this.boundingSphere === null) {
	                    var Sphere = __webpack_require__(17);
	                    this.boundingSphere = new Sphere();
	                }
	                var positions = this.attributes.position.array;
	                if (positions) {
	                    box.makeEmpty();
	                    var center = this.boundingSphere.center;
	                    for (var i = 0, il = positions.length; i < il; i += 3) {
	                        vector.fromArray(positions, i);
	                        box.expandByPoint(vector);
	                    }
	                    box.center(center);
	                    var maxRadiusSq = 0;
	                    for (var i = 0, il = positions.length; i < il; i += 3) {
	                        vector.fromArray(positions, i);
	                        maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector));
	                    }
	                    this.boundingSphere.radius = Math.sqrt(maxRadiusSq);
	                    if (isNaN(this.boundingSphere.radius)) {
	                        console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
	                    }
	                }
	            };
	        })();
	    }
	    BufferGeometry.prototype.getIndex = function () {
	        return this.index;
	    };
	    BufferGeometry.prototype.setIndex = function (index) {
	        this.index = index;
	    };
	    BufferGeometry.prototype.addAttribute = function (name, attribute) {
	        if (attribute instanceof BufferAttribute === false && attribute instanceof InterleavedBufferAttribute === false) {
	            console.warn('THREE.BufferGeometry: .addAttribute() now expects ( name, attribute ).');
	            this.addAttribute(name, new BufferAttribute(arguments[1], arguments[2]));
	            return;
	        }
	        if (name === 'index') {
	            console.warn('THREE.BufferGeometry.addAttribute: Use .setIndex() for index attribute.');
	            this.setIndex(attribute);
	            return;
	        }
	        this.attributes[name] = attribute;
	    };
	    BufferGeometry.prototype.getAttribute = function (name) {
	        return this.attributes[name];
	    };
	    BufferGeometry.prototype.removeAttribute = function (name) {
	        delete this.attributes[name];
	    };
	    BufferGeometry.prototype.addGroup = function (start, count, materialIndex) {
	        this.groups.push({
	            start: start,
	            count: count,
	            materialIndex: materialIndex !== undefined ? materialIndex : 0
	        });
	    };
	    BufferGeometry.prototype.clearGroups = function () {
	        this.groups = [];
	    };
	    BufferGeometry.prototype.setDrawRange = function (start, count) {
	        this.drawRange.start = start;
	        this.drawRange.count = count;
	    };
	    BufferGeometry.prototype.applyMatrix = function (matrix) {
	        var position = this.attributes.position;
	        if (position !== undefined) {
	            matrix.applyToVector3Array(position.array);
	            position.needsUpdate = true;
	        }
	        var normal = this.attributes.normal;
	        if (normal !== undefined) {
	            var normalMatrix = new Matrix3().getNormalMatrix(matrix);
	            normalMatrix.applyToVector3Array(normal.array);
	            normal.needsUpdate = true;
	        }
	        if (this.boundingBox !== null) {
	            this.computeBoundingBox();
	        }
	        if (this.boundingSphere !== null) {
	            this.computeBoundingSphere();
	        }
	    };
	    BufferGeometry.prototype.center = function () {
	        this.computeBoundingBox();
	        var offset = this.boundingBox.center().negate();
	        this.translate(offset.x, offset.y, offset.z);
	        return offset;
	    };
	    BufferGeometry.prototype.setFromObject = function (object) {
	        // console.log( 'THREE.BufferGeometry.setFromObject(). Converting', object, this );
	        var geometry = object.geometry;
	        if (object instanceof Points || object instanceof Line) {
	            var positions = new TypeAttribute.Float32Attribute(geometry.vertices.length * 3, 3);
	            var colors = new TypeAttribute.Float32Attribute(geometry.colors.length * 3, 3);
	            this.addAttribute('position', positions.copyVector3sArray(geometry.vertices));
	            this.addAttribute('color', colors.copyColorsArray(geometry.colors));
	            if (geometry.lineDistances && geometry.lineDistances.length === geometry.vertices.length) {
	                var lineDistances = new TypeAttribute.Float32Attribute(geometry.lineDistances.length, 1);
	                this.addAttribute('lineDistance', lineDistances.copyArray(geometry.lineDistances));
	            }
	            if (geometry.boundingSphere !== null) {
	                this.boundingSphere = geometry.boundingSphere.clone();
	            }
	            if (geometry.boundingBox !== null) {
	                this.boundingBox = geometry.boundingBox.clone();
	            }
	        }
	        else if (object instanceof Mesh) {
	            if (geometry instanceof Geometry) {
	                this.fromGeometry(geometry);
	            }
	        }
	        return this;
	    };
	    BufferGeometry.prototype.updateFromObject = function (object) {
	        var geometry = object.geometry;
	        if (object instanceof Mesh) {
	            var direct = geometry.__directGeometry;
	            if (direct === undefined) {
	                return this.fromGeometry(geometry);
	            }
	            direct.verticesNeedUpdate = geometry.verticesNeedUpdate;
	            direct.normalsNeedUpdate = geometry.normalsNeedUpdate;
	            direct.colorsNeedUpdate = geometry.colorsNeedUpdate;
	            direct.uvsNeedUpdate = geometry.uvsNeedUpdate;
	            direct.groupsNeedUpdate = geometry.groupsNeedUpdate;
	            geometry.verticesNeedUpdate = false;
	            geometry.normalsNeedUpdate = false;
	            geometry.colorsNeedUpdate = false;
	            geometry.uvsNeedUpdate = false;
	            geometry.groupsNeedUpdate = false;
	            geometry = direct;
	        }
	        if (geometry.verticesNeedUpdate === true) {
	            var attribute = this.attributes.position;
	            if (attribute !== undefined) {
	                attribute.copyVector3sArray(geometry.vertices);
	                attribute.needsUpdate = true;
	            }
	            geometry.verticesNeedUpdate = false;
	        }
	        if (geometry.normalsNeedUpdate === true) {
	            var attribute = this.attributes.normal;
	            if (attribute !== undefined) {
	                attribute.copyVector3sArray(geometry.normals);
	                attribute.needsUpdate = true;
	            }
	            geometry.normalsNeedUpdate = false;
	        }
	        if (geometry.colorsNeedUpdate === true) {
	            var attribute = this.attributes.color;
	            if (attribute !== undefined) {
	                attribute.copyColorsArray(geometry.colors);
	                attribute.needsUpdate = true;
	            }
	            geometry.colorsNeedUpdate = false;
	        }
	        if (geometry.lineDistancesNeedUpdate) {
	            var attribute = this.attributes.lineDistance;
	            if (attribute !== undefined) {
	                attribute.copyArray(geometry.lineDistances);
	                attribute.needsUpdate = true;
	            }
	            geometry.lineDistancesNeedUpdate = false;
	        }
	        if (geometry.groupsNeedUpdate) {
	            geometry.computeGroups(object.geometry);
	            this.groups = geometry.groups;
	            geometry.groupsNeedUpdate = false;
	        }
	        return this;
	    };
	    BufferGeometry.prototype.fromGeometry = function (geometry) {
	        geometry.__directGeometry = new DirectGeometry().fromGeometry(geometry);
	        return this.fromDirectGeometry(geometry.__directGeometry);
	    };
	    BufferGeometry.prototype.fromDirectGeometry = function (geometry) {
	        var positions = new Float32Array(geometry.vertices.length * 3);
	        this.addAttribute('position', new BufferAttribute(positions, 3).copyVector3sArray(geometry.vertices));
	        if (geometry.normals.length > 0) {
	            var normals = new Float32Array(geometry.normals.length * 3);
	            this.addAttribute('normal', new BufferAttribute(normals, 3).copyVector3sArray(geometry.normals));
	        }
	        if (geometry.colors.length > 0) {
	            var colors = new Float32Array(geometry.colors.length * 3);
	            this.addAttribute('color', new BufferAttribute(colors, 3).copyColorsArray(geometry.colors));
	        }
	        if (geometry.uvs.length > 0) {
	            var uvs = new Float32Array(geometry.uvs.length * 2);
	            this.addAttribute('uv', new BufferAttribute(uvs, 2).copyVector2sArray(geometry.uvs));
	        }
	        if (geometry.uvs2.length > 0) {
	            var uvs2 = new Float32Array(geometry.uvs2.length * 2);
	            this.addAttribute('uv2', new BufferAttribute(uvs2, 2).copyVector2sArray(geometry.uvs2));
	        }
	        if (geometry.indices.length > 0) {
	            var TypeArray = geometry.vertices.length > 65535 ? Uint32Array : Uint16Array;
	            var indices = new TypeArray(geometry.indices.length * 3);
	            this.setIndex(new BufferAttribute(indices, 1).copyIndicesArray(geometry.indices));
	        }
	        this.groups = geometry.groups;
	        for (var name in geometry.morphTargets) {
	            var array = [];
	            var morphTargets = geometry.morphTargets[name];
	            for (var i = 0, l = morphTargets.length; i < l; i++) {
	                var morphTarget = morphTargets[i];
	                var attribute = new TypeAttribute.Float32Attribute(morphTarget.length * 3, 3);
	                array.push(attribute.copyVector3sArray(morphTarget));
	            }
	            this.morphAttributes[name] = array;
	        }
	        if (geometry.skinIndices.length > 0) {
	            var skinIndices = new TypeAttribute.Float32Attribute(geometry.skinIndices.length * 4, 4);
	            this.addAttribute('skinIndex', skinIndices.copyVector4sArray(geometry.skinIndices));
	        }
	        if (geometry.skinWeights.length > 0) {
	            var skinWeights = new TypeAttribute.Float32Attribute(geometry.skinWeights.length * 4, 4);
	            this.addAttribute('skinWeight', skinWeights.copyVector4sArray(geometry.skinWeights));
	        }
	        if (geometry.boundingSphere !== null) {
	            this.boundingSphere = geometry.boundingSphere.clone();
	        }
	        if (geometry.boundingBox !== null) {
	            this.boundingBox = geometry.boundingBox.clone();
	        }
	        return this;
	    };
	    BufferGeometry.prototype.computeFaceNormals = function () {
	        // backwards compatibility
	    };
	    BufferGeometry.prototype.computeVertexNormals = function () {
	        var index = this.index;
	        var attributes = this.attributes;
	        var groups = this.groups;
	        if (attributes.position) {
	            var positions = attributes.position.array;
	            if (attributes.normal === undefined) {
	                this.addAttribute('normal', new BufferAttribute(new Float32Array(positions.length), 3));
	            }
	            else {
	                var normals = attributes.normal.array;
	                for (var i = 0, il = normals.length; i < il; i++) {
	                    normals[i] = 0;
	                }
	            }
	            var normals = attributes.normal.array;
	            var vA, vB, vC, pA = new Vector3(), pB = new Vector3(), pC = new Vector3(), cb = new Vector3(), ab = new Vector3();
	            if (index) {
	                var indices = index.array;
	                if (groups.length === 0) {
	                    this.addGroup(0, indices.length);
	                }
	                for (var j = 0, jl = groups.length; j < jl; ++j) {
	                    var group = groups[j];
	                    var start = group.start;
	                    var count = group.count;
	                    for (var i = start, il = start + count; i < il; i += 3) {
	                        vA = indices[i + 0] * 3;
	                        vB = indices[i + 1] * 3;
	                        vC = indices[i + 2] * 3;
	                        pA.fromArray(positions, vA);
	                        pB.fromArray(positions, vB);
	                        pC.fromArray(positions, vC);
	                        cb.subVectors(pC, pB);
	                        ab.subVectors(pA, pB);
	                        cb.cross(ab);
	                        normals[vA] += cb.x;
	                        normals[vA + 1] += cb.y;
	                        normals[vA + 2] += cb.z;
	                        normals[vB] += cb.x;
	                        normals[vB + 1] += cb.y;
	                        normals[vB + 2] += cb.z;
	                        normals[vC] += cb.x;
	                        normals[vC + 1] += cb.y;
	                        normals[vC + 2] += cb.z;
	                    }
	                }
	            }
	            else {
	                for (var i = 0, il = positions.length; i < il; i += 9) {
	                    pA.fromArray(positions, i);
	                    pB.fromArray(positions, i + 3);
	                    pC.fromArray(positions, i + 6);
	                    cb.subVectors(pC, pB);
	                    ab.subVectors(pA, pB);
	                    cb.cross(ab);
	                    normals[i] = cb.x;
	                    normals[i + 1] = cb.y;
	                    normals[i + 2] = cb.z;
	                    normals[i + 3] = cb.x;
	                    normals[i + 4] = cb.y;
	                    normals[i + 5] = cb.z;
	                    normals[i + 6] = cb.x;
	                    normals[i + 7] = cb.y;
	                    normals[i + 8] = cb.z;
	                }
	            }
	            this.normalizeNormals();
	            attributes.normal.needsUpdate = true;
	        }
	    };
	    BufferGeometry.prototype.computeTangents = function () {
	        console.warn('THREE.BufferGeometry: .computeTangents() has been removed.');
	    };
	    BufferGeometry.prototype.computeOffsets = function (size) {
	        console.warn('THREE.BufferGeometry: .computeOffsets() has been removed.');
	    };
	    BufferGeometry.prototype.merge = function (geometry, offset) {
	        if (geometry instanceof BufferGeometry === false) {
	            console.error('THREE.BufferGeometry.merge(): geometry not an instance of THREE.BufferGeometry.', geometry);
	            return;
	        }
	        if (offset === undefined)
	            offset = 0;
	        var attributes = this.attributes;
	        for (var key in attributes) {
	            if (geometry.attributes[key] === undefined)
	                continue;
	            var attribute1 = attributes[key];
	            var attributeArray1 = attribute1.array;
	            var attribute2 = geometry.attributes[key];
	            var attributeArray2 = attribute2.array;
	            var attributeSize = attribute2.itemSize;
	            for (var i = 0, j = attributeSize * offset; i < attributeArray2.length; i++, j++) {
	                attributeArray1[j] = attributeArray2[i];
	            }
	        }
	        return this;
	    };
	    BufferGeometry.prototype.normalizeNormals = function () {
	        var normals = this.attributes.normal.array;
	        var x, y, z, n;
	        for (var i = 0, il = normals.length; i < il; i += 3) {
	            x = normals[i];
	            y = normals[i + 1];
	            z = normals[i + 2];
	            n = 1.0 / Math.sqrt(x * x + y * y + z * z);
	            normals[i] *= n;
	            normals[i + 1] *= n;
	            normals[i + 2] *= n;
	        }
	    };
	    BufferGeometry.prototype.toJSON = function () {
	        var data = {
	            metadata: {
	                version: 4.4,
	                type: 'BufferGeometry',
	                generator: 'BufferGeometry.toJSON'
	            }
	        };
	        data.uuid = this.uuid;
	        data.type = this.type;
	        if (this.name !== '')
	            data.name = this.name;
	        if (this.parameters !== undefined) {
	            var parameters = this.parameters;
	            for (var key in parameters) {
	                if (parameters[key] !== undefined)
	                    data[key] = parameters[key];
	            }
	            return data;
	        }
	        data.data = { attributes: {} };
	        var index = this.index;
	        if (index !== null) {
	            var array = Array.prototype.slice.call(index.array);
	            data.data.index = {
	                type: index.array.constructor.name,
	                array: array
	            };
	        }
	        var attributes = this.attributes;
	        for (var key in attributes) {
	            var attribute = attributes[key];
	            var array = Array.prototype.slice.call(attribute.array);
	            data.data.attributes[key] = {
	                itemSize: attribute.itemSize,
	                type: attribute.array.constructor.name,
	                array: array
	            };
	        }
	        var groups = this.groups;
	        if (groups.length > 0) {
	            data.data.groups = JSON.parse(JSON.stringify(groups));
	        }
	        var boundingSphere = this.boundingSphere;
	        if (boundingSphere !== null) {
	            data.data.boundingSphere = {
	                center: boundingSphere.center.toArray(),
	                radius: boundingSphere.radius
	            };
	        }
	        return data;
	    };
	    BufferGeometry.prototype.clone = function () {
	        return new this.constructor().copy(this);
	    };
	    BufferGeometry.prototype.copy = function (source) {
	        var index = source.index;
	        if (index !== null) {
	            this.setIndex(index.clone());
	        }
	        var attributes = source.attributes;
	        for (var name in attributes) {
	            var attribute = attributes[name];
	            this.addAttribute(name, attribute.clone());
	        }
	        var groups = source.groups;
	        for (var i = 0, l = groups.length; i < l; i++) {
	            var group = groups[i];
	            this.addGroup(group.start, group.count);
	        }
	        return this;
	    };
	    BufferGeometry.prototype.dispose = function () {
	        this.dispatchEvent({ type: 'dispose' });
	    };
	    BufferGeometry.MaxIndex = 65535;
	    return BufferGeometry;
	})(EventDispatcher);
	module.exports = BufferGeometry;
	//# sourceMappingURL=BufferGeometry.js.map

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var MathUtil = __webpack_require__(3);
	var Matrix3 = __webpack_require__(8);
	var Matrix4 = __webpack_require__(5);
	var Vector2 = __webpack_require__(21);
	var Vector3 = __webpack_require__(4);
	var Color = __webpack_require__(14);
	var Box3 = __webpack_require__(18);
	var EventDispatcher = __webpack_require__(9);
	var Object3D = __webpack_require__(2);
	var Face3 = __webpack_require__(22);
	var Mesh = __webpack_require__(23);
	var Geometry = (function (_super) {
	    __extends(Geometry, _super);
	    function Geometry() {
	        _super.call(this);
	        this.id = Geometry.IdCount++;
	        this.uuid = MathUtil.generateUUID();
	        this.name = '';
	        this.type = 'Geometry';
	        this.vertices = [];
	        this.colors = [];
	        this.faces = [];
	        this.faceVertexUvs = [[]];
	        this.morphTargets = [];
	        this.morphNormals = [];
	        this.skinWeights = [];
	        this.skinIndices = [];
	        this.lineDistances = [];
	        this.boundingBox = null;
	        this.boundingSphere = null;
	        this.verticesNeedUpdate = false;
	        this.elementsNeedUpdate = false;
	        this.uvsNeedUpdate = false;
	        this.normalsNeedUpdate = false;
	        this.colorsNeedUpdate = false;
	        this.lineDistancesNeedUpdate = false;
	        this.groupsNeedUpdate = false;
	    }
	    Geometry.prototype.applyMatrix = function (matrix) {
	        var normalMatrix = new Matrix3().getNormalMatrix(matrix);
	        for (var i = 0, il = this.vertices.length; i < il; i++) {
	            var vertex = this.vertices[i];
	            vertex.applyMatrix4(matrix);
	        }
	        for (var i = 0, il = this.faces.length; i < il; i++) {
	            var face = this.faces[i];
	            face.normal.applyMatrix3(normalMatrix).normalize();
	            for (var j = 0, jl = face.vertexNormals.length; j < jl; j++) {
	                face.vertexNormals[j].applyMatrix3(normalMatrix).normalize();
	            }
	        }
	        if (this.boundingBox !== null) {
	            this.computeBoundingBox();
	        }
	        if (this.boundingSphere !== null) {
	            this.computeBoundingSphere();
	        }
	        this.verticesNeedUpdate = true;
	        this.normalsNeedUpdate = true;
	    };
	    Geometry.prototype.rotateX = function (angle) {
	        var m1 = new Matrix4();
	        m1.makeRotationX(angle);
	        this.applyMatrix(m1);
	        return this;
	    };
	    ;
	    Geometry.prototype.rotateY = function (angle) {
	        var m1 = new Matrix4();
	        m1.makeRotationY(angle);
	        this.applyMatrix(m1);
	        return this;
	    };
	    ;
	    Geometry.prototype.rotateZ = function (angle) {
	        var m1 = new Matrix4();
	        m1.makeRotationZ(angle);
	        this.applyMatrix(m1);
	        return this;
	    };
	    ;
	    Geometry.prototype.translate = function (x, y, z) {
	        var m1 = new Matrix4();
	        m1.makeTranslation(x, y, z);
	        this.applyMatrix(m1);
	        return this;
	    };
	    ;
	    Geometry.prototype.scale = function (x, y, z) {
	        var m1 = new Matrix4();
	        m1.makeScale(x, y, z);
	        this.applyMatrix(m1);
	        return this;
	    };
	    ;
	    Geometry.prototype.lookAt = function (vector) {
	        var obj = new Object3D();
	        obj.lookAt(vector);
	        obj.updateMatrix();
	        this.applyMatrix(obj.matrix);
	    };
	    ;
	    Geometry.prototype.fromBufferGeometry = function (geometry) {
	        var scope = this;
	        var indices = geometry.index !== null ? geometry.index.array : undefined;
	        var attributes = geometry.attributes;
	        var vertices = attributes.position.array;
	        var normals = attributes.normal !== undefined ? attributes.normal.array : undefined;
	        var colors = attributes.color !== undefined ? attributes.color.array : undefined;
	        var uvs = attributes.uv !== undefined ? attributes.uv.array : undefined;
	        var uvs2 = attributes.uv2 !== undefined ? attributes.uv2.array : undefined;
	        if (uvs2 !== undefined)
	            this.faceVertexUvs[1] = [];
	        var tempNormals = [];
	        var tempUVs = [];
	        var tempUVs2 = [];
	        for (var i = 0, j = 0, k = 0; i < vertices.length; i += 3, j += 2, k += 4) {
	            scope.vertices.push(new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]));
	            if (normals !== undefined) {
	                tempNormals.push(new Vector3(normals[i], normals[i + 1], normals[i + 2]));
	            }
	            if (colors !== undefined) {
	                scope.colors.push(new Color(colors[i], colors[i + 1], colors[i + 2]));
	            }
	            if (uvs !== undefined) {
	                tempUVs.push(new Vector2(uvs[j], uvs[j + 1]));
	            }
	            if (uvs2 !== undefined) {
	                tempUVs2.push(new Vector2(uvs2[j], uvs2[j + 1]));
	            }
	        }
	        function addFace(a, b, c) {
	            var vertexNormals = normals !== undefined ? [tempNormals[a].clone(), tempNormals[b].clone(), tempNormals[c].clone()] : [];
	            var vertexColors = colors !== undefined ? [scope.colors[a].clone(), scope.colors[b].clone(), scope.colors[c].clone()] : [];
	            var face = new Face3(a, b, c, vertexNormals, vertexColors);
	            scope.faces.push(face);
	            if (uvs !== undefined) {
	                scope.faceVertexUvs[0].push([tempUVs[a].clone(), tempUVs[b].clone(), tempUVs[c].clone()]);
	            }
	            if (uvs2 !== undefined) {
	                scope.faceVertexUvs[1].push([tempUVs2[a].clone(), tempUVs2[b].clone(), tempUVs2[c].clone()]);
	            }
	        }
	        ;
	        if (indices !== undefined) {
	            var groups = geometry.groups;
	            if (groups.length > 0) {
	                for (var i = 0; i < groups.length; i++) {
	                    var group = groups[i];
	                    var start = group.start;
	                    var count = group.count;
	                    for (var j = start, jl = start + count; j < jl; j += 3) {
	                        addFace(indices[j], indices[j + 1], indices[j + 2]);
	                    }
	                }
	            }
	            else {
	                for (var i = 0; i < indices.length; i += 3) {
	                    addFace(indices[i], indices[i + 1], indices[i + 2]);
	                }
	            }
	        }
	        else {
	            for (var i = 0; i < vertices.length / 3; i += 3) {
	                addFace(i, i + 1, i + 2);
	            }
	        }
	        this.computeFaceNormals();
	        if (geometry.boundingBox !== null) {
	            this.boundingBox = geometry.boundingBox.clone();
	        }
	        if (geometry.boundingSphere !== null) {
	            this.boundingSphere = geometry.boundingSphere.clone();
	        }
	        return this;
	    };
	    Geometry.prototype.center = function () {
	        this.computeBoundingBox();
	        var offset = this.boundingBox.center().negate();
	        this.translate(offset.x, offset.y, offset.z);
	        return offset;
	    };
	    Geometry.prototype.normalize = function () {
	        this.computeBoundingSphere();
	        var center = this.boundingSphere.center;
	        var radius = this.boundingSphere.radius;
	        var s = radius === 0 ? 1 : 1.0 / radius;
	        var matrix = new Matrix4();
	        matrix.set(s, 0, 0, -s * center.x, 0, s, 0, -s * center.y, 0, 0, s, -s * center.z, 0, 0, 0, 1);
	        this.applyMatrix(matrix);
	        return this;
	    };
	    Geometry.prototype.computeFaceNormals = function () {
	        var cb = new Vector3(), ab = new Vector3();
	        for (var f = 0, fl = this.faces.length; f < fl; f++) {
	            var face = this.faces[f];
	            var vA = this.vertices[face.a];
	            var vB = this.vertices[face.b];
	            var vC = this.vertices[face.c];
	            cb.subVectors(vC, vB);
	            ab.subVectors(vA, vB);
	            cb.cross(ab);
	            cb.normalize();
	            face.normal.copy(cb);
	        }
	    };
	    Geometry.prototype.computeVertexNormals = function (areaWeighted) {
	        var v, vl, f, fl, face, vertices;
	        vertices = new Array(this.vertices.length);
	        for (v = 0, vl = this.vertices.length; v < vl; v++) {
	            vertices[v] = new Vector3();
	        }
	        if (areaWeighted) {
	            var vA, vB, vC;
	            var cb = new Vector3(), ab = new Vector3();
	            for (f = 0, fl = this.faces.length; f < fl; f++) {
	                face = this.faces[f];
	                vA = this.vertices[face.a];
	                vB = this.vertices[face.b];
	                vC = this.vertices[face.c];
	                cb.subVectors(vC, vB);
	                ab.subVectors(vA, vB);
	                cb.cross(ab);
	                vertices[face.a].add(cb);
	                vertices[face.b].add(cb);
	                vertices[face.c].add(cb);
	            }
	        }
	        else {
	            for (f = 0, fl = this.faces.length; f < fl; f++) {
	                face = this.faces[f];
	                vertices[face.a].add(face.normal);
	                vertices[face.b].add(face.normal);
	                vertices[face.c].add(face.normal);
	            }
	        }
	        for (v = 0, vl = this.vertices.length; v < vl; v++) {
	            vertices[v].normalize();
	        }
	        for (f = 0, fl = this.faces.length; f < fl; f++) {
	            face = this.faces[f];
	            var vertexNormals = face.vertexNormals;
	            if (vertexNormals.length === 3) {
	                vertexNormals[0].copy(vertices[face.a]);
	                vertexNormals[1].copy(vertices[face.b]);
	                vertexNormals[2].copy(vertices[face.c]);
	            }
	            else {
	                vertexNormals[0] = vertices[face.a].clone();
	                vertexNormals[1] = vertices[face.b].clone();
	                vertexNormals[2] = vertices[face.c].clone();
	            }
	        }
	    };
	    Geometry.prototype.computeMorphNormals = function () {
	        var i, il, f, fl, face;
	        for (f = 0, fl = this.faces.length; f < fl; f++) {
	            face = this.faces[f];
	            if (!face.__originalFaceNormal) {
	                face.__originalFaceNormal = face.normal.clone();
	            }
	            else {
	                face.__originalFaceNormal.copy(face.normal);
	            }
	            if (!face.__originalVertexNormals)
	                face.__originalVertexNormals = [];
	            for (i = 0, il = face.vertexNormals.length; i < il; i++) {
	                if (!face.__originalVertexNormals[i]) {
	                    face.__originalVertexNormals[i] = face.vertexNormals[i].clone();
	                }
	                else {
	                    face.__originalVertexNormals[i].copy(face.vertexNormals[i]);
	                }
	            }
	        }
	        var tmpGeo = new Geometry();
	        tmpGeo.faces = this.faces;
	        for (i = 0, il = this.morphTargets.length; i < il; i++) {
	            if (!this.morphNormals[i]) {
	                this.morphNormals[i] = {};
	                this.morphNormals[i].faceNormals = [];
	                this.morphNormals[i].vertexNormals = [];
	                var dstNormalsFace = this.morphNormals[i].faceNormals;
	                var dstNormalsVertex = this.morphNormals[i].vertexNormals;
	                var faceNormal, vertexNormals;
	                for (f = 0, fl = this.faces.length; f < fl; f++) {
	                    faceNormal = new Vector3();
	                    vertexNormals = { a: new Vector3(), b: new Vector3(), c: new Vector3() };
	                    dstNormalsFace.push(faceNormal);
	                    dstNormalsVertex.push(vertexNormals);
	                }
	            }
	            var morphNormals = this.morphNormals[i];
	            tmpGeo.vertices = this.morphTargets[i].vertices;
	            tmpGeo.computeFaceNormals();
	            tmpGeo.computeVertexNormals();
	            var faceNormal, vertexNormals;
	            for (f = 0, fl = this.faces.length; f < fl; f++) {
	                face = this.faces[f];
	                faceNormal = morphNormals.faceNormals[f];
	                vertexNormals = morphNormals.vertexNormals[f];
	                faceNormal.copy(face.normal);
	                vertexNormals.a.copy(face.vertexNormals[0]);
	                vertexNormals.b.copy(face.vertexNormals[1]);
	                vertexNormals.c.copy(face.vertexNormals[2]);
	            }
	        }
	        for (f = 0, fl = this.faces.length; f < fl; f++) {
	            face = this.faces[f];
	            face.normal = face.__originalFaceNormal;
	            face.vertexNormals = face.__originalVertexNormals;
	        }
	    };
	    Geometry.prototype.computeLineDistances = function () {
	        var d = 0;
	        var vertices = this.vertices;
	        for (var i = 0, il = vertices.length; i < il; i++) {
	            if (i > 0) {
	                d += vertices[i].distanceTo(vertices[i - 1]);
	            }
	            this.lineDistances[i] = d;
	        }
	    };
	    Geometry.prototype.computeBoundingBox = function () {
	        if (this.boundingBox === null) {
	            this.boundingBox = new Box3();
	        }
	        this.boundingBox.setFromPoints(this.vertices);
	    };
	    Geometry.prototype.computeBoundingSphere = function () {
	        if (this.boundingSphere === null) {
	            var Sphere = __webpack_require__(17);
	            this.boundingSphere = new Sphere();
	        }
	        this.boundingSphere.setFromPoints(this.vertices);
	    };
	    Geometry.prototype.merge = function (geometry, matrix, materialIndexOffset) {
	        if (geometry instanceof Geometry === false) {
	            console.error('THREE.Geometry.merge(): geometry not an instance of THREE.Geometry.', geometry);
	            return;
	        }
	        var normalMatrix, vertexOffset = this.vertices.length, vertices1 = this.vertices, vertices2 = geometry.vertices, faces1 = this.faces, faces2 = geometry.faces, uvs1 = this.faceVertexUvs[0], uvs2 = geometry.faceVertexUvs[0];
	        if (materialIndexOffset === undefined)
	            materialIndexOffset = 0;
	        if (matrix !== undefined) {
	            normalMatrix = new Matrix3().getNormalMatrix(matrix);
	        }
	        for (var i = 0, il = vertices2.length; i < il; i++) {
	            var vertex = vertices2[i];
	            var vertexCopy = vertex.clone();
	            if (matrix !== undefined)
	                vertexCopy.applyMatrix4(matrix);
	            vertices1.push(vertexCopy);
	        }
	        for (i = 0, il = faces2.length; i < il; i++) {
	            var face = faces2[i], faceCopy, normal, color, faceVertexNormals = face.vertexNormals, faceVertexColors = face.vertexColors;
	            faceCopy = new Face3(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset);
	            faceCopy.normal.copy(face.normal);
	            if (normalMatrix !== undefined) {
	                faceCopy.normal.applyMatrix3(normalMatrix).normalize();
	            }
	            for (var j = 0, jl = faceVertexNormals.length; j < jl; j++) {
	                normal = faceVertexNormals[j].clone();
	                if (normalMatrix !== undefined) {
	                    normal.applyMatrix3(normalMatrix).normalize();
	                }
	                faceCopy.vertexNormals.push(normal);
	            }
	            faceCopy.color.copy(face.color);
	            for (var j = 0, jl = faceVertexColors.length; j < jl; j++) {
	                color = faceVertexColors[j];
	                faceCopy.vertexColors.push(color.clone());
	            }
	            faceCopy.materialIndex = face.materialIndex + materialIndexOffset;
	            faces1.push(faceCopy);
	        }
	        for (i = 0, il = uvs2.length; i < il; i++) {
	            var uv = uvs2[i], uvCopy = [];
	            if (uv === undefined) {
	                continue;
	            }
	            for (var j = 0, jl = uv.length; j < jl; j++) {
	                uvCopy.push(uv[j].clone());
	            }
	            uvs1.push(uvCopy);
	        }
	    };
	    Geometry.prototype.mergeMesh = function (mesh) {
	        if (mesh instanceof Mesh === false) {
	            console.error('THREE.Geometry.mergeMesh(): mesh not an instance of THREE.Mesh.', mesh);
	            return;
	        }
	        mesh.matrixAutoUpdate && mesh.updateMatrix();
	        this.merge(mesh.geometry, mesh.matrix);
	    };
	    Geometry.prototype.mergeVertices = function () {
	        var verticesMap = {};
	        var unique = [], changes = [];
	        var v, key;
	        var precisionPoints = 4;
	        var precision = Math.pow(10, precisionPoints);
	        var i, il, face;
	        var indices, j, jl;
	        for (i = 0, il = this.vertices.length; i < il; i++) {
	            v = this.vertices[i];
	            key = Math.round(v.x * precision) + '_' + Math.round(v.y * precision) + '_' + Math.round(v.z * precision);
	            if (verticesMap[key] === undefined) {
	                verticesMap[key] = i;
	                unique.push(this.vertices[i]);
	                changes[i] = unique.length - 1;
	            }
	            else {
	                changes[i] = changes[verticesMap[key]];
	            }
	        }
	        var faceIndicesToRemove = [];
	        for (i = 0, il = this.faces.length; i < il; i++) {
	            face = this.faces[i];
	            face.a = changes[face.a];
	            face.b = changes[face.b];
	            face.c = changes[face.c];
	            indices = [face.a, face.b, face.c];
	            var dupIndex = -1;
	            for (var n = 0; n < 3; n++) {
	                if (indices[n] === indices[(n + 1) % 3]) {
	                    dupIndex = n;
	                    faceIndicesToRemove.push(i);
	                    break;
	                }
	            }
	        }
	        for (i = faceIndicesToRemove.length - 1; i >= 0; i--) {
	            var idx = faceIndicesToRemove[i];
	            this.faces.splice(idx, 1);
	            for (j = 0, jl = this.faceVertexUvs.length; j < jl; j++) {
	                this.faceVertexUvs[j].splice(idx, 1);
	            }
	        }
	        var diff = this.vertices.length - unique.length;
	        this.vertices = unique;
	        return diff;
	    };
	    Geometry.prototype.sortFacesByMaterialIndex = function () {
	        var faces = this.faces;
	        var length = faces.length;
	        for (var i = 0; i < length; i++) {
	            faces[i]._id = i;
	        }
	        function materialIndexSort(a, b) {
	            return a.materialIndex - b.materialIndex;
	        }
	        faces.sort(materialIndexSort);
	        var uvs1 = this.faceVertexUvs[0];
	        var uvs2 = this.faceVertexUvs[1];
	        var newUvs1, newUvs2;
	        if (uvs1 && uvs1.length === length)
	            newUvs1 = [];
	        if (uvs2 && uvs2.length === length)
	            newUvs2 = [];
	        for (var i = 0; i < length; i++) {
	            var id = faces[i]._id;
	            if (newUvs1)
	                newUvs1.push(uvs1[id]);
	            if (newUvs2)
	                newUvs2.push(uvs2[id]);
	        }
	        if (newUvs1)
	            this.faceVertexUvs[0] = newUvs1;
	        if (newUvs2)
	            this.faceVertexUvs[1] = newUvs2;
	    };
	    Geometry.prototype.toJSON = function () {
	        var data = {
	            metadata: {
	                version: 4.4,
	                type: 'Geometry',
	                generator: 'Geometry.toJSON'
	            }
	        };
	        data.uuid = this.uuid;
	        data.type = this.type;
	        if (this.name !== '')
	            data.name = this.name;
	        if (this.parameters !== undefined) {
	            var parameters = this.parameters;
	            for (var key in parameters) {
	                if (parameters[key] !== undefined)
	                    data[key] = parameters[key];
	            }
	            return data;
	        }
	        var vertices = [];
	        for (var i = 0; i < this.vertices.length; i++) {
	            var vertex = this.vertices[i];
	            vertices.push(vertex.x, vertex.y, vertex.z);
	        }
	        var faces = [];
	        var normals = [];
	        var normalsHash = {};
	        var colors = [];
	        var colorsHash = {};
	        var uvs = [];
	        var uvsHash = {};
	        for (var i = 0; i < this.faces.length; i++) {
	            var face = this.faces[i];
	            var hasMaterial = false;
	            var hasFaceUv = false;
	            var hasFaceVertexUv = this.faceVertexUvs[0][i] !== undefined;
	            var hasFaceNormal = face.normal.length() > 0;
	            var hasFaceVertexNormal = face.vertexNormals.length > 0;
	            var hasFaceColor = face.color.r !== 1 || face.color.g !== 1 || face.color.b !== 1;
	            var hasFaceVertexColor = face.vertexColors.length > 0;
	            var faceType = 0;
	            faceType = setBit(faceType, 0, 0);
	            faceType = setBit(faceType, 1, hasMaterial);
	            faceType = setBit(faceType, 2, hasFaceUv);
	            faceType = setBit(faceType, 3, hasFaceVertexUv);
	            faceType = setBit(faceType, 4, hasFaceNormal);
	            faceType = setBit(faceType, 5, hasFaceVertexNormal);
	            faceType = setBit(faceType, 6, hasFaceColor);
	            faceType = setBit(faceType, 7, hasFaceVertexColor);
	            faces.push(faceType);
	            faces.push(face.a, face.b, face.c);
	            if (hasFaceVertexUv) {
	                var faceVertexUvs = this.faceVertexUvs[0][i];
	                faces.push(getUvIndex(faceVertexUvs[0]), getUvIndex(faceVertexUvs[1]), getUvIndex(faceVertexUvs[2]));
	            }
	            if (hasFaceNormal) {
	                faces.push(getNormalIndex(face.normal));
	            }
	            if (hasFaceVertexNormal) {
	                var vertexNormals = face.vertexNormals;
	                faces.push(getNormalIndex(vertexNormals[0]), getNormalIndex(vertexNormals[1]), getNormalIndex(vertexNormals[2]));
	            }
	            if (hasFaceColor) {
	                faces.push(getColorIndex(face.color));
	            }
	            if (hasFaceVertexColor) {
	                var vertexColors = face.vertexColors;
	                faces.push(getColorIndex(vertexColors[0]), getColorIndex(vertexColors[1]), getColorIndex(vertexColors[2]));
	            }
	        }
	        function setBit(value, position, enabled) {
	            return enabled ? value | (1 << position) : value & (~(1 << position));
	        }
	        function getNormalIndex(normal) {
	            var hash = normal.x.toString() + normal.y.toString() + normal.z.toString();
	            if (normalsHash[hash] !== undefined) {
	                return normalsHash[hash];
	            }
	            normalsHash[hash] = normals.length / 3;
	            normals.push(normal.x, normal.y, normal.z);
	            return normalsHash[hash];
	        }
	        function getColorIndex(color) {
	            var hash = color.r.toString() + color.g.toString() + color.b.toString();
	            if (colorsHash[hash] !== undefined) {
	                return colorsHash[hash];
	            }
	            colorsHash[hash] = colors.length;
	            colors.push(color.getHex());
	            return colorsHash[hash];
	        }
	        function getUvIndex(uv) {
	            var hash = uv.x.toString() + uv.y.toString();
	            if (uvsHash[hash] !== undefined) {
	                return uvsHash[hash];
	            }
	            uvsHash[hash] = uvs.length / 2;
	            uvs.push(uv.x, uv.y);
	            return uvsHash[hash];
	        }
	        data.data = {};
	        data.data.vertices = vertices;
	        data.data.normals = normals;
	        if (colors.length > 0)
	            data.data.colors = colors;
	        if (uvs.length > 0)
	            data.data.uvs = [uvs];
	        data.data.faces = faces;
	        return data;
	    };
	    Geometry.prototype.clone = function () {
	    };
	    Geometry.prototype.copy = function (source) {
	        this.vertices = [];
	        this.faces = [];
	        this.faceVertexUvs = [[]];
	        var vertices = source.vertices;
	        for (var i = 0, il = vertices.length; i < il; i++) {
	            this.vertices.push(vertices[i].clone());
	        }
	        var faces = source.faces;
	        for (var i = 0, il = faces.length; i < il; i++) {
	            this.faces.push(faces[i].clone());
	        }
	        for (var i = 0, il = source.faceVertexUvs.length; i < il; i++) {
	            var faceVertexUvs = source.faceVertexUvs[i];
	            if (this.faceVertexUvs[i] === undefined) {
	                this.faceVertexUvs[i] = [];
	            }
	            for (var j = 0, jl = faceVertexUvs.length; j < jl; j++) {
	                var uvs = faceVertexUvs[j], uvsCopy = [];
	                for (var k = 0, kl = uvs.length; k < kl; k++) {
	                    var uv = uvs[k];
	                    uvsCopy.push(uv.clone());
	                }
	                this.faceVertexUvs[i].push(uvsCopy);
	            }
	        }
	        return this;
	    };
	    Geometry.prototype.dispose = function () {
	        this.dispatchEvent({ type: 'dispose' });
	    };
	    Geometry.IdCount = 0;
	    return Geometry;
	})(EventDispatcher);
	module.exports = Geometry;
	//# sourceMappingURL=Geometry.js.map

/***/ },
/* 21 */
/***/ function(module, exports) {

	var Vector2 = (function () {
	    function Vector2(x, y) {
	        if (x === void 0) { x = 0; }
	        if (y === void 0) { y = 0; }
	        this.x = x;
	        this.y = y;
	    }
	    Object.defineProperty(Vector2.prototype, "width", {
	        get: function () {
	            return this.x;
	        },
	        set: function (value) {
	            this.x = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Vector2.prototype, "height", {
	        get: function () {
	            return this.y;
	        },
	        set: function (value) {
	            this.y = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Vector2.prototype.set = function (x, y) {
	        this.x = x;
	        this.y = y;
	        return this;
	    };
	    Vector2.prototype.setX = function (x) {
	        this.x = x;
	        return this;
	    };
	    Vector2.prototype.setY = function (y) {
	        this.y = y;
	        return this;
	    };
	    Vector2.prototype.setComponent = function (index, value) {
	        switch (index) {
	            case 0:
	                this.x = value;
	                break;
	            case 1:
	                this.y = value;
	                break;
	            default: throw new Error('index is out of range: ' + index);
	        }
	    };
	    Vector2.prototype.getComponent = function (index) {
	        switch (index) {
	            case 0: return this.x;
	            case 1: return this.y;
	            default: throw new Error('index is out of range: ' + index);
	        }
	    };
	    Vector2.prototype.clone = function () {
	        return new Vector2(this.x, this.y);
	    };
	    Vector2.prototype.copy = function (v) {
	        this.x = v.x;
	        this.y = v.y;
	        return this;
	    };
	    Vector2.prototype.add = function (v) {
	        this.x += v.x;
	        this.y += v.y;
	        return this;
	    };
	    Vector2.prototype.addScalar = function (s) {
	        this.x += s;
	        this.y += s;
	        return this;
	    };
	    Vector2.prototype.addVectors = function (a, b) {
	        this.x = a.x + b.x;
	        this.y = a.y + b.y;
	        return this;
	    };
	    Vector2.prototype.addScaledVector = function (v, s) {
	        this.x += v.x * s;
	        this.y += v.y * s;
	        return this;
	    };
	    Vector2.prototype.sub = function (v) {
	        this.x -= v.x;
	        this.y -= v.y;
	        return this;
	    };
	    Vector2.prototype.subScalar = function (s) {
	        this.x -= s;
	        this.y -= s;
	        return this;
	    };
	    Vector2.prototype.subVectors = function (a, b) {
	        this.x = a.x - b.x;
	        this.y = a.y - b.y;
	        return this;
	    };
	    Vector2.prototype.multiply = function (v) {
	        this.x *= v.x;
	        this.y *= v.x;
	        return this;
	    };
	    Vector2.prototype.multiplyScalar = function (scalar) {
	        if (isFinite(scalar)) {
	            this.x *= scalar;
	            this.y *= scalar;
	        }
	        else {
	            this.x = 0;
	            this.y = 0;
	        }
	        return this;
	    };
	    Vector2.prototype.divide = function (v) {
	        this.x /= v.x;
	        this.y /= v.y;
	        return this;
	    };
	    Vector2.prototype.divideScalar = function (scalar) {
	        return this.multiplyScalar(1 / scalar);
	    };
	    Vector2.prototype.min = function (v) {
	        this.x = Math.min(this.x, v.x);
	        this.y = Math.min(this.y, v.y);
	        return this;
	    };
	    Vector2.prototype.max = function (v) {
	        this.x = Math.max(this.x, v.x);
	        this.y = Math.max(this.y, v.y);
	        return this;
	    };
	    Vector2.prototype.clamp = function (min, max) {
	        this.x = Math.max(min.x, Math.min(max.x, this.x));
	        this.y = Math.max(min.y, Math.min(max.y, this.y));
	        return this;
	    };
	    Vector2.prototype.clampScalar = function (minVal, maxVal) {
	        var min = new Vector2();
	        var max = new Vector2();
	        min.set(minVal, minVal);
	        max.set(maxVal, maxVal);
	        return this.clamp(min, max);
	    };
	    Vector2.prototype.clampLength = function (min, max) {
	        var length = this.length();
	        this.multiplyScalar(Math.max(min, Math.min(max, length)) / length);
	        return this;
	    };
	    Vector2.prototype.floor = function () {
	        this.x = Math.floor(this.x);
	        this.y = Math.floor(this.y);
	        return this;
	    };
	    Vector2.prototype.ceil = function () {
	        this.x = Math.ceil(this.x);
	        this.y = Math.ceil(this.y);
	        return this;
	    };
	    Vector2.prototype.round = function () {
	        this.x = Math.round(this.x);
	        this.y = Math.round(this.y);
	        return this;
	    };
	    Vector2.prototype.roundToZero = function () {
	        this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
	        this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);
	        return this;
	    };
	    Vector2.prototype.negate = function () {
	        this.x = -this.x;
	        this.y = -this.y;
	        return this;
	    };
	    Vector2.prototype.dot = function (v) {
	        return this.x * v.x + this.y * v.y;
	    };
	    Vector2.prototype.lengthSq = function () {
	        return this.x * this.x + this.y * this.y;
	    };
	    Vector2.prototype.length = function () {
	        return Math.sqrt(this.x * this.x + this.y * this.y);
	    };
	    Vector2.prototype.lengthManhattan = function () {
	        return Math.abs(this.x) + Math.abs(this.y);
	    };
	    Vector2.prototype.normalize = function () {
	        return this.divideScalar(this.length());
	    };
	    Vector2.prototype.distanceTo = function (v) {
	        return Math.sqrt(this.distanceToSquared(v));
	    };
	    Vector2.prototype.distanceToSquared = function (v) {
	        var dx = this.x - v.x, dy = this.y - v.y;
	        return dx * dx + dy * dy;
	    };
	    Vector2.prototype.setLength = function (length) {
	        return this.multiplyScalar(length / this.length());
	    };
	    Vector2.prototype.lerp = function (v, alpha) {
	        this.x += (v.x - this.x) * alpha;
	        this.y += (v.y - this.y) * alpha;
	        return this;
	    };
	    Vector2.prototype.lerpVectors = function (v1, v2, alpha) {
	        this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
	        return this;
	    };
	    Vector2.prototype.equals = function (v) {
	        return ((v.x === this.x) && (v.y === this.y));
	    };
	    Vector2.prototype.fromArray = function (array, offset) {
	        if (offset === void 0) { offset = 0; }
	        this.x = array[offset];
	        this.y = array[offset + 1];
	        return this;
	    };
	    Vector2.prototype.toArray = function (array, offset) {
	        if (array === void 0) { array = []; }
	        if (offset === void 0) { offset = 0; }
	        array[offset] = this.x;
	        array[offset + 1] = this.y;
	        return array;
	    };
	    Vector2.prototype.fromAttribute = function (attribute, index, offset) {
	        if (offset === void 0) { offset = 0; }
	        index = index * attribute.itemSize + offset;
	        this.x = attribute.array[index];
	        this.y = attribute.array[index + 1];
	        return this;
	    };
	    Vector2.prototype.rotateAround = function (center, angle) {
	        var c = Math.cos(angle), s = Math.sin(angle);
	        var x = this.x - center.x;
	        var y = this.y - center.y;
	        this.x = x * c - y * s + center.x;
	        this.y = x * s + y * c + center.y;
	        return this;
	    };
	    return Vector2;
	})();
	module.exports = Vector2;
	//# sourceMappingURL=Vector2.js.map

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var Vector3 = __webpack_require__(4);
	var Color = __webpack_require__(14);
	var Face3 = (function () {
	    function Face3(a, b, c, normal, color, materialIndex) {
	        this.a = a;
	        this.b = b;
	        this.c = c;
	        this.normal = normal instanceof Vector3 ? normal : new Vector3();
	        this.vertexNormals = Array.isArray(normal) ? normal : [];
	        this.color = color instanceof Color ? color : new Color();
	        this.vertexColors = Array.isArray(color) ? color : [];
	        this.materialIndex = materialIndex !== undefined ? materialIndex : 0;
	    }
	    Face3.prototype.clone = function () {
	    };
	    Face3.prototype.copy = function (source) {
	        this.a = source.a;
	        this.b = source.b;
	        this.c = source.c;
	        this.normal.copy(source.normal);
	        this.color.copy(source.color);
	        this.materialIndex = source.materialIndex;
	        for (var i = 0, il = source.vertexNormals.length; i < il; i++) {
	            this.vertexNormals[i] = source.vertexNormals[i].clone();
	        }
	        for (var i = 0, il = source.vertexColors.length; i < il; i++) {
	            this.vertexColors[i] = source.vertexColors[i].clone();
	        }
	        return this;
	    };
	    return Face3;
	})();
	module.exports = Face3;
	//# sourceMappingURL=Face3.js.map

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Object3D = __webpack_require__(2);
	var Geometry = __webpack_require__(20);
	var MeshBasicMaterial = __webpack_require__(24);
	var Mesh = (function (_super) {
	    __extends(Mesh, _super);
	    function Mesh(geometry, material) {
	        _super.call(this);
	        this.morphTargetBase = -1;
	        this.morphTargetDictionary = {};
	        this.type = 'Mesh';
	        this.geometry = geometry !== undefined ? geometry : new Geometry();
	        this.material = material !== undefined ? material : new MeshBasicMaterial({ color: Math.random() * 0xffffff });
	        this.updateMorphTargets();
	    }
	    Mesh.prototype.updateMorphTargets = function () {
	        if (this.geometry.morphTargets !== undefined && this.geometry.morphTargets.length > 0) {
	            this.morphTargetBase = -1;
	            this.morphTargetInfluences = [];
	            this.morphTargetDictionary = {};
	            for (var m = 0, ml = this.geometry.morphTargets.length; m < ml; m++) {
	                this.morphTargetInfluences.push(0);
	                this.morphTargetDictionary[this.geometry.morphTargets[m].name] = m;
	            }
	        }
	    };
	    Mesh.prototype.getMorphTargetIndexByName = function (name) {
	        if (this.morphTargetDictionary[name] !== undefined) {
	            return this.morphTargetDictionary[name];
	        }
	        console.warn('THREE.Mesh.getMorphTargetIndexByName: morph target ' + name + ' does not exist. Returning 0.');
	        return 0;
	    };
	    return Mesh;
	})(Object3D);
	module.exports = Mesh;
	//# sourceMappingURL=Mesh.js.map

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Material = __webpack_require__(25);
	var Color = __webpack_require__(14);
	var ColorsType = __webpack_require__(33);
	var ShadingType = __webpack_require__(32);
	var TextureOperation = __webpack_require__(34);
	var MeshBasicMaterial = (function (_super) {
	    __extends(MeshBasicMaterial, _super);
	    function MeshBasicMaterial(parameters) {
	        _super.call(this);
	        this.type = 'MeshBasicMaterial';
	        this.color = new Color(0xffffff);
	        this.map = null;
	        this.aoMap = null;
	        this.aoMapIntensity = 1.0;
	        this.specularMap = null;
	        this.alphaMap = null;
	        this.envMap = null;
	        this.combine = TextureOperation.MultiplyOperation;
	        this.reflectivity = 1;
	        this.refractionRatio = 0.98;
	        this.fog = true;
	        this.shading = ShadingType.SmoothShading;
	        this.wireframe = false;
	        this.wireframeLinewidth = 1;
	        this.wireframeLinecap = 'round';
	        this.wireframeLinejoin = 'round';
	        this.vertexColors = ColorsType.NoColors;
	        this.skinning = false;
	        this.morphTargets = false;
	        this.setValues(parameters);
	    }
	    MeshBasicMaterial.prototype.copy = function (source) {
	        _super.prototype.copy.call(this, source);
	        this.color.copy(source.color);
	        this.map = source.map;
	        this.aoMap = source.aoMap;
	        this.aoMapIntensity = source.aoMapIntensity;
	        this.specularMap = source.specularMap;
	        this.alphaMap = source.alphaMap;
	        this.envMap = source.envMap;
	        this.combine = source.combine;
	        this.reflectivity = source.reflectivity;
	        this.refractionRatio = source.refractionRatio;
	        this.fog = source.fog;
	        this.shading = source.shading;
	        this.wireframe = source.wireframe;
	        this.wireframeLinewidth = source.wireframeLinewidth;
	        this.wireframeLinecap = source.wireframeLinecap;
	        this.wireframeLinejoin = source.wireframeLinejoin;
	        this.vertexColors = source.vertexColors;
	        this.skinning = source.skinning;
	        this.morphTargets = source.morphTargets;
	        return this;
	    };
	    ;
	    return MeshBasicMaterial;
	})(Material);
	module.exports = MeshBasicMaterial;
	//# sourceMappingURL=MeshBasicMaterial.js.map

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var MathUtil = __webpack_require__(3);
	var ShadingSideType = __webpack_require__(26);
	var BlendingMode = __webpack_require__(27);
	var BlendingFactor = __webpack_require__(28);
	var BlendEquation = __webpack_require__(29);
	var DepthMode = __webpack_require__(30);
	var Color = __webpack_require__(14);
	var Texture = __webpack_require__(31);
	var Vector3 = __webpack_require__(4);
	var ShadingType = __webpack_require__(32);
	var ColorsType = __webpack_require__(33);
	var EventDispatcher = __webpack_require__(9);
	var Material = (function (_super) {
	    __extends(Material, _super);
	    function Material() {
	        _super.apply(this, arguments);
	        this.uuid = MathUtil.generateUUID();
	        this.name = '';
	        this.type = 'Material';
	        this.side = ShadingSideType.FrontSide;
	        this.opacity = 1;
	        this.transparent = false;
	        this.blending = BlendingMode.NormalBlending;
	        this.blendSrc = BlendingFactor.SrcAlphaFactor;
	        this.blendDst = BlendingFactor.OneMinusSrcAlphaFactor;
	        this.blendEquation = BlendEquation.AddEquation;
	        this.blendSrcAlpha = null;
	        this.blendDstAlpha = null;
	        this.blendEquationAlpha = null;
	        this.depthFunc = DepthMode.LessEqualDepth;
	        this.depthTest = true;
	        this.depthWrite = true;
	        this.colorWrite = true;
	        this.precision = null;
	        this.polygonOffset = false;
	        this.polygonOffsetFactor = 0;
	        this.polygonOffsetUnits = 0;
	        this.alphaTest = 0;
	        this.overdraw = 0;
	        this.visible = true;
	        this._needsUpdate = true;
	    }
	    Object.defineProperty(Material.prototype, "needsUpdate", {
	        get: function () {
	            return this._needsUpdate;
	        },
	        set: function (value) {
	            if (value === true)
	                this.update();
	            this._needsUpdate = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Material.prototype.setValues = function (values) {
	        if (values === undefined)
	            return;
	        for (var key in values) {
	            var newValue = values[key];
	            if (newValue === undefined) {
	                console.warn("THREE.Material: '" + key + "' parameter is undefined.");
	                continue;
	            }
	            var currentValue = this[key];
	            if (currentValue === undefined) {
	                console.warn("THREE." + this.type + ": '" + key + "' is not a property of this material.");
	                continue;
	            }
	            if (currentValue instanceof Color) {
	                currentValue.set(newValue);
	            }
	            else if (currentValue instanceof Vector3 && newValue instanceof Vector3) {
	                currentValue.copy(newValue);
	            }
	            else if (key === 'overdraw') {
	                this[key] = Number(newValue);
	            }
	            else {
	                this[key] = newValue;
	            }
	        }
	    };
	    Material.prototype.toJSON = function (meta) {
	        var data = {
	            metadata: {
	                version: 4.4,
	                type: 'Material',
	                generator: 'Material.toJSON'
	            }
	        };
	        data.uuid = this.uuid;
	        data.type = this.type;
	        if (this.name !== '')
	            data.name = this.name;
	        if (this.color instanceof Color)
	            data.color = this.color.getHex();
	        if (this.emissive instanceof Color)
	            data.emissive = this.emissive.getHex();
	        if (this.specular instanceof Color)
	            data.specular = this.specular.getHex();
	        if (this.shininess !== undefined)
	            data.shininess = this.shininess;
	        if (this.map instanceof Texture)
	            data.map = this.map.toJSON(meta).uuid;
	        if (this.alphaMap instanceof Texture)
	            data.alphaMap = this.alphaMap.toJSON(meta).uuid;
	        if (this.lightMap instanceof Texture)
	            data.lightMap = this.lightMap.toJSON(meta).uuid;
	        if (this.bumpMap instanceof Texture) {
	            data.bumpMap = this.bumpMap.toJSON(meta).uuid;
	            data.bumpScale = this.bumpScale;
	        }
	        if (this.normalMap instanceof Texture) {
	            data.normalMap = this.normalMap.toJSON(meta).uuid;
	            data.normalScale = this.normalScale;
	        }
	        if (this.displacementMap instanceof Texture) {
	            data.displacementMap = this.displacementMap.toJSON(meta).uuid;
	            data.displacementScale = this.displacementScale;
	            data.displacementBias = this.displacementBias;
	        }
	        if (this.specularMap instanceof Texture)
	            data.specularMap = this.specularMap.toJSON(meta).uuid;
	        if (this.envMap instanceof Texture) {
	            data.envMap = this.envMap.toJSON(meta).uuid;
	            data.reflectivity = this.reflectivity;
	        }
	        if (this.size !== undefined)
	            data.size = this.size;
	        if (this.sizeAttenuation !== undefined)
	            data.sizeAttenuation = this.sizeAttenuation;
	        if (this.vertexColors !== undefined && this.vertexColors !== ColorsType.NoColors)
	            data.vertexColors = this.vertexColors;
	        if (this.shading !== undefined && this.shading !== ShadingType.SmoothShading)
	            data.shading = this.shading;
	        if (this.blending !== undefined && this.blending !== BlendingMode.NormalBlending)
	            data.blending = this.blending;
	        if (this.side !== undefined && this.side !== ShadingSideType.FrontSide)
	            data.side = this.side;
	        if (this.opacity < 1)
	            data.opacity = this.opacity;
	        if (this.transparent === true)
	            data.transparent = this.transparent;
	        if (this.alphaTest > 0)
	            data.alphaTest = this.alphaTest;
	        if (this.wireframe === true)
	            data.wireframe = this.wireframe;
	        if (this.wireframeLinewidth > 1)
	            data.wireframeLinewidth = this.wireframeLinewidth;
	        return data;
	    };
	    Material.prototype.clone = function () {
	    };
	    Material.prototype.copy = function (source) {
	        this.name = source.name;
	        this.side = source.side;
	        this.opacity = source.opacity;
	        this.transparent = source.transparent;
	        this.blending = source.blending;
	        this.blendSrc = source.blendSrc;
	        this.blendDst = source.blendDst;
	        this.blendEquation = source.blendEquation;
	        this.blendSrcAlpha = source.blendSrcAlpha;
	        this.blendDstAlpha = source.blendDstAlpha;
	        this.blendEquationAlpha = source.blendEquationAlpha;
	        this.depthFunc = source.depthFunc;
	        this.depthTest = source.depthTest;
	        this.depthWrite = source.depthWrite;
	        this.precision = source.precision;
	        this.polygonOffset = source.polygonOffset;
	        this.polygonOffsetFactor = source.polygonOffsetFactor;
	        this.polygonOffsetUnits = source.polygonOffsetUnits;
	        this.alphaTest = source.alphaTest;
	        this.overdraw = source.overdraw;
	        this.visible = source.visible;
	        return this;
	    };
	    Material.prototype.update = function () {
	        this.dispatchEvent({ type: 'update' });
	    };
	    Material.prototype.dispose = function () {
	        this.dispatchEvent({ type: 'dispose' });
	    };
	    Material.IdCount = 0;
	    return Material;
	})(EventDispatcher);
	module.exports = Material;
	//# sourceMappingURL=Material.js.map

/***/ },
/* 26 */
/***/ function(module, exports) {

	var ShadingSideType;
	(function (ShadingSideType) {
	    ShadingSideType[ShadingSideType["FrontSide"] = 0] = "FrontSide";
	    ShadingSideType[ShadingSideType["BackSide"] = 1] = "BackSide";
	    ShadingSideType[ShadingSideType["DoubleSide"] = 2] = "DoubleSide";
	})(ShadingSideType || (ShadingSideType = {}));
	module.exports = ShadingSideType;
	//# sourceMappingURL=ShadingSideType.js.map

/***/ },
/* 27 */
/***/ function(module, exports) {

	var BlendingMode;
	(function (BlendingMode) {
	    BlendingMode[BlendingMode["NoBlending"] = 0] = "NoBlending";
	    BlendingMode[BlendingMode["NormalBlending"] = 1] = "NormalBlending";
	    BlendingMode[BlendingMode["AdditiveBlending"] = 2] = "AdditiveBlending";
	    BlendingMode[BlendingMode["SubtractiveBlending"] = 3] = "SubtractiveBlending";
	    BlendingMode[BlendingMode["MultiplyBlending"] = 4] = "MultiplyBlending";
	    BlendingMode[BlendingMode["CustomBlending"] = 5] = "CustomBlending";
	})(BlendingMode || (BlendingMode = {}));
	module.exports = BlendingMode;
	//# sourceMappingURL=BlendingMode.js.map

/***/ },
/* 28 */
/***/ function(module, exports) {

	var BlendingFactor;
	(function (BlendingFactor) {
	    BlendingFactor[BlendingFactor["ZeroFactor"] = 0] = "ZeroFactor";
	    BlendingFactor[BlendingFactor["OneFactor"] = 1] = "OneFactor";
	    BlendingFactor[BlendingFactor["SrcColorFactor"] = 2] = "SrcColorFactor";
	    BlendingFactor[BlendingFactor["OneMinusSrcColorFactor"] = 3] = "OneMinusSrcColorFactor";
	    BlendingFactor[BlendingFactor["SrcAlphaFactor"] = 4] = "SrcAlphaFactor";
	    BlendingFactor[BlendingFactor["OneMinusSrcAlphaFactor"] = 5] = "OneMinusSrcAlphaFactor";
	    BlendingFactor[BlendingFactor["DstAlphaFactor"] = 6] = "DstAlphaFactor";
	    BlendingFactor[BlendingFactor["OneMinusDstAlphaFactor"] = 7] = "OneMinusDstAlphaFactor";
	})(BlendingFactor || (BlendingFactor = {}));
	module.exports = BlendingFactor;
	//# sourceMappingURL=BlendingFactor.js.map

/***/ },
/* 29 */
/***/ function(module, exports) {

	var BlendEquation;
	(function (BlendEquation) {
	    BlendEquation[BlendEquation["AddEquation"] = 0] = "AddEquation";
	    BlendEquation[BlendEquation["SubtractEquation"] = 1] = "SubtractEquation";
	    BlendEquation[BlendEquation["ReverseSubtractEquation"] = 2] = "ReverseSubtractEquation";
	    BlendEquation[BlendEquation["MinEquation"] = 3] = "MinEquation";
	    BlendEquation[BlendEquation["MaxEquation"] = 4] = "MaxEquation";
	})(BlendEquation || (BlendEquation = {}));
	module.exports = BlendEquation;
	//# sourceMappingURL=BlendEquation.js.map

/***/ },
/* 30 */
/***/ function(module, exports) {

	var DepthMode;
	(function (DepthMode) {
	    DepthMode[DepthMode["NeverDepth"] = 0] = "NeverDepth";
	    DepthMode[DepthMode["AlwaysDepth"] = 1] = "AlwaysDepth";
	    DepthMode[DepthMode["LessDepth"] = 2] = "LessDepth";
	    DepthMode[DepthMode["LessEqualDepth"] = 3] = "LessEqualDepth";
	    DepthMode[DepthMode["EqualDepth"] = 4] = "EqualDepth";
	    DepthMode[DepthMode["GreaterEqualDepth"] = 5] = "GreaterEqualDepth";
	    DepthMode[DepthMode["GreaterDepth"] = 6] = "GreaterDepth";
	    DepthMode[DepthMode["NotEqualDepth"] = 7] = "NotEqualDepth";
	})(DepthMode || (DepthMode = {}));
	module.exports = DepthMode;
	//# sourceMappingURL=DepthMode.js.map

/***/ },
/* 31 */
/***/ function(module, exports) {

	var Texture = (function () {
	    function Texture(image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy) {
	    }
	    return Texture;
	})();
	module.exports = Texture;
	//# sourceMappingURL=Texture.js.map

/***/ },
/* 32 */
/***/ function(module, exports) {

	var ShadingType;
	(function (ShadingType) {
	    ShadingType[ShadingType["FlatShading"] = 0] = "FlatShading";
	    ShadingType[ShadingType["SmoothShading"] = 1] = "SmoothShading";
	})(ShadingType || (ShadingType = {}));
	module.exports = ShadingType;
	//# sourceMappingURL=ShadingType.js.map

/***/ },
/* 33 */
/***/ function(module, exports) {

	var ColorsType;
	(function (ColorsType) {
	    ColorsType[ColorsType["NoColors"] = 0] = "NoColors";
	    ColorsType[ColorsType["FaceColors"] = 1] = "FaceColors";
	    ColorsType[ColorsType["VertexColors"] = 2] = "VertexColors";
	})(ColorsType || (ColorsType = {}));
	module.exports = ColorsType;
	//# sourceMappingURL=ColorsType.js.map

/***/ },
/* 34 */
/***/ function(module, exports) {

	var TextureOperation;
	(function (TextureOperation) {
	    TextureOperation[TextureOperation["MultiplyOperation"] = 0] = "MultiplyOperation";
	    TextureOperation[TextureOperation["MixOperation"] = 1] = "MixOperation";
	    TextureOperation[TextureOperation["AddOperation"] = 2] = "AddOperation";
	})(TextureOperation || (TextureOperation = {}));
	module.exports = TextureOperation;
	//# sourceMappingURL=TextureOperation.js.map

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var MathUtil = __webpack_require__(3);
	var InterleavedBufferAttribute = (function () {
	    function InterleavedBufferAttribute(interleavedBuffer, itemSize, offset) {
	        this.itemSize = itemSize;
	        this.offset = offset;
	        this.uuid = MathUtil.generateUUID();
	        this.data = interleavedBuffer;
	    }
	    Object.defineProperty(InterleavedBufferAttribute.prototype, "count", {
	        get: function () {
	            return this.data.array.length / this.data.stride;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    InterleavedBufferAttribute.prototype.setX = function (index, x) {
	        this.data.array[index * this.data.stride + this.offset] = x;
	        return this;
	    };
	    InterleavedBufferAttribute.prototype.setY = function (index, y) {
	        this.data.array[index * this.data.stride + this.offset + 1] = y;
	        return this;
	    };
	    InterleavedBufferAttribute.prototype.setZ = function (index, z) {
	        this.data.array[index * this.data.stride + this.offset + 2] = z;
	        return this;
	    };
	    InterleavedBufferAttribute.prototype.setW = function (index, w) {
	        this.data.array[index * this.data.stride + this.offset + 3] = w;
	        return this;
	    };
	    InterleavedBufferAttribute.prototype.getX = function (index) {
	        return this.data.array[index * this.data.stride + this.offset];
	    };
	    InterleavedBufferAttribute.prototype.getY = function (index) {
	        return this.data.array[index * this.data.stride + this.offset + 1];
	    };
	    InterleavedBufferAttribute.prototype.getZ = function (index) {
	        return this.data.array[index * this.data.stride + this.offset + 2];
	    };
	    InterleavedBufferAttribute.prototype.getW = function (index) {
	        return this.data.array[index * this.data.stride + this.offset + 3];
	    };
	    InterleavedBufferAttribute.prototype.setXY = function (index, x, y) {
	        index = index * this.data.stride + this.offset;
	        this.data.array[index + 0] = x;
	        this.data.array[index + 1] = y;
	        return this;
	    };
	    InterleavedBufferAttribute.prototype.setXYZ = function (index, x, y, z) {
	        index = index * this.data.stride + this.offset;
	        this.data.array[index + 0] = x;
	        this.data.array[index + 1] = y;
	        this.data.array[index + 2] = z;
	        return this;
	    };
	    InterleavedBufferAttribute.prototype.setXYZW = function (index, x, y, z, w) {
	        index = index * this.data.stride + this.offset;
	        this.data.array[index + 0] = x;
	        this.data.array[index + 1] = y;
	        this.data.array[index + 2] = z;
	        this.data.array[index + 3] = w;
	        return this;
	    };
	    return InterleavedBufferAttribute;
	})();
	module.exports = InterleavedBufferAttribute;
	//# sourceMappingURL=InterleavedBufferAttribute.js.map

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var Color = __webpack_require__(14);
	var Vector2 = __webpack_require__(21);
	var Vector3 = __webpack_require__(4);
	var Vector4 = __webpack_require__(37);
	var MathUtil = __webpack_require__(3);
	var BufferAttribute = (function () {
	    function BufferAttribute(array, itemSize) {
	        this.uuid = MathUtil.generateUUID();
	        this.array = array;
	        this.itemSize = itemSize;
	        this.dynamic = false;
	        this.updateRange = { offset: 0, count: -1 };
	        this.version = 0;
	    }
	    Object.defineProperty(BufferAttribute.prototype, "count", {
	        get: function () {
	            return this.array.length / this.itemSize;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(BufferAttribute.prototype, "needsUpdate", {
	        set: function (value) {
	            if (value === true)
	                this.version++;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    BufferAttribute.prototype.setDynamic = function (value) {
	        this.dynamic = value;
	        return this;
	    };
	    BufferAttribute.prototype.copy = function (source) {
	        this.array = new source.array.constructor(source.array);
	        this.itemSize = source.itemSize;
	        this.dynamic = source.dynamic;
	        return this;
	    };
	    BufferAttribute.prototype.copyAt = function (index1, attribute, index2) {
	        index1 *= this.itemSize;
	        index2 *= attribute.itemSize;
	        for (var i = 0, l = this.itemSize; i < l; i++) {
	            this.array[index1 + i] = attribute.array[index2 + i];
	        }
	        return this;
	    };
	    BufferAttribute.prototype.copyArray = function (array) {
	        this.array.set(array);
	        return this;
	    };
	    BufferAttribute.prototype.copyColorsArray = function (colors) {
	        var array = this.array, offset = 0;
	        for (var i = 0, l = colors.length; i < l; i++) {
	            var color = colors[i];
	            if (color === undefined) {
	                console.warn('THREE.BufferAttribute.copyColorsArray(): color is undefined', i);
	                color = new Color();
	            }
	            array[offset++] = color.r;
	            array[offset++] = color.g;
	            array[offset++] = color.b;
	        }
	        return this;
	    };
	    BufferAttribute.prototype.copyIndicesArray = function (indices) {
	        var array = this.array, offset = 0;
	        for (var i = 0, l = indices.length; i < l; i++) {
	            var index = indices[i];
	            array[offset++] = index.a;
	            array[offset++] = index.b;
	            array[offset++] = index.c;
	        }
	        return this;
	    };
	    BufferAttribute.prototype.copyVector2sArray = function (vectors) {
	        var array = this.array, offset = 0;
	        for (var i = 0, l = vectors.length; i < l; i++) {
	            var vector = vectors[i];
	            if (vector === undefined) {
	                console.warn('THREE.BufferAttribute.copyVector2sArray(): vector is undefined', i);
	                vector = new Vector2();
	            }
	            array[offset++] = vector.x;
	            array[offset++] = vector.y;
	        }
	        return this;
	    };
	    BufferAttribute.prototype.copyVector3sArray = function (vectors) {
	        var array = this.array, offset = 0;
	        for (var i = 0, l = vectors.length; i < l; i++) {
	            var vector = vectors[i];
	            if (vector === undefined) {
	                console.warn('THREE.BufferAttribute.copyVector3sArray(): vector is undefined', i);
	                vector = new Vector3();
	            }
	            array[offset++] = vector.x;
	            array[offset++] = vector.y;
	            array[offset++] = vector.z;
	        }
	        return this;
	    };
	    BufferAttribute.prototype.copyVector4sArray = function (vectors) {
	        var array = this.array, offset = 0;
	        for (var i = 0, l = vectors.length; i < l; i++) {
	            var vector = vectors[i];
	            if (vector === undefined) {
	                console.warn('THREE.BufferAttribute.copyVector4sArray(): vector is undefined', i);
	                vector = new Vector4();
	            }
	            array[offset++] = vector.x;
	            array[offset++] = vector.y;
	            array[offset++] = vector.z;
	            array[offset++] = vector.w;
	        }
	        return this;
	    };
	    BufferAttribute.prototype.set = function (value, offset) {
	        if (offset === undefined)
	            offset = 0;
	        this.array.set(value, offset);
	        return this;
	    };
	    BufferAttribute.prototype.getX = function (index) {
	        return this.array[index * this.itemSize];
	    };
	    BufferAttribute.prototype.setX = function (index, x) {
	        this.array[index * this.itemSize] = x;
	        return this;
	    };
	    BufferAttribute.prototype.getY = function (index) {
	        return this.array[index * this.itemSize + 1];
	    };
	    BufferAttribute.prototype.setY = function (index, y) {
	        this.array[index * this.itemSize + 1] = y;
	        return this;
	    };
	    BufferAttribute.prototype.getZ = function (index) {
	        return this.array[index * this.itemSize + 2];
	    };
	    BufferAttribute.prototype.setZ = function (index, z) {
	        this.array[index * this.itemSize + 2] = z;
	        return this;
	    };
	    BufferAttribute.prototype.getW = function (index) {
	        return this.array[index * this.itemSize + 3];
	    };
	    BufferAttribute.prototype.setW = function (index, w) {
	        this.array[index * this.itemSize + 3] = w;
	        return this;
	    };
	    BufferAttribute.prototype.setXY = function (index, x, y) {
	        index *= this.itemSize;
	        this.array[index + 0] = x;
	        this.array[index + 1] = y;
	        return this;
	    };
	    BufferAttribute.prototype.setXYZ = function (index, x, y, z) {
	        index *= this.itemSize;
	        this.array[index + 0] = x;
	        this.array[index + 1] = y;
	        this.array[index + 2] = z;
	        return this;
	    };
	    BufferAttribute.prototype.setXYZW = function (index, x, y, z, w) {
	        index *= this.itemSize;
	        this.array[index + 0] = x;
	        this.array[index + 1] = y;
	        this.array[index + 2] = z;
	        this.array[index + 3] = w;
	        return this;
	    };
	    BufferAttribute.prototype.clone = function () {
	        return new this.constructor().copy(this);
	    };
	    return BufferAttribute;
	})();
	module.exports = BufferAttribute;
	//# sourceMappingURL=BufferAttribute.js.map

/***/ },
/* 37 */
/***/ function(module, exports) {

	var Vector4 = (function () {
	    function Vector4(x, y, z, w) {
	        if (x === void 0) { x = 0; }
	        if (y === void 0) { y = 0; }
	        if (z === void 0) { z = 0; }
	        if (w === void 0) { w = 1; }
	        this.x = x;
	        this.y = y;
	        this.z = z;
	        this.w = w;
	    }
	    Vector4.prototype.set = function (x, y, z, w) {
	        this.x = x;
	        this.y = y;
	        this.z = z;
	        this.w = w;
	        return this;
	    };
	    Vector4.prototype.setX = function (x) {
	        this.x = x;
	        return this;
	    };
	    Vector4.prototype.setY = function (y) {
	        this.y = y;
	        return this;
	    };
	    Vector4.prototype.setZ = function (z) {
	        this.z = z;
	        return this;
	    };
	    Vector4.prototype.setW = function (w) {
	        this.w = w;
	    };
	    Vector4.prototype.setComponent = function (index, value) {
	        switch (index) {
	            case 0:
	                this.x = value;
	                break;
	            case 1:
	                this.y = value;
	                break;
	            case 2:
	                this.z = value;
	                break;
	            default: throw new Error('index is out of range: ' + index);
	        }
	    };
	    Vector4.prototype.getComponent = function (index) {
	        switch (index) {
	            case 0: return this.x;
	            case 1: return this.y;
	            case 2: return this.z;
	            case 3: return this.w;
	            default: throw new Error('index if out of range: ' + index);
	        }
	    };
	    Vector4.prototype.clone = function () {
	        return new Vector4(this.x, this.y, this.z, this.w);
	    };
	    Vector4.prototype.add = function (v) {
	        this.x += v.x;
	        this.y += v.y;
	        this.z += v.z;
	        this.w += v.w;
	        return this;
	    };
	    Vector4.prototype.addScalar = function (s) {
	        this.x += s;
	        this.y += s;
	        this.z += s;
	        this.w += s;
	        return this;
	    };
	    Vector4.prototype.addVectors = function (a, b) {
	        this.x = a.x + b.x;
	        this.y = a.y + b.y;
	        this.z = a.z + b.z;
	        this.w = a.w + b.w;
	        return this;
	    };
	    Vector4.prototype.addScaledVector = function (v, s) {
	        this.x += v.x * s;
	        this.y += v.y * s;
	        this.z += v.z * s;
	        this.w += v.w * s;
	        return this;
	    };
	    Vector4.prototype.sub = function (v) {
	        this.x -= v.x;
	        this.y -= v.y;
	        this.z -= v.z;
	        this.w -= v.w;
	        return this;
	    };
	    Vector4.prototype.subScalar = function (s) {
	        this.x -= s;
	        this.y -= s;
	        this.z -= s;
	        this.w -= s;
	        return this;
	    };
	    Vector4.prototype.subVectors = function (a, b) {
	        this.x = a.x - b.x;
	        this.y = a.y - b.y;
	        this.z = a.z - b.z;
	        this.w = a.w - b.w;
	        return this;
	    };
	    Vector4.prototype.multiplyScalar = function (scalar) {
	        if (isFinite(scalar)) {
	            this.x *= scalar;
	            this.y *= scalar;
	            this.z *= scalar;
	            this.w *= scalar;
	        }
	        else {
	            this.x = 0;
	            this.y = 0;
	            this.z = 0;
	            this.w = 0;
	        }
	        return this;
	    };
	    Vector4.prototype.applyMatrix4 = function (m) {
	        var x = this.x;
	        var y = this.y;
	        var z = this.z;
	        var w = this.w;
	        console.error('TODO');
	    };
	    Vector4.prototype.divideScalar = function (scalar) {
	        return this.multiplyScalar(1 / scalar);
	    };
	    Vector4.prototype.setAxisAngleFromQuaternion = function (q) {
	        console.error('TODO');
	    };
	    Vector4.prototype.setAxisAngleFromRotationMatrix = function (m) {
	        console.error('TODO');
	    };
	    Vector4.prototype.min = function (v) {
	        this.x = Math.min(this.x, v.x);
	        this.y = Math.min(this.x, v.y);
	        this.z = Math.min(this.z, v.z);
	        this.w = Math.min(this.w, v.w);
	        return this;
	    };
	    Vector4.prototype.max = function (v) {
	        this.x = Math.max(this.x, v.x);
	        this.y = Math.max(this.y, v.y);
	        this.z = Math.max(this.z, v.z);
	        this.w = Math.max(this.w, v.w);
	        return this;
	    };
	    Vector4.prototype.clamp = function (min, max) {
	        this.x = Math.max(min.x, Math.min(max.x, this.x));
	        this.y = Math.max(min.y, Math.min(max.y, this.y));
	        this.z = Math.max(min.z, Math.min(max.z, this.z));
	        this.w = Math.max(min.w, Math.min(max.w, this.w));
	        return this;
	    };
	    Vector4.prototype.clampScalar = function (minVal, maxVal) {
	        var min = new Vector4();
	        var max = new Vector4();
	        min.set(minVal, minVal, minVal, minVal);
	        max.set(maxVal, maxVal, maxVal, maxVal);
	        return this.clamp(min, max);
	    };
	    Vector4.prototype.floor = function () {
	        this.x = Math.floor(this.x);
	        this.y = Math.floor(this.y);
	        this.z = Math.floor(this.z);
	        this.w = Math.floor(this.w);
	        return this;
	    };
	    Vector4.prototype.ceil = function () {
	        this.x = Math.ceil(this.x);
	        this.y = Math.ceil(this.y);
	        this.z = Math.ceil(this.z);
	        this.w = Math.ceil(this.w);
	        return this;
	    };
	    Vector4.prototype.round = function () {
	        this.x = Math.round(this.x);
	        this.y = Math.round(this.y);
	        this.z = Math.round(this.z);
	        this.w = Math.round(this.w);
	        return this;
	    };
	    Vector4.prototype.roundToZero = function () {
	        this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
	        this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);
	        this.z = (this.z < 0) ? Math.ceil(this.z) : Math.floor(this.z);
	        this.w = (this.w < 0) ? Math.ceil(this.w) : Math.floor(this.w);
	        return this;
	    };
	    Vector4.prototype.negate = function () {
	        this.x = -this.x;
	        this.y = -this.y;
	        this.z = -this.z;
	        this.w = -this.w;
	        return this;
	    };
	    Vector4.prototype.dot = function (v) {
	        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
	    };
	    Vector4.prototype.length = function () {
	        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
	    };
	    Vector4.prototype.lengthManhattan = function () {
	        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
	    };
	    Vector4.prototype.normalize = function () {
	        return this.divideScalar(this.length());
	    };
	    Vector4.prototype.setLength = function () {
	        return this.multiplyScalar(length / this.length());
	    };
	    Vector4.prototype.lerp = function (v, alpha) {
	        this.x += (v.x - this.x) * alpha;
	        this.y += (v.y - this.y) * alpha;
	        this.z += (v.z - this.z) * alpha;
	        this.w += (v.w - this.w) * alpha;
	        return this;
	    };
	    Vector4.prototype.lerpVectors = function (v1, v2, alpha) {
	        this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
	        return this;
	    };
	    Vector4.prototype.equals = function (v) {
	        return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z) && (v.w === this.w));
	    };
	    Vector4.prototype.fromArray = function (array, offset) {
	        if (offset === void 0) { offset = 0; }
	        this.x = array[offset];
	        this.y = array[offset + 1];
	        this.z = array[offset + 2];
	        this.w = array[offset + 3];
	        return this;
	    };
	    Vector4.prototype.toArray = function (array, offset) {
	        if (array === void 0) { array = []; }
	        if (offset === void 0) { offset = 0; }
	        array[offset] = this.x;
	        array[offset + 1] = this.y;
	        array[offset + 2] = this.z;
	        array[offset + 3] = this.w;
	        return array;
	    };
	    Vector4.prototype.fromAttribute = function (attribute, index, offset) {
	        if (offset === void 0) { offset = 0; }
	        index = index * attribute.itemSize + offset;
	        this.x = attribute.array[index];
	        this.y = attribute.array[index + 1];
	        this.z = attribute.array[index + 2];
	        this.w = attribute.array[index + 3];
	        return this;
	    };
	    return Vector4;
	})();
	module.exports = Vector4;
	//# sourceMappingURL=Vector4.js.map

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var BufferAttribute = __webpack_require__(36);
	var Int8Attribute = (function (_super) {
	    __extends(Int8Attribute, _super);
	    function Int8Attribute(array, itemSize) {
	        _super.call(this, new Int8Array(array), itemSize);
	    }
	    ;
	    return Int8Attribute;
	})(BufferAttribute);
	exports.Int8Attribute = Int8Attribute;
	var Uint8Attribute = (function (_super) {
	    __extends(Uint8Attribute, _super);
	    function Uint8Attribute(array, itemSize) {
	        _super.call(this, new Uint8Array(array), itemSize);
	    }
	    ;
	    return Uint8Attribute;
	})(BufferAttribute);
	exports.Uint8Attribute = Uint8Attribute;
	var Uint8ClampedAttribute = (function (_super) {
	    __extends(Uint8ClampedAttribute, _super);
	    function Uint8ClampedAttribute(array, itemSize) {
	        _super.call(this, new Uint8ClampedArray(array), itemSize);
	    }
	    return Uint8ClampedAttribute;
	})(BufferAttribute);
	exports.Uint8ClampedAttribute = Uint8ClampedAttribute;
	var Int16Attribute = (function (_super) {
	    __extends(Int16Attribute, _super);
	    function Int16Attribute(array, itemSize) {
	        _super.call(this, new Int16Array(array), itemSize);
	    }
	    ;
	    return Int16Attribute;
	})(BufferAttribute);
	exports.Int16Attribute = Int16Attribute;
	var Uint16Attribute = (function (_super) {
	    __extends(Uint16Attribute, _super);
	    function Uint16Attribute(array, itemSize) {
	        _super.call(this, new Uint16Array(array), itemSize);
	    }
	    ;
	    return Uint16Attribute;
	})(BufferAttribute);
	exports.Uint16Attribute = Uint16Attribute;
	;
	var Int32Attribute = (function (_super) {
	    __extends(Int32Attribute, _super);
	    function Int32Attribute(array, itemSize) {
	        _super.call(this, new Int32Array(array), itemSize);
	    }
	    ;
	    return Int32Attribute;
	})(BufferAttribute);
	exports.Int32Attribute = Int32Attribute;
	;
	var Uint32Attribute = (function (_super) {
	    __extends(Uint32Attribute, _super);
	    function Uint32Attribute(array, itemSize) {
	        _super.call(this, new Uint32Array(array), itemSize);
	    }
	    ;
	    return Uint32Attribute;
	})(BufferAttribute);
	exports.Uint32Attribute = Uint32Attribute;
	;
	var Float32Attribute = (function (_super) {
	    __extends(Float32Attribute, _super);
	    function Float32Attribute(array, itemSize) {
	        _super.call(this, new Float32Array(array), itemSize);
	    }
	    ;
	    return Float32Attribute;
	})(BufferAttribute);
	exports.Float32Attribute = Float32Attribute;
	;
	var Float64Attribute = (function (_super) {
	    __extends(Float64Attribute, _super);
	    function Float64Attribute(array, itemSize) {
	        _super.call(this, new Float64Array(array), itemSize);
	    }
	    ;
	    return Float64Attribute;
	})(BufferAttribute);
	exports.Float64Attribute = Float64Attribute;
	;
	//# sourceMappingURL=TypeAttribute.js.map

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Object3D = __webpack_require__(2);
	var Points = (function (_super) {
	    __extends(Points, _super);
	    function Points() {
	        _super.apply(this, arguments);
	    }
	    return Points;
	})(Object3D);
	module.exports = Points;
	//# sourceMappingURL=Points.js.map

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Object3D = __webpack_require__(2);
	var Line = (function (_super) {
	    __extends(Line, _super);
	    function Line(geometry, material, mode) {
	        _super.call(this);
	    }
	    return Line;
	})(Object3D);
	module.exports = Line;
	//# sourceMappingURL=Line.js.map

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Geometry = __webpack_require__(20);
	var MathUtil = __webpack_require__(3);
	var Vector2 = __webpack_require__(21);
	var DirectGeometry = (function (_super) {
	    __extends(DirectGeometry, _super);
	    function DirectGeometry() {
	        _super.apply(this, arguments);
	        this.id = Geometry.IdCount++;
	        this.uuid = MathUtil.generateUUID();
	        this.name = '';
	        this.type = 'DirectGeometry';
	        this.indices = [];
	        this.vertices = [];
	        this.normals = [];
	        this.colors = [];
	        this.uvs = [];
	        this.uvs2 = [];
	        this.groups = [];
	        this.morphTargets = {};
	        this.skinWeights = [];
	        this.skinIndices = [];
	        this.boundingBox = null;
	        this.boundingSphere = null;
	        this.verticesNeedUpdate = false;
	        this.normalsNeedUpdate = false;
	        this.colorsNeedUpdate = false;
	        this.uvsNeedUpdate = false;
	        this.groupsNeedUpdate = false;
	    }
	    DirectGeometry.prototype.computeGroups = function (geometry) {
	        var group;
	        var groups = [];
	        var materialIndex;
	        var faces = geometry.faces;
	        for (var i = 0; i < faces.length; i++) {
	            var face = faces[i];
	            if (face.materialIndex !== materialIndex) {
	                materialIndex = face.materialIndex;
	                if (group !== undefined) {
	                    group.count = (i * 3) - group.start;
	                    groups.push(group);
	                }
	                group = {
	                    start: i * 3,
	                    materialIndex: materialIndex
	                };
	            }
	        }
	        if (group !== undefined) {
	            group.count = (i * 3) - group.start;
	            groups.push(group);
	        }
	        this.groups = groups;
	    };
	    DirectGeometry.prototype.fromGeometry = function (geometry) {
	        var faces = geometry.faces;
	        var vertices = geometry.vertices;
	        var faceVertexUvs = geometry.faceVertexUvs;
	        var hasFaceVertexUv = faceVertexUvs[0] && faceVertexUvs[0].length > 0;
	        var hasFaceVertexUv2 = faceVertexUvs[1] && faceVertexUvs[1].length > 0;
	        var morphTargets = geometry.morphTargets;
	        var morphTargetsLength = morphTargets.length;
	        if (morphTargetsLength > 0) {
	            var morphTargetsPosition = [];
	            for (var i = 0; i < morphTargetsLength; i++) {
	                morphTargetsPosition[i] = [];
	            }
	            this.morphTargets.position = morphTargetsPosition;
	        }
	        var morphNormals = geometry.morphNormals;
	        var morphNormalsLength = morphNormals.length;
	        if (morphNormalsLength > 0) {
	            var morphTargetsNormal = [];
	            for (var i = 0; i < morphNormalsLength; i++) {
	                morphTargetsNormal[i] = [];
	            }
	            this.morphTargets.normal = morphTargetsNormal;
	        }
	        var skinIndices = geometry.skinIndices;
	        var skinWeights = geometry.skinWeights;
	        var hasSkinIndices = skinIndices.length === vertices.length;
	        var hasSkinWeights = skinWeights.length === vertices.length;
	        for (var i = 0; i < faces.length; i++) {
	            var face = faces[i];
	            this.vertices.push(vertices[face.a], vertices[face.b], vertices[face.c]);
	            var vertexNormals = face.vertexNormals;
	            if (vertexNormals.length === 3) {
	                this.normals.push(vertexNormals[0], vertexNormals[1], vertexNormals[2]);
	            }
	            else {
	                var normal = face.normal;
	                this.normals.push(normal, normal, normal);
	            }
	            var vertexColors = face.vertexColors;
	            if (vertexColors.length === 3) {
	                this.colors.push(vertexColors[0], vertexColors[1], vertexColors[2]);
	            }
	            else {
	                var color = face.color;
	                this.colors.push(color, color, color);
	            }
	            if (hasFaceVertexUv === true) {
	                var vertexUvs = faceVertexUvs[0][i];
	                if (vertexUvs !== undefined) {
	                    this.uvs.push(vertexUvs[0], vertexUvs[1], vertexUvs[2]);
	                }
	                else {
	                    console.warn('THREE.DirectGeometry.fromGeometry(): Undefined vertexUv ', i);
	                    this.uvs.push(new Vector2(), new Vector2(), new Vector2());
	                }
	            }
	            if (hasFaceVertexUv2 === true) {
	                var vertexUvs = faceVertexUvs[1][i];
	                if (vertexUvs !== undefined) {
	                    this.uvs2.push(vertexUvs[0], vertexUvs[1], vertexUvs[2]);
	                }
	                else {
	                    console.warn('THREE.DirectGeometry.fromGeometry(): Undefined vertexUv2 ', i);
	                    this.uvs2.push(new Vector2(), new Vector2(), new Vector2());
	                }
	            }
	            for (var j = 0; j < morphTargetsLength; j++) {
	                var morphTarget = morphTargets[j].vertices;
	                morphTargetsPosition[j].push(morphTarget[face.a], morphTarget[face.b], morphTarget[face.c]);
	            }
	            for (var j = 0; j < morphNormalsLength; j++) {
	                var morphNormal = morphNormals[j].vertexNormals[i];
	                morphTargetsNormal[j].push(morphNormal.a, morphNormal.b, morphNormal.c);
	            }
	            if (hasSkinIndices) {
	                this.skinIndices.push(skinIndices[face.a], skinIndices[face.b], skinIndices[face.c]);
	            }
	            if (hasSkinWeights) {
	                this.skinWeights.push(skinWeights[face.a], skinWeights[face.b], skinWeights[face.c]);
	            }
	        }
	        this.computeGroups(geometry);
	        this.verticesNeedUpdate = geometry.verticesNeedUpdate;
	        this.normalsNeedUpdate = geometry.normalsNeedUpdate;
	        this.colorsNeedUpdate = geometry.colorsNeedUpdate;
	        this.uvsNeedUpdate = geometry.uvsNeedUpdate;
	        this.groupsNeedUpdate = geometry.groupsNeedUpdate;
	        return this;
	    };
	    DirectGeometry.prototype.dispose = function () {
	        this.dispatchEvent({ type: 'dispose' });
	    };
	    return DirectGeometry;
	})(Geometry);
	;
	module.exports = DirectGeometry;
	//# sourceMappingURL=DirectGeometry.js.map

/***/ },
/* 42 */
/***/ function(module, exports) {

	var extensions = {};
	var WebGLExtensions = (function () {
	    function WebGLExtensions(gl) {
	        this.gl = gl;
	    }
	    WebGLExtensions.prototype.get = function (name) {
	        if (extensions[name] !== undefined) {
	            return extensions[name];
	        }
	        var extension;
	        switch (name) {
	            case 'EXT_texture_filter_anisotropic':
	                extension = this.gl.getExtension('EXT_texture_filter_anisotropic') || this.gl.getExtension('MOZ_EXT_texture_filter_anisotropic') || this.gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
	                break;
	            case 'WEBGL_compressed_texture_s3tc':
	                extension = this.gl.getExtension('WEBGL_compressed_texture_s3tc') || this.gl.getExtension('MOZ_WEBGL_compressed_texture_s3tc') || this.gl.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc');
	                break;
	            case 'WEBGL_compressed_texture_pvrtc':
	                extension = this.gl.getExtension('WEBGL_compressed_texture_pvrtc') || this.gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');
	                break;
	            default:
	                extension = this.gl.getExtension(name);
	        }
	        if (extension === null) {
	            console.warn('THREE.WebGLRenderer: ' + name + ' extension not supported.');
	        }
	        extensions[name] = extension;
	        return extension;
	    };
	    return WebGLExtensions;
	})();
	module.exports = WebGLExtensions;
	//# sourceMappingURL=WebGLExtensions.js.map

/***/ },
/* 43 */
/***/ function(module, exports) {

	var WebGLCapabilities = (function () {
	    function WebGLCapabilities(gl, extensions, parameters) {
	        this.gl = gl;
	        this.extensions = extensions;
	        this.parameters = parameters;
	        this.precision = parameters.precision !== undefined ? parameters.precision : 'highp',
	            this.logarithmicDepthBuffer = parameters.logarithmicDepthBuffer !== undefined ? parameters.logarithmicDepthBuffer : false;
	        this.maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
	        this.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
	        this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
	        this.maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
	        this.maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
	        this.maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
	        this.maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS);
	        this.maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
	        this.vertexTextures = this.maxVertexTextures > 0;
	        this.floatFragmentTextures = !!extensions.get('OES_texture_float');
	        this.floatVertexTextures = this.vertexTextures && this.floatFragmentTextures;
	        var _maxPrecision = this.getMaxPrecision(this.precision);
	        if (_maxPrecision !== this.precision) {
	            console.warn('THREE.WebGLRenderer:', this.precision, 'not supported, using', _maxPrecision, 'instead.');
	            this.precision = _maxPrecision;
	        }
	        if (this.logarithmicDepthBuffer) {
	            this.logarithmicDepthBuffer = !!extensions.get('EXT_frag_depth');
	        }
	    }
	    WebGLCapabilities.prototype.getMaxPrecision = function (precision) {
	        var gl = this.gl;
	        if (precision === 'highp') {
	            if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision > 0 &&
	                gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0) {
	                return 'highp';
	            }
	            precision = 'mediump';
	        }
	        if (precision === 'mediump') {
	            if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).precision > 0 &&
	                gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0) {
	                return 'mediump';
	            }
	        }
	        return 'lowp';
	    };
	    return WebGLCapabilities;
	})();
	module.exports = WebGLCapabilities;
	//# sourceMappingURL=WebGLCapabilities.js.map

/***/ },
/* 44 */
/***/ function(module, exports) {

	var WebGLState = (function () {
	    function WebGLState(gl, extensions, paramThreeToGL) {
	    }
	    WebGLState.prototype.reset = function () {
	    };
	    WebGLState.prototype.setScissorTest = function (bool) {
	    };
	    WebGLState.prototype.init = function () {
	    };
	    WebGLState.prototype.bindTexture = function (webglType, webglTexture) {
	    };
	    WebGLState.prototype.texImage2D = function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i - 0] = arguments[_i];
	        }
	    };
	    WebGLState.prototype.setDepthTest = function (bool) {
	    };
	    WebGLState.prototype.initAttributes = function () {
	    };
	    WebGLState.prototype.enableAttribute = function (attribute) {
	    };
	    WebGLState.prototype.setDepthWrite = function (bool) {
	    };
	    WebGLState.prototype.disableUnusedAttributes = function () {
	    };
	    WebGLState.prototype.setColorWrite = function (bool) {
	    };
	    WebGLState.prototype.setBlending = function (blending, blendEquation, blendSrc, blendDst, blendEquationAlpha, blendSrcAlpha, blendDstAlpha) {
	    };
	    WebGLState.prototype.setDepthFunc = function (depthFunc) {
	    };
	    WebGLState.prototype.enable = function (id) {
	    };
	    WebGLState.prototype.disable = function (id) {
	    };
	    WebGLState.prototype.setFlipSided = function (flipSided) {
	    };
	    WebGLState.prototype.activeTexture = function (webglSlot) {
	    };
	    WebGLState.prototype.setLineWidth = function (width) {
	    };
	    WebGLState.prototype.getCompressedTextureFormats = function () {
	    };
	    WebGLState.prototype.compressedTexImage2D = function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i - 0] = arguments[_i];
	        }
	    };
	    WebGLState.prototype.setPolygonOffset = function (polygonOffset, factor, units) {
	    };
	    WebGLState.prototype.enableAttributeAndDivisor = function (programAttribute, meshPerAttribute, extension) {
	    };
	    return WebGLState;
	})();
	module.exports = WebGLState;
	//# sourceMappingURL=WebGLState.js.map

/***/ },
/* 45 */
/***/ function(module, exports) {

	var WebGLProperties = (function () {
	    function WebGLProperties() {
	        this.properties = {};
	    }
	    WebGLProperties.prototype.get = function (object) {
	        var uuid = object.uuid;
	        var map = this.properties[uuid];
	        if (map === undefined) {
	            map = {};
	            this.properties[uuid] = map;
	        }
	        return map;
	    };
	    ;
	    WebGLProperties.prototype.delete = function (object) {
	        delete this.properties[object.uuid];
	    };
	    ;
	    WebGLProperties.prototype.clear = function () {
	        this.properties = {};
	    };
	    ;
	    return WebGLProperties;
	})();
	module.exports = WebGLProperties;
	//# sourceMappingURL=WebGLProperties.js.map

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var WebGLGeometries = __webpack_require__(47);
	var Geometry = __webpack_require__(20);
	var InterleavedBufferAttribute = __webpack_require__(35);
	var BufferAttribute = __webpack_require__(36);
	var WebGLObjects = (function () {
	    function WebGLObjects(gl, properties, info) {
	        this.gl = gl;
	        this.properties = properties;
	        this.info = info;
	        this.geometries = new WebGLGeometries(gl, properties, info);
	    }
	    WebGLObjects.prototype.update = function (object) {
	        // TODO: Avoid updating twice (when using shadowMap). Maybe add frame counter.
	        var geometry = this.geometries.get(object);
	        if (object.geometry instanceof Geometry) {
	            geometry.updateFromObject(object);
	        }
	        var index = geometry.index;
	        var attributes = geometry.attributes;
	        if (index !== null) {
	            this.updateAttribute(index, this.gl.ELEMENT_ARRAY_BUFFER);
	        }
	        for (var name in attributes) {
	            this.updateAttribute(attributes[name], this.gl.ARRAY_BUFFER);
	        }
	        var morphAttributes = geometry.morphAttributes;
	        for (var name in morphAttributes) {
	            var array = morphAttributes[name];
	            for (var i = 0, l = array.length; i < l; i++) {
	                this.updateAttribute(array[i], this.gl.ARRAY_BUFFER);
	            }
	        }
	        return geometry;
	    };
	    WebGLObjects.prototype.updateAttribute = function (attribute, bufferType) {
	        var data = (attribute instanceof InterleavedBufferAttribute) ? attribute.data : attribute;
	        var attributeProperties = this.properties.get(data);
	        if (attributeProperties.__webglBuffer === undefined) {
	            this.createBuffer(attributeProperties, data, bufferType);
	        }
	        else if (attributeProperties.version !== data.version) {
	            this.updateBuffer(attributeProperties, data, bufferType);
	        }
	    };
	    WebGLObjects.prototype.createBuffer = function (attributeProperties, data, bufferType) {
	        var gl = this.gl;
	        attributeProperties.__webglBuffer = gl.createBuffer();
	        gl.bindBuffer(bufferType, attributeProperties.__webglBuffer);
	        var usage = data.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
	        gl.bufferData(bufferType, data.array, usage);
	        attributeProperties.version = data.version;
	    };
	    WebGLObjects.prototype.updateBuffer = function (attributeProperties, data, bufferType) {
	        var gl = this.gl;
	        gl.bindBuffer(bufferType, attributeProperties.__webglBuffer);
	        if (data.dynamic === false || data.updateRange.count === -1) {
	            gl.bufferSubData(bufferType, 0, data.array);
	        }
	        else if (data.updateRange.count === 0) {
	            console.error('THREE.WebGLObjects.updateBuffer: dynamic THREE.BufferAttribute marked as needsUpdate but updateRange.count is 0, ensure you are using set methods or updating manually.');
	        }
	        else {
	            gl.bufferSubData(bufferType, data.updateRange.offset * data.array.BYTES_PER_ELEMENT, data.array.subarray(data.updateRange.offset, data.updateRange.offset + data.updateRange.count));
	            data.updateRange.count = 0;
	        }
	        attributeProperties.version = data.version;
	    };
	    WebGLObjects.prototype.getAttributeBuffer = function (attribute) {
	        if (attribute instanceof InterleavedBufferAttribute) {
	            return this.properties.get(attribute.data).__webglBuffer;
	        }
	        return this.properties.get(attribute).__webglBuffer;
	    };
	    WebGLObjects.prototype.getWireframeAttribute = function (geometry) {
	        var property = this.properties.get(geometry);
	        if (property.wireframe !== undefined) {
	            return property.wireframe;
	        }
	        var indices = [];
	        var index = geometry.index;
	        var attributes = geometry.attributes;
	        var position = attributes.position;
	        if (index !== null) {
	            var edges = {};
	            var array = index.array;
	            for (var i = 0, l = array.length; i < l; i += 3) {
	                var a = array[i + 0];
	                var b = array[i + 1];
	                var c = array[i + 2];
	                if (this.checkEdge(edges, a, b))
	                    indices.push(a, b);
	                if (this.checkEdge(edges, b, c))
	                    indices.push(b, c);
	                if (this.checkEdge(edges, c, a))
	                    indices.push(c, a);
	            }
	        }
	        else {
	            var array = attributes.position.array;
	            for (var i = 0, l = (array.length / 3) - 1; i < l; i += 3) {
	                var a = i + 0;
	                var b = i + 1;
	                var c = i + 2;
	                indices.push(a, b, b, c, c, a);
	            }
	        }
	        var TypeArray = position.count > 65535 ? Uint32Array : Uint16Array;
	        var attribute = new BufferAttribute(new TypeArray(indices), 1);
	        this.updateAttribute(attribute, this.gl.ELEMENT_ARRAY_BUFFER);
	        property.wireframe = attribute;
	        return attribute;
	    };
	    WebGLObjects.prototype.checkEdge = function (edges, a, b) {
	        if (a > b) {
	            var tmp = a;
	            a = b;
	            b = tmp;
	        }
	        var list = edges[a];
	        if (list === undefined) {
	            edges[a] = [b];
	            return true;
	        }
	        else if (list.indexOf(b) === -1) {
	            list.push(b);
	            return true;
	        }
	        return false;
	    };
	    return WebGLObjects;
	})();
	module.exports = WebGLObjects;
	//# sourceMappingURL=WebGLObjects.js.map

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var BufferGeometry = __webpack_require__(19);
	var Geometry = __webpack_require__(20);
	var InterleavedBufferAttribute = __webpack_require__(35);
	var WebGLGeometries = (function () {
	    function WebGLGeometries(gl, properties, info) {
	        this.gl = gl;
	        this.properties = properties;
	        this.info = info;
	        this.geometries = {};
	    }
	    WebGLGeometries.prototype.get = function (object) {
	        var geometry = object.geometry;
	        if (this.geometries[geometry.id] !== undefined) {
	            return this.geometries[geometry.id];
	        }
	        geometry.addEventListener('dispose', this.onGeometryDispose);
	        var buffergeometry;
	        if (geometry instanceof BufferGeometry) {
	            buffergeometry = geometry;
	        }
	        else if (geometry instanceof Geometry) {
	            if (geometry._bufferGeometry === undefined) {
	                geometry._bufferGeometry = new BufferGeometry().setFromObject(object);
	            }
	            buffergeometry = geometry._bufferGeometry;
	        }
	        this.geometries[geometry.id] = buffergeometry;
	        this.info.memory.geometries++;
	        return buffergeometry;
	    };
	    WebGLGeometries.prototype.onGeometryDispose = function (event) {
	        var geometry = event.target;
	        var buffergeometry = this.geometries[geometry.id];
	        this.deleteAttributes(buffergeometry.attributes);
	        geometry.removeEventListener('dispose', this.onGeometryDispose);
	        delete this.geometries[geometry.id];
	        var property = this.properties.get(geometry);
	        if (property.wireframe)
	            this.deleteAttribute(property.wireframe);
	        this.info.memory.geometries--;
	    };
	    WebGLGeometries.prototype.getAttributeBuffer = function (attribute) {
	        if (attribute instanceof InterleavedBufferAttribute) {
	            return this.properties.get(attribute.data).__webglBuffer;
	        }
	        return this.properties.get(attribute).__webglBuffer;
	    };
	    WebGLGeometries.prototype.deleteAttribute = function (attribute) {
	        var buffer = this.getAttributeBuffer(attribute);
	        if (buffer !== undefined) {
	            this.gl.deleteBuffer(buffer);
	            this.removeAttributeBuffer(attribute);
	        }
	    };
	    WebGLGeometries.prototype.deleteAttributes = function (attributes) {
	        for (var name in attributes) {
	            this.deleteAttribute(attributes[name]);
	        }
	    };
	    WebGLGeometries.prototype.removeAttributeBuffer = function (attribute) {
	        if (attribute instanceof InterleavedBufferAttribute) {
	            this.properties.delete(attribute.data);
	        }
	        else {
	            this.properties.delete(attribute);
	        }
	    };
	    return WebGLGeometries;
	})();
	module.exports = WebGLGeometries;
	//# sourceMappingURL=WebGLGeometries.js.map

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var WaspProgram = __webpack_require__(49);
	var PointLight = __webpack_require__(54);
	var SpotLight = __webpack_require__(55);
	var DirectionalLight = __webpack_require__(56);
	var SkinnedMesh = __webpack_require__(57);
	var HemisphereLight = __webpack_require__(58);
	var ShadingSideType = __webpack_require__(26);
	var ShadingType = __webpack_require__(32);
	var FogExp2 = __webpack_require__(59);
	var WebGLPrograms = (function () {
	    function WebGLPrograms(renderer, capabilities) {
	        this.renderer = renderer;
	        this.capabilities = capabilities;
	        this.programs = [];
	        this.shaderIDs = {
	            MeshDepthMaterial: 'depth',
	            MeshNormalMaterial: 'normal',
	            MeshBasicMaterial: 'basic',
	            MeshLambertMaterial: 'lambert',
	            MeshPhongMaterial: 'phong',
	            LineBasicMaterial: 'basic',
	            LineDashedMaterial: 'dashed',
	            PointsMaterial: 'points'
	        };
	        this.parameterNames = [
	            "precision", "supportsVertexTextures", "map", "envMap", "envMapMode",
	            "lightMap", "aoMap", "emissiveMap", "bumpMap", "normalMap", "displacementMap", "specularMap",
	            "alphaMap", "combine", "vertexColors", "fog", "useFog", "fogExp",
	            "flatShading", "sizeAttenuation", "logarithmicDepthBuffer", "skinning",
	            "maxBones", "useVertexTexture", "morphTargets", "morphNormals",
	            "maxMorphTargets", "maxMorphNormals", "maxDirLights", "maxPointLights",
	            "maxSpotLights", "maxHemiLights", "maxShadows", "shadowMapEnabled", "pointLightShadows",
	            "shadowMapType", "shadowMapDebug", "alphaTest", "metal", "doubleSided",
	            "flipSided"
	        ];
	    }
	    WebGLPrograms.prototype.allocateBones = function (object) {
	        if (this.capabilities.floatVertexTextures && object && object.skeleton && object.skeleton.useVertexTexture) {
	            return 1024;
	        }
	        else {
	            var nVertexUniforms = this.capabilities.maxVertexUniforms;
	            var nVertexMatrices = Math.floor((nVertexUniforms - 20) / 4);
	            var maxBones = nVertexMatrices;
	            if (object !== undefined && object instanceof SkinnedMesh) {
	                maxBones = Math.min(object.skeleton.bones.length, maxBones);
	                if (maxBones < object.skeleton.bones.length) {
	                    console.warn('WebGLRenderer: too many bones - ' + object.skeleton.bones.length + ', this GPU supports just ' + maxBones + ' (try OpenGL instead of ANGLE)');
	                }
	            }
	            return maxBones;
	        }
	    };
	    WebGLPrograms.prototype.releaseProgram = function (program) {
	        if (--program.usedTimes === 0) {
	            var i = this.programs.indexOf(program);
	            this.programs[i] = this.programs[this.programs.length - 1];
	            this.programs.pop();
	            program.destroy();
	        }
	    };
	    WebGLPrograms.prototype.allocateLights = function (lights) {
	        var dirLights = 0;
	        var pointLights = 0;
	        var spotLights = 0;
	        var hemiLights = 0;
	        for (var l = 0, ll = lights.length; l < ll; l++) {
	            var light = lights[l];
	            if (light.visible === false)
	                continue;
	            if (light instanceof DirectionalLight)
	                dirLights++;
	            if (light instanceof PointLight)
	                pointLights++;
	            if (light instanceof SpotLight)
	                spotLights++;
	            if (light instanceof HemisphereLight)
	                hemiLights++;
	        }
	        return { 'directional': dirLights, 'point': pointLights, 'spot': spotLights, 'hemi': hemiLights };
	    };
	    WebGLPrograms.prototype.allocateShadows = function (lights) {
	        var maxShadows = 0;
	        var pointLightShadows = 0;
	        for (var l = 0, ll = lights.length; l < ll; l++) {
	            var light = lights[l];
	            if (!light.castShadow)
	                continue;
	            if (light instanceof SpotLight || light instanceof DirectionalLight)
	                maxShadows++;
	            if (light instanceof PointLight) {
	                maxShadows++;
	                pointLightShadows++;
	            }
	        }
	        return { 'maxShadows': maxShadows, 'pointLightShadows': pointLightShadows };
	    };
	    WebGLPrograms.prototype.getParameters = function (material, lights, fog, object) {
	        var shaderID = this.shaderIDs[material.type];
	        var maxLightCount = this.allocateLights(lights);
	        var allocatedShadows = this.allocateShadows(lights);
	        var maxBones = this.allocateBones(object);
	        var precision = this.renderer.getPrecision();
	        if (material.precision !== null) {
	            precision = this.capabilities.getMaxPrecision(material.precision);
	            if (precision !== material.precision) {
	                console.warn('THREE.WebGLRenderer.initMaterial:', material.precision, 'not supported, using', precision, 'instead.');
	            }
	        }
	        var parameters = {
	            shaderID: shaderID,
	            precision: precision,
	            supportsVertexTextures: this.capabilities.vertexTextures,
	            map: !!material.map,
	            envMap: !!material.envMap,
	            envMapMode: material.envMap && material.envMap.mapping,
	            lightMap: !!material.lightMap,
	            aoMap: !!material.aoMap,
	            emissiveMap: !!material.emissiveMap,
	            bumpMap: !!material.bumpMap,
	            normalMap: !!material.normalMap,
	            displacementMap: !!material.displacementMap,
	            specularMap: !!material.specularMap,
	            alphaMap: !!material.alphaMap,
	            combine: material.combine,
	            vertexColors: material.vertexColors,
	            fog: fog,
	            useFog: material.fog,
	            fogExp: fog instanceof FogExp2,
	            flatShading: material.shading === ShadingType.FlatShading,
	            sizeAttenuation: material.sizeAttenuation,
	            logarithmicDepthBuffer: this.capabilities.logarithmicDepthBuffer,
	            skinning: material.skinning,
	            maxBones: maxBones,
	            useVertexTexture: this.capabilities.floatVertexTextures && object && object.skeleton && object.skeleton.useVertexTexture,
	            morphTargets: material.morphTargets,
	            morphNormals: material.morphNormals,
	            maxMorphTargets: this.renderer.maxMorphTargets,
	            maxMorphNormals: this.renderer.maxMorphNormals,
	            maxDirLights: maxLightCount.directional,
	            maxPointLights: maxLightCount.point,
	            maxSpotLights: maxLightCount.spot,
	            maxHemiLights: maxLightCount.hemi,
	            maxShadows: allocatedShadows.maxShadows,
	            pointLightShadows: allocatedShadows.pointLightShadows,
	            shadowMapEnabled: this.renderer.shadowMap.enabled && object.receiveShadow && allocatedShadows.maxShadows > 0,
	            shadowMapType: this.renderer.shadowMap.type,
	            shadowMapDebug: this.renderer.shadowMap.debug,
	            alphaTest: material.alphaTest,
	            metal: material.metal,
	            doubleSided: material.side === ShadingSideType.DoubleSide,
	            flipSided: material.side === ShadingSideType.BackSide
	        };
	        return parameters;
	    };
	    WebGLPrograms.prototype.acquireProgram = function (material, parameters, code) {
	        var program;
	        for (var p = 0, pl = this.programs.length; p < pl; p++) {
	            var programInfo = this.programs[p];
	            if (programInfo.code === code) {
	                program = programInfo;
	                ++program.usedTimes;
	                break;
	            }
	        }
	        if (program === undefined) {
	            program = new WaspProgram(this.renderer, code, material, parameters);
	            this.programs.push(program);
	        }
	        return program;
	    };
	    WebGLPrograms.prototype.getProgramCode = function (material, parameters) {
	        var chunks = [];
	        if (parameters.shaderID) {
	            chunks.push(parameters.shaderID);
	        }
	        else {
	            chunks.push(material.fragmentShader);
	            chunks.push(material.vertexShader);
	        }
	        if (material.defines !== undefined) {
	            for (var name in material.defines) {
	                chunks.push(name);
	                chunks.push(material.defines[name]);
	            }
	        }
	        for (var i = 0; i < this.parameterNames.length; i++) {
	            var parameterName = this.parameterNames[i];
	            chunks.push(parameterName);
	            chunks.push(parameters[parameterName]);
	        }
	        return chunks.join();
	    };
	    return WebGLPrograms;
	})();
	module.exports = WebGLPrograms;
	//# sourceMappingURL=WebGLPrograms.js.map

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var ShadowMapType = __webpack_require__(50);
	var MappingMode = __webpack_require__(51);
	var TextureOperation = __webpack_require__(34);
	var RawShaderMaterial = __webpack_require__(52);
	var WaspShader = __webpack_require__(53);
	var WaspProgram = (function () {
	    function WaspProgram(renderer, code, material, parameters) {
	        this.renderer = renderer;
	        this.code = code;
	        this.material = material;
	        this.parameters = parameters;
	        var gl = renderer.context;
	        this.gl = gl;
	        var defines = material.defines;
	        var vertexShader = material.__webglShader.vertexShader;
	        var fragmentShader = material.__webglShader.fragmentShader;
	        var shadowMapTypeDefine = 'SHADOWMAP_TYPE_BASIC';
	        if (parameters.shadowMapType === ShadowMapType.PCFShadowMap) {
	            shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF';
	        }
	        else if (parameters.shadowMapType === ShadowMapType.PCFSoftShadowMap) {
	            shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF_SOFT';
	        }
	        var envMapTypeDefine = 'ENVMAP_TYPE_CUBE';
	        var envMapModeDefine = 'ENVMAP_MODE_REFLECTION';
	        var envMapBlendingDefine = 'ENVMAP_BLENDING_MULTIPLY';
	        if (parameters.envMap) {
	            switch (material.envMap.mapping) {
	                case MappingMode.CubeReflectionMapping:
	                case MappingMode.CubeRefractionMapping:
	                    envMapTypeDefine = 'ENVMAP_TYPE_CUBE';
	                    break;
	                case MappingMode.EquirectangularReflectionMapping:
	                case MappingMode.EquirectangularRefractionMapping:
	                    envMapTypeDefine = 'ENVMAP_TYPE_EQUIREC';
	                    break;
	                case MappingMode.SphericalReflectionMapping:
	                    envMapTypeDefine = 'ENVMAP_TYPE_SPHERE';
	                    break;
	            }
	            switch (material.envMap.mapping) {
	                case MappingMode.CubeRefractionMapping:
	                case MappingMode.EquirectangularRefractionMapping:
	                    envMapModeDefine = 'ENVMAP_MODE_REFRACTION';
	                    break;
	            }
	            switch (material.combine) {
	                case TextureOperation.MultiplyOperation:
	                    envMapBlendingDefine = 'ENVMAP_BLENDING_MULTIPLY';
	                    break;
	                case TextureOperation.MixOperation:
	                    envMapBlendingDefine = 'ENVMAP_BLENDING_MIX';
	                    break;
	                case TextureOperation.AddOperation:
	                    envMapBlendingDefine = 'ENVMAP_BLENDING_ADD';
	                    break;
	            }
	        }
	        var gammaFactorDefine = (renderer.gammaFactor > 0) ? renderer.gammaFactor : 1.0;
	        var customDefines = this.generateDefines(defines);
	        var program = gl.createProgram();
	        var prefixVertex, prefixFragment;
	        if (material instanceof RawShaderMaterial) {
	            prefixVertex = '';
	            prefixFragment = '';
	        }
	        else {
	            prefixVertex = [
	                'precision ' + parameters.precision + ' float;',
	                'precision ' + parameters.precision + ' int;',
	                '#define SHADER_NAME ' + material.__webglShader.name,
	                customDefines,
	                parameters.supportsVertexTextures ? '#define VERTEX_TEXTURES' : '',
	                renderer.gammaInput ? '#define GAMMA_INPUT' : '',
	                renderer.gammaOutput ? '#define GAMMA_OUTPUT' : '',
	                '#define GAMMA_FACTOR ' + gammaFactorDefine,
	                '#define MAX_DIR_LIGHTS ' + parameters.maxDirLights,
	                '#define MAX_POINT_LIGHTS ' + parameters.maxPointLights,
	                '#define MAX_SPOT_LIGHTS ' + parameters.maxSpotLights,
	                '#define MAX_HEMI_LIGHTS ' + parameters.maxHemiLights,
	                '#define MAX_SHADOWS ' + parameters.maxShadows,
	                '#define MAX_BONES ' + parameters.maxBones,
	                parameters.map ? '#define USE_MAP' : '',
	                parameters.envMap ? '#define USE_ENVMAP' : '',
	                parameters.envMap ? '#define ' + envMapModeDefine : '',
	                parameters.lightMap ? '#define USE_LIGHTMAP' : '',
	                parameters.aoMap ? '#define USE_AOMAP' : '',
	                parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '',
	                parameters.bumpMap ? '#define USE_BUMPMAP' : '',
	                parameters.normalMap ? '#define USE_NORMALMAP' : '',
	                parameters.displacementMap && parameters.supportsVertexTextures ? '#define USE_DISPLACEMENTMAP' : '',
	                parameters.specularMap ? '#define USE_SPECULARMAP' : '',
	                parameters.alphaMap ? '#define USE_ALPHAMAP' : '',
	                parameters.vertexColors ? '#define USE_COLOR' : '',
	                parameters.flatShading ? '#define FLAT_SHADED' : '',
	                parameters.skinning ? '#define USE_SKINNING' : '',
	                parameters.useVertexTexture ? '#define BONE_TEXTURE' : '',
	                parameters.morphTargets ? '#define USE_MORPHTARGETS' : '',
	                parameters.morphNormals && parameters.flatShading === false ? '#define USE_MORPHNORMALS' : '',
	                parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
	                parameters.flipSided ? '#define FLIP_SIDED' : '',
	                parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
	                parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '',
	                parameters.shadowMapDebug ? '#define SHADOWMAP_DEBUG' : '',
	                parameters.pointLightShadows > 0 ? '#define POINT_LIGHT_SHADOWS' : '',
	                parameters.sizeAttenuation ? '#define USE_SIZEATTENUATION' : '',
	                parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
	                parameters.logarithmicDepthBuffer && renderer.extensions.get('EXT_frag_depth') ? '#define USE_LOGDEPTHBUF_EXT' : '',
	                'uniform mat4 modelMatrix;',
	                'uniform mat4 modelViewMatrix;',
	                'uniform mat4 projectionMatrix;',
	                'uniform mat4 viewMatrix;',
	                'uniform mat3 normalMatrix;',
	                'uniform vec3 cameraPosition;',
	                'attribute vec3 position;',
	                'attribute vec3 normal;',
	                'attribute vec2 uv;',
	                '#ifdef USE_COLOR',
	                '	attribute vec3 color;',
	                '#endif',
	                '#ifdef USE_MORPHTARGETS',
	                '	attribute vec3 morphTarget0;',
	                '	attribute vec3 morphTarget1;',
	                '	attribute vec3 morphTarget2;',
	                '	attribute vec3 morphTarget3;',
	                '	#ifdef USE_MORPHNORMALS',
	                '		attribute vec3 morphNormal0;',
	                '		attribute vec3 morphNormal1;',
	                '		attribute vec3 morphNormal2;',
	                '		attribute vec3 morphNormal3;',
	                '	#else',
	                '		attribute vec3 morphTarget4;',
	                '		attribute vec3 morphTarget5;',
	                '		attribute vec3 morphTarget6;',
	                '		attribute vec3 morphTarget7;',
	                '	#endif',
	                '#endif',
	                '#ifdef USE_SKINNING',
	                '	attribute vec4 skinIndex;',
	                '	attribute vec4 skinWeight;',
	                '#endif',
	                '\n'
	            ].filter(this.filterEmptyLine).join('\n');
	            prefixFragment = [
	                parameters.bumpMap || parameters.normalMap || parameters.flatShading || material.derivatives ? '#extension GL_OES_standard_derivatives : enable' : '',
	                parameters.logarithmicDepthBuffer && renderer.extensions.get('EXT_frag_depth') ? '#extension GL_EXT_frag_depth : enable' : '',
	                'precision ' + parameters.precision + ' float;',
	                'precision ' + parameters.precision + ' int;',
	                '#define SHADER_NAME ' + material.__webglShader.name,
	                customDefines,
	                '#define MAX_DIR_LIGHTS ' + parameters.maxDirLights,
	                '#define MAX_POINT_LIGHTS ' + parameters.maxPointLights,
	                '#define MAX_SPOT_LIGHTS ' + parameters.maxSpotLights,
	                '#define MAX_HEMI_LIGHTS ' + parameters.maxHemiLights,
	                '#define MAX_SHADOWS ' + parameters.maxShadows,
	                parameters.alphaTest ? '#define ALPHATEST ' + parameters.alphaTest : '',
	                renderer.gammaInput ? '#define GAMMA_INPUT' : '',
	                renderer.gammaOutput ? '#define GAMMA_OUTPUT' : '',
	                '#define GAMMA_FACTOR ' + gammaFactorDefine,
	                (parameters.useFog && parameters.fog) ? '#define USE_FOG' : '',
	                (parameters.useFog && parameters.fogExp) ? '#define FOG_EXP2' : '',
	                parameters.map ? '#define USE_MAP' : '',
	                parameters.envMap ? '#define USE_ENVMAP' : '',
	                parameters.envMap ? '#define ' + envMapTypeDefine : '',
	                parameters.envMap ? '#define ' + envMapModeDefine : '',
	                parameters.envMap ? '#define ' + envMapBlendingDefine : '',
	                parameters.lightMap ? '#define USE_LIGHTMAP' : '',
	                parameters.aoMap ? '#define USE_AOMAP' : '',
	                parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '',
	                parameters.bumpMap ? '#define USE_BUMPMAP' : '',
	                parameters.normalMap ? '#define USE_NORMALMAP' : '',
	                parameters.specularMap ? '#define USE_SPECULARMAP' : '',
	                parameters.alphaMap ? '#define USE_ALPHAMAP' : '',
	                parameters.vertexColors ? '#define USE_COLOR' : '',
	                parameters.flatShading ? '#define FLAT_SHADED' : '',
	                parameters.metal ? '#define METAL' : '',
	                parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
	                parameters.flipSided ? '#define FLIP_SIDED' : '',
	                parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
	                parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '',
	                parameters.shadowMapDebug ? '#define SHADOWMAP_DEBUG' : '',
	                parameters.pointLightShadows > 0 ? '#define POINT_LIGHT_SHADOWS' : '',
	                parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
	                parameters.logarithmicDepthBuffer && renderer.extensions.get('EXT_frag_depth') ? '#define USE_LOGDEPTHBUF_EXT' : '',
	                'uniform mat4 viewMatrix;',
	                'uniform vec3 cameraPosition;',
	                '\n'
	            ].filter(this.filterEmptyLine).join('\n');
	        }
	        var vertexGlsl = prefixVertex + vertexShader;
	        var fragmentGlsl = prefixFragment + fragmentShader;
	        var glVertexShader = new WaspShader(gl, gl.VERTEX_SHADER, vertexGlsl);
	        var glFragmentShader = new WaspShader(gl, gl.FRAGMENT_SHADER, fragmentGlsl);
	        gl.attachShader(program, glVertexShader);
	        gl.attachShader(program, glFragmentShader);
	        if (material.index0AttributeName !== undefined) {
	            gl.bindAttribLocation(program, 0, material.index0AttributeName);
	        }
	        else if (parameters.morphTargets === true) {
	            gl.bindAttribLocation(program, 0, 'position');
	        }
	        gl.linkProgram(program);
	        var programLog = gl.getProgramInfoLog(program);
	        var vertexLog = gl.getShaderInfoLog(glVertexShader);
	        var fragmentLog = gl.getShaderInfoLog(glFragmentShader);
	        var runnable = true;
	        var haveDiagnostics = true;
	        if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
	            runnable = false;
	            console.error('THREE.WebGLProgram: shader error: ', gl.getError(), 'gl.VALIDATE_STATUS', gl.getProgramParameter(program, gl.VALIDATE_STATUS), 'gl.getProgramInfoLog', programLog, vertexLog, fragmentLog);
	        }
	        else if (programLog !== '') {
	            console.warn('THREE.WebGLProgram: gl.getProgramInfoLog()', programLog);
	        }
	        else if (vertexLog === '' || fragmentLog === '') {
	            haveDiagnostics = false;
	        }
	        if (haveDiagnostics) {
	            this.diagnostics = {
	                runnable: runnable,
	                material: material,
	                programLog: programLog,
	                vertexShader: {
	                    log: vertexLog,
	                    prefix: prefixVertex
	                },
	                fragmentShader: {
	                    log: fragmentLog,
	                    prefix: prefixFragment
	                }
	            };
	        }
	        gl.deleteShader(glVertexShader);
	        gl.deleteShader(glFragmentShader);
	        var cachedUniforms;
	        this.id = WaspProgram.programIdCount++;
	        this.code = code;
	        this.usedTimes = 1;
	        this.program = program;
	        this.vertexShader = glVertexShader;
	        this.fragmentShader = glFragmentShader;
	        return this;
	    }
	    WaspProgram.prototype.generateDefines = function (defines) {
	        var chunks = [];
	        for (var name in defines) {
	            var value = defines[name];
	            if (value === false)
	                continue;
	            chunks.push('#define ' + name + ' ' + value);
	        }
	        return chunks.join('\n');
	    };
	    WaspProgram.prototype.fetchUniformLocations = function (gl, program, identifiers) {
	        var uniforms = {};
	        var n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
	        for (var i = 0; i < n; i++) {
	            var info = gl.getActiveUniform(program, i);
	            var name = info.name;
	            var location = gl.getUniformLocation(program, name);
	            var suffixPos = name.lastIndexOf('[0]');
	            if (suffixPos !== -1 && suffixPos === name.length - 3) {
	                uniforms[name.substr(0, suffixPos)] = location;
	            }
	            uniforms[name] = location;
	        }
	        return uniforms;
	    };
	    WaspProgram.prototype.fetchAttributeLocations = function (gl, program, identifiers) {
	        var attributes = {};
	        var n = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
	        for (var i = 0; i < n; i++) {
	            var info = gl.getActiveAttrib(program, i);
	            var name = info.name;
	            attributes[name] = gl.getAttribLocation(program, name);
	        }
	        return attributes;
	    };
	    WaspProgram.prototype.filterEmptyLine = function (string) {
	        return string !== '';
	    };
	    WaspProgram.prototype.getUniforms = function () {
	        if (this.cachedUniforms === undefined) {
	            this.cachedUniforms = this.fetchUniformLocations(this.gl, this.program);
	        }
	        return this.cachedUniforms;
	    };
	    WaspProgram.prototype.getAttributes = function () {
	        if (this.cachedAttributes === undefined) {
	            this.cachedAttributes = this.fetchAttributeLocations(this.gl, this.program);
	        }
	        return this.cachedAttributes;
	    };
	    ;
	    WaspProgram.prototype.destroy = function () {
	        this.gl.deleteProgram(this.program);
	        this.program = undefined;
	    };
	    WaspProgram.programIdCount = 0;
	    return WaspProgram;
	})();
	module.exports = WaspProgram;
	//# sourceMappingURL=WaspProgram.js.map

/***/ },
/* 50 */
/***/ function(module, exports) {

	var ShadowMapType;
	(function (ShadowMapType) {
	    ShadowMapType[ShadowMapType["BasicShadowMap"] = 0] = "BasicShadowMap";
	    ShadowMapType[ShadowMapType["PCFShadowMap"] = 1] = "PCFShadowMap";
	    ShadowMapType[ShadowMapType["PCFSoftShadowMap"] = 2] = "PCFSoftShadowMap";
	})(ShadowMapType || (ShadowMapType = {}));
	module.exports = ShadowMapType;
	//# sourceMappingURL=ShadowMapType.js.map

/***/ },
/* 51 */
/***/ function(module, exports) {

	var MappingMode;
	(function (MappingMode) {
	    MappingMode[MappingMode["UVMapping"] = 0] = "UVMapping";
	    MappingMode[MappingMode["CubeReflectionMapping"] = 1] = "CubeReflectionMapping";
	    MappingMode[MappingMode["CubeRefractionMapping"] = 2] = "CubeRefractionMapping";
	    MappingMode[MappingMode["EquirectangularReflectionMapping"] = 3] = "EquirectangularReflectionMapping";
	    MappingMode[MappingMode["EquirectangularRefractionMapping"] = 4] = "EquirectangularRefractionMapping";
	    MappingMode[MappingMode["SphericalReflectionMapping"] = 5] = "SphericalReflectionMapping";
	})(MappingMode || (MappingMode = {}));
	module.exports = MappingMode;
	//# sourceMappingURL=MappingMode.js.map

/***/ },
/* 52 */
/***/ function(module, exports) {

	var RawShaderMaterial = (function () {
	    function RawShaderMaterial() {
	    }
	    return RawShaderMaterial;
	})();
	module.exports = RawShaderMaterial;
	//# sourceMappingURL=RawShaderMaterial.js.map

/***/ },
/* 53 */
/***/ function(module, exports) {

	var WaspShader = (function () {
	    function addLineNumbers(string) {
	        var lines = string.split('\n');
	        for (var i = 0; i < lines.length; i++) {
	            lines[i] = (i + 1) + ': ' + lines[i];
	        }
	        return lines.join('\n');
	    }
	    return function WebGLShader(gl, type, string) {
	        var shader = gl.createShader(type);
	        gl.shaderSource(shader, string);
	        gl.compileShader(shader);
	        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false) {
	            console.error('THREE.WebGLShader: Shader couldn\'t compile.');
	        }
	        if (gl.getShaderInfoLog(shader) !== '') {
	            console.warn('THREE.WebGLShader: gl.getShaderInfoLog()', type === gl.VERTEX_SHADER ? 'vertex' : 'fragment', gl.getShaderInfoLog(shader), addLineNumbers(string));
	        }
	        return shader;
	    };
	})();
	module.exports = WaspShader;
	//# sourceMappingURL=WaspShader.js.map

/***/ },
/* 54 */
/***/ function(module, exports) {

	var PointLight = (function () {
	    function PointLight() {
	    }
	    return PointLight;
	})();
	module.exports = PointLight;
	//# sourceMappingURL=PointLight.js.map

/***/ },
/* 55 */
/***/ function(module, exports) {

	var SpotLight = (function () {
	    function SpotLight() {
	    }
	    return SpotLight;
	})();
	module.exports = SpotLight;
	//# sourceMappingURL=SpotLight.js.map

/***/ },
/* 56 */
/***/ function(module, exports) {

	var DirectionalLight = (function () {
	    function DirectionalLight() {
	    }
	    return DirectionalLight;
	})();
	module.exports = DirectionalLight;
	//# sourceMappingURL=DirectionalLight.js.map

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Object3D = __webpack_require__(2);
	var SkinnedMesh = (function (_super) {
	    __extends(SkinnedMesh, _super);
	    function SkinnedMesh() {
	        _super.apply(this, arguments);
	    }
	    return SkinnedMesh;
	})(Object3D);
	module.exports = SkinnedMesh;
	//# sourceMappingURL=SkinnedMesh.js.map

/***/ },
/* 58 */
/***/ function(module, exports) {

	var HemisphereLight = (function () {
	    function HemisphereLight() {
	    }
	    return HemisphereLight;
	})();
	module.exports = HemisphereLight;
	//# sourceMappingURL=HemisphereLight.js.map

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var Color = __webpack_require__(14);
	var FogExp2 = (function () {
	    function FogExp2(color, density) {
	        this.clone = function () {
	            return new FogExp2(this.color.getHex(), this.density);
	        };
	        this.name = '';
	        this.color = new Color(color);
	        this.density = (density !== undefined) ? density : 0.00025;
	    }
	    return FogExp2;
	})();
	module.exports = FogExp2;
	//# sourceMappingURL=FogExp2.js.map

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	var InterleavedBufferAttribute = __webpack_require__(35);
	var WebGLBufferRenderer = (function () {
	    function WebGLBufferRenderer(_gl, extensions, _infoRender) {
	        this._gl = _gl;
	        this.extensions = extensions;
	        this._infoRender = _infoRender;
	    }
	    WebGLBufferRenderer.prototype.setMode = function (value) {
	        this.mode = value;
	    };
	    WebGLBufferRenderer.prototype.render = function (start, count) {
	        console.log(this.mode, start, count);
	        this._gl.drawArrays(this.mode, start, count);
	        this._infoRender.calls++;
	        this._infoRender.vertices += count;
	        if (this.mode === this._gl.TRIANGLES)
	            this._infoRender.faces += count / 3;
	    };
	    WebGLBufferRenderer.prototype.renderInstances = function (geometry) {
	        var extension = this.extensions.get('ANGLE_instanced_arrays');
	        if (extension === null) {
	            console.error('THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.');
	            return;
	        }
	        var position = geometry.attributes.position;
	        if (position instanceof InterleavedBufferAttribute) {
	            extension.drawArraysInstancedANGLE(this.mode, 0, position.data.count, geometry.maxInstancedCount);
	        }
	        else {
	            extension.drawArraysInstancedANGLE(this.mode, 0, position.count, geometry.maxInstancedCount);
	        }
	    };
	    return WebGLBufferRenderer;
	})();
	module.exports = WebGLBufferRenderer;
	//# sourceMappingURL=WebGLBufferRenderer.js.map

/***/ },
/* 61 */
/***/ function(module, exports) {

	var WebGLIndexedBufferRenderer = (function () {
	    function WebGLIndexedBufferRenderer(_gl, extensions, _infoRender) {
	    }
	    return WebGLIndexedBufferRenderer;
	})();
	module.exports = WebGLIndexedBufferRenderer;
	//# sourceMappingURL=WebGLIndexedBufferRenderer.js.map

/***/ },
/* 62 */
/***/ function(module, exports) {

	var WebGLShadowMap = (function () {
	    function WebGLShadowMap(render, lights, objects) {
	    }
	    WebGLShadowMap.prototype.render = function (scene) {
	    };
	    return WebGLShadowMap;
	})();
	module.exports = WebGLShadowMap;
	//# sourceMappingURL=WebGLShadowMap.js.map

/***/ },
/* 63 */
/***/ function(module, exports) {

	var lensFlaresPlugin = (function () {
	    function lensFlaresPlugin(renderer, flares) {
	    }
	    lensFlaresPlugin.prototype.render = function (scene, camera, viewportWidth, viewportHeight) {
	    };
	    return lensFlaresPlugin;
	})();
	module.exports = lensFlaresPlugin;
	//# sourceMappingURL=LensFlarePlugin.js.map

/***/ },
/* 64 */
/***/ function(module, exports) {

	var SpritePlugin = (function () {
	    function SpritePlugin(renderer, sprites) {
	    }
	    SpritePlugin.prototype.render = function (scene, camera) {
	    };
	    ;
	    return SpritePlugin;
	})();
	module.exports = SpritePlugin;
	//# sourceMappingURL=SpritePlugin.js.map

/***/ },
/* 65 */
/***/ function(module, exports) {

	var WebGLRenderTargetCube = (function () {
	    function WebGLRenderTargetCube() {
	    }
	    return WebGLRenderTargetCube;
	})();
	module.exports = WebGLRenderTargetCube;
	//# sourceMappingURL=WebGLRenderTargetCube.js.map

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Object3D = __webpack_require__(2);
	var Color = __webpack_require__(14);
	var Light = (function (_super) {
	    __extends(Light, _super);
	    function Light(color) {
	        _super.call(this);
	        this.type = 'Light';
	        this.receiveShadow = undefined;
	        this.groundColor = undefined;
	        this.color = new Color(color);
	    }
	    Object.defineProperty(Light.prototype, "shadowCameraFov", {
	        set: function (value) {
	            this.shadow.camera.fov = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Light.prototype, "shadowCameraLeft", {
	        set: function (value) {
	            this.shadow.camera.left = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Light.prototype, "shadowCameraRight", {
	        set: function (value) {
	            this.shadow.camera.right = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Light.prototype, "shadowCameraTop", {
	        set: function (value) {
	            this.shadow.camera.top = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Light.prototype, "shadowCameraBottom", {
	        set: function (value) {
	            this.shadow.camera.bottom = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Light.prototype, "shadowCameraNear", {
	        set: function (value) {
	            this.shadow.camera.near = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Light.prototype, "shadowCameraFar", {
	        set: function (value) {
	            this.shadow.camera.far = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Light.prototype, "shadowBias", {
	        set: function (value) {
	            this.shadow.bias = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Light.prototype, "shadowDarkness", {
	        set: function (value) {
	            this.shadow.darkness = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Light.prototype, "shadowMapWidth", {
	        set: function (value) {
	            this.shadow.mapSize.width = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Light.prototype, "shadowMapHeight", {
	        set: function (value) {
	            this.shadow.mapSize.height = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Light.prototype.copy = function (source) {
	        _super.prototype.copy.call(this, source);
	        this.color.copy(source.color);
	        return this;
	    };
	    Light.prototype.toJson = function (meta) {
	        var data = Object3D.prototype.toJSON.call(this, meta);
	        data.object.color = this.color.getHex();
	        if (this.groundColor !== undefined)
	            data.object.groundColor = this.groundColor.getHex();
	        if (this.intensity !== undefined)
	            data.object.intensity = this.intensity;
	        if (this.distance !== undefined)
	            data.object.distance = this.distance;
	        if (this.angle !== undefined)
	            data.object.angle = this.angle;
	        if (this.decay !== undefined)
	            data.object.decay = this.decay;
	        if (this.exponent !== undefined)
	            data.object.exponent = this.exponent;
	        return data;
	    };
	    return Light;
	})(Object3D);
	module.exports = Light;
	//# sourceMappingURL=Light.js.map

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Object3D = __webpack_require__(2);
	var Sprite = (function (_super) {
	    __extends(Sprite, _super);
	    function Sprite(material) {
	        _super.call(this);
	    }
	    return Sprite;
	})(Object3D);
	module.exports = Sprite;
	//# sourceMappingURL=Sprite.js.map

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Object3D = __webpack_require__(2);
	var LensFlare = (function (_super) {
	    __extends(LensFlare, _super);
	    function LensFlare() {
	        _super.apply(this, arguments);
	        this.type = 'LensFlare';
	    }
	    return LensFlare;
	})(Object3D);
	module.exports = LensFlare;
	//# sourceMappingURL=LensFlare.js.map

/***/ },
/* 69 */
/***/ function(module, exports) {

	var ImmediateRenderObject = (function () {
	    function ImmediateRenderObject() {
	    }
	    return ImmediateRenderObject;
	})();
	module.exports = ImmediateRenderObject;
	//# sourceMappingURL=ImmediateRenderObject.js.map

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(71);
	//# sourceMappingURL=MeshFaceMaterial.js.map

/***/ },
/* 71 */
/***/ function(module, exports) {

	var MultiMaterial = (function () {
	    function MultiMaterial() {
	    }
	    return MultiMaterial;
	})();
	module.exports = MultiMaterial;
	//# sourceMappingURL=MultiMaterial.js.map

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	var UniformsUtils = __webpack_require__(73);
	var UniformsLib = __webpack_require__(74);
	var ShaderChunk = __webpack_require__(75);
	var Color = __webpack_require__(14);
	var Vector3 = __webpack_require__(4);
	var ShaderLib = {
	    'basic': {
	        uniforms: UniformsUtils.merge([
	            UniformsLib["common"],
	            UniformsLib["aomap"],
	            UniformsLib["fog"],
	            UniformsLib["shadowmap"]
	        ]),
	        vertexShader: [
	            ShaderChunk["common"],
	            ShaderChunk["uv_pars_vertex"],
	            ShaderChunk["uv2_pars_vertex"],
	            ShaderChunk["envmap_pars_vertex"],
	            ShaderChunk["color_pars_vertex"],
	            ShaderChunk["morphtarget_pars_vertex"],
	            ShaderChunk["skinning_pars_vertex"],
	            ShaderChunk["shadowmap_pars_vertex"],
	            ShaderChunk["logdepthbuf_pars_vertex"],
	            "void main() {",
	            ShaderChunk["uv_vertex"],
	            ShaderChunk["uv2_vertex"],
	            ShaderChunk["color_vertex"],
	            ShaderChunk["skinbase_vertex"],
	            "	#ifdef USE_ENVMAP",
	            ShaderChunk["beginnormal_vertex"],
	            ShaderChunk["morphnormal_vertex"],
	            ShaderChunk["skinnormal_vertex"],
	            ShaderChunk["defaultnormal_vertex"],
	            "	#endif",
	            ShaderChunk["begin_vertex"],
	            ShaderChunk["morphtarget_vertex"],
	            ShaderChunk["skinning_vertex"],
	            ShaderChunk["project_vertex"],
	            ShaderChunk["logdepthbuf_vertex"],
	            ShaderChunk["worldpos_vertex"],
	            ShaderChunk["envmap_vertex"],
	            ShaderChunk["shadowmap_vertex"],
	            "}"
	        ].join("\n"),
	        fragmentShader: [
	            "uniform vec3 diffuse;",
	            "uniform float opacity;",
	            ShaderChunk["common"],
	            ShaderChunk["color_pars_fragment"],
	            ShaderChunk["uv_pars_fragment"],
	            ShaderChunk["map_pars_fragment"],
	            ShaderChunk["uv2_pars_fragment"],
	            ShaderChunk["alphamap_pars_fragment"],
	            ShaderChunk["aomap_pars_fragment"],
	            ShaderChunk["envmap_pars_fragment"],
	            ShaderChunk["fog_pars_fragment"],
	            ShaderChunk["shadowmap_pars_fragment"],
	            ShaderChunk["specularmap_pars_fragment"],
	            ShaderChunk["logdepthbuf_pars_fragment"],
	            "void main() {",
	            "	vec3 outgoingLight = vec3( 0.0 );",
	            "	vec4 diffuseColor = vec4( diffuse, opacity );",
	            "	vec3 totalAmbientLight = vec3( 1.0 );",
	            "	vec3 shadowMask = vec3( 1.0 );",
	            ShaderChunk["logdepthbuf_fragment"],
	            ShaderChunk["map_fragment"],
	            ShaderChunk["color_fragment"],
	            ShaderChunk["alphamap_fragment"],
	            ShaderChunk["alphatest_fragment"],
	            ShaderChunk["specularmap_fragment"],
	            ShaderChunk["aomap_fragment"],
	            ShaderChunk["shadowmap_fragment"],
	            "	outgoingLight = diffuseColor.rgb * totalAmbientLight * shadowMask;",
	            ShaderChunk["envmap_fragment"],
	            ShaderChunk["linear_to_gamma_fragment"],
	            ShaderChunk["fog_fragment"],
	            "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
	            "}"
	        ].join("\n")
	    },
	    'lambert': {
	        uniforms: UniformsUtils.merge([
	            UniformsLib["common"],
	            UniformsLib["fog"],
	            UniformsLib["lights"],
	            UniformsLib["shadowmap"],
	            {
	                "emissive": { type: "c", value: new Color(0x000000) }
	            }
	        ]),
	        vertexShader: [
	            "#define LAMBERT",
	            "varying vec3 vLightFront;",
	            "#ifdef DOUBLE_SIDED",
	            "	varying vec3 vLightBack;",
	            "#endif",
	            ShaderChunk["common"],
	            ShaderChunk["uv_pars_vertex"],
	            ShaderChunk["uv2_pars_vertex"],
	            ShaderChunk["envmap_pars_vertex"],
	            ShaderChunk["lights_lambert_pars_vertex"],
	            ShaderChunk["color_pars_vertex"],
	            ShaderChunk["morphtarget_pars_vertex"],
	            ShaderChunk["skinning_pars_vertex"],
	            ShaderChunk["shadowmap_pars_vertex"],
	            ShaderChunk["logdepthbuf_pars_vertex"],
	            "void main() {",
	            ShaderChunk["uv_vertex"],
	            ShaderChunk["uv2_vertex"],
	            ShaderChunk["color_vertex"],
	            ShaderChunk["beginnormal_vertex"],
	            ShaderChunk["morphnormal_vertex"],
	            ShaderChunk["skinbase_vertex"],
	            ShaderChunk["skinnormal_vertex"],
	            ShaderChunk["defaultnormal_vertex"],
	            ShaderChunk["begin_vertex"],
	            ShaderChunk["morphtarget_vertex"],
	            ShaderChunk["skinning_vertex"],
	            ShaderChunk["project_vertex"],
	            ShaderChunk["logdepthbuf_vertex"],
	            ShaderChunk["worldpos_vertex"],
	            ShaderChunk["envmap_vertex"],
	            ShaderChunk["lights_lambert_vertex"],
	            ShaderChunk["shadowmap_vertex"],
	            "}"
	        ].join("\n"),
	        fragmentShader: [
	            "uniform vec3 diffuse;",
	            "uniform vec3 emissive;",
	            "uniform float opacity;",
	            "uniform vec3 ambientLightColor;",
	            "varying vec3 vLightFront;",
	            "#ifdef DOUBLE_SIDED",
	            "	varying vec3 vLightBack;",
	            "#endif",
	            ShaderChunk["common"],
	            ShaderChunk["color_pars_fragment"],
	            ShaderChunk["uv_pars_fragment"],
	            ShaderChunk["uv2_pars_fragment"],
	            ShaderChunk["map_pars_fragment"],
	            ShaderChunk["alphamap_pars_fragment"],
	            ShaderChunk["envmap_pars_fragment"],
	            ShaderChunk["fog_pars_fragment"],
	            ShaderChunk["shadowmap_pars_fragment"],
	            ShaderChunk["specularmap_pars_fragment"],
	            ShaderChunk["logdepthbuf_pars_fragment"],
	            "void main() {",
	            "	vec3 outgoingLight = vec3( 0.0 );",
	            "	vec4 diffuseColor = vec4( diffuse, opacity );",
	            "	vec3 totalAmbientLight = ambientLightColor;",
	            "	vec3 shadowMask = vec3( 1.0 );",
	            ShaderChunk["logdepthbuf_fragment"],
	            ShaderChunk["map_fragment"],
	            ShaderChunk["color_fragment"],
	            ShaderChunk["alphamap_fragment"],
	            ShaderChunk["alphatest_fragment"],
	            ShaderChunk["specularmap_fragment"],
	            ShaderChunk["shadowmap_fragment"],
	            "	#ifdef DOUBLE_SIDED",
	            "		if ( gl_FrontFacing )",
	            "			outgoingLight += diffuseColor.rgb * ( vLightFront * shadowMask + totalAmbientLight ) + emissive;",
	            "		else",
	            "			outgoingLight += diffuseColor.rgb * ( vLightBack * shadowMask + totalAmbientLight ) + emissive;",
	            "	#else",
	            "		outgoingLight += diffuseColor.rgb * ( vLightFront * shadowMask + totalAmbientLight ) + emissive;",
	            "	#endif",
	            ShaderChunk["envmap_fragment"],
	            ShaderChunk["linear_to_gamma_fragment"],
	            ShaderChunk["fog_fragment"],
	            "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
	            "}"
	        ].join("\n")
	    },
	    'phong': {
	        uniforms: UniformsUtils.merge([
	            UniformsLib["common"],
	            UniformsLib["aomap"],
	            UniformsLib["lightmap"],
	            UniformsLib["emissivemap"],
	            UniformsLib["bumpmap"],
	            UniformsLib["normalmap"],
	            UniformsLib["displacementmap"],
	            UniformsLib["fog"],
	            UniformsLib["lights"],
	            UniformsLib["shadowmap"],
	            {
	                "emissive": { type: "c", value: new Color(0x000000) },
	                "specular": { type: "c", value: new Color(0x111111) },
	                "shininess": { type: "f", value: 30 }
	            }
	        ]),
	        vertexShader: [
	            "#define PHONG",
	            "varying vec3 vViewPosition;",
	            "#ifndef FLAT_SHADED",
	            "	varying vec3 vNormal;",
	            "#endif",
	            ShaderChunk["common"],
	            ShaderChunk["uv_pars_vertex"],
	            ShaderChunk["uv2_pars_vertex"],
	            ShaderChunk["displacementmap_pars_vertex"],
	            ShaderChunk["envmap_pars_vertex"],
	            ShaderChunk["lights_phong_pars_vertex"],
	            ShaderChunk["color_pars_vertex"],
	            ShaderChunk["morphtarget_pars_vertex"],
	            ShaderChunk["skinning_pars_vertex"],
	            ShaderChunk["shadowmap_pars_vertex"],
	            ShaderChunk["logdepthbuf_pars_vertex"],
	            "void main() {",
	            ShaderChunk["uv_vertex"],
	            ShaderChunk["uv2_vertex"],
	            ShaderChunk["color_vertex"],
	            ShaderChunk["beginnormal_vertex"],
	            ShaderChunk["morphnormal_vertex"],
	            ShaderChunk["skinbase_vertex"],
	            ShaderChunk["skinnormal_vertex"],
	            ShaderChunk["defaultnormal_vertex"],
	            "#ifndef FLAT_SHADED",
	            "	vNormal = normalize( transformedNormal );",
	            "#endif",
	            ShaderChunk["begin_vertex"],
	            ShaderChunk["displacementmap_vertex"],
	            ShaderChunk["morphtarget_vertex"],
	            ShaderChunk["skinning_vertex"],
	            ShaderChunk["project_vertex"],
	            ShaderChunk["logdepthbuf_vertex"],
	            "	vViewPosition = - mvPosition.xyz;",
	            ShaderChunk["worldpos_vertex"],
	            ShaderChunk["envmap_vertex"],
	            ShaderChunk["lights_phong_vertex"],
	            ShaderChunk["shadowmap_vertex"],
	            "}"
	        ].join("\n"),
	        fragmentShader: [
	            "#define PHONG",
	            "uniform vec3 diffuse;",
	            "uniform vec3 emissive;",
	            "uniform vec3 specular;",
	            "uniform float shininess;",
	            "uniform float opacity;",
	            ShaderChunk["common"],
	            ShaderChunk["color_pars_fragment"],
	            ShaderChunk["uv_pars_fragment"],
	            ShaderChunk["uv2_pars_fragment"],
	            ShaderChunk["map_pars_fragment"],
	            ShaderChunk["alphamap_pars_fragment"],
	            ShaderChunk["aomap_pars_fragment"],
	            ShaderChunk["lightmap_pars_fragment"],
	            ShaderChunk["emissivemap_pars_fragment"],
	            ShaderChunk["envmap_pars_fragment"],
	            ShaderChunk["fog_pars_fragment"],
	            ShaderChunk["lights_phong_pars_fragment"],
	            ShaderChunk["shadowmap_pars_fragment"],
	            ShaderChunk["bumpmap_pars_fragment"],
	            ShaderChunk["normalmap_pars_fragment"],
	            ShaderChunk["specularmap_pars_fragment"],
	            ShaderChunk["logdepthbuf_pars_fragment"],
	            "void main() {",
	            "	vec3 outgoingLight = vec3( 0.0 );",
	            "	vec4 diffuseColor = vec4( diffuse, opacity );",
	            "	vec3 totalAmbientLight = ambientLightColor;",
	            "	vec3 totalEmissiveLight = emissive;",
	            "	vec3 shadowMask = vec3( 1.0 );",
	            ShaderChunk["logdepthbuf_fragment"],
	            ShaderChunk["map_fragment"],
	            ShaderChunk["color_fragment"],
	            ShaderChunk["alphamap_fragment"],
	            ShaderChunk["alphatest_fragment"],
	            ShaderChunk["specularmap_fragment"],
	            ShaderChunk["normal_phong_fragment"],
	            ShaderChunk["lightmap_fragment"],
	            ShaderChunk["hemilight_fragment"],
	            ShaderChunk["aomap_fragment"],
	            ShaderChunk["emissivemap_fragment"],
	            ShaderChunk["lights_phong_fragment"],
	            ShaderChunk["shadowmap_fragment"],
	            "totalDiffuseLight *= shadowMask;",
	            "totalSpecularLight *= shadowMask;",
	            "#ifdef METAL",
	            "	outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) * specular + totalSpecularLight + totalEmissiveLight;",
	            "#else",
	            "	outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) + totalSpecularLight + totalEmissiveLight;",
	            "#endif",
	            ShaderChunk["envmap_fragment"],
	            ShaderChunk["linear_to_gamma_fragment"],
	            ShaderChunk["fog_fragment"],
	            "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
	            "}"
	        ].join("\n")
	    },
	    'points': {
	        uniforms: UniformsUtils.merge([
	            UniformsLib["points"],
	            UniformsLib["shadowmap"]
	        ]),
	        vertexShader: [
	            "uniform float size;",
	            "uniform float scale;",
	            ShaderChunk["common"],
	            ShaderChunk["color_pars_vertex"],
	            ShaderChunk["shadowmap_pars_vertex"],
	            ShaderChunk["logdepthbuf_pars_vertex"],
	            "void main() {",
	            ShaderChunk["color_vertex"],
	            "	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
	            "	#ifdef USE_SIZEATTENUATION",
	            "		gl_PointSize = size * ( scale / length( mvPosition.xyz ) );",
	            "	#else",
	            "		gl_PointSize = size;",
	            "	#endif",
	            "	gl_Position = projectionMatrix * mvPosition;",
	            ShaderChunk["logdepthbuf_vertex"],
	            ShaderChunk["worldpos_vertex"],
	            ShaderChunk["shadowmap_vertex"],
	            "}"
	        ].join("\n"),
	        fragmentShader: [
	            "uniform vec3 psColor;",
	            "uniform float opacity;",
	            ShaderChunk["common"],
	            ShaderChunk["color_pars_fragment"],
	            ShaderChunk["map_particle_pars_fragment"],
	            ShaderChunk["fog_pars_fragment"],
	            ShaderChunk["shadowmap_pars_fragment"],
	            ShaderChunk["logdepthbuf_pars_fragment"],
	            "void main() {",
	            "	vec3 outgoingLight = vec3( 0.0 );",
	            "	vec4 diffuseColor = vec4( psColor, opacity );",
	            "	vec3 shadowMask = vec3( 1.0 );",
	            ShaderChunk["logdepthbuf_fragment"],
	            ShaderChunk["map_particle_fragment"],
	            ShaderChunk["color_fragment"],
	            ShaderChunk["alphatest_fragment"],
	            ShaderChunk["shadowmap_fragment"],
	            "	outgoingLight = diffuseColor.rgb * shadowMask;",
	            ShaderChunk["fog_fragment"],
	            "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
	            "}"
	        ].join("\n")
	    },
	    'dashed': {
	        uniforms: UniformsUtils.merge([
	            UniformsLib["common"],
	            UniformsLib["fog"],
	            {
	                "scale": { type: "f", value: 1 },
	                "dashSize": { type: "f", value: 1 },
	                "totalSize": { type: "f", value: 2 }
	            }
	        ]),
	        vertexShader: [
	            "uniform float scale;",
	            "attribute float lineDistance;",
	            "varying float vLineDistance;",
	            ShaderChunk["common"],
	            ShaderChunk["color_pars_vertex"],
	            ShaderChunk["logdepthbuf_pars_vertex"],
	            "void main() {",
	            ShaderChunk["color_vertex"],
	            "	vLineDistance = scale * lineDistance;",
	            "	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
	            "	gl_Position = projectionMatrix * mvPosition;",
	            ShaderChunk["logdepthbuf_vertex"],
	            "}"
	        ].join("\n"),
	        fragmentShader: [
	            "uniform vec3 diffuse;",
	            "uniform float opacity;",
	            "uniform float dashSize;",
	            "uniform float totalSize;",
	            "varying float vLineDistance;",
	            ShaderChunk["common"],
	            ShaderChunk["color_pars_fragment"],
	            ShaderChunk["fog_pars_fragment"],
	            ShaderChunk["logdepthbuf_pars_fragment"],
	            "void main() {",
	            "	if ( mod( vLineDistance, totalSize ) > dashSize ) {",
	            "		discard;",
	            "	}",
	            "	vec3 outgoingLight = vec3( 0.0 );",
	            "	vec4 diffuseColor = vec4( diffuse, opacity );",
	            ShaderChunk["logdepthbuf_fragment"],
	            ShaderChunk["color_fragment"],
	            "	outgoingLight = diffuseColor.rgb;",
	            ShaderChunk["fog_fragment"],
	            "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
	            "}"
	        ].join("\n")
	    },
	    'depth': {
	        uniforms: {
	            "mNear": { type: "f", value: 1.0 },
	            "mFar": { type: "f", value: 2000.0 },
	            "opacity": { type: "f", value: 1.0 }
	        },
	        vertexShader: [
	            ShaderChunk["common"],
	            ShaderChunk["morphtarget_pars_vertex"],
	            ShaderChunk["logdepthbuf_pars_vertex"],
	            "void main() {",
	            ShaderChunk["begin_vertex"],
	            ShaderChunk["morphtarget_vertex"],
	            ShaderChunk["project_vertex"],
	            ShaderChunk["logdepthbuf_vertex"],
	            "}"
	        ].join("\n"),
	        fragmentShader: [
	            "uniform float mNear;",
	            "uniform float mFar;",
	            "uniform float opacity;",
	            ShaderChunk["common"],
	            ShaderChunk["logdepthbuf_pars_fragment"],
	            "void main() {",
	            ShaderChunk["logdepthbuf_fragment"],
	            "	#ifdef USE_LOGDEPTHBUF_EXT",
	            "		float depth = gl_FragDepthEXT / gl_FragCoord.w;",
	            "	#else",
	            "		float depth = gl_FragCoord.z / gl_FragCoord.w;",
	            "	#endif",
	            "	float color = 1.0 - smoothstep( mNear, mFar, depth );",
	            "	gl_FragColor = vec4( vec3( color ), opacity );",
	            "}"
	        ].join("\n")
	    },
	    'normal': {
	        uniforms: {
	            "opacity": { type: "f", value: 1.0 }
	        },
	        vertexShader: [
	            "varying vec3 vNormal;",
	            ShaderChunk["common"],
	            ShaderChunk["morphtarget_pars_vertex"],
	            ShaderChunk["logdepthbuf_pars_vertex"],
	            "void main() {",
	            "	vNormal = normalize( normalMatrix * normal );",
	            ShaderChunk["begin_vertex"],
	            ShaderChunk["morphtarget_vertex"],
	            ShaderChunk["project_vertex"],
	            ShaderChunk["logdepthbuf_vertex"],
	            "}"
	        ].join("\n"),
	        fragmentShader: [
	            "uniform float opacity;",
	            "varying vec3 vNormal;",
	            ShaderChunk["common"],
	            ShaderChunk["logdepthbuf_pars_fragment"],
	            "void main() {",
	            "	gl_FragColor = vec4( 0.5 * normalize( vNormal ) + 0.5, opacity );",
	            ShaderChunk["logdepthbuf_fragment"],
	            "}"
	        ].join("\n")
	    },
	    'cube': {
	        uniforms: { "tCube": { type: "t", value: null },
	            "tFlip": { type: "f", value: -1 } },
	        vertexShader: [
	            "varying vec3 vWorldPosition;",
	            ShaderChunk["common"],
	            ShaderChunk["logdepthbuf_pars_vertex"],
	            "void main() {",
	            "	vWorldPosition = transformDirection( position, modelMatrix );",
	            "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
	            ShaderChunk["logdepthbuf_vertex"],
	            "}"
	        ].join("\n"),
	        fragmentShader: [
	            "uniform samplerCube tCube;",
	            "uniform float tFlip;",
	            "varying vec3 vWorldPosition;",
	            ShaderChunk["common"],
	            ShaderChunk["logdepthbuf_pars_fragment"],
	            "void main() {",
	            "	gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );",
	            ShaderChunk["logdepthbuf_fragment"],
	            "}"
	        ].join("\n")
	    },
	    'equirect': {
	        uniforms: { "tEquirect": { type: "t", value: null },
	            "tFlip": { type: "f", value: -1 } },
	        vertexShader: [
	            "varying vec3 vWorldPosition;",
	            ShaderChunk["common"],
	            ShaderChunk["logdepthbuf_pars_vertex"],
	            "void main() {",
	            "	vWorldPosition = transformDirection( position, modelMatrix );",
	            "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
	            ShaderChunk["logdepthbuf_vertex"],
	            "}"
	        ].join("\n"),
	        fragmentShader: [
	            "uniform sampler2D tEquirect;",
	            "uniform float tFlip;",
	            "varying vec3 vWorldPosition;",
	            ShaderChunk["common"],
	            ShaderChunk["logdepthbuf_pars_fragment"],
	            "void main() {",
	            "vec3 direction = normalize( vWorldPosition );",
	            "vec2 sampleUV;",
	            "sampleUV.y = saturate( tFlip * direction.y * -0.5 + 0.5 );",
	            "sampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;",
	            "gl_FragColor = texture2D( tEquirect, sampleUV );",
	            ShaderChunk["logdepthbuf_fragment"],
	            "}"
	        ].join("\n")
	    },
	    'depthRGBA': {
	        uniforms: {},
	        vertexShader: [
	            ShaderChunk["common"],
	            ShaderChunk["morphtarget_pars_vertex"],
	            ShaderChunk["skinning_pars_vertex"],
	            ShaderChunk["logdepthbuf_pars_vertex"],
	            "void main() {",
	            ShaderChunk["skinbase_vertex"],
	            ShaderChunk["begin_vertex"],
	            ShaderChunk["morphtarget_vertex"],
	            ShaderChunk["skinning_vertex"],
	            ShaderChunk["project_vertex"],
	            ShaderChunk["logdepthbuf_vertex"],
	            "}"
	        ].join("\n"),
	        fragmentShader: [
	            ShaderChunk["common"],
	            ShaderChunk["logdepthbuf_pars_fragment"],
	            "vec4 pack_depth( const in float depth ) {",
	            "	const vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );",
	            "	const vec4 bit_mask = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );",
	            "	vec4 res = mod( depth * bit_shift * vec4( 255 ), vec4( 256 ) ) / vec4( 255 );",
	            "	res -= res.xxyz * bit_mask;",
	            "	return res;",
	            "}",
	            "void main() {",
	            ShaderChunk["logdepthbuf_fragment"],
	            "	#ifdef USE_LOGDEPTHBUF_EXT",
	            "		gl_FragData[ 0 ] = pack_depth( gl_FragDepthEXT );",
	            "	#else",
	            "		gl_FragData[ 0 ] = pack_depth( gl_FragCoord.z );",
	            "	#endif",
	            "}"
	        ].join("\n")
	    },
	    'distanceRGBA': {
	        uniforms: {
	            "lightPos": { type: "v3", value: new Vector3(0, 0, 0) }
	        },
	        vertexShader: [
	            "varying vec4 vWorldPosition;",
	            ShaderChunk["common"],
	            ShaderChunk["morphtarget_pars_vertex"],
	            ShaderChunk["skinning_pars_vertex"],
	            "void main() {",
	            ShaderChunk["skinbase_vertex"],
	            ShaderChunk["begin_vertex"],
	            ShaderChunk["morphtarget_vertex"],
	            ShaderChunk["skinning_vertex"],
	            ShaderChunk["project_vertex"],
	            ShaderChunk["worldpos_vertex"],
	            "vWorldPosition = worldPosition;",
	            "}"
	        ].join("\n"),
	        fragmentShader: [
	            "uniform vec3 lightPos;",
	            "varying vec4 vWorldPosition;",
	            ShaderChunk["common"],
	            "vec4 pack1K ( float depth ) {",
	            "   depth /= 1000.0;",
	            "   const vec4 bitSh = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );",
	            "	const vec4 bitMsk = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );",
	            "	vec4 res = fract( depth * bitSh );",
	            "	res -= res.xxyz * bitMsk;",
	            "	return res; ",
	            "}",
	            "float unpack1K ( vec4 color ) {",
	            "	const vec4 bitSh = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );",
	            "	return dot( color, bitSh ) * 1000.0;",
	            "}",
	            "void main () {",
	            "	gl_FragColor = pack1K( length( vWorldPosition.xyz - lightPos.xyz ) );",
	            "}"
	        ].join("\n")
	    }
	};
	module.exports = ShaderLib;
	//# sourceMappingURL=ShaderLib.js.map

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	var Color = __webpack_require__(14);
	var Vector2 = __webpack_require__(21);
	var Vector3 = __webpack_require__(4);
	var Vector4 = __webpack_require__(37);
	var Matrix3 = __webpack_require__(8);
	var Matrix4 = __webpack_require__(5);
	var Texture = __webpack_require__(31);
	var UniformsUtils = {
	    merge: function (uniforms) {
	        var merged = {};
	        for (var u = 0; u < uniforms.length; u++) {
	            var tmp = this.clone(uniforms[u]);
	            for (var p in tmp) {
	                merged[p] = tmp[p];
	            }
	        }
	        return merged;
	    },
	    clone: function (uniforms_src) {
	        var uniforms_dst = {};
	        for (var u in uniforms_src) {
	            uniforms_dst[u] = {};
	            for (var p in uniforms_src[u]) {
	                var parameter_src = uniforms_src[u][p];
	                if (parameter_src instanceof Color ||
	                    parameter_src instanceof Vector2 ||
	                    parameter_src instanceof Vector3 ||
	                    parameter_src instanceof Vector4 ||
	                    parameter_src instanceof Matrix3 ||
	                    parameter_src instanceof Matrix4 ||
	                    parameter_src instanceof Texture) {
	                    uniforms_dst[u][p] = parameter_src.clone();
	                }
	                else if (Array.isArray(parameter_src)) {
	                    uniforms_dst[u][p] = parameter_src.slice();
	                }
	                else {
	                    uniforms_dst[u][p] = parameter_src;
	                }
	            }
	        }
	        return uniforms_dst;
	    }
	};
	module.exports = UniformsUtils;
	//# sourceMappingURL=UniformsUtils.js.map

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	var Color = __webpack_require__(14);
	var Vector4 = __webpack_require__(37);
	var Vector2 = __webpack_require__(21);
	var UniformsLib = {
	    common: {
	        "diffuse": { type: "c", value: new Color(0xeeeeee) },
	        "opacity": { type: "f", value: 1.0 },
	        "map": { type: "t", value: null },
	        "offsetRepeat": { type: "v4", value: new Vector4(0, 0, 1, 1) },
	        "specularMap": { type: "t", value: null },
	        "alphaMap": { type: "t", value: null },
	        "envMap": { type: "t", value: null },
	        "flipEnvMap": { type: "f", value: -1 },
	        "reflectivity": { type: "f", value: 1.0 },
	        "refractionRatio": { type: "f", value: 0.98 }
	    },
	    aomap: {
	        "aoMap": { type: "t", value: null },
	        "aoMapIntensity": { type: "f", value: 1 },
	    },
	    lightmap: {
	        "lightMap": { type: "t", value: null },
	        "lightMapIntensity": { type: "f", value: 1 },
	    },
	    emissivemap: {
	        "emissiveMap": { type: "t", value: null },
	    },
	    bumpmap: {
	        "bumpMap": { type: "t", value: null },
	        "bumpScale": { type: "f", value: 1 }
	    },
	    normalmap: {
	        "normalMap": { type: "t", value: null },
	        "normalScale": { type: "v2", value: new Vector2(1, 1) }
	    },
	    displacementmap: {
	        "displacementMap": { type: "t", value: null },
	        "displacementScale": { type: "f", value: 1 },
	        "displacementBias": { type: "f", value: 0 }
	    },
	    fog: {
	        "fogDensity": { type: "f", value: 0.00025 },
	        "fogNear": { type: "f", value: 1 },
	        "fogFar": { type: "f", value: 2000 },
	        "fogColor": { type: "c", value: new Color(0xffffff) }
	    },
	    lights: {
	        "ambientLightColor": { type: "fv", value: [] },
	        "directionalLightDirection": { type: "fv", value: [] },
	        "directionalLightColor": { type: "fv", value: [] },
	        "hemisphereLightDirection": { type: "fv", value: [] },
	        "hemisphereLightSkyColor": { type: "fv", value: [] },
	        "hemisphereLightGroundColor": { type: "fv", value: [] },
	        "pointLightColor": { type: "fv", value: [] },
	        "pointLightPosition": { type: "fv", value: [] },
	        "pointLightDistance": { type: "fv1", value: [] },
	        "pointLightDecay": { type: "fv1", value: [] },
	        "spotLightColor": { type: "fv", value: [] },
	        "spotLightPosition": { type: "fv", value: [] },
	        "spotLightDirection": { type: "fv", value: [] },
	        "spotLightDistance": { type: "fv1", value: [] },
	        "spotLightAngleCos": { type: "fv1", value: [] },
	        "spotLightExponent": { type: "fv1", value: [] },
	        "spotLightDecay": { type: "fv1", value: [] }
	    },
	    points: {
	        "psColor": { type: "c", value: new Color(0xeeeeee) },
	        "opacity": { type: "f", value: 1.0 },
	        "size": { type: "f", value: 1.0 },
	        "scale": { type: "f", value: 1.0 },
	        "map": { type: "t", value: null },
	        "offsetRepeat": { type: "v4", value: new Vector4(0, 0, 1, 1) },
	        "fogDensity": { type: "f", value: 0.00025 },
	        "fogNear": { type: "f", value: 1 },
	        "fogFar": { type: "f", value: 2000 },
	        "fogColor": { type: "c", value: new Color(0xffffff) }
	    },
	    shadowmap: {
	        "shadowMap": { type: "tv", value: [] },
	        "shadowMapSize": { type: "v2v", value: [] },
	        "shadowBias": { type: "fv1", value: [] },
	        "shadowDarkness": { type: "fv1", value: [] },
	        "shadowMatrix": { type: "m4v", value: [] }
	    }
	};
	module.exports = UniformsLib;
	//# sourceMappingURL=UniformsLib.js.map

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	var ShaderChunk = __webpack_require__(76);
	module.exports = ShaderChunk;
	//# sourceMappingURL=ShaderChunk.js.map

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  alphamap_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./AlphaMapFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  alphamap_pars_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./AlphaMapParsFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  alphatest_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./AlphaTestFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  aomap_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./AOMapFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  aomap_pars_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./AOMapParsFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  begin_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./BeginVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  beginnormal_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./BeginNormalVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  bumpmap_pars_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./BumpMapParsFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  color_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./ColorFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  color_pars_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./ColorParsFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  color_pars_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./ColorParsFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  color_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./ColorVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  common:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./Common.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  defaultnormal_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./DefaultNormalVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  displacementmap_pars_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./DisplacementMapParsVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  displacementmap_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./DisplacementMapVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  emissivemap_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./EmissiveMapFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  emissivemap_pars_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./EmissiveMapParsFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  envmap_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./EnvMapFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  envmap_pars_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./EnvMapParsFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  envmap_pars_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./EnvMapParsVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  envmap_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./EnvMapVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  fog_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./FogFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  fog_pars_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./FogParsFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  hemilight_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./HemiLightFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  lightmap_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./LightMapFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  lightmap_pars_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./LightMapParsFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  lights_lambert_pars_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./LightsLambertParsVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  lights_lambert_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./LightsLambertVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  lights_phong_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./LightsPhongFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  lights_phong_pars_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./LightsPhongParsFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  lights_phong_pars_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./LightsPhongParsVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  lights_phong_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./LightsPhongVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  linear_to_gamma_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./LinearToGammaFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  logdepthbuf_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./LogDepthBufFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  logdepthbuf_pars_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./LogDepthBufParsFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  logdepthbuf_pars_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./LogDepthBufParsVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  logdepthbuf_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./LogDepthBufVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  map_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./MapFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  map_pars_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./MapParsFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  map_particle_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./MapParticleFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  map_particle_pars_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./MapParticleParsFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  morphnormal_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./MorphNormalVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  morphtarget_pars_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./MorphTargetParsVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  morphtarget_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./MorphTargetVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  normal_phong_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./NormalPhongFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  normalmap_pars_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./NormalMapParsFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  project_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./ProjectVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  shadowmap_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./ShadowMapFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  shadowmap_pars_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./ShadowMapParsFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  shadowmap_pars_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./ShadowMapParsVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  shadowmap_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./ShadowMapVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  skinbase_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./SkinbaseVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  skinning_pars_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./SkinningParsVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  skinning_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./SkinningVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  skinnormal_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./SkinNormalVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  specularmap_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./SpecularMapFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  specularmap_pars_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./SpecularMapParsFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  uv2_pars_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./UV2ParsFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  uv2_pars_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./UV2ParsVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  uv2_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./UV2Vertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  uv_pars_fragment:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./UVParsFragment.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  uv_pars_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./UVParsVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  uv_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./UVVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(),
	  worldpos_vertex:__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./WorldPosVertex.glsl!\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))()

	};


/***/ },
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */,
/* 101 */,
/* 102 */,
/* 103 */,
/* 104 */,
/* 105 */,
/* 106 */,
/* 107 */,
/* 108 */,
/* 109 */,
/* 110 */,
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */,
/* 117 */,
/* 118 */,
/* 119 */,
/* 120 */,
/* 121 */,
/* 122 */,
/* 123 */,
/* 124 */,
/* 125 */,
/* 126 */,
/* 127 */,
/* 128 */,
/* 129 */,
/* 130 */,
/* 131 */,
/* 132 */,
/* 133 */,
/* 134 */,
/* 135 */,
/* 136 */,
/* 137 */,
/* 138 */,
/* 139 */,
/* 140 */,
/* 141 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Material = __webpack_require__(25);
	var ShadingType = __webpack_require__(32);
	var ColorsType = __webpack_require__(33);
	var UniformsUtils = __webpack_require__(73);
	var ShaderMaterial = (function (_super) {
	    __extends(ShaderMaterial, _super);
	    function ShaderMaterial(parameters) {
	        _super.call(this);
	        this.type = 'ShaderMaterial';
	        this.defines = {};
	        this.uniforms = {};
	        this.vertexShader = 'void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}';
	        this.fragmentShader = 'void main() {\n\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}';
	        this.shading = ShadingType.SmoothShading;
	        this.linewidth = 1;
	        this.wireframe = false;
	        this.wireframeLinewidth = 1;
	        this.fog = false;
	        this.lights = false;
	        this.vertexColors = ColorsType.NoColors;
	        this.skinning = false;
	        this.morphTargets = false;
	        this.morphNormals = false;
	        this.derivatives = false;
	        this.defaultAttributeValues = {
	            'color': [1, 1, 1],
	            'uv': [0, 0],
	            'uv2': [0, 0]
	        };
	        this.index0AttributeName = undefined;
	        if (parameters !== undefined) {
	            if (parameters.attributes !== undefined) {
	                console.error('THREE.ShaderMaterial: attributes should now be defined in THREE.BufferGeometry instead.');
	            }
	            this.setValues(parameters);
	        }
	    }
	    ShaderMaterial.prototype.copy = function (source) {
	        _super.prototype.copy.call(this, source);
	        this.fragmentShader = source.fragmentShader;
	        this.vertexShader = source.vertexShader;
	        this.uniforms = UniformsUtils.clone(source.uniforms);
	        this.attributes = source.attributes;
	        this.defines = source.defines;
	        this.shading = source.shading;
	        this.wireframe = source.wireframe;
	        this.wireframeLinewidth = source.wireframeLinewidth;
	        this.fog = source.fog;
	        this.lights = source.lights;
	        this.vertexColors = source.vertexColors;
	        this.skinning = source.skinning;
	        this.morphTargets = source.morphTargets;
	        this.morphNormals = source.morphNormals;
	        this.derivatives = source.derivatives;
	        return this;
	    };
	    ;
	    ShaderMaterial.prototype.toJSON = function (meta) {
	        var data = _super.prototype.toJSON.call(this, meta);
	        data.uniforms = this.uniforms;
	        data.attributes = this.attributes;
	        data.vertexShader = this.vertexShader;
	        data.fragmentShader = this.fragmentShader;
	        return data;
	    };
	    ;
	    return ShaderMaterial;
	})(Material);
	module.exports = ShaderMaterial;
	//# sourceMappingURL=ShaderMaterial.js.map

/***/ },
/* 142 */
/***/ function(module, exports) {

	var MeshPhongMaterial = (function () {
	    function MeshPhongMaterial() {
	    }
	    return MeshPhongMaterial;
	})();
	module.exports = MeshPhongMaterial;
	//# sourceMappingURL=MeshPhongMaterial.js.map

/***/ },
/* 143 */
/***/ function(module, exports) {

	var MeshLambertMaterial = (function () {
	    function MeshLambertMaterial() {
	    }
	    return MeshLambertMaterial;
	})();
	module.exports = MeshLambertMaterial;
	//# sourceMappingURL=MeshLambertMaterial.js.map

/***/ },
/* 144 */
/***/ function(module, exports) {

	var LineBasicMaterial = (function () {
	    function LineBasicMaterial() {
	    }
	    return LineBasicMaterial;
	})();
	module.exports = LineBasicMaterial;
	//# sourceMappingURL=LineBasicMaterial.js.map

/***/ },
/* 145 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Material = __webpack_require__(25);
	var LineDashedMaterial = (function (_super) {
	    __extends(LineDashedMaterial, _super);
	    function LineDashedMaterial() {
	        _super.apply(this, arguments);
	    }
	    return LineDashedMaterial;
	})(Material);
	module.exports = LineDashedMaterial;
	//# sourceMappingURL=LineDashedMaterial.js.map

/***/ },
/* 146 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Material = __webpack_require__(25);
	var PointsMaterial = (function (_super) {
	    __extends(PointsMaterial, _super);
	    function PointsMaterial() {
	        _super.apply(this, arguments);
	    }
	    return PointsMaterial;
	})(Material);
	module.exports = PointsMaterial;
	//# sourceMappingURL=PointsMaterial.js.map

/***/ },
/* 147 */
/***/ function(module, exports) {

	var MeshDepthMaterial = (function () {
	    function MeshDepthMaterial() {
	    }
	    return MeshDepthMaterial;
	})();
	module.exports = MeshDepthMaterial;
	//# sourceMappingURL=MeshDepthMaterial.js.map

/***/ },
/* 148 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Material = __webpack_require__(71);
	var MeshNormalMaterial = (function (_super) {
	    __extends(MeshNormalMaterial, _super);
	    function MeshNormalMaterial() {
	        _super.apply(this, arguments);
	    }
	    return MeshNormalMaterial;
	})(Material);
	module.exports = MeshNormalMaterial;
	//# sourceMappingURL=MeshNormalMaterial.js.map

/***/ },
/* 149 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var BufferGeometry = __webpack_require__(19);
	var InstancedBufferGeometry = (function (_super) {
	    __extends(InstancedBufferGeometry, _super);
	    function InstancedBufferGeometry() {
	        _super.call(this);
	        this.type = 'InstancedBufferGeometry';
	        this.maxInstancedCount = undefined;
	    }
	    InstancedBufferGeometry.prototype.addGroup = function (start, count, instances) {
	        this.groups.push({
	            start: start,
	            count: count,
	            instances: instances
	        });
	    };
	    InstancedBufferGeometry.prototype.copy = function (source) {
	        var index = source.index;
	        if (index !== null) {
	            this.setIndex(index.clone());
	        }
	        var attributes = source.attributes;
	        for (var name in attributes) {
	            var attribute = attributes[name];
	            this.addAttribute(name, attribute.clone());
	        }
	        var groups = source.groups;
	        for (var i = 0, l = groups.length; i < l; i++) {
	            var group = groups[i];
	            this.addGroup(group.start, group.count, group.instances);
	        }
	        return this;
	    };
	    return InstancedBufferGeometry;
	})(BufferGeometry);
	module.exports = InstancedBufferGeometry;
	//# sourceMappingURL=InstancedBufferGeometry.js.map

/***/ },
/* 150 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var BufferAttribute = __webpack_require__(36);
	var InstancedBufferAttribute = (function (_super) {
	    __extends(InstancedBufferAttribute, _super);
	    function InstancedBufferAttribute(array, itemSize, meshPerAttribute) {
	        _super.call(this, array, itemSize);
	        this.meshPerAttribute = meshPerAttribute || 1;
	    }
	    InstancedBufferAttribute.prototype.copy = function (source) {
	        _super.prototype.copy.call(this, source);
	        this.meshPerAttribute = source.meshPerAttribute;
	        return this;
	    };
	    ;
	    return InstancedBufferAttribute;
	})(BufferAttribute);
	module.exports = InstancedBufferAttribute;
	//# sourceMappingURL=InstancedBufferAttribute.js.map

/***/ },
/* 151 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Geometry = __webpack_require__(20);
	var Vector3 = __webpack_require__(4);
	var Vector2 = __webpack_require__(21);
	var Face3 = __webpack_require__(22);
	var BoxGeometry = (function (_super) {
	    __extends(BoxGeometry, _super);
	    function BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments) {
	        _super.call(this);
	        this.type = 'BoxGeometry';
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
	        this.buildPlane('z', 'y', -1, -1, depth, height, width_half, 0);
	        this.buildPlane('z', 'y', 1, -1, depth, height, -width_half, 1);
	        this.buildPlane('x', 'z', 1, 1, width, depth, height_half, 2);
	        this.buildPlane('x', 'z', 1, -1, width, depth, -height_half, 3);
	        this.buildPlane('x', 'y', 1, -1, width, height, depth_half, 4);
	        this.buildPlane('x', 'y', -1, -1, width, height, -depth_half, 5);
	    }
	    BoxGeometry.prototype.buildPlane = function (u, v, udir, vdir, width, height, depth, materialIndex) {
	        var scope = this;
	        var w, ix, iy, gridX = scope.widthSegments, gridY = scope.heightSegments, width_half = width / 2, height_half = height / 2, offset = scope.vertices.length;
	        if ((u === 'x' && v === 'y') || (u === 'y' && v === 'x')) {
	            w = 'z';
	        }
	        else if ((u === 'x' && v === 'z') || (u === 'z' && v === 'x')) {
	            w = 'y';
	            gridY = scope.depthSegments;
	        }
	        else if ((u === 'z' && v === 'y') || (u === 'y' && v === 'z')) {
	            w = 'x';
	            gridX = scope.depthSegments;
	        }
	        var gridX1 = gridX + 1, gridY1 = gridY + 1, segment_width = width / gridX, segment_height = height / gridY, normal = new Vector3();
	        normal[w] = depth > 0 ? 1 : -1;
	        for (iy = 0; iy < gridY1; iy++) {
	            for (ix = 0; ix < gridX1; ix++) {
	                var vector = new Vector3();
	                vector[u] = (ix * segment_width - width_half) * udir;
	                vector[v] = (iy * segment_height - height_half) * vdir;
	                vector[w] = depth;
	                scope.vertices.push(vector);
	            }
	        }
	        for (iy = 0; iy < gridY; iy++) {
	            for (ix = 0; ix < gridX; ix++) {
	                var a = ix + gridX1 * iy;
	                var b = ix + gridX1 * (iy + 1);
	                var c = (ix + 1) + gridX1 * (iy + 1);
	                var d = (ix + 1) + gridX1 * iy;
	                var uva = new Vector2(ix / gridX, 1 - iy / gridY);
	                var uvb = new Vector2(ix / gridX, 1 - (iy + 1) / gridY);
	                var uvc = new Vector2((ix + 1) / gridX, 1 - (iy + 1) / gridY);
	                var uvd = new Vector2((ix + 1) / gridX, 1 - iy / gridY);
	                var face = new Face3(a + offset, b + offset, d + offset);
	                face.normal.copy(normal);
	                face.vertexNormals.push(normal.clone(), normal.clone(), normal.clone());
	                face.materialIndex = materialIndex;
	                scope.faces.push(face);
	                scope.faceVertexUvs[0].push([uva, uvb, uvd]);
	                face = new Face3(b + offset, c + offset, d + offset);
	                face.normal.copy(normal);
	                face.vertexNormals.push(normal.clone(), normal.clone(), normal.clone());
	                face.materialIndex = materialIndex;
	                scope.faces.push(face);
	                scope.faceVertexUvs[0].push([uvb.clone(), uvc, uvd.clone()]);
	            }
	        }
	    };
	    return BoxGeometry;
	})(Geometry);
	module.exports = BoxGeometry;
	//# sourceMappingURL=BoxGeometry.js.map

/***/ }
/******/ ]);