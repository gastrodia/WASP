var WOZLLA;
(function (WOZLLA) {
    var type = function (val) {
        switch (toString.call(val)) {
            case '[object Function]': return 'function';
            case '[object Date]': return 'date';
            case '[object RegExp]': return 'regexp';
            case '[object Arguments]': return 'arguments';
            case '[object Array]': return 'array';
            case '[object String]': return 'string';
        }
        if (typeof val == 'object' && val && typeof val.length == 'number') {
            try {
                if (typeof val.callee == 'function')
                    return 'arguments';
            }
            catch (ex) {
                if (ex instanceof TypeError) {
                    return 'arguments';
                }
            }
        }
        if (val === null)
            return 'null';
        if (val === undefined)
            return 'undefined';
        if (val && val.nodeType === 1)
            return 'element';
        if (val === Object(val))
            return 'object';
        return typeof val;
    };
    var jsonpID = 0, document = window.document, key, name, rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, scriptTypeRE = /^(?:text|application)\/javascript/i, xmlTypeRE = /^(?:text|application)\/xml/i, jsonType = 'application/json', htmlType = 'text/html', blankRE = /^\s*$/;
    WOZLLA.ajax = function (options) {
        var settings = extend({}, options || {});
        for (key in WOZLLA.ajax.settings)
            if (settings[key] === undefined)
                settings[key] = WOZLLA.ajax.settings[key];
        ajaxStart(settings);
        if (!settings.crossDomain)
            settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
                RegExp.$2 != window.location.host;
        var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url);
        if (dataType == 'jsonp' || hasPlaceholder) {
            if (!hasPlaceholder)
                settings.url = appendQuery(settings.url, 'callback=?');
            return WOZLLA.ajax.JSONP(settings);
        }
        if (!settings.url)
            settings.url = window.location.toString();
        serializeData(settings);
        var mime = settings.accepts[dataType], baseHeaders = {}, protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol, xhr = WOZLLA.ajax.settings.xhr(), abortTimeout;
        if (!settings.crossDomain)
            baseHeaders['X-Requested-With'] = 'XMLHttpRequest';
        if (mime) {
            baseHeaders['Accept'] = mime;
            if (mime.indexOf(',') > -1)
                mime = mime.split(',', 2)[0];
            xhr.overrideMimeType && xhr.overrideMimeType(mime);
        }
        if (settings.contentType || (settings.data && settings.type.toUpperCase() != 'GET'))
            baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded');
        settings.headers = extend(baseHeaders, settings.headers || {});
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                clearTimeout(abortTimeout);
                var result, error = false;
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                    dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'));
                    result = xhr.responseText;
                    try {
                        if (dataType == 'script')
                            (1, eval)(result);
                        else if (dataType == 'xml')
                            result = xhr.responseXML;
                        else if (dataType == 'json')
                            result = blankRE.test(result) ? null : JSON.parse(result);
                    }
                    catch (e) {
                        error = e;
                    }
                    if (error)
                        ajaxError(error, 'parsererror', xhr, settings);
                    else
                        ajaxSuccess(result, xhr, settings);
                }
                else {
                    ajaxError(null, 'error', xhr, settings);
                }
            }
        };
        var async = 'async' in settings ? settings.async : true;
        xhr.open(settings.type, settings.url, async);
        for (name in settings.headers)
            xhr.setRequestHeader(name, settings.headers[name]);
        if (ajaxBeforeSend(xhr, settings) === false) {
            xhr.abort();
            return false;
        }
        if (settings.timeout > 0)
            abortTimeout = setTimeout(function () {
                xhr.onreadystatechange = empty;
                xhr.abort();
                ajaxError(null, 'timeout', xhr, settings);
            }, settings.timeout);
        // avoid sending empty string (#319)
        xhr.send(settings.data ? settings.data : null);
        return xhr;
    };
    // trigger a custom event and return false if it was cancelled
    function triggerAndReturn(context, eventName, data) {
        //todo: Fire off some events
        //var event = $.Event(eventName)
        //$(context).trigger(event, data)
        return true; //!event.defaultPrevented
    }
    // trigger an Ajax "global" event
    function triggerGlobal(settings, context, eventName, data) {
        if (settings.global)
            return triggerAndReturn(context || document, eventName, data);
    }
    // Number of active Ajax requests
    WOZLLA.ajax.active = 0;
    function ajaxStart(settings) {
        if (settings.global && WOZLLA.ajax.active++ === 0)
            triggerGlobal(settings, null, 'ajaxStart');
    }
    function ajaxStop(settings) {
        if (settings.global && !(--WOZLLA.ajax.active))
            triggerGlobal(settings, null, 'ajaxStop');
    }
    // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
    function ajaxBeforeSend(xhr, settings) {
        var context = settings.context;
        if (settings.beforeSend.call(context, xhr, settings) === false ||
            triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
            return false;
        triggerGlobal(settings, context, 'ajaxSend', [xhr, settings]);
    }
    function ajaxSuccess(data, xhr, settings) {
        var context = settings.context, status = 'success';
        settings.success.call(context, data, status, xhr);
        triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data]);
        ajaxComplete(status, xhr, settings);
    }
    // type: "timeout", "error", "abort", "parsererror"
    function ajaxError(error, type, xhr, settings) {
        var context = settings.context;
        settings.error.call(context, xhr, type, error);
        triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error]);
        ajaxComplete(type, xhr, settings);
    }
    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
    function ajaxComplete(status, xhr, settings) {
        var context = settings.context;
        settings.complete.call(context, xhr, status);
        triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings]);
        ajaxStop(settings);
    }
    // Empty function, used as default callback
    function empty() { }
    WOZLLA.ajax.JSONP = function (options) {
        if (!('type' in options))
            return WOZLLA.ajax(options);
        var callbackName = 'jsonp' + (++jsonpID), script = document.createElement('script'), abort = function () {
            //todo: remove script
            //$(script).remove()
            if (callbackName in window)
                window[callbackName] = empty;
            ajaxComplete('abort', xhr, options);
        }, xhr = { abort: abort }, abortTimeout, head = document.getElementsByTagName("head")[0]
            || document.documentElement;
        if (options.error)
            script.onerror = function () {
                xhr.abort();
                options.error();
            };
        window[callbackName] = function (data) {
            clearTimeout(abortTimeout);
            //todo: remove script
            //$(script).remove()
            delete window[callbackName];
            ajaxSuccess(data, xhr, options);
        };
        serializeData(options);
        script.src = options.url.replace(/=\?/, '=' + callbackName);
        // Use insertBefore instead of appendChild to circumvent an IE6 bug.
        // This arises when a base node is used (see jQuery bugs #2709 and #4378).
        head.insertBefore(script, head.firstChild);
        if (options.timeout > 0)
            abortTimeout = setTimeout(function () {
                xhr.abort();
                ajaxComplete('timeout', xhr, options);
            }, options.timeout);
        return xhr;
    };
    WOZLLA.ajax.settings = {
        // Default type of request
        type: 'GET',
        // Callback that is executed before request
        beforeSend: empty,
        // Callback that is executed if the request succeeds
        success: empty,
        // Callback that is executed the the server drops error
        error: empty,
        // Callback that is executed on request complete (both: error and success)
        complete: empty,
        // The context for the callbacks
        context: null,
        // Whether to trigger "global" Ajax events
        global: true,
        // Transport
        xhr: function () {
            return new XMLHttpRequest();
        },
        // MIME types mapping
        accepts: {
            script: 'text/javascript, application/javascript',
            json: jsonType,
            xml: 'application/xml, text/xml',
            html: htmlType,
            text: 'text/plain'
        },
        // Whether the request is to another domain
        crossDomain: false,
        // Default timeout
        timeout: 0
    };
    function mimeToDataType(mime) {
        return mime && (mime == htmlType ? 'html' :
            mime == jsonType ? 'json' :
                scriptTypeRE.test(mime) ? 'script' :
                    xmlTypeRE.test(mime) && 'xml') || 'text';
    }
    function appendQuery(url, query) {
        return (url + '&' + query).replace(/[&?]{1,2}/, '?');
    }
    // serialize payload and append it to the URL for GET requests
    function serializeData(options) {
        if (type(options.data) === 'object')
            options.data = param(options.data);
        if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
            options.url = appendQuery(options.url, options.data);
    }
    WOZLLA.ajax.get = function (url, success) { return WOZLLA.ajax({ url: url, success: success }); };
    WOZLLA.ajax.post = function (url, data, success, dataType) {
        if (type(data) === 'function')
            dataType = dataType || success, success = data, data = null;
        return WOZLLA.ajax({ type: 'POST', url: url, data: data, success: success, dataType: dataType });
    };
    WOZLLA.ajax.getJSON = function (url, success) {
        return WOZLLA.ajax({ url: url, success: success, dataType: 'json' });
    };
    var escape = encodeURIComponent;
    function serialize(params, obj, traditional, scope) {
        var array = type(obj) === 'array';
        for (var key in obj) {
            var value = obj[key];
            if (scope)
                key = traditional ? scope : scope + '[' + (array ? '' : key) + ']';
            // handle data in serializeArray() format
            if (!scope && array)
                params.add(value.name, value.value);
            else if (traditional ? (type(value) === 'array') : (type(value) === 'object'))
                serialize(params, value, traditional, key);
            else
                params.add(key, value);
        }
    }
    function param(obj, traditional) {
        var params = [];
        params.add = function (k, v) { this.push(escape(k) + '=' + escape(v)); };
        serialize(params, obj, traditional);
        return params.join('&').replace('%20', '+');
    }
    function extend(target, a) {
        var slice = Array.prototype.slice;
        slice.call(arguments, 1).forEach(function (source) {
            for (key in source)
                if (source[key] !== undefined)
                    target[key] = source[key];
        });
        return target;
    }
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var asset;
    (function (asset_1) {
        var AssetLoader = (function () {
            function AssetLoader(assetManager) {
                this.canceled = false;
                this.loading = false;
                this.assetManager = assetManager;
            }
            AssetLoader.prototype.loadAsync = function (decriptor, callback) {
                var _this = this;
                if (this.canceled) {
                    callback(AssetLoader.CANCEL_ERROR, null);
                    return;
                }
                if (this.loading) {
                    callback(AssetLoader.LOADING_ERROR, null);
                    return;
                }
                this.begin();
                this.doLoadAsync(decriptor, function (error, asset) {
                    _this.end();
                    callback(error, asset);
                });
            };
            AssetLoader.prototype.cancel = function () {
                this.canceled = true;
            };
            AssetLoader.prototype.isLoading = function () {
                return this.loading;
            };
            AssetLoader.prototype.isCanceled = function () {
                return this.canceled;
            };
            AssetLoader.prototype.begin = function () {
                this.loading = true;
            };
            AssetLoader.prototype.end = function () {
                this.loading = false;
                this.canceled = false;
            };
            AssetLoader.prototype.doLoadAsync = function (decriptor, callback) {
                throw new Error('This is an abstract method');
            };
            AssetLoader.CANCEL_ERROR = "Loader canceled";
            AssetLoader.LOADING_ERROR = "Loader is loading";
            return AssetLoader;
        })();
        asset_1.AssetLoader = AssetLoader;
    })(asset = WOZLLA.asset || (WOZLLA.asset = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var asset;
    (function (asset) {
        var AssetDescriptor = (function () {
            function AssetDescriptor(assetPath) {
                this._hashCode = WOZLLA.util.IHashable.randomHashCode();
                this._assetPath = assetPath;
            }
            Object.defineProperty(AssetDescriptor.prototype, "assetPath", {
                get: function () {
                    return this._assetPath;
                },
                enumerable: true,
                configurable: true
            });
            AssetDescriptor.prototype.getLoader = function () {
                return this._loader;
            };
            AssetDescriptor.prototype.setLoader = function (loader) {
                this._loader = loader;
            };
            AssetDescriptor.prototype.getReferenceKey = function () {
                return this._assetPath;
            };
            AssetDescriptor.prototype.getClass = function () {
                throw new Error('This is an abstract method');
            };
            AssetDescriptor.prototype.hashCode = function () {
                return this._hashCode;
            };
            return AssetDescriptor;
        })();
        asset.AssetDescriptor = AssetDescriptor;
    })(asset = WOZLLA.asset || (WOZLLA.asset = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="AssetDescriptor.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var WOZLLA;
(function (WOZLLA) {
    var asset;
    (function (asset) {
        var AjaxDescriptor = (function (_super) {
            __extends(AjaxDescriptor, _super);
            function AjaxDescriptor(options) {
                _super.call(this, typeof options === 'string' ? options : options.url);
                if (typeof options === 'string') {
                    this._options = {
                        url: options
                    };
                }
                else {
                    this._options = options;
                }
            }
            Object.defineProperty(AjaxDescriptor.prototype, "options", {
                get: function () {
                    return this._options;
                },
                enumerable: true,
                configurable: true
            });
            return AjaxDescriptor;
        })(asset.AssetDescriptor);
        asset.AjaxDescriptor = AjaxDescriptor;
    })(asset = WOZLLA.asset || (WOZLLA.asset = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="AssetLoader.ts" />
/// <reference path="AjaxDescriptor.ts" />
var WOZLLA;
(function (WOZLLA) {
    var asset;
    (function (asset_2) {
        var AbstractAjaxLoader = (function (_super) {
            __extends(AbstractAjaxLoader, _super);
            function AbstractAjaxLoader() {
                _super.apply(this, arguments);
            }
            AbstractAjaxLoader.prototype.doLoadAsync = function (decriptor, callback) {
                var _this = this;
                var url;
                if (this.assetManager) {
                    url = this.assetManager.resolveURL(decriptor.options.url);
                }
                else {
                    url = decriptor.options.url;
                }
                WOZLLA.ajaxRequest({
                    url: url,
                    async: decriptor.options.async,
                    method: decriptor.options.method,
                    timeout: decriptor.options.timeout,
                    withCredentials: decriptor.options.withCredentials,
                    responseType: decriptor.options.responseType,
                    callback: function (error, xhr) {
                        if (error) {
                            callback(error, null);
                            return;
                        }
                        _this.onAjaxSuccess(decriptor, xhr, callback);
                    }
                });
            };
            AbstractAjaxLoader.prototype.onAjaxSuccess = function (decriptor, xhr, callback) {
                throw new Error('This is an abstract method');
            };
            return AbstractAjaxLoader;
        })(asset_2.AssetLoader);
        asset_2.AbstractAjaxLoader = AbstractAjaxLoader;
    })(asset = WOZLLA.asset || (WOZLLA.asset = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var event;
    (function (event) {
        /**
         * @enum {number} WOZLLA.event.EventPhase
         * all enumerations of event phase
         */
        (function (EventPhase) {
            /** @property {number} [CAPTURE] */
            EventPhase[EventPhase["CAPTURE"] = 0] = "CAPTURE";
            /** @property {number} [BUBBLE] */
            EventPhase[EventPhase["BUBBLE"] = 1] = "BUBBLE";
            /** @property {number} [TARGET] */
            EventPhase[EventPhase["TARGET"] = 2] = "TARGET";
        })(event.EventPhase || (event.EventPhase = {}));
        var EventPhase = event.EventPhase;
        /**
         * @class WOZLLA.event.Event
         * Base class for all event object of WOZLLA engine.    <br/>
         * see also:    <br/>
         * {@link WOZLLA.event.EventPhase}  <br/>
         * {@link WOZLLA.event.EventDispatcher}     <br/>
         */
        var Event = (function () {
            /**
             * @method constructor
             * create a new Event object
             * @member WOZLLA.event.Event
             * @param {string} type
             * @param {boolean} bubbles
             * @param {any} data
             * @param {boolean} canStopBubbles
             */
            function Event(type, bubbles, data, canStopBubbles) {
                if (bubbles === void 0) { bubbles = false; }
                if (data === void 0) { data = null; }
                if (canStopBubbles === void 0) { canStopBubbles = true; }
                this._eventPhase = EventPhase.CAPTURE;
                this._immediatePropagationStoped = false;
                this._propagationStoped = false;
                this._listenerRemove = false;
                this._type = type;
                this._bubbles = bubbles;
                this._data = data;
                this._canStopBubbles = canStopBubbles;
            }
            Object.defineProperty(Event.prototype, "data", {
                /**
                 * event data.
                 * @member WOZLLA.event.Event
                 * @property {any} data
                 * @readonly
                 */
                get: function () { return this._data; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Event.prototype, "type", {
                /**
                 * event type.
                 * @member WOZLLA.event.Event
                 * @property {string} type
                 * @readonly
                 */
                get: function () {
                    return this._type;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Event.prototype, "target", {
                /**
                 * event origin target.
                 * @member WOZLLA.event.Event
                 * @property {WOZLLA.event.EventDispatcher} target
                 * @readonly
                 */
                get: function () {
                    return this._target;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Event.prototype, "currentTarget", {
                /**
                 * current event target in event bubbling.
                 * @member WOZLLA.event.Event
                 * @property {WOZLLA.event.EventDispatcher} currentTarget
                 * @readonly
                 */
                get: function () {
                    return this._currentTarget;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Event.prototype, "eventPhase", {
                /**
                 * which phase this event is in.
                 * @member WOZLLA.event.Event
                 * @property {WOZLLA.event.EventPhase} eventPhase
                 * @readonly
                 */
                get: function () {
                    return this._eventPhase;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Event.prototype, "bubbles", {
                /**
                 * true to identify this event could be bubbled, false otherwise.
                 * @member WOZLLA.event.Event
                 * @property {boolean} bubbles
                 * @readonly
                 */
                get: function () {
                    return this._bubbles;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Event.prototype, "canStopBubbles", {
                /**
                 * true to identify this event could be stop bubbles, false otherwise.
                 * @member WOZLLA.event.Event
                 * @property {boolean} canStopBubbles
                 * @readonly
                 */
                get: function () {
                    return this._canStopBubbles;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * @method isStopPropagation
             * @member WOZLLA.event.Event
             * @returns {boolean}
             */
            Event.prototype.isStopPropagation = function () {
                return this._propagationStoped;
            };
            /**
             * stop bubble to next parent
             * @method stopPropagation
             * @member WOZLLA.event.Event
             */
            Event.prototype.stopPropagation = function () {
                if (!this._canStopBubbles) {
                    return;
                }
                this._propagationStoped = true;
            };
            /**
             * @method isStopImmediatePropagation
             * @member WOZLLA.event.Event
             * @returns {boolean}
             */
            Event.prototype.isStopImmediatePropagation = function () {
                return this._immediatePropagationStoped;
            };
            /**
             * stop event bubble immediately even other listeners dosen't receive this event.
             * @method stopImmediatePropagation
             * @member WOZLLA.event.Event
             */
            Event.prototype.stopImmediatePropagation = function () {
                if (!this._canStopBubbles) {
                    return;
                }
                this._immediatePropagationStoped = true;
                this._propagationStoped = true;
            };
            /**
             * call from current listener to remove the current listener
             */
            Event.prototype.removeCurrentListener = function () {
                this._listenerRemove = true;
            };
            return Event;
        })();
        event.Event = Event;
    })(event = WOZLLA.event || (WOZLLA.event = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="Event.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var event;
    (function (event_1) {
        var ListenerList = (function () {
            function ListenerList() {
                this._listeners = [];
            }
            ListenerList.prototype.add = function (listener) {
                this._listeners.push(listener);
            };
            ListenerList.prototype.remove = function (listener, scope) {
                var i, len = this._listeners.length;
                var l;
                for (i = 0; i < len; i++) {
                    l = this._listeners[i];
                    if (scope) {
                        if (l.listener === listener && scope === l.scope) {
                            this._listeners.splice(i, 1);
                            return;
                        }
                    }
                    else if (l === listener) {
                        this._listeners.splice(i, 1);
                        return true;
                    }
                }
                return false;
            };
            ListenerList.prototype.removeAt = function (idx) {
                return this._listeners.splice(idx, 1);
            };
            ListenerList.prototype.get = function (idx) {
                return this._listeners[idx];
            };
            ListenerList.prototype.length = function () {
                return this._listeners.length;
            };
            ListenerList.prototype.clear = function () {
                this._listeners.length = 0;
            };
            return ListenerList;
        })();
        event_1.ListenerList = ListenerList;
        /**
         * @class WOZLLA.event.EventDispatcher
         * Base class for bubblable event system
         *
         */
        var EventDispatcher = (function () {
            function EventDispatcher() {
                this._captureDict = {};
                this._bubbleDict = {};
            }
            /**
             * @method setBubbleParent
             * set bubble parent of this dispatcher
             * @param {WOZLLA.event.EventDispatcher} bubbleParent
             */
            EventDispatcher.prototype.setBubbleParent = function (bubbleParent) {
                this._bubbleParent = bubbleParent;
            };
            /**
             * @method hasListener
             * @param {string} type
             * @param {boolean} useCapture true to check capture phase, false to check bubble and target phases.
             */
            EventDispatcher.prototype.hasListener = function (type, useCapture) {
                if (useCapture === void 0) { useCapture = false; }
                return this._getListenerList(type, useCapture).length() > 0;
            };
            /**
             * @method getListenerCount
             * @param {string} type
             * @param {boolean} useCapture true to check capture phase, false to check bubble and target phases.
             * @returns {number}
             */
            EventDispatcher.prototype.getListenerCount = function (type, useCapture) {
                return this._getListenerList(type, useCapture).length();
            };
            /**
             * @method addListener
             * @param {string} type
             * @param {boolean} useCapture true to check capture phase, false to check bubble and target phases.
             */
            EventDispatcher.prototype.addListener = function (type, listener, useCapture) {
                if (useCapture === void 0) { useCapture = false; }
                this._getListenerList(type, useCapture).add(listener);
            };
            EventDispatcher.prototype.addListenerScope = function (type, listener, scope, useCapture) {
                if (useCapture === void 0) { useCapture = false; }
                this.addListener(type, {
                    listener: listener,
                    scope: scope
                }, useCapture);
            };
            /**
             * @method removeListener
             * @param {string} type
             * @param {boolean} useCapture true to check capture phase, false to check bubble and target phases.
             */
            EventDispatcher.prototype.removeListener = function (type, listener, useCapture) {
                if (useCapture === void 0) { useCapture = false; }
                return this._getListenerList(type, useCapture).remove(listener);
            };
            EventDispatcher.prototype.removeListenerScope = function (type, listener, scope, userCapture) {
                if (userCapture === void 0) { userCapture = false; }
                return this._getListenerList(type, userCapture).remove(listener, scope);
            };
            /**
             * @method clearListeners
             * @param {string} type
             * @param {boolean} useCapture true to check capture phase, false to check bubble and target phases.
             */
            EventDispatcher.prototype.clearListeners = function (type, useCapture) {
                this._getListenerList(type, useCapture).clear();
            };
            /**
             * @method clearAllListeners
             *  clear all listeners
             */
            EventDispatcher.prototype.clearAllListeners = function () {
                this._captureDict = {};
                this._bubbleDict = {};
            };
            /**
             * @method dispatch an event
             * @param {WOZLLA.event.Event} event
             */
            EventDispatcher.prototype.dispatchEvent = function (event) {
                var i, len, ancients, ancient;
                event._target = this;
                if (!event.bubbles) {
                    this._dispatchEventInPhase(event, event_1.EventPhase.TARGET);
                    return;
                }
                ancients = this._getAncients();
                len = ancients.length;
                for (i = len - 1; i >= 0; i--) {
                    ancient = ancients[i];
                    if (ancient._dispatchEventInPhase(event, event_1.EventPhase.CAPTURE)) {
                        return;
                    }
                }
                if (this._dispatchEventInPhase(event, event_1.EventPhase.CAPTURE)) {
                    return;
                }
                if (this._dispatchEventInPhase(event, event_1.EventPhase.TARGET)) {
                    return;
                }
                for (i = 0; i < len; i++) {
                    ancient = ancients[i];
                    if (ancient._dispatchEventInPhase(event, event_1.EventPhase.BUBBLE)) {
                        return;
                    }
                }
            };
            EventDispatcher.prototype._dispatchEventInPhase = function (event, phase) {
                var i, len;
                var listener;
                var scope;
                var listenerList;
                event._eventPhase = phase;
                event._listenerRemove = false;
                event._currentTarget = this;
                listenerList = this._getListenerList(event.type, phase === event_1.EventPhase.CAPTURE);
                len = listenerList.length();
                if (len > 0) {
                    for (i = len - 1; i >= 0; i--) {
                        listener = listenerList.get(i);
                        scope = listener.scope;
                        if (scope) {
                            listener.listener.call(scope, event, listener.listener);
                        }
                        else {
                            listener(event, listener);
                        }
                        // handle remove listener when client call event.removeCurrentListener();
                        if (event._listenerRemove) {
                            event._listenerRemove = false;
                            listenerList.removeAt(i);
                        }
                        if (event.isStopImmediatePropagation()) {
                            return true;
                        }
                    }
                    if (event.isStopPropagation()) {
                        return true;
                    }
                }
                listenerList = this._getListenerList('*', phase === event_1.EventPhase.CAPTURE);
                len = listenerList.length();
                if (len > 0) {
                    for (i = len - 1; i >= 0; i--) {
                        listener = listenerList.get(i);
                        scope = listener.scope;
                        if (scope) {
                            listener.listener.call(scope, event, listener.listener);
                        }
                        else {
                            listener(event, listener);
                        }
                        // handle remove listener when client call event.removeCurrentListener();
                        if (event._listenerRemove) {
                            event._listenerRemove = false;
                            listenerList.removeAt(i);
                        }
                        if (event.isStopImmediatePropagation()) {
                            return true;
                        }
                    }
                    if (event.isStopPropagation()) {
                        return true;
                    }
                }
                return false;
            };
            EventDispatcher.prototype._getAncients = function () {
                var ancients = [];
                var parent = this;
                while (parent._bubbleParent) {
                    parent = parent._bubbleParent;
                    ancients.push(parent);
                }
                return ancients;
            };
            EventDispatcher.prototype._getListenerList = function (type, useCapture) {
                var listenerList;
                var dict = useCapture ? this._captureDict : this._bubbleDict;
                listenerList = dict[type];
                if (!listenerList) {
                    listenerList = new ListenerList();
                    dict[type] = listenerList;
                }
                return listenerList;
            };
            EventDispatcher.prototype.emit = function (event) {
                this.dispatchEvent(event);
            };
            EventDispatcher.prototype.on = function (type, listener, useCapture) {
                if (useCapture === void 0) { useCapture = false; }
                this.addListener(type, listener, useCapture);
            };
            return EventDispatcher;
        })();
        event_1.EventDispatcher = EventDispatcher;
    })(event = WOZLLA.event || (WOZLLA.event = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="AssetDescriptor.ts" />
/// <reference path="../event/EventDispatcher.ts" />
var WOZLLA;
(function (WOZLLA) {
    var asset;
    (function (asset) {
        var Asset = (function (_super) {
            __extends(Asset, _super);
            function Asset(descriptor) {
                _super.call(this);
                this._descriptor = descriptor;
            }
            Object.defineProperty(Asset.prototype, "descriptor", {
                get: function () {
                    return this._descriptor;
                },
                enumerable: true,
                configurable: true
            });
            Asset.prototype.unload = function () {
                this.dispatchEvent(new WOZLLA.event.Event('unload'));
            };
            return Asset;
        })(WOZLLA.event.EventDispatcher);
        asset.Asset = Asset;
    })(asset = WOZLLA.asset || (WOZLLA.asset = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var asset;
    (function (asset_3) {
        var AssetGroup = (function () {
            function AssetGroup() {
                this._loadPairs = [];
                this._loadedCount = 0;
                this._loading = false;
            }
            AssetGroup.prototype.put = function (descriptor, loader) {
                if (this.isLoading() || this.isFinish()) {
                    WOZLLA.Log.error(AssetGroup.LOADING_ERROR);
                    return;
                }
                this._loadPairs.push({
                    descriptor: descriptor,
                    loader: loader
                });
            };
            AssetGroup.prototype.loadAsync = function (callback) {
                var _this = this;
                this._loading = true;
                this._loadPairs.forEach(function (pair) {
                    var descriptor = pair.descriptor;
                    var loader = pair.loader;
                    loader.loadAsync(descriptor, function (error, asset) {
                        _this.onLoadOne(error, asset, callback);
                    });
                });
            };
            AssetGroup.prototype.loadWithAssetManager = function (assetManager, callback) {
                var _this = this;
                this._loading = true;
                this.forEach(function (descriptor, loader) {
                    if (loader) {
                        assetManager.loadWithLoader(descriptor, loader, function (error, asset) {
                            _this.onLoadOne(error, asset, callback);
                        });
                    }
                    else {
                        assetManager.load(descriptor, function (error, asset) {
                            _this.onLoadOne(error, asset, callback);
                        });
                    }
                });
            };
            AssetGroup.prototype.forEach = function (func) {
                this._loadPairs.forEach(function (pair) {
                    func(pair.descriptor, pair.loader);
                });
            };
            AssetGroup.prototype.getProgress = function (total) {
                if (total === void 0) { total = 1; }
                return this.getTotalCount() === 0 ? 0 : (this._loadedCount / this.getTotalCount() * total);
            };
            AssetGroup.prototype.getTotalCount = function () {
                return this._loadPairs.length;
            };
            AssetGroup.prototype.getLoadedCount = function () {
                return this._loadedCount;
            };
            AssetGroup.prototype.isFinish = function () {
                return this.getTotalCount() === 0 ? false : this._loadedCount === this.getTotalCount();
            };
            AssetGroup.prototype.isLoading = function () {
                return this._loading;
            };
            AssetGroup.prototype.onLoadOne = function (error, asset, callback) {
                this._loadedCount++;
                callback && callback.onLoadOne(error, asset);
                if (this.getLoadedCount() === this.getTotalCount()) {
                    this._loading = false;
                    callback.onFinish();
                }
            };
            AssetGroup.LOADING_ERROR = 'group is loading or all loaded';
            return AssetGroup;
        })();
        asset_3.AssetGroup = AssetGroup;
    })(asset = WOZLLA.asset || (WOZLLA.asset = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var asset;
    (function (asset_4) {
        var ParallelAssetLoadStrategy = (function () {
            function ParallelAssetLoadStrategy() {
                this._queueStrategyMap = {};
            }
            ParallelAssetLoadStrategy.prototype.load = function (task) {
                var queueStrategy = this._queueStrategyMap[task.descriptor.getReferenceKey()];
                if (!queueStrategy) {
                    queueStrategy = new QueueAssetLoadStrategy();
                    this._queueStrategyMap[task.descriptor.getReferenceKey()] = queueStrategy;
                }
                queueStrategy.load(task);
            };
            ParallelAssetLoadStrategy.prototype.isIdle = function () {
                return this._queueStrategyMap.size() > 0;
            };
            ParallelAssetLoadStrategy.prototype.onClear = function () {
                for (var key in this._queueStrategyMap) {
                    var queueStrategy = this._queueStrategyMap[key];
                    queueStrategy.onClear();
                }
                this._queueStrategyMap = {};
            };
            ParallelAssetLoadStrategy.prototype.update = function () {
                for (var key in this._queueStrategyMap) {
                    var queueStrategy = this._queueStrategyMap[key];
                    queueStrategy.update();
                    if (queueStrategy.isIdle()) {
                        delete this._queueStrategyMap[key];
                    }
                }
            };
            return ParallelAssetLoadStrategy;
        })();
        asset_4.ParallelAssetLoadStrategy = ParallelAssetLoadStrategy;
        var QueueAssetLoadStrategy = (function () {
            function QueueAssetLoadStrategy() {
                this._taskQueue = [];
                this._taskMap = new WOZLLA.util.HashMap();
            }
            QueueAssetLoadStrategy.prototype.load = function (task) {
                this._taskQueue.push(task);
                this._taskMap.put(task.descriptor, task);
                this.update();
            };
            QueueAssetLoadStrategy.prototype.isIdle = function () {
                return !this._loadingTask && this._taskQueue.length === 0;
            };
            QueueAssetLoadStrategy.prototype.onClear = function () {
                if (this._loadingTask) {
                    this._loadingTask.cancel();
                    this._loadingTask = null;
                }
                this._taskQueue.length = 0;
            };
            QueueAssetLoadStrategy.prototype.update = function () {
                var _this = this;
                if (this._loadingTask || this._taskQueue.length === 0)
                    return;
                this._loadingTask = this._taskQueue.shift();
                this._taskMap.remove(this._loadingTask.descriptor);
                if (this._loadingTask.canceled) {
                    this.update();
                    return;
                }
                if (this._loadingTask.assetManager.contains(this._loadingTask.descriptor)) {
                    var asset_5 = this._loadingTask.asset = this._loadingTask.assetManager._retain(this._loadingTask.descriptor);
                    var loadingTask = this._loadingTask;
                    loadingTask.asset = asset_5;
                    this._loadingTask = null;
                    loadingTask.callback();
                    this.update();
                    return;
                }
                this._loadingTask.setLoading(true);
                this._loadingTask.loader.loadAsync(this._loadingTask.descriptor, function (error, asset) {
                    _this._loadingTask.error = error;
                    _this._loadingTask.asset = asset;
                    _this._loadingTask.setLoading(false);
                    if (error) {
                        _this._loadingTask.callback();
                        _this._loadingTask = null;
                        return;
                    }
                    _this._loadingTask.assetManager.addAsset(asset);
                    var loadingTask = _this._loadingTask;
                    _this._loadingTask = null;
                    loadingTask.callback();
                    _this.update();
                });
            };
            return QueueAssetLoadStrategy;
        })();
        asset_4.QueueAssetLoadStrategy = QueueAssetLoadStrategy;
    })(asset = WOZLLA.asset || (WOZLLA.asset = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var asset;
    (function (asset_6) {
        var _hasOwnProperty = Object.prototype.hasOwnProperty;
        var has = function (obj, prop) {
            return _hasOwnProperty.call(obj, prop);
        };
        var AssetManager = (function () {
            function AssetManager(director, parallelLoad, monitorLowNetwork) {
                if (parallelLoad === void 0) { parallelLoad = false; }
                if (monitorLowNetwork === void 0) { monitorLowNetwork = false; }
                this._baseURL = '';
                this._assetMap = {};
                this._monitorLowNetwork = false;
                this._director = director;
                this._assetLoadStrategy = parallelLoad ? new asset_6.ParallelAssetLoadStrategy() : new asset_6.QueueAssetLoadStrategy();
                this._monitorLowNetwork = monitorLowNetwork;
            }
            Object.defineProperty(AssetManager.prototype, "director", {
                get: function () {
                    return this._director;
                },
                enumerable: true,
                configurable: true
            });
            AssetManager.prototype.isMonitorLowNetwork = function () {
                return this._monitorLowNetwork;
            };
            AssetManager.prototype.setAssetPathResolver = function (resolver) {
                this._assetPathResolver = resolver;
            };
            AssetManager.prototype.getBaseURL = function () {
                return this._baseURL;
            };
            AssetManager.prototype.setBaseURL = function (baseURL) {
                this._baseURL = baseURL;
            };
            AssetManager.prototype.resolveURL = function (assetPath) {
                if (this._assetPathResolver) {
                    return this._assetPathResolver.resolvePath(assetPath, this);
                }
                return this._baseURL + assetPath;
            };
            AssetManager.prototype.load = function (descriptor, callback) {
                var loader = descriptor.getLoader() || asset_6.LoaderManager.getInstance().createLoader(descriptor.getClass(), this);
                this.loadWithLoader(descriptor, loader, callback);
            };
            AssetManager.prototype.loadGroup = function (assetGroup, callback) {
                assetGroup.loadWithAssetManager(this, callback);
            };
            AssetManager.prototype.loadWithLoader = function (descriptor, loader, callback) {
                var task;
                task = new AssetLoadingTask();
                task.assetManager = this;
                task.descriptor = descriptor;
                task.loader = loader;
                task.addCallback(callback);
                this._assetLoadStrategy.load(task);
            };
            AssetManager.prototype.update = function () {
                this._assetLoadStrategy.update();
            };
            AssetManager.prototype.clear = function () {
                this._assetLoadStrategy.onClear();
                for (var key in this._assetMap) {
                    if (has(this._assetMap, key)) {
                        var refContainer = this._assetMap[key];
                        refContainer.asset.unload();
                    }
                }
                this._assetMap = {};
            };
            AssetManager.prototype.contains = function (descriptor) {
                return !!this._assetMap[descriptor.getReferenceKey()];
            };
            AssetManager.prototype.unload = function (descriptor) {
                if (descriptor instanceof asset_6.Asset) {
                    descriptor = descriptor.descriptor;
                }
                this._release(descriptor);
            };
            AssetManager.prototype.getAsset = function (descriptor) {
                var refKey = descriptor.getReferenceKey();
                var container = this._assetMap[refKey];
                if (!container) {
                    return null;
                }
                return container.asset;
            };
            AssetManager.prototype.addAsset = function (asset) {
                this._add(asset.descriptor, asset);
            };
            AssetManager.prototype._add = function (decriptor, asset) {
                var refKey = decriptor.getReferenceKey();
                var container = this._assetMap[refKey];
                if (!container) {
                    container = this._assetMap[refKey] = new ManagedReferenceContainer(refKey, asset);
                }
                container.increase();
            };
            AssetManager.prototype._retain = function (descriptor) {
                var refKey = descriptor.getReferenceKey();
                var container = this._assetMap[refKey];
                container.increase();
                return container.asset;
            };
            AssetManager.prototype._release = function (descriptor) {
                var refKey = descriptor.getReferenceKey();
                var container = this._assetMap[refKey];
                container.decrease();
                if (container.referenceCount === 0) {
                    delete this._assetMap[refKey];
                    container.asset.unload();
                }
            };
            return AssetManager;
        })();
        asset_6.AssetManager = AssetManager;
        var ManagedReferenceContainer = (function () {
            function ManagedReferenceContainer(referenceKey, asset) {
                this._referenceCount = 0;
                this._referenceKey = referenceKey;
                this._asset = asset;
            }
            Object.defineProperty(ManagedReferenceContainer.prototype, "referenceKey", {
                get: function () {
                    return this._referenceKey;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ManagedReferenceContainer.prototype, "referenceCount", {
                get: function () {
                    return this._referenceCount;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ManagedReferenceContainer.prototype, "asset", {
                get: function () {
                    return this._asset;
                },
                enumerable: true,
                configurable: true
            });
            ManagedReferenceContainer.prototype.increase = function () {
                this._referenceCount++;
            };
            ManagedReferenceContainer.prototype.decrease = function () {
                if (this._referenceCount > 0) {
                    this._referenceCount--;
                }
                else {
                    WOZLLA.Log.error("Decrease too much: " + this.referenceKey);
                }
            };
            return ManagedReferenceContainer;
        })();
        var AssetLoadingTask = (function () {
            function AssetLoadingTask() {
                this.descriptor = null;
                this.loader = null;
                this.asset = null;
                this.error = null;
                this.canceled = false;
                this.callbacks = [];
                this._loading = false;
            }
            Object.defineProperty(AssetLoadingTask.prototype, "loaded", {
                get: function () { return !!this.asset; },
                enumerable: true,
                configurable: true
            });
            AssetLoadingTask.prototype.cancel = function () {
                this.loader.cancel();
                this.canceled = true;
            };
            AssetLoadingTask.prototype.callback = function () {
                var _this = this;
                if (this.assetManager.isMonitorLowNetwork()) {
                    this.assetManager.director.scheduler.scheduleTime(function () {
                        for (var _i = 0, _a = _this.callbacks; _i < _a.length; _i++) {
                            var callback = _a[_i];
                            callback(_this.error, _this.asset);
                        }
                    }, Math.random() * 3000 + 1000);
                }
                else {
                    for (var _i = 0, _a = this.callbacks; _i < _a.length; _i++) {
                        var callback = _a[_i];
                        callback(this.error, this.asset);
                    }
                }
            };
            AssetLoadingTask.prototype.setLoading = function (loading) {
                this._loading = loading;
            };
            AssetLoadingTask.prototype.addCallback = function (callback) {
                this.callbacks.push(callback);
            };
            return AssetLoadingTask;
        })();
        asset_6.AssetLoadingTask = AssetLoadingTask;
    })(asset = WOZLLA.asset || (WOZLLA.asset = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var asset;
    (function (asset) {
        var LoaderManager = (function () {
            function LoaderManager() {
                this._loaderMap = {};
            }
            LoaderManager.getInstance = function () {
                if (!LoaderManager.instance) {
                    LoaderManager.instance = new LoaderManager();
                }
                return LoaderManager.instance;
            };
            LoaderManager.prototype.register = function (assetClass, loaderFactory) {
                this._loaderMap[assetClass] = loaderFactory;
            };
            LoaderManager.prototype.createLoader = function (assetClass, assetManager) {
                var loaderFactory = this._loaderMap[assetClass];
                if (!loaderFactory) {
                    var err = "Can't found a loader for " + assetClass;
                    WOZLLA.Log.error(err);
                    return;
                }
                return loaderFactory(assetManager);
            };
            return LoaderManager;
        })();
        asset.LoaderManager = LoaderManager;
    })(asset = WOZLLA.asset || (WOZLLA.asset = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var util;
    (function (util) {
        var hashCodeGenerator = 1;
        var IHashable;
        (function (IHashable) {
            IHashable.KEY = 'WOZLLA_hashcode';
            function randomHashCode() {
                return hashCodeGenerator++;
            }
            IHashable.randomHashCode = randomHashCode;
        })(IHashable = util.IHashable || (util.IHashable = {}));
        Object.defineProperty(Object.prototype, "hashCode", {
            value: function () {
                if (!this[IHashable.KEY]) {
                    this[IHashable.KEY] = IHashable.randomHashCode();
                }
                return this[IHashable.KEY];
            },
            writable: false,
            enumerable: false,
            configurable: false
        });
    })(util = WOZLLA.util || (WOZLLA.util = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../util/IHashable.ts"/>
/// <reference path="../AssetDescriptor.ts" />
/// <reference path="../Asset.ts" />
/// <reference path="../AssetLoader.ts" />
/// <reference path="../LoaderManager.ts" />
/// <reference path="../../rendering/ITexture.ts" />
var WOZLLA;
(function (WOZLLA) {
    var asset;
    (function (asset_7) {
        var ImageDescriptor = (function (_super) {
            __extends(ImageDescriptor, _super);
            function ImageDescriptor(assetPath) {
                _super.call(this, assetPath);
            }
            ImageDescriptor.prototype.getClass = function () {
                return ImageAsset.CLASS;
            };
            return ImageDescriptor;
        })(asset_7.AssetDescriptor);
        asset_7.ImageDescriptor = ImageDescriptor;
        var ImageAsset = (function (_super) {
            __extends(ImageAsset, _super);
            function ImageAsset(descriptor, sourceTexture, assetManager) {
                _super.call(this, descriptor);
                this._sourceTexture = sourceTexture;
                this._width = sourceTexture.width;
                this._height = sourceTexture.height;
                this.bindAssetManager(assetManager);
            }
            ImageAsset.prototype.getDebugInfo = function () {
                return this.descriptor.assetPath;
            };
            ImageAsset.prototype.getSourceImage = function () {
                return this._sourceTexture;
            };
            ImageAsset.prototype.getSourceTexture = function () {
                return this._sourceWebGLTexture || this._sourceTexture;
            };
            ImageAsset.prototype.getWidth = function () {
                return this._width;
            };
            ImageAsset.prototype.getHeight = function () {
                return this._height;
            };
            ImageAsset.prototype.unload = function () {
                if (this._assetManager && this._assetManager.director) {
                    this._assetManager.director.renderContext.deleteTexture(this._sourceTexture);
                }
                _super.prototype.unload.call(this);
            };
            ImageAsset.prototype.bindAssetManager = function (assetManager) {
                if (this._assetManager === assetManager) {
                    return;
                }
                if (this._assetManager) {
                    WOZLLA.Log.error('this image asset has bound to an asset manager');
                    return;
                }
                this._assetManager = assetManager;
                if (this._assetManager && this._assetManager.director) {
                    this._sourceWebGLTexture = this._assetManager.director.renderContext.createTexture(this._sourceTexture);
                }
            };
            ImageAsset.CLASS = "ImageAsset";
            return ImageAsset;
        })(asset_7.Asset);
        asset_7.ImageAsset = ImageAsset;
        var ImageLoader = (function (_super) {
            __extends(ImageLoader, _super);
            function ImageLoader(assetManager) {
                _super.call(this, assetManager);
            }
            ImageLoader.prototype.doLoadAsync = function (decriptor, callback) {
                this.loadImage(decriptor, callback);
            };
            ImageLoader.prototype.loadImage = function (descriptor, callback) {
                var _this = this;
                var image = new Image();
                if (this.assetManager) {
                    image.src = this.assetManager.resolveURL(descriptor.assetPath);
                }
                else {
                    image.src = descriptor.assetPath;
                }
                image.onload = function () {
                    if (_this.canceled) {
                        callback(asset_7.AssetLoader.CANCEL_ERROR, null);
                    }
                    else {
                        callback(null, new ImageAsset(descriptor, image, _this.assetManager));
                    }
                };
                image.onerror = function () {
                    if (_this.canceled) {
                        callback(asset_7.AssetLoader.CANCEL_ERROR, null);
                    }
                    else {
                        callback(ImageLoader.FAIL_ERROR, null);
                    }
                };
            };
            ImageLoader.FAIL_ERROR = "Fail to load image";
            return ImageLoader;
        })(asset_7.AssetLoader);
        asset_7.ImageLoader = ImageLoader;
        asset.LoaderManager.getInstance().register(ImageAsset.CLASS, function (assetManager) {
            return new ImageLoader(assetManager);
        });
    })(asset = WOZLLA.asset || (WOZLLA.asset = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../AbstractAjaxLoader.ts" />
/// <reference path="../Asset.ts" />
/// <reference path="../LoaderManager.ts" />
var WOZLLA;
(function (WOZLLA) {
    var asset;
    (function (asset_8) {
        var PlainTextDescriptor = (function (_super) {
            __extends(PlainTextDescriptor, _super);
            function PlainTextDescriptor() {
                _super.apply(this, arguments);
            }
            PlainTextDescriptor.prototype.getClass = function () {
                return PlainTextAsset.CLASS;
            };
            return PlainTextDescriptor;
        })(asset_8.AjaxDescriptor);
        asset_8.PlainTextDescriptor = PlainTextDescriptor;
        var PlainTextAsset = (function (_super) {
            __extends(PlainTextAsset, _super);
            function PlainTextAsset(descriptor, plainText, assetManager) {
                _super.call(this, descriptor);
                this._assetManager = assetManager;
                this._plainText = plainText;
            }
            PlainTextAsset.prototype.getPlainText = function () {
                return this._plainText;
            };
            PlainTextAsset.CLASS = "PlainTextAsset";
            return PlainTextAsset;
        })(asset_8.Asset);
        asset_8.PlainTextAsset = PlainTextAsset;
        var PlainTextLoader = (function (_super) {
            __extends(PlainTextLoader, _super);
            function PlainTextLoader() {
                _super.apply(this, arguments);
            }
            PlainTextLoader.prototype.onAjaxSuccess = function (decriptor, xhr, callback) {
                callback(null, new PlainTextAsset(decriptor, xhr.responseText, this.assetManager));
            };
            return PlainTextLoader;
        })(asset_8.AbstractAjaxLoader);
        asset_8.PlainTextLoader = PlainTextLoader;
        asset.LoaderManager.getInstance().register(PlainTextAsset.CLASS, function (assetManager) {
            return new PlainTextLoader(assetManager);
        });
    })(asset = WOZLLA.asset || (WOZLLA.asset = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../AbstractAjaxLoader.ts" />
/// <reference path="../AjaxDescriptor.ts" />
/// <reference path="../LoaderManager.ts" />
/// <reference path="PlainText.ts" />
var WOZLLA;
(function (WOZLLA) {
    var asset;
    (function (asset_9) {
        var JsonDescriptor = (function (_super) {
            __extends(JsonDescriptor, _super);
            function JsonDescriptor(options) {
                _super.call(this, options);
                this.options.responseType = 'text';
            }
            JsonDescriptor.prototype.getClass = function () {
                return JsonAsset.CLASS;
            };
            return JsonDescriptor;
        })(asset_9.AjaxDescriptor);
        asset_9.JsonDescriptor = JsonDescriptor;
        var JsonAsset = (function (_super) {
            __extends(JsonAsset, _super);
            function JsonAsset() {
                _super.apply(this, arguments);
            }
            JsonAsset.prototype.getJson = function () {
                return JSON.parse(this.getPlainText());
            };
            JsonAsset.CLASS = "JsonAsset";
            return JsonAsset;
        })(asset_9.PlainTextAsset);
        asset_9.JsonAsset = JsonAsset;
        var JsonLoader = (function (_super) {
            __extends(JsonLoader, _super);
            function JsonLoader() {
                _super.apply(this, arguments);
            }
            JsonLoader.prototype.onAjaxSuccess = function (decriptor, xhr, callback) {
                callback(null, new JsonAsset(decriptor, xhr.responseText, this.assetManager));
            };
            return JsonLoader;
        })(asset_9.PlainTextLoader);
        asset_9.JsonLoader = JsonLoader;
        asset.LoaderManager.getInstance().register(JsonAsset.CLASS, function (assetManager) {
            return new JsonLoader(assetManager);
        });
    })(asset = WOZLLA.asset || (WOZLLA.asset = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="Json.ts" />
/// <reference path="Image.ts" />
/// <reference path="../AssetDescriptor.ts" />
/// <reference path="../AssetLoader.ts" />
/// <reference path="../Asset.ts" />
var WOZLLA;
(function (WOZLLA) {
    var asset;
    (function (asset_10) {
        var SpriteAtlasDescriptor = (function (_super) {
            __extends(SpriteAtlasDescriptor, _super);
            function SpriteAtlasDescriptor(options) {
                _super.call(this, typeof options === 'string' ? options : options.jsonPath);
                var jsonPath;
                var imagePath;
                if (typeof options === 'string') {
                    jsonPath = options;
                    imagePath = jsonPath.replace('.json', '.png');
                }
                else {
                    jsonPath = options.jsonPath;
                    imagePath = options.imagePath || jsonPath.replace('.json', '.png');
                }
                this._imageDescriptor = new asset_10.ImageDescriptor(imagePath);
                this._jsonDescriptor = new asset_10.JsonDescriptor(jsonPath);
            }
            Object.defineProperty(SpriteAtlasDescriptor.prototype, "imageDescriptor", {
                get: function () {
                    return this._imageDescriptor;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SpriteAtlasDescriptor.prototype, "jsonDescriptor", {
                get: function () {
                    return this._jsonDescriptor;
                },
                enumerable: true,
                configurable: true
            });
            SpriteAtlasDescriptor.prototype.getReferenceKey = function () {
                return this._jsonDescriptor.assetPath + this._imageDescriptor.assetPath;
            };
            SpriteAtlasDescriptor.prototype.getClass = function () {
                return SpriteAtlas.CLASS;
            };
            return SpriteAtlasDescriptor;
        })(asset_10.AssetDescriptor);
        asset_10.SpriteAtlasDescriptor = SpriteAtlasDescriptor;
        var SpriteAtlas = (function (_super) {
            __extends(SpriteAtlas, _super);
            function SpriteAtlas(spriteAtlasDescriptor, jsonAsset, imageAsset) {
                _super.call(this, spriteAtlasDescriptor);
                this._spriteCanche = {};
                this._jsonAsset = jsonAsset;
                this._imageAsset = imageAsset;
                this._spriteData = this._jsonAsset.getJson();
            }
            SpriteAtlas.prototype.getSourceImage = function () {
                return this._imageAsset.getSourceImage();
            };
            SpriteAtlas.prototype.getTexture = function () {
                return this._imageAsset;
            };
            SpriteAtlas.prototype.getSprite = function (name) {
                var sprite = this._spriteCanche[name];
                if (sprite) {
                    return sprite;
                }
                var frameData = this._spriteData.frames[name];
                if (!frameData) {
                    return null;
                }
                sprite = new Sprite(this, name, frameData);
                this._spriteCanche[name] = sprite;
                return sprite;
            };
            SpriteAtlas.prototype.getSpriteCount = function () {
                return this._spriteData.frames.length;
            };
            SpriteAtlas.CLASS = 'SpriteAltas';
            return SpriteAtlas;
        })(asset_10.Asset);
        asset_10.SpriteAtlas = SpriteAtlas;
        var SpriteAtlasLoader = (function (_super) {
            __extends(SpriteAtlasLoader, _super);
            function SpriteAtlasLoader(assetManager) {
                _super.call(this, assetManager);
                this._jsonLoader = new asset_10.JsonLoader(assetManager);
                this._imageLoader = new asset_10.ImageLoader(assetManager);
            }
            SpriteAtlasLoader.prototype.doLoadAsync = function (decriptor, callback) {
                var _this = this;
                this._jsonLoader.loadAsync(decriptor.jsonDescriptor, function (error, jsonAsset) {
                    if (error) {
                        callback(error, null);
                        return;
                    }
                    if (_this.canceled) {
                        jsonAsset.unload();
                        callback(asset_10.AssetLoader.CANCEL_ERROR, null);
                        return;
                    }
                    _this._imageLoader.loadAsync(decriptor.imageDescriptor, function (error, imageAsset) {
                        if (error) {
                            jsonAsset.unload();
                            callback(error, null);
                            return;
                        }
                        if (_this.canceled) {
                            jsonAsset.unload();
                            imageAsset.unload();
                            callback(asset_10.AssetLoader.CANCEL_ERROR, null);
                            return;
                        }
                        if (_this.assetManager) {
                            imageAsset.bindAssetManager(_this.assetManager);
                        }
                        callback(null, new SpriteAtlas(decriptor, jsonAsset, imageAsset));
                    });
                });
            };
            return SpriteAtlasLoader;
        })(asset_10.AssetLoader);
        asset_10.SpriteAtlasLoader = SpriteAtlasLoader;
        var Sprite = (function () {
            function Sprite(spriteAtlas, name, frameData) {
                this._spiteAtlas = spriteAtlas;
                this._name = name;
                this._frameData = frameData;
                if (frameData.frame.offset) {
                    this._offsetX = frameData.frame.offset.x;
                    this._offsetY = frameData.frame.offset.y;
                }
                else {
                    this._offsetX = frameData.frame.offsetX || (Math.ceil(frameData.spriteSourceSize ? (frameData.spriteSourceSize.x || 0) : 0));
                    this._offsetY = frameData.frame.offsetY || (Math.ceil(frameData.spriteSourceSize ? (frameData.spriteSourceSize.y || 0) : 0));
                }
            }
            Object.defineProperty(Sprite.prototype, "spriteAtlas", {
                get: function () {
                    return this._spiteAtlas;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sprite.prototype, "name", {
                get: function () {
                    return this._name;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sprite.prototype, "x", {
                get: function () {
                    return this._frameData.frame.x;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sprite.prototype, "y", {
                get: function () {
                    return this._frameData.frame.y;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sprite.prototype, "width", {
                get: function () {
                    return this._frameData.frame.w;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sprite.prototype, "height", {
                get: function () {
                    return this._frameData.frame.h;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sprite.prototype, "offsetX", {
                get: function () {
                    return this._offsetX;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sprite.prototype, "offsetY", {
                get: function () {
                    return this._offsetY;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sprite.prototype, "rotated", {
                get: function () {
                    return this._frameData.trimed;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sprite.prototype, "trimed", {
                get: function () {
                    return this._frameData.rotated;
                },
                enumerable: true,
                configurable: true
            });
            Sprite.prototype.getSourceTexture = function () {
                return this._spiteAtlas.getTexture().getSourceTexture();
            };
            Sprite.prototype.getWidth = function () {
                return this._spiteAtlas.getTexture().getWidth();
            };
            Sprite.prototype.getHeight = function () {
                return this._spiteAtlas.getTexture().getHeight();
            };
            Sprite.prototype.getDebugInfo = function () {
                return this._spiteAtlas.descriptor.assetPath + ':' + this._name;
            };
            return Sprite;
        })();
        asset_10.Sprite = Sprite;
        asset.LoaderManager.getInstance().register(SpriteAtlas.CLASS, function (assetManager) {
            return new SpriteAtlasLoader(assetManager);
        });
    })(asset = WOZLLA.asset || (WOZLLA.asset = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var tempPropAnnos = null;
        var ComponentAnnotation = (function () {
            function ComponentAnnotation(name, ctor) {
                this._properties = [];
                this._propertyMap = {};
                this._requires = [];
                this._name = name;
                this._ctor = ctor;
            }
            Object.defineProperty(ComponentAnnotation.prototype, "name", {
                get: function () {
                    return this._name;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ComponentAnnotation.prototype, "ctor", {
                get: function () {
                    return this._ctor;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ComponentAnnotation.prototype, "properties", {
                get: function () {
                    return this._properties.slice(0);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ComponentAnnotation.prototype, "propertiesRaw", {
                get: function () {
                    return this._properties;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ComponentAnnotation.prototype, "requires", {
                get: function () {
                    return this._requires.slice(0);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ComponentAnnotation.prototype, "requiresRaw", {
                get: function () {
                    return this._requires;
                },
                enumerable: true,
                configurable: true
            });
            ComponentAnnotation.prototype.addPropertyAnnotation = function (propertyAnnotation) {
                this._properties.push(propertyAnnotation);
                this._propertyMap[propertyAnnotation.propertyName] = propertyAnnotation;
            };
            ComponentAnnotation.prototype.getPropertyAnnotation = function (name) {
                var anno = this._propertyMap[name];
                if (!anno) {
                    var superClass = ComponentFactory.getSuperClass(this._ctor);
                    if (superClass) {
                        var superAnno = ComponentFactory.getAnnotation(superClass);
                        anno = superAnno.getPropertyAnnotation(name);
                    }
                }
                return anno;
            };
            ComponentAnnotation.prototype.addRequired = function (compType) {
                this._requires.push(compType);
            };
            return ComponentAnnotation;
        })();
        component.ComponentAnnotation = ComponentAnnotation;
        var NAME_KEY = 'ComponentClassName';
        var ANNO_KEY = 'ComponentPropertyAnnotations';
        var REQUIRE_KEY = 'ComponentRequires';
        var SUPER_CLASS_KEY = 'ComponentSuperClass';
        var ABSTRACT_KEY = 'ComponentAbstract';
        var ComponentFactory = (function () {
            function ComponentFactory() {
            }
            ComponentFactory.eachComponent = function (func) {
                for (var name in ComponentFactory._typeMap) {
                    func(name);
                }
            };
            ComponentFactory.getName = function (arg) {
                if (typeof arg === 'function') {
                    return arg[NAME_KEY];
                }
                else {
                    return arg.constructor[NAME_KEY];
                }
            };
            ComponentFactory.getType = function (name) {
                return this._typeMap[name];
            };
            ComponentFactory.create = function (name) {
                return new (ComponentFactory.getType(name))();
            };
            ComponentFactory.getSuperClass = function (compCtor) {
                return compCtor[SUPER_CLASS_KEY];
            };
            ComponentFactory.getAnnotation = function (name) {
                if (typeof name === 'function') {
                    name = ComponentFactory.getName(name);
                }
                return this._annotationMap[name];
            };
            ComponentFactory.setAbstract = function (target, isAbstarct) {
                if (isAbstarct === void 0) { isAbstarct = false; }
                target[ABSTRACT_KEY] = target;
            };
            ComponentFactory.isAbstract = function (target) {
                return target[ABSTRACT_KEY] === target;
            };
            ComponentFactory.register = function (name, compCtor, superClass) {
                if (ComponentFactory._annotationMap[name]) {
                    throw new Error('Name has been registered: ' + name);
                }
                var anno = ComponentFactory._annotationMap[name] = new ComponentAnnotation(name, compCtor);
                compCtor[NAME_KEY] = name;
                if (tempPropAnnos) {
                    tempPropAnnos.forEach(function (propertyAnno) {
                        anno.addPropertyAnnotation(propertyAnno);
                    });
                    delete compCtor[ANNO_KEY];
                }
                if (compCtor[REQUIRE_KEY]) {
                    compCtor[REQUIRE_KEY].forEach(function (compType) {
                        anno.addRequired(compType);
                    });
                    delete compCtor[REQUIRE_KEY];
                }
                ComponentFactory._typeMap[name] = compCtor;
                compCtor[SUPER_CLASS_KEY] = superClass;
                tempPropAnnos = null;
            };
            ComponentFactory.unregister = function (name) {
                delete ComponentFactory._typeMap[name];
                delete ComponentFactory._annotationMap[name];
            };
            ComponentFactory.registerProperty = function (compCtor, propertyName, propertyType, defaultValue, editorConfig) {
                tempPropAnnos = tempPropAnnos || [];
                tempPropAnnos.push({
                    propertyName: propertyName,
                    propertyType: propertyType,
                    defaultValue: defaultValue,
                    editorConfig: editorConfig
                });
            };
            ComponentFactory.registerRequired = function (compCtor, compType) {
                var name = compCtor[NAME_KEY];
                if (!name) {
                    compCtor[REQUIRE_KEY] = compCtor[REQUIRE_KEY] || [];
                    compCtor[REQUIRE_KEY].push(component.required);
                }
                else {
                    var anno = this._annotationMap[name];
                    anno.addRequired(compType);
                }
            };
            ComponentFactory._typeMap = {};
            ComponentFactory._annotationMap = {};
            return ComponentFactory;
        })();
        component.ComponentFactory = ComponentFactory;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="ComponentFactory.ts" />
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component_1) {
        var Type;
        (function (Type) {
            Type.Boolean = 'boolean';
            Type.Int = 'int';
            Type.Number = 'number';
            Type.String = 'string';
            Type.Image = 'Image';
            Type.SpriteAtlas = 'SpriteAtlas';
            Type.SpriteFrame = 'SpriteFrame';
            Type.Align = 'align';
            Type.Valign = 'valign';
            Type.Json = 'json';
        })(Type = component_1.Type || (component_1.Type = {}));
        function component(name, superClass) {
            return function (target) {
                component_1.ComponentFactory.register(name, target, superClass);
            };
        }
        component_1.component = component;
        function abstract() {
            return function (target) {
                component_1.ComponentFactory.setAbstract(target);
            };
        }
        component_1.abstract = abstract;
        function property(propertyType, defaultValue, editorConfig) {
            return function (targetPrototype, propertyName) {
                component_1.ComponentFactory.registerProperty(targetPrototype['constructor'], propertyName, propertyType, defaultValue, editorConfig);
            };
        }
        component_1.property = property;
        function required(compType) {
            return function (target) {
                component_1.ComponentFactory.registerRequired(target, compType);
            };
        }
        component_1.required = required;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../event/EventDispatcher.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component_2) {
        var Property = (function (_super) {
            __extends(Property, _super);
            function Property(defaultValue) {
                _super.call(this);
                this._dirty = true;
                this._defaultValue = defaultValue;
                this._value = defaultValue;
            }
            Property.prototype.convert = function (data) {
                this.set(data);
            };
            Property.prototype.get = function () {
                return this._value;
            };
            Property.prototype.set = function (value) {
                if (value === this._value)
                    return;
                if (typeof value === 'undefined' && typeof this._defaultValue !== 'undefined') {
                    this._value = this._defaultValue;
                }
                else {
                    this._value = value;
                }
                this.setDirty(true);
            };
            Property.prototype.setDefault = function () {
                this.set(this._defaultValue);
            };
            Property.prototype.setDirty = function (dirty) {
                if (dirty === void 0) { dirty = true; }
                this._dirty = dirty;
            };
            Property.prototype.clearDirty = function () {
                this.setDirty(false);
            };
            Property.prototype.isDirty = function () {
                return this._dirty;
            };
            return Property;
        })(WOZLLA.event.EventDispatcher);
        component_2.Property = Property;
        var ComplexProperty = (function (_super) {
            __extends(ComplexProperty, _super);
            function ComplexProperty() {
                _super.apply(this, arguments);
                this._dirty = true;
            }
            ComplexProperty.prototype.setDirty = function (dirty) {
                if (dirty === void 0) { dirty = true; }
                this._dirty = dirty;
            };
            ComplexProperty.prototype.clearDirty = function () {
                this.setDirty(false);
            };
            ComplexProperty.prototype.isDirty = function () {
                return this._dirty;
            };
            ComplexProperty.prototype.convert = function (data) {
            };
            return ComplexProperty;
        })(WOZLLA.event.EventDispatcher);
        component_2.ComplexProperty = ComplexProperty;
        var DelegateProperty = (function (_super) {
            __extends(DelegateProperty, _super);
            function DelegateProperty(getter, setter) {
                _super.call(this);
                this._getter = null;
                this._setter = null;
                this._getter = getter;
                this._setter = setter;
            }
            DelegateProperty.prototype.get = function () {
                return this._getter && this._getter() || null;
            };
            DelegateProperty.prototype.set = function (value) {
                if (this.get() === value)
                    return;
                this._setter && this._setter(value);
            };
            DelegateProperty.prototype.convert = function (data) {
                this.set(data);
            };
            return DelegateProperty;
        })(WOZLLA.event.EventDispatcher);
        component_2.DelegateProperty = DelegateProperty;
        var AssetChangeEvent = (function (_super) {
            __extends(AssetChangeEvent, _super);
            function AssetChangeEvent(property) {
                _super.call(this, 'assetChange');
                this._property = property;
            }
            Object.defineProperty(AssetChangeEvent.prototype, "property", {
                get: function () { return this._property; },
                enumerable: true,
                configurable: true
            });
            return AssetChangeEvent;
        })(WOZLLA.event.Event);
        component_2.AssetChangeEvent = AssetChangeEvent;
        var AssetProxyProperty = (function (_super) {
            __extends(AssetProxyProperty, _super);
            function AssetProxyProperty(component, defaultValue) {
                _super.call(this, defaultValue);
                this.component = component;
            }
            AssetProxyProperty.prototype.getAsset = function () {
                return this.asset;
            };
            AssetProxyProperty.prototype.destroy = function () {
                if (this.asset) {
                    this.component.assetManager.unload(this.asset);
                }
            };
            AssetProxyProperty.prototype.loadAssets = function (callback) {
                var _this = this;
                if (this.isDirty()) {
                    var descriptor = this.createAssetDescriptor();
                    if (!descriptor) {
                        this.clearDirty();
                        this.unloadAsset();
                        callback && callback();
                        return;
                    }
                    this.component.assetManager.load(descriptor, function (error, asset) {
                        _this.unloadAsset();
                        _this.clearDirty();
                        _this.asset = asset;
                        _this.dispatchEvent(new AssetChangeEvent(_this));
                        callback && callback();
                    });
                }
                else {
                    callback && callback();
                }
            };
            AssetProxyProperty.prototype.unloadAsset = function () {
                if (this.asset) {
                    this.component.assetManager.unload(this.asset);
                    this.asset = null;
                }
            };
            AssetProxyProperty.prototype.createAssetDescriptor = function () {
                throw new Error('This is an abstract method');
            };
            return AssetProxyProperty;
        })(Property);
        component_2.AssetProxyProperty = AssetProxyProperty;
        var ImageProperty = (function (_super) {
            __extends(ImageProperty, _super);
            function ImageProperty() {
                _super.apply(this, arguments);
            }
            ImageProperty.prototype.createAssetDescriptor = function () {
                var assetPath = this.get();
                if (!assetPath)
                    return null;
                return new WOZLLA.asset.ImageDescriptor(assetPath);
            };
            return ImageProperty;
        })(AssetProxyProperty);
        component_2.ImageProperty = ImageProperty;
        var SpriteAtlasProperty = (function (_super) {
            __extends(SpriteAtlasProperty, _super);
            function SpriteAtlasProperty() {
                _super.apply(this, arguments);
            }
            SpriteAtlasProperty.prototype.createAssetDescriptor = function () {
                var assetPath = this.get();
                if (!assetPath)
                    return null;
                return new WOZLLA.asset.SpriteAtlasDescriptor(assetPath);
            };
            return SpriteAtlasProperty;
        })(AssetProxyProperty);
        component_2.SpriteAtlasProperty = SpriteAtlasProperty;
        var JsonProperty = (function (_super) {
            __extends(JsonProperty, _super);
            function JsonProperty() {
                _super.apply(this, arguments);
            }
            JsonProperty.prototype.createAssetDescriptor = function () {
                var assetPath = this.get();
                if (!assetPath)
                    return null;
                return new WOZLLA.asset.JsonDescriptor(assetPath);
            };
            return JsonProperty;
        })(AssetProxyProperty);
        component_2.JsonProperty = JsonProperty;
        var SizeProperty = (function (_super) {
            __extends(SizeProperty, _super);
            function SizeProperty(defaultValue) {
                _super.call(this);
                this._width = 0;
                this._height = 0;
                if (defaultValue) {
                    this._width = defaultValue.width;
                    this._height = defaultValue.height;
                }
            }
            Object.defineProperty(SizeProperty.prototype, "width", {
                get: function () {
                    return this._width;
                },
                set: function (width) {
                    if (this._width === width)
                        return;
                    this._width = width;
                    this.setDirty(true);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SizeProperty.prototype, "height", {
                get: function () {
                    return this._height;
                },
                set: function (height) {
                    if (this._height === height)
                        return;
                    this._height = height;
                    this.setDirty(true);
                },
                enumerable: true,
                configurable: true
            });
            SizeProperty.prototype.setSize = function (width, height) {
                this.width = width;
                this.height = height;
            };
            SizeProperty.prototype.convert = function (data) {
                if (typeof data === 'string') {
                    var splitData = data.split(',');
                    if (!splitData[0] || !splitData[1]) {
                        return;
                    }
                    data = {
                        width: parseInt(splitData[0]),
                        height: parseInt(splitData[1])
                    };
                }
                this.setSize(data.width, data.height);
            };
            return SizeProperty;
        })(ComplexProperty);
        component_2.SizeProperty = SizeProperty;
        var PointProperty = (function (_super) {
            __extends(PointProperty, _super);
            function PointProperty(defaultValue) {
                _super.call(this);
                this._x = 0;
                this._y = 0;
                if (defaultValue) {
                    this._x = defaultValue.x;
                    this._y = defaultValue.y;
                }
            }
            Object.defineProperty(PointProperty.prototype, "x", {
                get: function () {
                    return this._x;
                },
                set: function (x) {
                    if (this._x === x)
                        return;
                    this._x = x;
                    this.setDirty(true);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PointProperty.prototype, "y", {
                get: function () {
                    return this._y;
                },
                set: function (y) {
                    if (this._y === y)
                        return;
                    this._y = y;
                    this.setDirty(true);
                },
                enumerable: true,
                configurable: true
            });
            PointProperty.prototype.setPoint = function (x, y) {
                if (this._x === x && this._y === y)
                    return;
                this._x = x;
                this._y = y;
            };
            PointProperty.prototype.convert = function (data) {
                if (typeof data === 'string') {
                    var splitData = data.split(',');
                    if (!splitData[0] || !splitData[1]) {
                        return;
                    }
                    data = {
                        x: parseInt(splitData[0]),
                        y: parseInt(splitData[1])
                    };
                }
                this.setPoint(data.x, data.y);
            };
            return PointProperty;
        })(ComplexProperty);
        component_2.PointProperty = PointProperty;
        var RectProperty = (function (_super) {
            __extends(RectProperty, _super);
            function RectProperty(defaultValue) {
                _super.call(this, defaultValue);
                this._x = 0;
                this._y = 0;
                if (defaultValue) {
                    this._x = defaultValue.x;
                    this._y = defaultValue.y;
                }
            }
            Object.defineProperty(RectProperty.prototype, "x", {
                get: function () {
                    return this._x;
                },
                set: function (x) {
                    if (this._x === x)
                        return;
                    this._x = x;
                    this.setDirty(true);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(RectProperty.prototype, "y", {
                get: function () {
                    return this._y;
                },
                set: function (y) {
                    if (this._y === y)
                        return;
                    this._y = y;
                    this.setDirty(true);
                },
                enumerable: true,
                configurable: true
            });
            RectProperty.prototype.setRect = function (x, y, width, height) {
                if (this._x === x && this._y === y && this.width === width && this.height === height)
                    return;
                this._x = x;
                this._y = y;
                this.width = width;
                this.height = height;
            };
            RectProperty.prototype.convert = function (data) {
                if (typeof data === 'string') {
                    var splitData = data.split(',');
                    if (!splitData[0] || !splitData[1] || !splitData[2] || !splitData[3]) {
                        return;
                    }
                    data = {
                        x: parseInt(splitData[0]),
                        y: parseInt(splitData[1]),
                        width: parseInt(splitData[2]),
                        height: parseInt(splitData[3])
                    };
                }
                this.setRect(data.x || 0, data.y || 0, data.width, data.height);
            };
            return RectProperty;
        })(SizeProperty);
        component_2.RectProperty = RectProperty;
        var CanvasStyleProperty = (function (_super) {
            __extends(CanvasStyleProperty, _super);
            function CanvasStyleProperty() {
                _super.apply(this, arguments);
                this._font = 'normal 24px Arial';
                this._shadow = false;
                this._shadowOffsetX = 0;
                this._shadowOffsetY = 0;
                this._shadowColor = '#000000';
                this._stroke = false;
                this._strokeColor = '#000000';
                this._strokeWidth = 0;
                this._alpha = 1;
                this._fill = false;
                this._fillColor = '#FFFFFF';
            }
            Object.defineProperty(CanvasStyleProperty.prototype, "alpha", {
                get: function () { return this._alpha; },
                set: function (value) {
                    this._alpha = value;
                    this.setDirty(true);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CanvasStyleProperty.prototype, "stroke", {
                get: function () { return this._stroke; },
                set: function (value) {
                    if (value === this._stroke)
                        return;
                    this._stroke = value;
                    this.setDirty(true);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CanvasStyleProperty.prototype, "strokeColor", {
                get: function () { return this._strokeColor; },
                set: function (value) {
                    if (value === this._strokeColor)
                        return;
                    this._strokeColor = value;
                    this.setDirty(true);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CanvasStyleProperty.prototype, "strokeWidth", {
                get: function () { return this._strokeWidth; },
                set: function (value) {
                    if (value === this._strokeWidth)
                        return;
                    this._strokeWidth = value;
                    this.setDirty(true);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CanvasStyleProperty.prototype, "fill", {
                get: function () { return this._fill; },
                set: function (value) {
                    if (value === this._fill)
                        return;
                    this._fill = value;
                    this.setDirty(true);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CanvasStyleProperty.prototype, "fillColor", {
                get: function () { return this._fillColor; },
                set: function (value) {
                    if (value === this._fillColor)
                        return;
                    this._fillColor = value;
                    this.setDirty(true);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CanvasStyleProperty.prototype, "font", {
                get: function () { return this._font; },
                set: function (value) {
                    if (value === this._font)
                        return;
                    this._font = value;
                    this.setDirty(true);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CanvasStyleProperty.prototype, "shadow", {
                get: function () { return this._shadow; },
                set: function (value) {
                    if (value === this._shadow)
                        return;
                    this._shadow = value;
                    this.setDirty(true);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CanvasStyleProperty.prototype, "shadowOffsetX", {
                get: function () { return this._shadowOffsetX; },
                set: function (value) {
                    if (value === this._shadowOffsetX)
                        return;
                    this._shadowOffsetX = value;
                    this.setDirty(true);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CanvasStyleProperty.prototype, "shadowOffsetY", {
                get: function () { return this._shadowOffsetY; },
                set: function (value) {
                    if (value === this._shadowOffsetY)
                        return;
                    this._shadowOffsetY = value;
                    this.setDirty(true);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CanvasStyleProperty.prototype, "shadowColor", {
                get: function () { return this._shadowColor; },
                set: function (value) {
                    this._shadowColor = value;
                    this.setDirty();
                },
                enumerable: true,
                configurable: true
            });
            CanvasStyleProperty.prototype.applyStyle = function (context, useFont) {
                if (useFont === void 0) { useFont = false; }
                if (useFont) {
                    context.font = this._font;
                }
                context.globalAlpha = this._alpha;
                context.strokeStyle = this._strokeColor;
                context.lineWidth = this._strokeWidth;
                context.fillStyle = this._fillColor;
            };
            CanvasStyleProperty.prototype.convert = function (data) {
                if (data && typeof data === 'string') {
                    data = JSON.parse(data);
                }
                for (var prop in data) {
                    this[prop] = data[prop];
                }
            };
            return CanvasStyleProperty;
        })(ComplexProperty);
        component_2.CanvasStyleProperty = CanvasStyleProperty;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var math;
    (function (math) {
        /**
         * @class WOZLLA.math.Matrix
         * a util class for 3x3 matrix
         */
        var Matrix3x3 = (function () {
            function Matrix3x3() {
                /**
                 * get values of this matrix
                 * @property {Float32Array} values
                 * @readonly
                 */
                this.values = new Float32Array(9);
                this.identity();
            }
            Object.defineProperty(Matrix3x3.prototype, "a", {
                get: function () {
                    return this.values[0];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Matrix3x3.prototype, "c", {
                get: function () {
                    return this.values[1];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Matrix3x3.prototype, "b", {
                get: function () {
                    return this.values[3];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Matrix3x3.prototype, "d", {
                get: function () {
                    return this.values[4];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Matrix3x3.prototype, "tx", {
                get: function () {
                    return this.values[6];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Matrix3x3.prototype, "ty", {
                get: function () {
                    return this.values[7];
                },
                enumerable: true,
                configurable: true
            });
            /**
             * apply from another matrix
             * @param matrix
             */
            Matrix3x3.prototype.applyMatrix = function (matrix) {
                this.values.set(matrix.values);
            };
            /**
             * identify this matrix
             */
            Matrix3x3.prototype.identity = function () {
                this.values[0] = 1; // a
                this.values[1] = 0; // c
                this.values[2] = 0;
                this.values[3] = 0; // b
                this.values[4] = 1; // d
                this.values[5] = 0;
                this.values[6] = 0; // tx
                this.values[7] = 0; // ty
                this.values[8] = 1;
            };
            /**
             * invert this matrix
             */
            Matrix3x3.prototype.invert = function () {
                var a1 = this.values[0];
                var b1 = this.values[1];
                var c1 = this.values[3];
                var d1 = this.values[4];
                var tx1 = this.values[6];
                var ty1 = this.values[7];
                var n = a1 * d1 - b1 * c1;
                this.values[0] = d1 / n;
                this.values[1] = -b1 / n;
                this.values[3] = -c1 / n;
                this.values[4] = a1 / n;
                this.values[6] = (c1 * ty1 - d1 * tx1) / n;
                this.values[7] = -(a1 * ty1 - b1 * tx1) / n;
            };
            /**
             * prepend 2d params to this matrix
             * @param a
             * @param b
             * @param c
             * @param d
             * @param tx
             * @param ty
             */
            Matrix3x3.prototype.prepend = function (a, b, c, d, tx, ty) {
                var a1, b1, c1, d1;
                var values = this.values;
                var tx1 = values[6];
                var ty1 = values[7];
                if (a != 1 || b != 0 || c != 0 || d != 1) {
                    a1 = values[0];
                    b1 = values[1];
                    c1 = values[3];
                    d1 = values[4];
                    values[0] = a1 * a + b1 * c;
                    values[1] = a1 * b + b1 * d;
                    values[3] = c1 * a + d1 * c;
                    values[4] = c1 * b + d1 * d;
                }
                values[6] = tx1 * a + ty1 * c + tx;
                values[7] = tx1 * b + ty1 * d + ty;
            };
            /**
             * append 2d params to this matrix
             * @param a
             * @param b
             * @param c
             * @param d
             * @param tx
             * @param ty
             */
            Matrix3x3.prototype.append = function (a, b, c, d, tx, ty) {
                var a1, b1, c1, d1;
                var values = this.values;
                a1 = values[0];
                b1 = values[1];
                c1 = values[3];
                d1 = values[4];
                values[0] = a * a1 + b * c1;
                values[1] = a * b1 + b * d1;
                values[3] = c * a1 + d * c1;
                values[4] = c * b1 + d * d1;
                values[6] = tx * a1 + ty * c1 + values[6];
                values[7] = tx * b1 + ty * d1 + values[7];
            };
            /**
             * prepend 2d transform params to this matrix
             * @param x
             * @param y
             * @param scaleX
             * @param scaleY
             * @param rotation
             * @param skewX
             * @param skewY
             * @param regX
             * @param regY
             * @returns {WOZLLA.math.Matrix}
             */
            Matrix3x3.prototype.prependTransform = function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
                if (rotation % 360) {
                    var r = rotation * Matrix3x3.DEG_TO_RAD;
                    var cos = Math.cos(r);
                    var sin = Math.sin(r);
                }
                else {
                    cos = 1;
                    sin = 0;
                }
                if (regX || regY) {
                    this.values[6] -= regX;
                    this.values[7] -= regY;
                }
                if (skewX || skewY) {
                    skewX *= Matrix3x3.DEG_TO_RAD;
                    skewY *= Matrix3x3.DEG_TO_RAD;
                    this.prepend(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
                    this.prepend(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
                }
                else {
                    this.prepend(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
                }
                return this;
            };
            /**
             * append 2d transform params to this matrix
             * @param x
             * @param y
             * @param scaleX
             * @param scaleY
             * @param rotation
             * @param skewX
             * @param skewY
             * @param regX
             * @param regY
             * @returns {WOZLLA.math.Matrix}
             */
            Matrix3x3.prototype.appendTransform = function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
                if (scaleX === void 0) { scaleX = 1; }
                if (scaleY === void 0) { scaleY = 1; }
                if (rotation === void 0) { rotation = 0; }
                if (skewX === void 0) { skewX = 0; }
                if (skewY === void 0) { skewY = 0; }
                if (regX === void 0) { regX = 0; }
                if (regY === void 0) { regY = 0; }
                if (rotation % 360) {
                    var r = rotation * Matrix3x3.DEG_TO_RAD;
                    var cos = Math.cos(r);
                    var sin = Math.sin(r);
                }
                else {
                    cos = 1;
                    sin = 0;
                }
                if (skewX || skewY) {
                    skewX *= Matrix3x3.DEG_TO_RAD;
                    skewY *= Matrix3x3.DEG_TO_RAD;
                    this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
                    this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
                }
                else {
                    this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
                }
                if (regX || regY) {
                    // prepend the registration offset:
                    this.values[6] -= regX * this.values[0] + regY * this.values[3];
                    this.values[7] -= regX * this.values[1] + regY * this.values[4];
                }
                return this;
            };
            /**
             * @property DEG_TO_RAD
             * @member WOZLLA.math.Matrix
             * @readonly
             * @static
             */
            Matrix3x3.DEG_TO_RAD = Math.PI / 180;
            return Matrix3x3;
        })();
        math.Matrix3x3 = Matrix3x3;
    })(math = WOZLLA.math || (WOZLLA.math = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../math/Matrix3x3.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var helpMatrix = new WOZLLA.math.Matrix3x3();
    /**
     * this class define the position, scale, rotation and about transform information of {@link WOZLLA.GameObject}
     * @class WOZLLA.Transform
     */
    var Transform = (function () {
        function Transform() {
            /**
             * @property {WOZLLA.math.Matrix} worldMatrix
             * @readonly
             */
            this.worldMatrix = new WOZLLA.math.Matrix3x3();
            /**
             * specify this tranform
             * @type {boolean}
             */
            this.useGLCoords = false;
            this._relative = true;
            this._dirty = false;
            this._values = new Array(7);
            this.reset();
        }
        Object.defineProperty(Transform.prototype, "x", {
            get: function () {
                return this._values[0];
            },
            set: function (value) {
                if (value === this._values[0])
                    return;
                this._values[0] = value;
                this._dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "y", {
            get: function () {
                return this._values[1];
            },
            set: function (value) {
                if (value === this._values[1])
                    return;
                this._values[1] = value;
                this._dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "worldX", {
            get: function () {
                return this.worldMatrix.tx;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "worldY", {
            get: function () {
                return this.worldMatrix.ty;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "rotation", {
            get: function () {
                return this._values[2];
            },
            set: function (value) {
                if (value === this._values[2])
                    return;
                this._values[2] = value;
                this._dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "scaleX", {
            get: function () {
                return this._values[3];
            },
            set: function (value) {
                if (value === this._values[3])
                    return;
                this._values[3] = value;
                this._dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "scaleY", {
            get: function () {
                return this._values[4];
            },
            set: function (value) {
                if (value === this._values[4])
                    return;
                this._values[4] = value;
                this._dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "skewX", {
            get: function () {
                return this._values[5];
            },
            set: function (value) {
                if (value === this._values[5])
                    return;
                this._values[5] = value;
                this._dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "skewY", {
            get: function () {
                return this._values[6];
            },
            set: function (value) {
                if (value === this._values[6])
                    return;
                this._values[6] = value;
                this._dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "relative", {
            get: function () {
                return this._relative;
            },
            set: function (relative) {
                this._relative = relative;
                this._dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "dirty", {
            get: function () {
                return this._dirty;
            },
            set: function (value) {
                this._dirty = value;
            },
            enumerable: true,
            configurable: true
        });
        Transform.prototype.setPosition = function (x, y) {
            this.x = x;
            this.y = y;
        };
        Transform.prototype.setScale = function (scaleX, scaleY) {
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        };
        Transform.prototype.setSkew = function (skewX, skewY) {
            this.skewX = skewX;
            this.skewY = skewY;
        };
        Transform.prototype.reset = function () {
            this._values[0] = 0; // x
            this._values[1] = 0; // y
            this._values[2] = 0; // rotation
            this._values[3] = 1; // scaleX
            this._values[4] = 1; // scaleY
            this._values[5] = 0; // skewX
            this._values[6] = 0; // skewY
        };
        Transform.prototype.set = function (transform) {
            if (typeof transform.x === "number") {
                this.x = transform.x;
            }
            if (typeof transform.y === "number") {
                this.y = transform.y;
            }
            if (typeof transform.rotation === 'number') {
                this.rotation = transform.rotation;
            }
            if (typeof transform.scaleX === 'number') {
                this.scaleX = transform.scaleX;
            }
            if (typeof transform.scaleY === 'number') {
                this.scaleY = transform.scaleY;
            }
            if (typeof transform.skewX === 'number') {
                this.skewX = transform.skewX;
            }
            if (typeof transform.skewY === 'number') {
                this.skewY = transform.skewY;
            }
            if (typeof transform.relative !== 'undefined') {
                this.relative = transform.relative;
            }
        };
        Transform.prototype.transform = function (rootTransform, parentTransform) {
            if (parentTransform === void 0) { parentTransform = null; }
            var cos, sin, r;
            var matrix;
            var worldMatrix = this.worldMatrix;
            var x = this._values[0];
            var y = this._values[1];
            var rotation = this._values[2];
            var scaleX = this._values[3];
            var scaleY = this._values[4];
            var skewX = this._values[5];
            var skewY = this._values[6];
            if (this.useGLCoords) {
                skewX += 180;
            }
            if (parentTransform && this._relative) {
                worldMatrix.applyMatrix(parentTransform.worldMatrix);
            }
            else {
                // if this is the transform of stage
                if (this === parentTransform) {
                    worldMatrix.identity();
                }
                else {
                    worldMatrix.applyMatrix(rootTransform.worldMatrix);
                }
            }
            if (this.__local_matrix) {
                matrix = this.__local_matrix;
                worldMatrix.append(matrix.a, matrix.c, matrix.b, matrix.d, matrix.tx, matrix.ty);
                this._dirty = false;
                return;
            }
            if (rotation % 360) {
                r = rotation * Transform.DEG_TO_RAD;
                cos = Math.cos(r);
                sin = Math.sin(r);
            }
            else {
                cos = 1;
                sin = 0;
            }
            if (skewX || skewY) {
                skewX *= Transform.DEG_TO_RAD;
                skewY *= Transform.DEG_TO_RAD;
                worldMatrix.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
                worldMatrix.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
            }
            else {
                worldMatrix.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
            }
            this._dirty = false;
        };
        Transform.prototype.globalToLocal = function (x, y, out) {
            helpMatrix.applyMatrix(this.worldMatrix);
            helpMatrix.invert();
            helpMatrix.append(1, 0, 0, 1, x, y);
            if (out) {
                out.x = helpMatrix.tx;
                out.y = helpMatrix.ty;
                return out;
            }
            return {
                x: helpMatrix.tx,
                y: helpMatrix.ty
            };
        };
        Transform.prototype.localToGlobal = function (x, y, out) {
            helpMatrix.applyMatrix(this.worldMatrix);
            helpMatrix.append(1, 0, 0, 1, x, y);
            if (out) {
                out.x = helpMatrix.tx;
                out.y = helpMatrix.ty;
                return out;
            }
            return {
                x: helpMatrix.tx,
                y: helpMatrix.ty
            };
        };
        Transform.prototype.localToLocal = function (x, y, trans, out) {
            out = out || { x: 0, y: 0 };
            trans.localToGlobal(x, y, out);
            return this.globalToLocal(out.x, out.y, out);
        };
        Transform.prototype.tween = function (override, loop) {
            if (loop === void 0) { loop = false; }
            return WOZLLA.util.Tween.get(this, {
                loop: loop
            }, null, override);
        };
        Transform.prototype.clearTweens = function () {
            WOZLLA.util.Tween.removeTweens(this);
        };
        /**
         * @property {number} DEG_TO_RAD
         * @readonly
         * @static
         */
        Transform.DEG_TO_RAD = Math.PI / 180;
        return Transform;
    })();
    WOZLLA.Transform = Transform;
})(WOZLLA || (WOZLLA = {}));
/// <reference path="Transform.ts"/>
/// <reference path="../event/EventDispatcher.ts"/>
var WOZLLA;
(function (WOZLLA) {
    WOZLLA.sharedHelpTransform = new WOZLLA.Transform();
    /**
     * Top class of all components
     * @class WOZLLA.Component
     * @extends WOZLLA.event.EventDispatcher
     * @abstract
     */
    var Component = (function (_super) {
        __extends(Component, _super);
        function Component() {
            _super.apply(this, arguments);
            this._UID = WOZLLA.genUID();
            this._assetProxyList = [];
        }
        Object.defineProperty(Component.prototype, "UID", {
            get: function () {
                return this._UID;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "gameObject", {
            /**
             * get the GameObject of this component belongs to.
             * @property {WOZLLA.GameObject} gameObject
             */
            get: function () { return this._gameObject; },
            set: function (value) { this._gameObject = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "transform", {
            /**
             *  get transform of the gameObject of this component
             *  @property {WOZLLA.Transform} transform
             */
            get: function () {
                if (!this._gameObject)
                    return null;
                return this._gameObject.transform;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "rectTransform", {
            get: function () {
                if (!this._gameObject)
                    return null;
                return this._gameObject.rectTransform;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "director", {
            get: function () {
                if (!this._gameObject)
                    return null;
                return this._gameObject.director;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "stage", {
            get: function () {
                if (!this._gameObject)
                    return null;
                return this._gameObject.stage;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "assetManager", {
            get: function () {
                return this.director.assetManager;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * init this component
         */
        Component.prototype.init = function () {
        };
        /**
         * destroy this component
         */
        Component.prototype.destroy = function () {
            this._assetProxyList.forEach(function (assetProxy) { return assetProxy.destroy(); });
            this._assetProxyList.length = 0;
        };
        Component.prototype.loadAssets = function (callback) {
            if (this._assetProxyList.length === 0) {
                callback && callback();
            }
            else {
                var loadedCount = 0;
                var total = this._assetProxyList.length;
                for (var i = total - 1; i >= 0; i--) {
                    var assetProxy = this._assetProxyList[i];
                    assetProxy.loadAssets(function () {
                        if (++loadedCount === total) {
                            callback && callback();
                        }
                    });
                }
            }
        };
        Component.prototype.addAssetProxy = function (proxy) {
            this._assetProxyList.push(proxy);
        };
        Component.prototype.removeAssetProxy = function (proxy) {
            var index = this._assetProxyList.indexOf(proxy);
            if (index === -1)
                return;
            this._assetProxyList.splice(index, 1);
        };
        return Component;
    })(WOZLLA.event.EventDispatcher);
    WOZLLA.Component = Component;
})(WOZLLA || (WOZLLA = {}));
/// <reference path="Component.ts"/>
var WOZLLA;
(function (WOZLLA) {
    /**
     * Abstract base class for RenderContext component
     * @class WOZLLA.Renderer
     * @abstract
     */
    var Renderer = (function (_super) {
        __extends(Renderer, _super);
        function Renderer() {
            _super.apply(this, arguments);
        }
        Renderer.prototype.render = function (renderContext, transformDirty, renderLayer, renderOrder, alpha) { };
        return Renderer;
    })(WOZLLA.Component);
    WOZLLA.Renderer = Renderer;
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    WOZLLA.isWebGLSupport = (function () {
        var contextOptions = { stencil: true };
        try {
            if (!window['WebGLRenderingContext']) {
                return false;
            }
            var canvas = document.createElement('canvas'), gl = canvas.getContext('webgl', contextOptions) || canvas.getContext('experimental-webgl', contextOptions);
            return !!(gl && gl.getContextAttributes().stencil);
        }
        catch (e) {
            return false;
        }
    })();
    function empty() { }
    WOZLLA.empty = empty;
    WOZLLA.ALIGN_START = 'start';
    WOZLLA.ALIGN_CENTER = 'center';
    WOZLLA.ALIGN_END = 'end';
    WOZLLA.VALIGN_TOP = 'top';
    WOZLLA.VALIGN_MIDDLE = 'middle';
    WOZLLA.VALIGN_BOTTOM = 'bottom';
    var UID_gen = 10000;
    function genUID() {
        return (UID_gen++) + '';
    }
    WOZLLA.genUID = genUID;
    function genUUID() {
        var d = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
    WOZLLA.genUUID = genUUID;
    function applyIfUndefined(target, source) {
        for (var i in source) {
            if (typeof target[i] === 'undefined') {
                target[i] = source[i];
            }
        }
        return target;
    }
    WOZLLA.applyIfUndefined = applyIfUndefined;
    function isArray(test) {
        return Object.prototype.toString.call(test) === '[object Array]';
    }
    WOZLLA.isArray = isArray;
    function createCanvas(width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
    WOZLLA.createCanvas = createCanvas;
    if (!console.warn) {
        console.warn = console.log;
    }
    if (!console.debug) {
        console.debug = console.log;
    }
    if (!console.info) {
        console.info = console.log;
    }
    if (!console.error) {
        console.error = console.log;
    }
    var Log;
    (function (Log) {
        Log.NONE = 0;
        Log.ERROR = 1;
        Log.WARN = 2;
        Log.INFO = 3;
        Log.DEBUG = 4;
        Log.logLevel = Log.ERROR;
        function debug() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (Log.logLevel >= Log.DEBUG) {
                console.log.apply(console, arguments);
            }
        }
        Log.debug = debug;
        function info() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (Log.logLevel >= Log.INFO) {
                console.info.apply(console, arguments);
            }
        }
        Log.info = info;
        function warn() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (Log.logLevel >= Log.WARN) {
                console.warn.apply(console, arguments);
            }
        }
        Log.warn = warn;
        function error() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (Log.logLevel >= Log.ERROR) {
                console.error.apply(console, arguments);
            }
        }
        Log.error = error;
    })(Log = WOZLLA.Log || (WOZLLA.Log = {}));
    function ajaxRequest(options) {
        var xhr;
        var timeoutId;
        options = applyIfUndefined(options, {
            url: '',
            async: true,
            method: 'GET',
            responseType: 'text',
            timeout: 10000,
            callback: empty,
            withCredentials: false
        });
        xhr = new XMLHttpRequest();
        xhr.responseType = options.responseType;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                xhr.onreadystatechange = empty;
                clearTimeout(timeoutId);
                if (xhr.status === 200 || xhr.status === 0) {
                    options.callback(null, xhr);
                }
                else {
                    options.callback('request fail', null);
                }
            }
        };
        xhr.open(options.method, options.url, options.async);
        xhr.withCredentials = options.withCredentials;
        timeoutId = setTimeout(function () {
            xhr.onreadystatechange = empty;
            xhr.abort();
            options.callback('timeout', null);
        }, options.timeout);
        xhr.send();
    }
    WOZLLA.ajaxRequest = ajaxRequest;
})(WOZLLA || (WOZLLA = {}));
/// <reference path="Annotations.ts" />
/// <reference path="Property.ts" />
/// <reference path="../core/Renderer.ts" />
/// <reference path="../WOZLLA.ts" />
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var AbstractSpriteRenderer = (function (_super) {
            __extends(AbstractSpriteRenderer, _super);
            function AbstractSpriteRenderer() {
                _super.call(this);
                this._spriteAtlas = new component.SpriteAtlasProperty(this);
                this._frame = new component.Property();
                this._align = new component.Property(WOZLLA.ALIGN_START);
                this._valign = new component.Property(WOZLLA.VALIGN_TOP);
                this.addAssetProxy(this._spriteAtlas);
            }
            Object.defineProperty(AbstractSpriteRenderer.prototype, "spriteAtlas", {
                get: function () {
                    return this._spriteAtlas;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AbstractSpriteRenderer.prototype, "align", {
                get: function () {
                    return this._align;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AbstractSpriteRenderer.prototype, "valign", {
                get: function () {
                    return this._valign;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AbstractSpriteRenderer.prototype, "frame", {
                get: function () {
                    return this._frame;
                },
                enumerable: true,
                configurable: true
            });
            AbstractSpriteRenderer.prototype.render = function (renderContext, transformDirty, renderLayer, renderOrder, alpha) {
                throw new Error('abstract method');
            };
            AbstractSpriteRenderer.prototype.getSprite = function () {
                var asset = this.spriteAtlas.getAsset();
                var sprite = asset && asset.getSprite(this.frame.get());
                return sprite || null;
            };
            __decorate([
                component.property(component.Type.SpriteAtlas)
            ], AbstractSpriteRenderer.prototype, "spriteAtlas", null);
            __decorate([
                component.property(component.Type.String)
            ], AbstractSpriteRenderer.prototype, "align", null);
            __decorate([
                component.property(component.Type.String)
            ], AbstractSpriteRenderer.prototype, "valign", null);
            __decorate([
                component.property(component.Type.SpriteFrame)
            ], AbstractSpriteRenderer.prototype, "frame", null);
            AbstractSpriteRenderer = __decorate([
                component.component('AbstractSpriteRenderer'),
                component.abstract()
            ], AbstractSpriteRenderer);
            return AbstractSpriteRenderer;
        })(WOZLLA.Renderer);
        component.AbstractSpriteRenderer = AbstractSpriteRenderer;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../Annotations.ts" />
/// <reference path="../Property.ts" />
/// <reference path="../AbstractSpriteRenderer.ts" />
/// <reference path="../../WOZLLA.ts" />
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var SpriteRenderer = (function (_super) {
            __extends(SpriteRenderer, _super);
            function SpriteRenderer() {
                _super.apply(this, arguments);
                this._useOffset = false;
            }
            SpriteRenderer.prototype.setUseOffset = function (useOffset) {
                this._useOffset = useOffset;
            };
            SpriteRenderer.prototype.render = function (renderContext, transformDirty, renderLayer, renderOrder, alpha) {
                var sprite = this.getSprite();
                if (!this._quadCommand) {
                    this._quadCommand = renderContext.createQuadCommand();
                    this._quadCommand.matrix = this.transform.worldMatrix;
                }
                if (!sprite) {
                    if (this._quadCommand.texture) {
                        this._quadCommand.texture = null;
                    }
                    return;
                }
                if (transformDirty) {
                    this._quadCommand.matrixDirty = true;
                }
                if (this._quadCommand.texture !== sprite || this.frame.isDirty()) {
                    this._quadCommand.texture = sprite;
                    this._quadCommand.textureRegion.x = sprite.x;
                    this._quadCommand.textureRegion.y = sprite.y;
                    this._quadCommand.textureRegion.width = sprite.width;
                    this._quadCommand.textureRegion.height = sprite.height;
                    this.frame.clearDirty();
                }
                if (this._useOffset) {
                    this._quadCommand.textureOffset.x = -sprite.offsetX / sprite.width;
                    this._quadCommand.textureOffset.y = -sprite.offsetY / sprite.height;
                }
                else if (this.align.isDirty() || this.valign.isDirty()) {
                    var align = this.align.get();
                    var valign = this.valign.get();
                    if (align === WOZLLA.ALIGN_CENTER) {
                        this._quadCommand.textureOffset.x = 0.5;
                    }
                    else if (align === WOZLLA.ALIGN_END) {
                        this._quadCommand.textureOffset.x = 1;
                    }
                    else {
                        this._quadCommand.textureOffset.x = 0;
                    }
                    if (valign === WOZLLA.VALIGN_MIDDLE) {
                        this._quadCommand.textureOffset.y = 0.5;
                    }
                    else if (valign === WOZLLA.VALIGN_BOTTOM) {
                        this._quadCommand.textureOffset.y = 1;
                    }
                    else {
                        this._quadCommand.textureOffset.y = 0;
                    }
                    this.align.clearDirty();
                    this.valign.clearDirty();
                }
                this._quadCommand.alpha = alpha;
                this._quadCommand.renderLayer = renderLayer;
                this._quadCommand.renderOrder = renderOrder;
                if (this._quadCommand.canRender) {
                    renderContext.addCommand(this._quadCommand);
                }
            };
            SpriteRenderer = __decorate([
                component.component('SpriteRenderer', component.AbstractSpriteRenderer)
            ], SpriteRenderer);
            return SpriteRenderer;
        })(component.AbstractSpriteRenderer);
        component.SpriteRenderer = SpriteRenderer;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="Component.ts"/>
var WOZLLA;
(function (WOZLLA) {
    /**
     * Abstract base class for all behaviours, the {@link WOZLLA.Behaviour#update} function would be call
     * by WOZLLA engine every frame when the gameObject is actived and the property enabled of this behaviour is true
     * @class WOZLLA.Behaviour
     * @extends WOZLLA.Component
     * @abstract
     */
    var Behaviour = (function (_super) {
        __extends(Behaviour, _super);
        function Behaviour() {
            _super.apply(this, arguments);
            /**
             * enabled or disabled this behaviour
             * @property {boolean} [enabled=true]
             */
            this.enabled = true;
        }
        /**
         * call by Engine every frame
         * @method update
         */
        Behaviour.prototype.update = function () { };
        return Behaviour;
    })(WOZLLA.Component);
    WOZLLA.Behaviour = Behaviour;
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var util;
    (function (util) {
        var Tween = (function () {
            function Tween(target, props, pluginData) {
                this._target = null;
                this._useTicks = false;
                this.ignoreGlobalPause = false;
                this.loop = false;
                this.pluginData = null;
                this._steps = null;
                this._actions = null;
                this.paused = false;
                this.duration = 0;
                this._prevPos = -1;
                this.position = null;
                this._prevPosition = 0;
                this._stepPosition = 0;
                this.passive = false;
                this.initialize(target, props, pluginData);
            }
            Tween.get = function (target, props, pluginData, override) {
                if (props === void 0) { props = null; }
                if (pluginData === void 0) { pluginData = null; }
                if (override === void 0) { override = false; }
                if (override) {
                    Tween.removeTweens(target);
                }
                return new Tween(target, props, pluginData);
            };
            Tween.removeTweens = function (target) {
                if (!target.tween_count) {
                    return;
                }
                var tweens = Tween._tweens;
                for (var i = tweens.length - 1; i >= 0; i--) {
                    if (tweens[i]._target == target) {
                        tweens[i].paused = true;
                        tweens.splice(i, 1);
                    }
                }
                target.tween_count = 0;
            };
            Tween.tick = function (delta, paused) {
                if (paused === void 0) { paused = false; }
                var tweens = Tween._tweens.concat();
                for (var i = tweens.length - 1; i >= 0; i--) {
                    var tween = tweens[i];
                    if ((paused && !tween.ignoreGlobalPause) || tween.paused) {
                        continue;
                    }
                    tween.tick(tween._useTicks ? 1 : delta);
                }
            };
            Tween._register = function (tween, value) {
                var target = tween._target;
                var tweens = Tween._tweens;
                if (value) {
                    if (target) {
                        target.tween_count = target.tween_count ? target.tween_count + 1 : 1;
                    }
                    tweens.push(tween);
                }
                else {
                    if (target) {
                        target.tween_count--;
                    }
                    var i = tweens.length;
                    while (i--) {
                        if (tweens[i] == tween) {
                            tweens.splice(i, 1);
                            return;
                        }
                    }
                }
            };
            Tween.removeAllTweens = function () {
                var tweens = Tween._tweens;
                for (var i = 0, l = tweens.length; i < l; i++) {
                    var tween = tweens[i];
                    tween.paused = true;
                    tween._target.tweenjs_count = 0;
                }
                tweens.length = 0;
            };
            Tween.prototype.initialize = function (target, props, pluginData) {
                this._target = target;
                if (props) {
                    this._useTicks = props.useTicks;
                    this.ignoreGlobalPause = props.ignoreGlobalPause;
                    this.loop = props.loop;
                    //                props.onChange && this.addEventListener("change", props.onChange, props.onChangeObj);
                    if (props.override) {
                        Tween.removeTweens(target);
                    }
                }
                this.pluginData = pluginData || {};
                this._curQueueProps = {};
                this._initQueueProps = {};
                this._steps = [];
                this._actions = [];
                if (props && props.paused) {
                    this.paused = true;
                }
                else {
                    Tween._register(this, true);
                }
                if (props && props.position != null) {
                    this.setPosition(props.position, Tween.NONE);
                }
            };
            Tween.prototype.setPosition = function (value, actionsMode) {
                if (actionsMode === void 0) { actionsMode = 1; }
                if (value < 0) {
                    value = 0;
                }
                var t = value;
                var end = false;
                if (t >= this.duration) {
                    if (this.loop) {
                        t = t % this.duration;
                    }
                    else {
                        t = this.duration;
                        end = true;
                    }
                }
                if (t == this._prevPos) {
                    return end;
                }
                var prevPos = this._prevPos;
                this.position = this._prevPos = t;
                this._prevPosition = value;
                if (this._target) {
                    if (end) {
                        this._updateTargetProps(null, 1);
                    }
                    else if (this._steps.length > 0) {
                        for (var i = 0, l = this._steps.length; i < l; i++) {
                            if (this._steps[i].t > t) {
                                break;
                            }
                        }
                        var step = this._steps[i - 1];
                        this._updateTargetProps(step, (this._stepPosition = t - step.t) / step.d);
                    }
                }
                if (actionsMode != 0 && this._actions.length > 0) {
                    if (this._useTicks) {
                        this._runActions(t, t);
                    }
                    else if (actionsMode == 1 && t < prevPos) {
                        if (prevPos != this.duration) {
                            this._runActions(prevPos, this.duration);
                        }
                        this._runActions(0, t, true);
                    }
                    else {
                        this._runActions(prevPos, t);
                    }
                }
                if (end) {
                    this.setPaused(true);
                }
                //            this.dispatchEventWith("change");
                return end;
            };
            Tween.prototype._runActions = function (startPos, endPos, includeStart) {
                if (includeStart === void 0) { includeStart = false; }
                var sPos = startPos;
                var ePos = endPos;
                var i = -1;
                var j = this._actions.length;
                var k = 1;
                if (startPos > endPos) {
                    sPos = endPos;
                    ePos = startPos;
                    i = j;
                    j = k = -1;
                }
                while ((i += k) != j) {
                    var action = this._actions[i];
                    var pos = action.t;
                    if (pos == ePos || (pos > sPos && pos < ePos) || (includeStart && pos == startPos)) {
                        action.f.apply(action.o, action.p);
                    }
                }
            };
            Tween.prototype._updateTargetProps = function (step, ratio) {
                var p0, p1, v, v0, v1, arr;
                if (!step && ratio == 1) {
                    this.passive = false;
                    p0 = p1 = this._curQueueProps;
                }
                else {
                    this.passive = !!step.v;
                    if (this.passive) {
                        return;
                    }
                    if (step.e) {
                        ratio = step.e(ratio, 0, 1, 1);
                    }
                    p0 = step.p0;
                    p1 = step.p1;
                }
                for (var n in this._initQueueProps) {
                    if ((v0 = p0[n]) == null) {
                        p0[n] = v0 = this._initQueueProps[n];
                    }
                    if ((v1 = p1[n]) == null) {
                        p1[n] = v1 = v0;
                    }
                    if (v0 == v1 || ratio == 0 || ratio == 1 || (typeof (v0) != "number")) {
                        v = ratio == 1 ? v1 : v0;
                    }
                    else {
                        v = v0 + (v1 - v0) * ratio;
                    }
                    var ignore = false;
                    if (arr = Tween._plugins[n]) {
                        for (var i = 0, l = arr.length; i < l; i++) {
                            var v2 = arr[i].tween(this, n, v, p0, p1, ratio, !!step && p0 == p1, !step);
                            if (v2 == Tween.IGNORE) {
                                ignore = true;
                            }
                            else {
                                v = v2;
                            }
                        }
                    }
                    if (!ignore) {
                        this._target[n] = v;
                    }
                }
            };
            Tween.prototype.setPaused = function (value) {
                this.paused = value;
                Tween._register(this, !value);
                return this;
            };
            Tween.prototype._cloneProps = function (props) {
                var o = {};
                for (var n in props) {
                    o[n] = props[n];
                }
                return o;
            };
            Tween.prototype._addStep = function (o) {
                if (o.d > 0) {
                    this._steps.push(o);
                    o.t = this.duration;
                    this.duration += o.d;
                }
                return this;
            };
            Tween.prototype._appendQueueProps = function (o) {
                var arr, oldValue, i, l, injectProps;
                for (var n in o) {
                    if (this._initQueueProps[n] === undefined) {
                        oldValue = this._target[n];
                        if (arr = Tween._plugins[n]) {
                            for (i = 0, l = arr.length; i < l; i++) {
                                oldValue = arr[i].init(this, n, oldValue);
                            }
                        }
                        this._initQueueProps[n] = this._curQueueProps[n] = (oldValue === undefined) ? null : oldValue;
                    }
                    else {
                        oldValue = this._curQueueProps[n];
                    }
                }
                for (var n in o) {
                    oldValue = this._curQueueProps[n];
                    if (arr = Tween._plugins[n]) {
                        injectProps = injectProps || {};
                        for (i = 0, l = arr.length; i < l; i++) {
                            if (arr[i].step) {
                                (arr[i].step)(this, n, oldValue, o[n], injectProps);
                            }
                        }
                    }
                    this._curQueueProps[n] = o[n];
                }
                if (injectProps) {
                    this._appendQueueProps(injectProps);
                }
                return this._curQueueProps;
            };
            Tween.prototype._addAction = function (o) {
                o.t = this.duration;
                this._actions.push(o);
                return this;
            };
            Tween.prototype._set = function (props, o) {
                for (var n in props) {
                    o[n] = props[n];
                }
            };
            Tween.prototype.wait = function (duration, passive) {
                if (passive === void 0) { passive = false; }
                if (duration == null || duration <= 0) {
                    return this;
                }
                var o = this._cloneProps(this._curQueueProps);
                return this._addStep({ d: duration, p0: o, p1: o, v: passive });
            };
            Tween.prototype.to = function (props, duration, ease) {
                if (ease === void 0) { ease = undefined; }
                if (isNaN(duration) || duration < 0) {
                    duration = 0;
                }
                return this._addStep({ d: duration || 0, p0: this._cloneProps(this._curQueueProps), e: ease, p1: this._cloneProps(this._appendQueueProps(props)) });
            };
            Tween.prototype.call = function (callback, thisObj, params) {
                if (thisObj === void 0) { thisObj = undefined; }
                if (params === void 0) { params = undefined; }
                if (!callback) {
                    callback = function () { };
                }
                return this._addAction({ f: callback, p: params ? params : [this], o: thisObj ? thisObj : this._target });
            };
            Tween.prototype.set = function (props, target) {
                if (target === void 0) { target = null; }
                return this._addAction({ f: this._set, o: this, p: [props, target ? target : this._target] });
            };
            Tween.prototype.play = function (tween) {
                if (!tween) {
                    tween = this;
                }
                return this.call(tween.setPaused, [false], tween);
            };
            Tween.prototype.pause = function (tween) {
                if (!tween) {
                    tween = this;
                }
                return this.call(tween.setPaused, [true], tween);
            };
            Tween.prototype.tick = function (delta) {
                if (this.paused) {
                    return;
                }
                this.setPosition(this._prevPosition + delta);
            };
            Tween.NONE = 0;
            Tween.LOOP = 1;
            Tween.REVERSE = 2;
            Tween._tweens = [];
            Tween.IGNORE = {};
            Tween._plugins = {};
            Tween._inited = false;
            return Tween;
        })();
        util.Tween = Tween;
    })(util = WOZLLA.util || (WOZLLA.util = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../Annotations.ts" />
/// <reference path="../Property.ts" />
/// <reference path="../renderer/SpriteRenderer.ts" />
/// <reference path="../../core/Behaviour.ts" />
/// <reference path="../../WOZLLA.ts" />
/// <reference path="../../util/Tween.ts" />
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var SpriteAnimation = (function (_super) {
            __extends(SpriteAnimation, _super);
            function SpriteAnimation() {
                _super.apply(this, arguments);
                this._animation = new component.Property();
                this._loop = new component.Property(true);
                this._pause = new component.Property(false);
                this._duration = new component.Property(1000);
                this._stoped = new component.Property(false);
                this._animationMap = {};
                this._playedTime = 0;
                this._playingFrame = -1;
            }
            Object.defineProperty(SpriteAnimation.prototype, "loop", {
                get: function () {
                    return this._loop;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SpriteAnimation.prototype, "pause", {
                get: function () {
                    return this._pause;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SpriteAnimation.prototype, "animation", {
                get: function () {
                    return this._animation;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SpriteAnimation.prototype, "duration", {
                get: function () {
                    return this._duration;
                },
                enumerable: true,
                configurable: true
            });
            SpriteAnimation.prototype.init = function () {
                _super.prototype.init.call(this);
                this.initAnimations();
            };
            SpriteAnimation.prototype.getNowAnimation = function () {
                return this._animationMap[this._animation.get()];
            };
            SpriteAnimation.prototype.update = function () {
                if (this._pause.get()) {
                    return;
                }
                if (this._stoped.get()) {
                    return;
                }
                var duration = this._duration.get();
                var nowAnim = this.getNowAnimation();
                if (!nowAnim) {
                    return;
                }
                if (!this._playingAnimation || nowAnim !== this._playingAnimation) {
                    this._playingAnimation = nowAnim;
                }
                this._playedTime += this.getFrameDelta();
                if (this._playedTime > duration && !this._loop.get()) {
                    this._stoped.set(true);
                    return;
                }
                var frame = Math.floor(this._playingAnimation.length * (this._playedTime % duration / duration));
                if (this._playingFrame === -1 || frame !== this._playingFrame) {
                    this._playingFrame = frame;
                    var spriteRenderer = this.gameObject.renderer;
                    spriteRenderer.frame.set(frame);
                }
            };
            SpriteAnimation.prototype.play = function (options) {
                if (!options) {
                    options = {};
                }
                WOZLLA.applyIfUndefined(options, {
                    loop: true,
                    animation: this._animation.get(),
                    duration: this._duration.get()
                });
                this._loop.set(options.loop);
                this._duration.set(options.duration);
                this._animation.set(options.animation);
                this._stoped.set(false);
                this._playedTime = 0;
            };
            SpriteAnimation.prototype.initAnimations = function () {
                var spriteRenderer = this.gameObject.renderer;
                var spriteAtlas = spriteRenderer.spriteAtlas.getAsset();
                var len = spriteAtlas.getSpriteCount();
                var animation = this._animationMap[SpriteAnimation.DEFAULT_ANIMATION] = new Animation();
                this._animation.set(SpriteAnimation.DEFAULT_ANIMATION);
                for (var i = 0; i < len; i++) {
                    var sprite = spriteAtlas.getSprite(i);
                    animation.addFrame(sprite);
                }
                spriteRenderer.setUseOffset(true);
            };
            SpriteAnimation.prototype.getFrameDelta = function () {
                return this.director.deltaTime;
            };
            SpriteAnimation.DEFAULT_ANIMATION = 'defaultAnimation';
            __decorate([
                component.property(component.Type.Boolean)
            ], SpriteAnimation.prototype, "loop", null);
            __decorate([
                component.property(component.Type.Boolean)
            ], SpriteAnimation.prototype, "pause", null);
            __decorate([
                component.property(component.Type.String)
            ], SpriteAnimation.prototype, "animation", null);
            __decorate([
                component.property(component.Type.Int)
            ], SpriteAnimation.prototype, "duration", null);
            SpriteAnimation = __decorate([
                component.component('SpriteAnimation'),
                component.required(component.SpriteRenderer)
            ], SpriteAnimation);
            return SpriteAnimation;
        })(WOZLLA.Behaviour);
        component.SpriteAnimation = SpriteAnimation;
        var Animation = (function () {
            function Animation() {
                this._frames = [];
            }
            Object.defineProperty(Animation.prototype, "length", {
                get: function () {
                    return this._frames.length;
                },
                enumerable: true,
                configurable: true
            });
            Animation.prototype.addFrame = function (frame) {
                this._frames.push(frame);
            };
            Animation.prototype.getFrame = function (index) {
                return this._frames[index];
            };
            return Animation;
        })();
        component.Animation = Animation;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="Annotations.ts" />
/// <reference path="Property.ts" />
/// <reference path="../core/Renderer.ts" />
/// <reference path="../WOZLLA.ts" />
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var helpCanvas = WOZLLA.createCanvas(1, 1);
        var helpContext = helpCanvas.getContext('2d');
        var CanvasTextureWrapper = (function () {
            function CanvasTextureWrapper(width, height, sourceTexture) {
                this._UUID = WOZLLA.genUID();
                this.reset(width, height, sourceTexture);
            }
            CanvasTextureWrapper.prototype.getSourceTexture = function () {
                return this._sourceTexture;
            };
            CanvasTextureWrapper.prototype.getWidth = function () {
                return this._width;
            };
            CanvasTextureWrapper.prototype.getHeight = function () {
                return this._height;
            };
            CanvasTextureWrapper.prototype.reset = function (width, height, sourceTexture) {
                this._width = width;
                this._height = height;
                this._sourceTexture = sourceTexture;
            };
            CanvasTextureWrapper.prototype.getDebugInfo = function () {
                return 'Canvas_' + this._UUID;
            };
            return CanvasTextureWrapper;
        })();
        component.CanvasTextureWrapper = CanvasTextureWrapper;
        var CanvasRenderer = (function (_super) {
            __extends(CanvasRenderer, _super);
            function CanvasRenderer() {
                _super.apply(this, arguments);
                this._align = new component.Property(WOZLLA.ALIGN_CENTER);
                this._valign = new component.Property(WOZLLA.VALIGN_MIDDLE);
                this._canvasSize = new component.SizeProperty();
                this._canvasStyle = new component.CanvasStyleProperty();
            }
            Object.defineProperty(CanvasRenderer.prototype, "align", {
                get: function () {
                    return this._align;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CanvasRenderer.prototype, "valign", {
                get: function () {
                    return this._valign;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CanvasRenderer.prototype, "canvasStyle", {
                get: function () {
                    return this._canvasStyle;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CanvasRenderer.prototype, "canvasSize", {
                get: function () {
                    return this._canvasSize;
                },
                enumerable: true,
                configurable: true
            });
            CanvasRenderer.prototype.render = function (renderContext, transformDirty, renderLayer, renderOrder, alpha) {
                this.measureCanvasSize(helpContext, this._canvasSize);
                if (this._canvasSize.isDirty()) {
                    if (this._canvasSize.width === 0 || this._canvasSize.height === 0) {
                        return;
                    }
                    this._canvas = this.initCanvas(this._canvasSize);
                    this._context = this._canvas.getContext('2d');
                }
                if (!this._quadCommand) {
                    this._quadCommand = renderContext.createQuadCommand();
                }
                if (transformDirty || this._canvasSize.isDirty() || this.isGraphicsDirty() || this._canvasStyle.isDirty()) {
                    this._canvasStyle.applyStyle(this._context);
                    this._context.clearRect(0, 0, this._canvasSize.width, this._canvasSize.height);
                    this.draw(this._context, this._canvas);
                    if (!this._quadCommand.texture) {
                        this._quadCommand.texture = new CanvasTextureWrapper(this._canvas.width, this._canvas.height, renderContext.updateTexture(this._canvas));
                    }
                    else {
                        var wrapper = this._quadCommand.texture;
                        wrapper.reset(this._canvas.width, this._canvas.height, renderContext.updateTexture(this._canvas));
                    }
                    this._quadCommand.matrix = this.transform.worldMatrix;
                    this._quadCommand.textureRegion.set(0, 0, this._canvasSize.width, this._canvasSize.height);
                    this._canvasStyle.clearDirty();
                    this._canvasSize.clearDirty();
                    this.clearGraphicsDirty();
                }
                if (this._align.isDirty() || this._valign.isDirty()) {
                    var align = this._align.get();
                    var valign = this._valign.get();
                    if (align === WOZLLA.ALIGN_CENTER) {
                        this._quadCommand.textureOffset.x = 0.5;
                    }
                    else if (align === WOZLLA.ALIGN_END) {
                        this._quadCommand.textureOffset.x = 1;
                    }
                    else {
                        this._quadCommand.textureOffset.x = 0;
                    }
                    if (valign === WOZLLA.VALIGN_MIDDLE) {
                        this._quadCommand.textureOffset.y = 0.5;
                    }
                    else if (valign === WOZLLA.VALIGN_BOTTOM) {
                        this._quadCommand.textureOffset.y = 1;
                    }
                    else {
                        this._quadCommand.textureOffset.y = 0;
                    }
                    this._align.clearDirty();
                    this._valign.clearDirty();
                }
                this._quadCommand.alpha = alpha;
                this._quadCommand.renderLayer = renderLayer;
                this._quadCommand.renderOrder = renderOrder;
                renderContext.addCommand(this._quadCommand);
            };
            CanvasRenderer.prototype.destroy = function () {
                _super.prototype.destroy.call(this);
                if (this._quadCommand && this._quadCommand.texture) {
                    this.director.renderContext.deleteTexture(this._quadCommand.texture);
                }
            };
            CanvasRenderer.prototype.measureCanvasSize = function (helpContext, size) {
                throw new Error('abstract method');
            };
            CanvasRenderer.prototype.isGraphicsDirty = function () {
                throw new Error('abstract method');
            };
            CanvasRenderer.prototype.clearGraphicsDirty = function () {
                throw new Error('abstract method');
            };
            CanvasRenderer.prototype.draw = function (context, canvas) {
            };
            CanvasRenderer.prototype.initCanvas = function (size) {
                return WOZLLA.createCanvas(size.width, size.height);
            };
            __decorate([
                component.property(component.Type.String)
            ], CanvasRenderer.prototype, "align", null);
            __decorate([
                component.property(component.Type.String)
            ], CanvasRenderer.prototype, "valign", null);
            __decorate([
                component.property(component.Type.Json, {
                    font: 'normal 24px Arial',
                    shadow: false,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    shadowColor: '#000000',
                    stroke: false,
                    strokeColor: '#000000',
                    strokeWidth: 0,
                    alpha: 1,
                    fill: false,
                    fillColor: '#FFFFFF'
                })
            ], CanvasRenderer.prototype, "canvasStyle", null);
            __decorate([
                component.property(component.Type.String)
            ], CanvasRenderer.prototype, "canvasSize", null);
            CanvasRenderer = __decorate([
                component.component('CanvasRenderer'),
                component.abstract()
            ], CanvasRenderer);
            return CanvasRenderer;
        })(WOZLLA.Renderer);
        component.CanvasRenderer = CanvasRenderer;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="Component.ts"/>
var WOZLLA;
(function (WOZLLA) {
    /**
     * abstract base class for all colliders
     * @class WOZLLA.Collider
     * @extends WOZLLA.Component
     * @abstract
     */
    var Collider = (function (_super) {
        __extends(Collider, _super);
        function Collider() {
            _super.apply(this, arguments);
        }
        /**
         * @method {boolean} containsXY
         * @param localX x coords relate to the gameObject of this collider
         * @param localY y coords relate to the gameObject of this collider
         * @returns {boolean}
         */
        Collider.prototype.collideXY = function (localX, localY) {
            return false;
        };
        Collider.prototype.collide = function (collider) {
            return false;
        };
        return Collider;
    })(WOZLLA.Component);
    WOZLLA.Collider = Collider;
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../Annotations.ts" />
/// <reference path="../Property.ts" />
/// <reference path="../../core/Collider.ts" />
/// <reference path="../../WOZLLA.ts" />
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var CircleCollider = (function (_super) {
            __extends(CircleCollider, _super);
            function CircleCollider() {
                _super.apply(this, arguments);
                this._centerX = new component.Property(0);
                this._centerY = new component.Property(0);
                this._radius = new component.Property(100);
                this._reverse = new component.Property(false);
            }
            Object.defineProperty(CircleCollider.prototype, "centerX", {
                get: function () {
                    return this._centerX;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CircleCollider.prototype, "centerY", {
                get: function () {
                    return this._centerY;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CircleCollider.prototype, "radius", {
                get: function () {
                    return this._radius;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CircleCollider.prototype, "reverse", {
                get: function () {
                    return this._reverse;
                },
                enumerable: true,
                configurable: true
            });
            CircleCollider.prototype.collideXY = function (localX, localY) {
                var distancePow2 = Math.pow((localX - this._centerX.get()), 2) + Math.pow((localY - this._centerY.get()), 2);
                var radius = this._radius.get();
                var ret = distancePow2 <= radius * radius;
                return this._reverse.get() ? !ret : ret;
            };
            CircleCollider.prototype.setRegion = function (centerX, centerY, radius) {
                this._centerX.set(centerX);
                this._centerY.set(centerY);
                this._radius.set(radius);
            };
            __decorate([
                component.property(component.Type.Int)
            ], CircleCollider.prototype, "centerX", null);
            __decorate([
                component.property(component.Type.Int)
            ], CircleCollider.prototype, "centerY", null);
            __decorate([
                component.property(component.Type.Int)
            ], CircleCollider.prototype, "radius", null);
            __decorate([
                component.property(component.Type.Boolean)
            ], CircleCollider.prototype, "reverse", null);
            CircleCollider = __decorate([
                component.component('CircleCollider')
            ], CircleCollider);
            return CircleCollider;
        })(WOZLLA.Collider);
        component.CircleCollider = CircleCollider;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../Annotations.ts" />
/// <reference path="../Property.ts" />
/// <reference path="../../core/Collider.ts" />
/// <reference path="../../WOZLLA.ts" />
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var InfiniteCollider = (function (_super) {
            __extends(InfiniteCollider, _super);
            function InfiniteCollider() {
                _super.apply(this, arguments);
            }
            InfiniteCollider.prototype.collideXY = function (localX, localY) {
                return true;
            };
            InfiniteCollider = __decorate([
                component.component('InfiniteCollider')
            ], InfiniteCollider);
            return InfiniteCollider;
        })(WOZLLA.Collider);
        component.InfiniteCollider = InfiniteCollider;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../Annotations.ts" />
/// <reference path="../Property.ts" />
/// <reference path="../../core/Collider.ts" />
/// <reference path="../../WOZLLA.ts" />
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var RectCollider = (function (_super) {
            __extends(RectCollider, _super);
            function RectCollider() {
                _super.apply(this, arguments);
                this._x = new component.Property(0);
                this._y = new component.Property(0);
                this._width = new component.Property(100);
                this._height = new component.Property(100);
                this._reverse = new component.Property(false);
            }
            Object.defineProperty(RectCollider.prototype, "x", {
                get: function () {
                    return this._x;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(RectCollider.prototype, "y", {
                get: function () {
                    return this._y;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(RectCollider.prototype, "width", {
                get: function () {
                    return this._width;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(RectCollider.prototype, "height", {
                get: function () {
                    return this._height;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(RectCollider.prototype, "reverse", {
                get: function () {
                    return this._reverse;
                },
                enumerable: true,
                configurable: true
            });
            RectCollider.prototype.collideXY = function (localX, localY) {
                var ret = localX >= this._x.get() && localX < this._x.get() + this._width.get() &&
                    localY >= this._y.get() && localY < this._y.get() + this._height.get();
                return this._reverse.get() ? !ret : ret;
            };
            RectCollider.prototype.setRegion = function (x, y, width, height) {
                this._x.set(x);
                this._y.set(y);
                this._width.set(width);
                this._height.set(height);
            };
            __decorate([
                component.property(component.Type.Int)
            ], RectCollider.prototype, "x", null);
            __decorate([
                component.property(component.Type.Int)
            ], RectCollider.prototype, "y", null);
            __decorate([
                component.property(component.Type.Int)
            ], RectCollider.prototype, "width", null);
            __decorate([
                component.property(component.Type.Int)
            ], RectCollider.prototype, "height", null);
            __decorate([
                component.property(component.Type.Boolean)
            ], RectCollider.prototype, "reverse", null);
            RectCollider = __decorate([
                component.component('RectCollider')
            ], RectCollider);
            return RectCollider;
        })(WOZLLA.Collider);
        component.RectCollider = RectCollider;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var math;
    (function (math) {
        /**
         * @class WOZLLA.math.Point
         * a util class contains x and y properties
         */
        var Point = (function () {
            /**
             * @method constructor
             * create a new instance of Point
             * @member WOZLLA.math.Point
             * @param {number} x
             * @param {number} y
             */
            function Point(x, y) {
                /**
                 * @property {number} x
                 * get or set x of this object
                 * @member WOZLLA.math.Point
                 */
                this.x = x;
                /**
                 * @property {number} y
                 * get or set y of this object
                 * @member WOZLLA.math.Point
                 */
                this.y = y;
            }
            /**
             * get simple description of this object
             * @returns {string}
             */
            Point.prototype.toString = function () {
                return 'Point[' + this.x + ',' + this.y + ']';
            };
            return Point;
        })();
        math.Point = Point;
    })(math = WOZLLA.math || (WOZLLA.math = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../Annotations.ts" />
/// <reference path="../Property.ts" />
/// <reference path="../AbstractSpriteRenderer.ts" />
/// <reference path="../../WOZLLA.ts" />
/// <reference path="../../math/Point.ts" />
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var helpPoint = new WOZLLA.math.Point(0, 0);
        var NormalRectMask = (function (_super) {
            __extends(NormalRectMask, _super);
            function NormalRectMask() {
                _super.apply(this, arguments);
                this._rect = new component.RectProperty();
                this._startOrder = new component.Property(0);
                this._endOrder = new component.Property(0);
            }
            Object.defineProperty(NormalRectMask.prototype, "rect", {
                get: function () {
                    return this._rect;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NormalRectMask.prototype, "startOrder", {
                get: function () {
                    return this._startOrder;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NormalRectMask.prototype, "endOrder", {
                get: function () {
                    return this._endOrder;
                },
                enumerable: true,
                configurable: true
            });
            NormalRectMask.prototype.render = function (renderContext, transformDirty, renderLayer, renderOrder, alpha) {
                if (!this._pushMaskCommand) {
                    this._pushMaskCommand = new WOZLLA.rendering.PushMaskCommand(renderLayer, renderOrder);
                    this._popMaskCommand = new WOZLLA.rendering.PopMaskCommand(renderLayer, renderOrder);
                }
                if (transformDirty) {
                    var left, top_1, right, bottom;
                    this.transform.localToGlobal(this._rect.x, this._rect.y, helpPoint);
                    left = right = helpPoint.x;
                    top_1 = bottom = helpPoint.y;
                    this.transform.localToGlobal(this._rect.x + this._rect.width, this._rect.y, helpPoint);
                    if (helpPoint.x < left) {
                        left = helpPoint.x;
                    }
                    else if (helpPoint.x > right) {
                        right = helpPoint.x;
                    }
                    if (helpPoint.y < top_1) {
                        top_1 = helpPoint.y;
                    }
                    else if (helpPoint.y > bottom) {
                        bottom = helpPoint.y;
                    }
                    this.transform.localToGlobal(this._rect.x, this._rect.y + this._rect.height, helpPoint);
                    if (helpPoint.x < left) {
                        left = helpPoint.x;
                    }
                    else if (helpPoint.x > right) {
                        right = helpPoint.x;
                    }
                    if (helpPoint.y < top_1) {
                        top_1 = helpPoint.y;
                    }
                    else if (helpPoint.y > bottom) {
                        bottom = helpPoint.y;
                    }
                    this.transform.localToGlobal(this._rect.x + this._rect.width, this._rect.y + this._rect.height, helpPoint);
                    if (helpPoint.x < left) {
                        left = helpPoint.x;
                    }
                    else if (helpPoint.x > right) {
                        right = helpPoint.x;
                    }
                    if (helpPoint.y < top_1) {
                        top_1 = helpPoint.y;
                    }
                    else if (helpPoint.y > bottom) {
                        bottom = helpPoint.y;
                    }
                    this._pushMaskCommand.rect.x = left;
                    this._pushMaskCommand.rect.y = top_1;
                    this._pushMaskCommand.rect.width = right - left;
                    this._pushMaskCommand.rect.height = bottom - top_1;
                }
                this._pushMaskCommand.renderLayer = renderLayer;
                this._pushMaskCommand.renderOrder = this._startOrder.get();
                this._popMaskCommand.renderLayer = renderLayer;
                this._popMaskCommand.renderOrder = this._endOrder.get();
                renderContext.addCommand(this._pushMaskCommand);
                renderContext.addCommand(this._popMaskCommand);
            };
            __decorate([
                component.property(component.Type.String)
            ], NormalRectMask.prototype, "rect", null);
            __decorate([
                component.property(component.Type.Int)
            ], NormalRectMask.prototype, "startOrder", null);
            __decorate([
                component.property(component.Type.Int)
            ], NormalRectMask.prototype, "endOrder", null);
            NormalRectMask = __decorate([
                component.component('NormalRectMask')
            ], NormalRectMask);
            return NormalRectMask;
        })(WOZLLA.Renderer);
        component.NormalRectMask = NormalRectMask;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../Annotations.ts" />
/// <reference path="../Property.ts" />
/// <reference path="../CanvasRenderer.ts" />
/// <reference path="../../WOZLLA.ts" />
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var CircleRenderer = (function (_super) {
            __extends(CircleRenderer, _super);
            function CircleRenderer() {
                _super.apply(this, arguments);
                this._radius = new component.Property(100);
            }
            Object.defineProperty(CircleRenderer.prototype, "radius", {
                get: function () {
                    return this._radius;
                },
                enumerable: true,
                configurable: true
            });
            CircleRenderer.prototype.measureCanvasSize = function (helpContext, sizeOut) {
                var style = this.canvasStyle;
                sizeOut.width = Math.ceil(this._radius.get() * 2 + (style.stroke ? style.strokeWidth : 0));
                sizeOut.height = Math.ceil(this._radius.get() * 2 + (style.stroke ? style.strokeWidth : 0));
                this._center = {
                    x: sizeOut.width / 2,
                    y: sizeOut.height / 2
                };
            };
            CircleRenderer.prototype.isGraphicsDirty = function () {
                return this._radius.isDirty();
            };
            CircleRenderer.prototype.clearGraphicsDirty = function () {
                this._radius.clearDirty();
            };
            CircleRenderer.prototype.draw = function (context) {
                var style = this.canvasStyle;
                context.beginPath();
                context.arc(this._center.x, this._center.y, this._radius.get(), 0, 2 * Math.PI);
                if (style.stroke) {
                    context.stroke();
                }
                if (style.fill) {
                    context.fill();
                }
            };
            __decorate([
                component.property(component.Type.Int)
            ], CircleRenderer.prototype, "radius", null);
            CircleRenderer = __decorate([
                component.component('CircleRenderer', component.CanvasRenderer)
            ], CircleRenderer);
            return CircleRenderer;
        })(component.CanvasRenderer);
        component.CircleRenderer = CircleRenderer;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../Annotations.ts" />
/// <reference path="../Property.ts" />
/// <reference path="../CanvasRenderer.ts" />
/// <reference path="../../WOZLLA.ts" />
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var PureColorBgRenderer = (function (_super) {
            __extends(PureColorBgRenderer, _super);
            function PureColorBgRenderer() {
                _super.apply(this, arguments);
                this._color = new component.Property('#000000');
                this._scaleMatrix = new WOZLLA.math.Matrix3x3();
            }
            Object.defineProperty(PureColorBgRenderer.prototype, "color", {
                get: function () {
                    return this._color;
                },
                enumerable: true,
                configurable: true
            });
            PureColorBgRenderer.prototype.getCanvas = function () {
                if (!this._canvas) {
                    this._canvas = WOZLLA.createCanvas(1, 1);
                    var ctx = this._canvas.getContext('2d');
                    ctx.fillStyle = this._color.get();
                    ctx.fillRect(0, 0, 2, 2);
                }
                return this._canvas;
            };
            PureColorBgRenderer.prototype.render = function (renderContext, transformDirty, renderLayer, renderOrder, alpha) {
                if (!this._quadCommand) {
                    this._quadCommand = renderContext.createQuadCommand();
                }
                if (transformDirty) {
                    if (!this._quadCommand.texture) {
                        this._quadCommand.texture = new component.CanvasTextureWrapper(1, 1, renderContext.updateTexture(this.getCanvas()));
                    }
                    else {
                        var wrapper = this._quadCommand.texture;
                        wrapper.reset(1, 1, renderContext.updateTexture(this.getCanvas()));
                    }
                    var viewport = renderContext.viewport;
                    this._scaleMatrix.applyMatrix(this.transform.worldMatrix);
                    this._scaleMatrix.appendTransform(0, 0, viewport.width, viewport.height);
                    this._quadCommand.matrix = this._scaleMatrix;
                    this._quadCommand.textureRegion.set(0, 0, 1, 1);
                }
                this._quadCommand.alpha = alpha;
                this._quadCommand.renderLayer = renderLayer;
                this._quadCommand.renderOrder = renderOrder;
                renderContext.addCommand(this._quadCommand);
            };
            __decorate([
                component.property(component.Type.String)
            ], PureColorBgRenderer.prototype, "color", null);
            PureColorBgRenderer = __decorate([
                component.component('PureColorBgRenderer')
            ], PureColorBgRenderer);
            return PureColorBgRenderer;
        })(WOZLLA.Renderer);
        component.PureColorBgRenderer = PureColorBgRenderer;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../Annotations.ts" />
/// <reference path="../Property.ts" />
/// <reference path="../CanvasRenderer.ts" />
/// <reference path="../../WOZLLA.ts" />
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var RectRenderer = (function (_super) {
            __extends(RectRenderer, _super);
            function RectRenderer() {
                _super.apply(this, arguments);
                this._rectSize = new component.SizeProperty();
            }
            Object.defineProperty(RectRenderer.prototype, "size", {
                get: function () {
                    return this._rectSize;
                },
                enumerable: true,
                configurable: true
            });
            RectRenderer.prototype.measureCanvasSize = function (helpContext, sizeOut) {
                var style = this.canvasStyle;
                sizeOut.width = Math.ceil(this._rectSize.width + (style.stroke ? style.strokeWidth : 0));
                sizeOut.height = Math.ceil(this._rectSize.height + (style.stroke ? style.strokeWidth : 0));
            };
            RectRenderer.prototype.isGraphicsDirty = function () {
                return this._rectSize.isDirty();
            };
            RectRenderer.prototype.clearGraphicsDirty = function () {
                this._rectSize.clearDirty();
            };
            RectRenderer.prototype.draw = function (context) {
                var style = this.canvasStyle;
                if (style.stroke) {
                    context.rect(style.strokeWidth / 2, style.strokeWidth / 2, this._rectSize.width, this._rectSize.height);
                    context.stroke();
                }
                else {
                    context.rect(0, 0, this._rectSize.width, this._rectSize.height);
                }
                if (style.fill) {
                    context.fill();
                }
            };
            __decorate([
                component.property(component.Type.String)
            ], RectRenderer.prototype, "size", null);
            RectRenderer = __decorate([
                component.component('RectRenderer', component.CanvasRenderer)
            ], RectRenderer);
            return RectRenderer;
        })(component.CanvasRenderer);
        component.RectRenderer = RectRenderer;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="Annotations.ts" />
/// <reference path="Property.ts" />
/// <reference path="../core/Renderer.ts" />
/// <reference path="../WOZLLA.ts" />
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var Reference = (function (_super) {
            __extends(Reference, _super);
            function Reference() {
                _super.apply(this, arguments);
                this._viewJson = new component.Property();
            }
            Object.defineProperty(Reference.prototype, "viewJson", {
                get: function () { return this._viewJson; },
                enumerable: true,
                configurable: true
            });
            Reference.prototype.loadAssets = function (callback) {
                var _this = this;
                var builder = WOZLLA.wson.newBuilder();
                var filePath = this._viewJson.get();
                if (!filePath) {
                    callback && callback();
                    return;
                }
                builder.build(this.director, this._viewJson.get(), function (error, root) {
                    if (root) {
                        root.loadAssets(function () {
                            _this.gameObject.addChild(root);
                            callback && callback();
                        });
                    }
                    else {
                        callback && callback();
                    }
                });
            };
            __decorate([
                component.property(component.Type.String)
            ], Reference.prototype, "viewJson", null);
            Reference = __decorate([
                component.component('Reference')
            ], Reference);
            return Reference;
        })(WOZLLA.Component);
        component.Reference = Reference;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../Annotations.ts" />
/// <reference path="../Property.ts" />
/// <reference path="../../core/Renderer.ts" />
/// <reference path="../../WOZLLA.ts" />
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var ImageRenderer = (function (_super) {
            __extends(ImageRenderer, _super);
            function ImageRenderer() {
                _super.call(this);
                this._imageSrc = new component.ImageProperty(this);
                this._align = new component.Property(WOZLLA.ALIGN_START);
                this._valign = new component.Property(WOZLLA.VALIGN_TOP);
                this.addAssetProxy(this._imageSrc);
            }
            Object.defineProperty(ImageRenderer.prototype, "imageSrc", {
                get: function () {
                    return this._imageSrc;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ImageRenderer.prototype, "align", {
                get: function () {
                    return this._align;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ImageRenderer.prototype, "valign", {
                get: function () {
                    return this._valign;
                },
                enumerable: true,
                configurable: true
            });
            ImageRenderer.prototype.render = function (renderContext, transformDirty, renderLayer, renderOrder, alpha) {
                var asset = this._imageSrc.getAsset();
                if (!this._quadCommand) {
                    this._quadCommand = renderContext.createQuadCommand();
                    this._quadCommand.matrix = this.transform.worldMatrix;
                }
                if (!asset) {
                    if (this._quadCommand.texture) {
                        this._quadCommand.texture = null;
                    }
                    return;
                }
                if (transformDirty || this._quadCommand.texture !== asset) {
                    this._quadCommand.matrixDirty = true;
                }
                if (this._quadCommand.texture !== asset) {
                    this._quadCommand.texture = asset;
                    this._quadCommand.textureRegion.width = asset.getWidth();
                    this._quadCommand.textureRegion.height = asset.getHeight();
                }
                if (this._align.isDirty() || this._valign.isDirty()) {
                    var align = this._align.get();
                    var valign = this._valign.get();
                    if (align === WOZLLA.ALIGN_CENTER) {
                        this._quadCommand.textureOffset.x = 0.5;
                    }
                    else if (align === WOZLLA.ALIGN_END) {
                        this._quadCommand.textureOffset.x = 1;
                    }
                    else {
                        this._quadCommand.textureOffset.x = 0;
                    }
                    if (valign === WOZLLA.VALIGN_MIDDLE) {
                        this._quadCommand.textureOffset.y = 0.5;
                    }
                    else if (valign === WOZLLA.VALIGN_BOTTOM) {
                        this._quadCommand.textureOffset.y = 1;
                    }
                    else {
                        this._quadCommand.textureOffset.y = 0;
                    }
                    this._align.clearDirty();
                    this._valign.clearDirty();
                }
                this._quadCommand.alpha = alpha;
                this._quadCommand.renderLayer = renderLayer;
                this._quadCommand.renderOrder = renderOrder;
                if (this._quadCommand.canRender) {
                    renderContext.addCommand(this._quadCommand);
                }
            };
            __decorate([
                component.property(component.Type.Image)
            ], ImageRenderer.prototype, "imageSrc", null);
            __decorate([
                component.property(component.Type.String)
            ], ImageRenderer.prototype, "align", null);
            __decorate([
                component.property(component.Type.String)
            ], ImageRenderer.prototype, "valign", null);
            ImageRenderer = __decorate([
                component.component('ImageRenderer')
            ], ImageRenderer);
            return ImageRenderer;
        })(WOZLLA.Renderer);
        component.ImageRenderer = ImageRenderer;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../Annotations.ts" />
/// <reference path="../Property.ts" />
/// <reference path="../AbstractSpriteRenderer.ts" />
/// <reference path="../../WOZLLA.ts" />
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var helpTransform = new WOZLLA.Transform();
        var Sprite9Patch = (function (_super) {
            __extends(Sprite9Patch, _super);
            function Sprite9Patch() {
                _super.apply(this, arguments);
                this._patchTop = new component.Property(0);
                this._patchBottom = new component.Property(0);
                this._patchLeft = new component.Property(0);
                this._patchRight = new component.Property(0);
                this._renderWidth = new component.Property(0);
                this._renderHeight = new component.Property(0);
                this._createdCommands = false;
            }
            Object.defineProperty(Sprite9Patch.prototype, "patchTop", {
                get: function () {
                    return this._patchTop;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sprite9Patch.prototype, "patchBottom", {
                get: function () {
                    return this._patchBottom;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sprite9Patch.prototype, "patchLeft", {
                get: function () {
                    return this._patchLeft;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sprite9Patch.prototype, "patchRight", {
                get: function () {
                    return this._patchRight;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sprite9Patch.prototype, "renderWidth", {
                get: function () {
                    return this._renderWidth;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sprite9Patch.prototype, "renderHeight", {
                get: function () {
                    return this._renderHeight;
                },
                enumerable: true,
                configurable: true
            });
            Sprite9Patch.prototype.render = function (renderContext, transformDirty, renderLayer, renderOrder, alpha) {
                var asset = this.spriteAtlas.getAsset();
                if (!this._createdCommands) {
                    this._create9PatchCommands(renderContext);
                    this._createdCommands = true;
                }
                var sprite = asset && asset.getSprite(this.frame.get());
                if (!asset || !sprite) {
                    this._clearCommandsTexture();
                    return;
                }
                this.render9Patch(renderContext, transformDirty, renderLayer, renderOrder, alpha, asset, sprite);
            };
            Sprite9Patch.prototype.render9Patch = function (renderContext, transformDirty, renderLayer, renderOrder, alpha, asset, sprite) {
                var patchValuesDirty = this._patchTop.isDirty() ||
                    this._patchBottom.isDirty() ||
                    this._patchLeft.isDirty() ||
                    this._patchRight.isDirty() ||
                    this._renderWidth.isDirty() ||
                    this._renderHeight.isDirty();
                if (patchValuesDirty || transformDirty) {
                    var pt = this._patchTop.get();
                    var pb = this._patchBottom.get();
                    var pl = this._patchLeft.get();
                    var pr = this._patchRight.get();
                    var rw = this._renderWidth.get();
                    var rh = this._renderHeight.get();
                    var centW = rw - pl - pr;
                    var centH = rh - pt - pb;
                    var sx = sprite.x;
                    var sy = sprite.y;
                    var sw = sprite.width;
                    var sh = sprite.height;
                    var sCentW = sw - pl - pr;
                    var sCentH = sh - pt - pb;
                    if (centW < 0) {
                        centW = 0;
                    }
                    if (centH < 0) {
                        centH = 0;
                    }
                    if (sCentW < 0) {
                        sCentW = 0;
                    }
                    if (sCentH < 0) {
                        sCentH = 0;
                    }
                    var centScaleX = 1;
                    var centScaleY = 1;
                    if (centW === 0 || sCentW === 0) {
                        centScaleX = 0;
                    }
                    else {
                        centScaleX = centW / sCentW;
                    }
                    if (centH === 0 || sCentH === 0) {
                        centScaleX = 0;
                    }
                    else {
                        centScaleY = centH / sCentH;
                    }
                    // compute 9 patches
                    /**
                     * 0,1,2,
                     * 3,4,5,
                     * 6,7,8
                     */
                    for (var i = 0; i < 9; i++) {
                        var command = this._commandArray[i];
                        helpTransform.reset();
                        if (i === 1 || i === 4 || i === 7) {
                            helpTransform.scaleX = centScaleX;
                            helpTransform.x = pl;
                            command.textureRegion.x = sx + pl;
                            command.textureRegion.width = sCentW;
                        }
                        else if (i === 2 || i === 5 || i === 8) {
                            helpTransform.x = pl + centW;
                            command.textureRegion.x = sx + pl + sCentW;
                            command.textureRegion.width = pr;
                        }
                        else {
                            command.textureRegion.x = sx;
                            command.textureRegion.width = pl;
                        }
                        if (i >= 3 && i <= 5) {
                            helpTransform.y = pt;
                            helpTransform.scaleY = centScaleY;
                            command.textureRegion.y = sy + pt;
                            command.textureRegion.height = sCentH;
                        }
                        else if (i >= 6) {
                            helpTransform.y = pt + centH;
                            command.textureRegion.y = sy + pt + sCentH;
                            command.textureRegion.height = pb;
                        }
                        else {
                            command.textureRegion.y = sy;
                            command.textureRegion.height = pt;
                        }
                        helpTransform.transform(this.transform, this.transform);
                        command.matrix.applyMatrix(helpTransform.worldMatrix);
                        command.matrixDirty = true;
                    }
                    this._patchTop.clearDirty();
                    this._patchBottom.clearDirty();
                    this._patchLeft.clearDirty();
                    this._patchRight.clearDirty();
                    this._renderWidth.clearDirty();
                    this._renderHeight.clearDirty();
                }
                if (this._topLeftCommand.texture !== asset.getTexture()) {
                    this._setCommandsTexture(asset.getTexture());
                }
                if (this.align.isDirty() || this.valign.isDirty()) {
                    var align = this.align.get();
                    var valign = this.valign.get();
                    for (var _i = 0, _a = this._commandArray; _i < _a.length; _i++) {
                        var command = _a[_i];
                        var alignVal = this._alignToOffsetValue(align, command.textureRegion.width);
                        var valignVal = this._alignToOffsetValue(valign, command.textureRegion.height);
                        command.textureOffset.x = alignVal;
                        command.textureOffset.y = valignVal;
                    }
                    this.align.clearDirty();
                    this.valign.clearDirty();
                }
                for (var _b = 0, _c = this._commandArray; _b < _c.length; _b++) {
                    var command = _c[_b];
                    command.alpha = alpha;
                    command.renderLayer = renderLayer;
                    command.renderOrder = renderOrder;
                    renderContext.addCommand(command);
                }
            };
            Sprite9Patch.prototype._alignToOffsetValue = function (align, texSize) {
                if (align === WOZLLA.ALIGN_CENTER || align === WOZLLA.VALIGN_MIDDLE) {
                    return this._renderWidth.get() / texSize / 2;
                }
                else if (align === WOZLLA.ALIGN_END || align === WOZLLA.VALIGN_BOTTOM) {
                    return this._renderWidth.get() / texSize;
                }
                else {
                    return 0;
                }
            };
            Sprite9Patch.prototype._clearCommandsTexture = function () {
                if (this._commandArray) {
                    for (var _i = 0, _a = this._commandArray; _i < _a.length; _i++) {
                        var command = _a[_i];
                        command.texture = null;
                    }
                }
            };
            Sprite9Patch.prototype._setCommandsTexture = function (texture) {
                if (this._commandArray) {
                    for (var _i = 0, _a = this._commandArray; _i < _a.length; _i++) {
                        var command = _a[_i];
                        command.texture = texture;
                    }
                }
            };
            Sprite9Patch.prototype._create9PatchCommands = function (renderer) {
                this._commandArray = [];
                this._topLeftCommand = renderer.createQuadCommand();
                this._topCenterCommand = renderer.createQuadCommand();
                this._topRightCommand = renderer.createQuadCommand();
                this._middleLeftCommand = renderer.createQuadCommand();
                this._middleCenterCommand = renderer.createQuadCommand();
                this._middleRightCommand = renderer.createQuadCommand();
                this._bottomLeftCommand = renderer.createQuadCommand();
                this._bottomCenterCommand = renderer.createQuadCommand();
                this._bottomRightCommand = renderer.createQuadCommand();
                this._commandArray.push(this._topLeftCommand);
                this._commandArray.push(this._topCenterCommand);
                this._commandArray.push(this._topRightCommand);
                this._commandArray.push(this._middleLeftCommand);
                this._commandArray.push(this._middleCenterCommand);
                this._commandArray.push(this._middleRightCommand);
                this._commandArray.push(this._bottomLeftCommand);
                this._commandArray.push(this._bottomCenterCommand);
                this._commandArray.push(this._bottomRightCommand);
                for (var _i = 0, _a = this._commandArray; _i < _a.length; _i++) {
                    var command = _a[_i];
                    command.matrix = new WOZLLA.math.Matrix3x3();
                }
            };
            __decorate([
                component.property(component.Type.Int)
            ], Sprite9Patch.prototype, "patchTop", null);
            __decorate([
                component.property(component.Type.Int)
            ], Sprite9Patch.prototype, "patchBottom", null);
            __decorate([
                component.property(component.Type.Int)
            ], Sprite9Patch.prototype, "patchLeft", null);
            __decorate([
                component.property(component.Type.Int)
            ], Sprite9Patch.prototype, "patchRight", null);
            __decorate([
                component.property(component.Type.Int)
            ], Sprite9Patch.prototype, "renderWidth", null);
            __decorate([
                component.property(component.Type.Int)
            ], Sprite9Patch.prototype, "renderHeight", null);
            Sprite9Patch = __decorate([
                component.component('Sprite9Patch', component.AbstractSpriteRenderer)
            ], Sprite9Patch);
            return Sprite9Patch;
        })(component.AbstractSpriteRenderer);
        component.Sprite9Patch = Sprite9Patch;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../Annotations.ts" />
/// <reference path="../Property.ts" />
/// <reference path="../AbstractSpriteRenderer.ts" />
/// <reference path="../../WOZLLA.ts" />
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var TilingSpriteRenderer = (function (_super) {
            __extends(TilingSpriteRenderer, _super);
            function TilingSpriteRenderer() {
                _super.apply(this, arguments);
                this._size = new component.SizeProperty();
                this._margin = new component.SizeProperty();
            }
            Object.defineProperty(TilingSpriteRenderer.prototype, "size", {
                get: function () {
                    return this._size;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TilingSpriteRenderer.prototype, "margin", {
                get: function () {
                    return this._margin;
                },
                enumerable: true,
                configurable: true
            });
            TilingSpriteRenderer.prototype.render = function (renderContext, transformDirty, renderLayer, renderOrder, alpha) {
                if (!this._spriteBatch) {
                    this._spriteBatch = renderContext.createSpriteBatch();
                }
                var sprite = this.getSprite();
                if (this._size.width === 0 || this._size.height === 0 || !sprite) {
                    this._drawingTexture = null;
                    this._spriteBatch.reset();
                    return;
                }
                var texture = sprite.spriteAtlas.getTexture();
                if (this._size.isDirty() ||
                    this._margin.isDirty() ||
                    this.align.isDirty() ||
                    this.valign.isDirty() ||
                    texture !== this._drawingTexture ||
                    transformDirty) {
                    this._spriteBatch.setAlpha(alpha);
                    this._spriteBatch.setRenderLayer(renderLayer);
                    this._spriteBatch.setRenderOrder(renderOrder);
                    this._spriteBatch.reset();
                    this._spriteBatch.getMatrix().applyMatrix(this.transform.worldMatrix);
                    var col = Math.ceil(this._size.width / sprite.width);
                    var row = Math.ceil(this._size.height / sprite.height);
                    var x = 0;
                    var y = 0;
                    var renderWidth = sprite.width * col;
                    var renderHeight = sprite.height * row;
                    var align = this.align.get();
                    var valign = this.valign.get();
                    if (align === WOZLLA.ALIGN_CENTER) {
                        x = -renderWidth / 2;
                    }
                    else if (align === WOZLLA.ALIGN_END) {
                        x = -renderWidth;
                    }
                    if (valign === WOZLLA.VALIGN_MIDDLE) {
                        y = -renderHeight / 2;
                    }
                    else if (valign === WOZLLA.VALIGN_BOTTOM) {
                        y = -renderHeight;
                    }
                    var marginX = this._margin.width;
                    var marginY = this._margin.height;
                    for (var r = 0; r < row; r++) {
                        for (var c = 0; c < col; c++) {
                            this._spriteBatch.drawTexture(texture, sprite.x, sprite.y, sprite.width, sprite.height, x + marginX * c, y + marginY * r);
                        }
                    }
                    this._drawingTexture = texture;
                    this._size.clearDirty();
                    this._margin.clearDirty();
                    this.align.clearDirty();
                    this.valign.clearDirty();
                }
                this._spriteBatch.render(renderContext);
            };
            __decorate([
                component.property(component.Type.String)
            ], TilingSpriteRenderer.prototype, "size", null);
            __decorate([
                component.property(component.Type.String)
            ], TilingSpriteRenderer.prototype, "margin", null);
            TilingSpriteRenderer = __decorate([
                component.component('TilingSpriteRenderer', component.AbstractSpriteRenderer)
            ], TilingSpriteRenderer);
            return TilingSpriteRenderer;
        })(component.AbstractSpriteRenderer);
        component.TilingSpriteRenderer = TilingSpriteRenderer;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../Annotations.ts" />
/// <reference path="../Property.ts" />
/// <reference path="../AbstractSpriteRenderer.ts" />
/// <reference path="../../WOZLLA.ts" />
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var SpriteText = (function (_super) {
            __extends(SpriteText, _super);
            function SpriteText() {
                _super.apply(this, arguments);
                this._sample = new component.Property();
                this._text = new component.Property();
                this._wordMargin = new component.Property(0);
            }
            Object.defineProperty(SpriteText.prototype, "sample", {
                get: function () {
                    return this._sample;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SpriteText.prototype, "text", {
                get: function () {
                    return this._text;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SpriteText.prototype, "wordMargin", {
                get: function () {
                    return this._wordMargin;
                },
                enumerable: true,
                configurable: true
            });
            SpriteText.prototype.render = function (renderContext, transformDirty, renderLayer, renderOrder) {
                if (!this._spriteBatch) {
                    this._spriteBatch = renderContext.createSpriteBatch();
                }
                var text = this._text.get();
                var sample = this._sample.get();
                var sprite = this.getSprite();
                if (!text || !sample || !sprite) {
                    this._drawingTexture = null;
                    this._spriteBatch.reset();
                    return;
                }
                var texture = sprite;
                if (this._text.isDirty() ||
                    this._wordMargin.isDirty() ||
                    this.align.isDirty() ||
                    this.valign.isDirty() ||
                    texture !== this._drawingTexture ||
                    transformDirty) {
                    this._spriteBatch.setRenderLayer(renderLayer);
                    this._spriteBatch.setRenderOrder(renderOrder);
                    this._spriteBatch.reset();
                    this._spriteBatch.getMatrix().applyMatrix(this.transform.worldMatrix);
                    var wordW = sprite.width / sample.length;
                    var wordH = sprite.height;
                    var textLen = text.length;
                    var textW = textLen * wordW;
                    var wordMargin = this._wordMargin.get();
                    var realTextW = textLen * (wordW + wordMargin);
                    var x = 0;
                    var y = 0;
                    var align = this.align.get();
                    var valign = this.valign.get();
                    if (align === WOZLLA.ALIGN_CENTER) {
                        x = -realTextW / 2;
                    }
                    else if (align === WOZLLA.ALIGN_END) {
                        x = -realTextW;
                    }
                    if (valign === WOZLLA.VALIGN_MIDDLE) {
                        y = -wordH / 2;
                    }
                    else if (valign === WOZLLA.VALIGN_BOTTOM) {
                        y = -wordH;
                    }
                    for (var i = 0; i < textLen; i++) {
                        var ch = text[i];
                        var idx = sample.indexOf(ch);
                        if (idx !== -1) {
                            this._spriteBatch.drawTexture(texture, sprite.x + idx * wordW, sprite.y, wordW, wordH, x, y);
                        }
                        x += wordW + wordMargin;
                    }
                    this._drawingTexture = texture;
                    this._text.clearDirty();
                    this._wordMargin.clearDirty();
                    this.align.clearDirty();
                    this.valign.clearDirty();
                }
                this._spriteBatch.render(renderContext);
            };
            __decorate([
                component.property(component.Type.String)
            ], SpriteText.prototype, "sample", null);
            __decorate([
                component.property(component.Type.String)
            ], SpriteText.prototype, "text", null);
            __decorate([
                component.property(component.Type.Int)
            ], SpriteText.prototype, "wordMargin", null);
            SpriteText = __decorate([
                component.component('SpriteText', component.AbstractSpriteRenderer)
            ], SpriteText);
            return SpriteText;
        })(component.AbstractSpriteRenderer);
        component.SpriteText = SpriteText;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../Annotations.ts" />
/// <reference path="../Property.ts" />
/// <reference path="../AbstractSpriteRenderer.ts" />
/// <reference path="../../WOZLLA.ts" />
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var TextRenderer = (function (_super) {
            __extends(TextRenderer, _super);
            function TextRenderer() {
                _super.apply(this, arguments);
                this._text = new component.Property();
            }
            TextRenderer.measureText = function (helpContext, style, text) {
                var measuredWidth, measuredHeight;
                var extendSize;
                helpContext.font = style.font;
                measuredWidth = Math.ceil(helpContext.measureText(text).width);
                measuredHeight = Math.ceil(helpContext.measureText("M").width * 1.2);
                if (style.shadow || style.stroke) {
                    extendSize = Math.max(style.strokeWidth, Math.abs(style.shadowOffsetX), Math.abs(style.shadowOffsetY));
                    measuredWidth += extendSize * 2;
                    measuredHeight += extendSize * 2 + 4;
                }
                measuredWidth = Math.ceil(measuredWidth);
                measuredHeight = Math.ceil(measuredHeight);
                if (measuredWidth % 2 !== 0) {
                    measuredWidth += 1;
                }
                if (measuredHeight % 2 !== 0) {
                    measuredHeight += 1;
                }
                return {
                    width: measuredWidth,
                    height: measuredHeight
                };
            };
            Object.defineProperty(TextRenderer.prototype, "text", {
                get: function () {
                    return this._text;
                },
                enumerable: true,
                configurable: true
            });
            TextRenderer.prototype.measureCanvasSize = function (helpContext, sizeOut) {
                var text = this._text.get();
                if (!text)
                    return;
                var size = TextRenderer.measureText(helpContext, this.canvasStyle, text);
                sizeOut.width = size.width;
                sizeOut.height = size.height;
            };
            TextRenderer.prototype.isGraphicsDirty = function () {
                return this._text.isDirty();
            };
            TextRenderer.prototype.clearGraphicsDirty = function () {
                this._text.clearDirty();
            };
            TextRenderer.prototype.draw = function (context) {
                this.drawText(context, this.canvasSize.width, this.canvasSize.height);
            };
            TextRenderer.prototype.drawText = function (context, measuredWidth, measuredHeight) {
                var style = this.canvasStyle;
                var text = this._text.get();
                context.save();
                context.font = style.font;
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                if (style.shadow && (style.shadowOffsetX > 0 || style.shadowOffsetY > 0)) {
                    context.fillStyle = style.shadowColor;
                    context.fillText(text, measuredWidth / 2 + style.shadowOffsetX, measuredHeight / 2 + style.shadowOffsetY);
                }
                if (style.stroke && style.strokeWidth > 0) {
                    context.strokeStyle = style.strokeColor;
                    context.lineWidth = style.strokeWidth;
                    context.strokeText(text, measuredWidth / 2, measuredHeight / 2);
                }
                context.fillStyle = style.fillColor;
                context.fillText(text, measuredWidth / 2, measuredHeight / 2);
                context.restore();
            };
            __decorate([
                component.property(component.Type.String)
            ], TextRenderer.prototype, "text", null);
            TextRenderer = __decorate([
                component.component('TextRenderer', component.CanvasRenderer)
            ], TextRenderer);
            return TextRenderer;
        })(component.CanvasRenderer);
        component.TextRenderer = TextRenderer;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var Assert = (function () {
        function Assert() {
        }
        Assert.isTrue = function (test, msg) {
            if (msg === void 0) { msg = Assert.DEFAULT_MESSAGE; }
            if (test !== true) {
                throw new Error(msg);
            }
        };
        Assert.isFalse = function (test, msg) {
            if (msg === void 0) { msg = Assert.DEFAULT_MESSAGE; }
            if (test !== false) {
                throw new Error(msg);
            }
        };
        Assert.isTypeof = function (test, type, msg) {
            if (msg === void 0) { msg = Assert.DEFAULT_MESSAGE; }
            if (typeof test !== type) {
                throw new Error(msg);
            }
        };
        Assert.isNotTypeof = function (test, type, msg) {
            if (msg === void 0) { msg = Assert.DEFAULT_MESSAGE; }
            if (typeof test === type) {
                throw new Error(msg);
            }
        };
        Assert.isString = function (test, msg) {
            if (msg === void 0) { msg = Assert.DEFAULT_MESSAGE; }
            Assert.isTypeof(test, 'string', msg);
        };
        Assert.isObject = function (test, msg) {
            if (msg === void 0) { msg = Assert.DEFAULT_MESSAGE; }
            Assert.isTypeof(test, 'object', msg);
        };
        Assert.isUndefined = function (test, msg) {
            if (msg === void 0) { msg = Assert.DEFAULT_MESSAGE; }
            Assert.isTypeof(test, 'undefined', msg);
        };
        Assert.isNotUndefined = function (test, msg) {
            if (msg === void 0) { msg = Assert.DEFAULT_MESSAGE; }
            Assert.isNotTypeof(test, 'undefined', msg);
        };
        Assert.isFunction = function (test, msg) {
            if (msg === void 0) { msg = Assert.DEFAULT_MESSAGE; }
            Assert.isTypeof(test, 'function', msg);
        };
        Assert.DEFAULT_MESSAGE = 'Assertion Fail';
        return Assert;
    })();
    WOZLLA.Assert = Assert;
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../event/EventDispatcher.ts"/>
/// <reference path="Assert.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var util;
    (function (util) {
        var StateMachine = (function (_super) {
            __extends(StateMachine, _super);
            function StateMachine() {
                _super.apply(this, arguments);
                this._stateConfig = {};
            }
            StateMachine.prototype.defineState = function (name, isDefault) {
                if (isDefault === void 0) { isDefault = false; }
                WOZLLA.Assert.isUndefined(this._stateConfig[name], 'state "' + name + '" has been defined');
                this._stateConfig[name] = {
                    data: {}
                };
                if (isDefault) {
                    this._defaultState = name;
                }
            };
            StateMachine.prototype.getStateData = function (state, key) {
                WOZLLA.Assert.isNotUndefined(this._stateConfig[state], 'state "' + state + '" not defined');
                return this._stateConfig[state].data[key];
            };
            StateMachine.prototype.setStateData = function (state, key, data) {
                WOZLLA.Assert.isNotUndefined(this._stateConfig[state], 'state "' + state + '" not defined');
                this._stateConfig[state].data[key] = data;
            };
            StateMachine.prototype.defineTransition = function (fromState, toState, transition) {
                WOZLLA.Assert.isNotUndefined(this._stateConfig[fromState], 'state "' + fromState + '" not defined');
                WOZLLA.Assert.isNotUndefined(this._stateConfig[toState], 'state "' + toState + '" not defined');
                this._stateConfig[fromState][toState] = transition;
            };
            StateMachine.prototype.init = function () {
                this._currentState = this._defaultState;
                this.dispatchEvent(new WOZLLA.event.Event(StateMachine.INIT, false, new StateEventData(this._currentState)));
            };
            StateMachine.prototype.getCurrentState = function () {
                return this._currentState;
            };
            StateMachine.prototype.changeState = function (state) {
                var _this = this;
                var from, to, transition;
                WOZLLA.Assert.isNotUndefined(this._stateConfig[state]);
                from = this._currentState;
                to = state;
                transition = this._stateConfig[from][to] || EmptyTransition.getInstance();
                if (this._currentTransition) {
                    this._currentTransition.cancel();
                }
                transition.reset();
                transition.execute(from, to, function () {
                    _this._currentTransition = null;
                    _this._currentState = to;
                    _this.dispatchEvent(new WOZLLA.event.Event(StateMachine.CHANGE, false, new StateEventData(_this._currentState)));
                });
                this._currentTransition = transition;
            };
            StateMachine.INIT = 'state.init';
            StateMachine.CHANGE = 'state.change';
            return StateMachine;
        })(WOZLLA.event.EventDispatcher);
        util.StateMachine = StateMachine;
        var StateEventData = (function () {
            function StateEventData(state) {
                this.state = state;
            }
            return StateEventData;
        })();
        util.StateEventData = StateEventData;
        var EmptyTransition = (function () {
            function EmptyTransition() {
                this._canceled = false;
            }
            EmptyTransition.getInstance = function () {
                if (!EmptyTransition.instance) {
                    EmptyTransition.instance = new EmptyTransition();
                }
                return EmptyTransition.instance;
            };
            EmptyTransition.prototype.reset = function () {
                this._canceled = false;
            };
            EmptyTransition.prototype.cancel = function () {
                this._canceled = true;
            };
            EmptyTransition.prototype.execute = function (fromState, toState, onComplete) {
                if (this._canceled) {
                    return;
                }
                onComplete();
            };
            return EmptyTransition;
        })();
        util.EmptyTransition = EmptyTransition;
    })(util = WOZLLA.util || (WOZLLA.util = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../../core/Component.ts"/>
/// <reference path="../../util/StateMachine.ts"/>
/// <reference path="../../component/renderer/SpriteRenderer.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var StateMachine = WOZLLA.util.StateMachine;
        var StateWidget = (function (_super) {
            __extends(StateWidget, _super);
            function StateWidget() {
                _super.call(this);
                this._stateMachine = new WOZLLA.util.StateMachine();
                this.initStates();
            }
            StateWidget.prototype.init = function () {
                var _this = this;
                this._stateMachine.addListener(StateMachine.INIT, function (e) { return _this.onStateChange(e); });
                this._stateMachine.addListener(StateMachine.CHANGE, function (e) { return _this.onStateChange(e); });
                this._stateMachine.init();
                _super.prototype.init.call(this);
            };
            StateWidget.prototype.destroy = function () {
                this._stateMachine.clearAllListeners();
                _super.prototype.destroy.call(this);
            };
            StateWidget.prototype.initStates = function () {
            };
            StateWidget.prototype.getStateSpriteName = function (state) {
                return this._stateMachine.getStateData(state, 'spriteName');
            };
            StateWidget.prototype.setStateSpriteName = function (state, spriteName) {
                this._stateMachine.setStateData(state, 'spriteName', spriteName);
            };
            StateWidget.prototype.onStateChange = function (e) {
                this.frame.set(this.getStateSpriteName(e.data.state));
            };
            StateWidget = __decorate([
                component.component('StateWidget', component.SpriteRenderer),
                component.abstract()
            ], StateWidget);
            return StateWidget;
        })(component.SpriteRenderer);
        component.StateWidget = StateWidget;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="StateWidget.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var Button = (function (_super) {
            __extends(Button, _super);
            function Button() {
                var _this = this;
                _super.apply(this, arguments);
                this._scaleOnPress = new component.Property(1.2);
                this._normalSpriteName = new component.DelegateProperty(function () { return _this.getStateSpriteName(Button.STATE_NORMAL); }, function (value) { return _this.setStateSpriteName(Button.STATE_NORMAL, value); });
                this._disabledSpriteName = new component.DelegateProperty(function () { return _this.getStateSpriteName(Button.STATE_DISABLED); }, function (value) { return _this.setStateSpriteName(Button.STATE_DISABLED, value); });
                this._pressedSpriteName = new component.DelegateProperty(function () { return _this.getStateSpriteName(Button.STATE_PRESSED); }, function (value) { return _this.setStateSpriteName(Button.STATE_PRESSED, value); });
            }
            Object.defineProperty(Button.prototype, "normalSpriteName", {
                get: function () { return this._normalSpriteName; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Button.prototype, "disabledSpriteName", {
                get: function () { return this._disabledSpriteName; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Button.prototype, "pressedSpriteName", {
                get: function () { return this._pressedSpriteName; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Button.prototype, "scaleOnPress", {
                get: function () { return this._scaleOnPress; },
                enumerable: true,
                configurable: true
            });
            Button.prototype.init = function () {
                var _this = this;
                this._originScaleX = this.transform.scaleX;
                this._originScaleY = this.transform.scaleY;
                this.gameObject.addListener('touch', function (e) { return _this.onTouch(e); });
                this.gameObject.addListener('release', function (e) { return _this.onRelease(e); });
                _super.prototype.init.call(this);
            };
            Button.prototype.isEnabled = function () {
                return this._stateMachine.getCurrentState() !== Button.STATE_DISABLED;
            };
            Button.prototype.setEnabled = function (enabled) {
                if (enabled === void 0) { enabled = true; }
                this._stateMachine.changeState(enabled ? Button.STATE_NORMAL : Button.STATE_DISABLED);
                this.gameObject.touchable = enabled;
                this._touchTween && this._touchTween.setPaused(true);
                this.transform.setScale(this._originScaleX, this._originScaleY);
            };
            Button.prototype.initStates = function () {
                this._stateMachine.defineState(Button.STATE_NORMAL, true);
                this._stateMachine.defineState(Button.STATE_DISABLED);
                this._stateMachine.defineState(Button.STATE_PRESSED);
            };
            Button.prototype.onTouch = function (e) {
                if (!this.isEnabled())
                    return;
                this._stateMachine.changeState(Button.STATE_PRESSED);
                if (this._scaleOnPress.get() !== 1) {
                    this._touchTime = this.director.now;
                    this._touchTween = this.transform.tween(false).to({
                        scaleX: this._scaleOnPress.get() * this._originScaleX,
                        scaleY: this._scaleOnPress.get() * this._originScaleY
                    }, 100);
                }
            };
            Button.prototype.onRelease = function (e) {
                var _this = this;
                if (!this.isEnabled())
                    return;
                this._stateMachine.changeState(Button.STATE_NORMAL);
                this._scaleTimer && this.director.scheduler.removeSchedule(this._scaleTimer);
                if (this._scaleOnPress.get() !== 1) {
                    this._scaleTimer = this.director.scheduler.scheduleTime(function () {
                        _this._touchTween.setPaused(true);
                        _this.transform.tween(false).to({
                            scaleX: _this._originScaleX,
                            scaleY: _this._originScaleY
                        }, 100);
                    }, 100 + this._touchTime - this.director.now);
                }
            };
            Button.STATE_NORMAL = 'normal';
            Button.STATE_DISABLED = 'disabled';
            Button.STATE_PRESSED = 'pressed';
            __decorate([
                component.property(component.Type.SpriteFrame)
            ], Button.prototype, "normalSpriteName", null);
            __decorate([
                component.property(component.Type.SpriteFrame)
            ], Button.prototype, "disabledSpriteName", null);
            __decorate([
                component.property(component.Type.SpriteFrame)
            ], Button.prototype, "pressedSpriteName", null);
            __decorate([
                component.property(component.Type.Number)
            ], Button.prototype, "scaleOnPress", null);
            Button = __decorate([
                component.component('Button', component.StateWidget)
            ], Button);
            return Button;
        })(component.StateWidget);
        component.Button = Button;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../AbstractSpriteRenderer.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var Progress = (function (_super) {
            __extends(Progress, _super);
            function Progress() {
                _super.apply(this, arguments);
                this._value = new component.Property(100);
            }
            Object.defineProperty(Progress.prototype, "value", {
                get: function () {
                    return this._value;
                },
                enumerable: true,
                configurable: true
            });
            Progress.prototype.render = function (renderContext, transformDirty, renderLayer, renderOrder, alpha) {
                var sprite = this.getSprite();
                if (!this._quadCommand) {
                    this._quadCommand = renderContext.createQuadCommand();
                    this._quadCommand.matrix = this.transform.worldMatrix;
                }
                if (!sprite) {
                    if (this._quadCommand.texture) {
                        this._quadCommand.texture = null;
                    }
                    return;
                }
                if (transformDirty) {
                    this._quadCommand.matrixDirty = true;
                }
                if (this._quadCommand.texture !== sprite || this.frame.isDirty() || this._value.isDirty()) {
                    var value = this._value.get();
                    if (value > 100) {
                        value = 100;
                    }
                    this._quadCommand.texture = sprite;
                    this._quadCommand.textureRegion.x = sprite.x;
                    this._quadCommand.textureRegion.y = sprite.y;
                    this._quadCommand.textureRegion.width = sprite.width * value / 100;
                    this._quadCommand.textureRegion.height = sprite.height;
                    this.frame.clearDirty();
                    this._value.clearDirty();
                }
                if (this.align.isDirty() || this.valign.isDirty()) {
                    var align = this.align.get();
                    var valign = this.valign.get();
                    if (align === WOZLLA.ALIGN_CENTER) {
                        this._quadCommand.textureOffset.x = 0.5;
                    }
                    else if (align === WOZLLA.ALIGN_END) {
                        this._quadCommand.textureOffset.x = 1;
                    }
                    else {
                        this._quadCommand.textureOffset.x = 0;
                    }
                    if (valign === WOZLLA.VALIGN_MIDDLE) {
                        this._quadCommand.textureOffset.y = 0.5;
                    }
                    else if (valign === WOZLLA.VALIGN_BOTTOM) {
                        this._quadCommand.textureOffset.y = 1;
                    }
                    else {
                        this._quadCommand.textureOffset.y = 0;
                    }
                    this.align.clearDirty();
                    this.valign.clearDirty();
                }
                this._quadCommand.alpha = alpha;
                this._quadCommand.renderLayer = renderLayer;
                this._quadCommand.renderOrder = renderOrder;
                if (this._quadCommand.canRender) {
                    renderContext.addCommand(this._quadCommand);
                }
            };
            __decorate([
                component.property(component.Type.Number)
            ], Progress.prototype, "value", null);
            Progress = __decorate([
                component.component('Progress', component.AbstractSpriteRenderer)
            ], Progress);
            return Progress;
        })(WOZLLA.component.AbstractSpriteRenderer);
        component.Progress = Progress;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var math;
    (function (math) {
        var MathUtils;
        (function (MathUtils) {
            function rectIntersect(a, b) {
                return a.x < b.x + b.width &&
                    b.x < a.x + a.width &&
                    a.y < b.y + b.height &&
                    b.y < a.y + a.height;
            }
            MathUtils.rectIntersect = rectIntersect;
            function rectIntersect2(ax, ay, aw, ah, bx, by, bw, bh) {
                return ax <= bx + bw &&
                    bx <= ax + aw &&
                    ay <= by + bh &&
                    by <= ay + ah;
            }
            MathUtils.rectIntersect2 = rectIntersect2;
        })(MathUtils = math.MathUtils || (math.MathUtils = {}));
    })(math = WOZLLA.math || (WOZLLA.math = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../../math/MathUtils.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var component;
    (function (component) {
        var helpPoint = { x: 0, y: 0 };
        var rectIntersect2 = WOZLLA.math.MathUtils.rectIntersect2;
        function middle(a, b, c) {
            return (a < b ? (b < c ? b : a < c ? c : a) : (b > c ? b : a > c ? c : a));
        }
        var ScrollRect = (function (_super) {
            __extends(ScrollRect, _super);
            function ScrollRect() {
                _super.apply(this, arguments);
                this._scrollEnabled = new component.Property(true);
                this._bufferBackEnabled = new component.Property(true);
                this._momentumEnabled = new component.Property(true);
                this._direction = new component.Property(ScrollRect.VERTICAL);
                this._content = new component.Property();
                this._visibleRect = new component.RectProperty();
                this._contentRect = new component.RectProperty();
                this._dragMovedInLastSession = false;
                this._dragging = false;
                this._values = {
                    velocityX: 0,
                    velocityY: 0,
                    momentumX: 0,
                    momentumY: 0,
                    lastDragX: 0,
                    lastDragY: 0,
                    momentumXTween: undefined,
                    momentumYTween: undefined,
                    bufferXTween: undefined,
                    bufferYTween: undefined
                };
                this._bufferBackCheckRequired = false;
            }
            Object.defineProperty(ScrollRect.prototype, "direction", {
                get: function () { return this._direction; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ScrollRect.prototype, "scrollEnabled", {
                get: function () { return this._scrollEnabled; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ScrollRect.prototype, "content", {
                get: function () { return this._content; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ScrollRect.prototype, "visibleRect", {
                get: function () {
                    return this._visibleRect;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ScrollRect.prototype, "contentRect", {
                get: function () {
                    return this._contentRect;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ScrollRect.prototype, "bufferBackEnabled", {
                get: function () { return this._bufferBackEnabled; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ScrollRect.prototype, "momentumEnabled", {
                get: function () { return this._momentumEnabled; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ScrollRect.prototype, "interactiveRect", {
                set: function (value) {
                    this.gameObject.interactiveRect.setRectangle(value);
                },
                enumerable: true,
                configurable: true
            });
            ScrollRect.prototype.init = function () {
                if (this._content.get()) {
                    this._contentGameObject = this.gameObject.query(this._content.get());
                }
                this.gameObject.addListenerScope('panstart', this.onDragStart, this);
                this.gameObject.addListenerScope('panmove', this.onDrag, this);
                this.gameObject.addListenerScope('panend', this.onDragEnd, this);
                _super.prototype.init.call(this);
            };
            ScrollRect.prototype.destroy = function () {
                this.gameObject.removeListenerScope('panstart', this.onDragStart, this);
                this.gameObject.removeListenerScope('panmove', this.onDrag, this);
                this.gameObject.removeListenerScope('panend', this.onDragEnd, this);
                this.clearAllTweens();
                _super.prototype.destroy.call(this);
            };
            ScrollRect.prototype.update = function () {
                var _this = this;
                if (!this._contentGameObject)
                    return;
                if (!this._bufferBackEnabled.get() && !this._momentumEnabled.get())
                    return;
                var contentTrans = this._contentGameObject.rectTransform;
                if (this._direction.get() === ScrollRect.BOTH || this._direction.get() === ScrollRect.HORIZONTAL) {
                    contentTrans.px += (this._values.velocityX + this._values.momentumX) * this.director.deltaTime;
                    var minScrollX = this.getMinScrollX();
                    if (!this._bufferBackEnabled.get()) {
                        contentTrans.px = middle(contentTrans.px, minScrollX, 0);
                    }
                    var bufferMomentumX = false;
                    if (contentTrans.px > 0 && this._values.velocityX !== 0 || this._bufferBackCheckRequired) {
                        contentTrans.px = 0;
                        this._values.momentumX = this._values.velocityX;
                        bufferMomentumX = true;
                        this._bufferBackCheckRequired = false;
                    }
                    else if (contentTrans.px < minScrollX && this._values.velocityX !== 0 || this._bufferBackCheckRequired) {
                        contentTrans.px = minScrollX;
                        this._values.momentumX = this._values.velocityX;
                        bufferMomentumX = true;
                        this._bufferBackCheckRequired = false;
                    }
                    if (bufferMomentumX) {
                        if (this._values.momentumXTween) {
                            this._values.momentumXTween.setPaused(true);
                        }
                        this._values.momentumXTween = WOZLLA.util.Tween.get(this._values).to({
                            momentumX: 0
                        }, 100).call(function () {
                            _this.tryBufferBackX();
                        });
                    }
                }
                if (this._direction.get() === ScrollRect.BOTH || this._direction.get() === ScrollRect.VERTICAL) {
                    contentTrans.py += (this._values.velocityY + this._values.momentumY) * this.director.deltaTime;
                    var minScrollY = this.getMinScrollY();
                    if (!this._bufferBackEnabled.get()) {
                        contentTrans.py = middle(contentTrans.py, minScrollY, 0);
                    }
                    var bufferMomentumY = false;
                    if (contentTrans.py > 0 && this._values.velocityY !== 0 || this._bufferBackCheckRequired) {
                        contentTrans.py = 0;
                        this._values.momentumY = this._values.velocityY;
                        bufferMomentumY = true;
                        this._bufferBackCheckRequired = false;
                    }
                    else if (contentTrans.py < minScrollY && this._values.velocityY !== 0 || this._bufferBackCheckRequired) {
                        contentTrans.py = minScrollY;
                        this._values.momentumY = this._values.velocityY;
                        bufferMomentumY = true;
                        this._bufferBackCheckRequired = false;
                    }
                    if (bufferMomentumY) {
                        if (this._values.momentumYTween) {
                            this._values.momentumYTween.setPaused(true);
                        }
                        this._values.momentumYTween = WOZLLA.util.Tween.get(this._values).to({
                            momentumY: 0
                        }, 100).call(function () {
                            _this.tryBufferBackY();
                        });
                    }
                }
            };
            ScrollRect.prototype.isScrollable = function () {
                return this._contentGameObject && ScrollRect.globalScrollEnabled && this._scrollEnabled.get();
            };
            ScrollRect.prototype.requestCheckBufferBack = function () {
                this._bufferBackCheckRequired = true;
            };
            ScrollRect.prototype.stopScroll = function () {
                this.clearAllTweens();
                this._values.lastDragX = 0;
                this._values.lastDragY = 0;
                this._values.velocityX = 0;
                this._values.velocityY = 0;
                this._values.momentumX = 0;
                this._values.momentumY = 0;
            };
            ScrollRect.prototype.clearAllTweens = function () {
                if (this._contentGameObject) {
                    this._contentGameObject.rectTransform.clearTweens();
                }
                if (this._values.momentumXTween) {
                    this._values.momentumXTween.setPaused(true);
                    this._values.momentumXTween = null;
                }
                if (this._values.momentumYTween) {
                    this._values.momentumYTween.setPaused(true);
                    this._values.momentumYTween = null;
                }
                if (this._values.bufferXTween) {
                    this._values.bufferXTween.setPaused(true);
                    this._values.bufferXTween = null;
                }
                if (this._values.bufferYTween) {
                    this._values.bufferYTween.setPaused(true);
                    this._values.bufferYTween = null;
                }
            };
            ScrollRect.prototype.getMinScrollX = function () {
                if (this.visibleRect.width > this.contentRect.width) {
                    return 0;
                }
                return this.visibleRect.width - this.contentRect.width;
            };
            ScrollRect.prototype.getMinScrollY = function () {
                if (this.visibleRect.height > this.contentRect.height) {
                    return 0;
                }
                return this.visibleRect.height - this.contentRect.height;
            };
            ScrollRect.prototype.onDragStart = function (e) {
                if (!this.isScrollable()) {
                    return;
                }
                this._dragging = true;
                this._dragMovedInLastSession = true;
                this._values.lastDragX = e.x;
                this._values.lastDragY = e.y;
                this._values.velocityX = 0;
                this._values.velocityY = 0;
                this._values.momentumX = 0;
                this._values.momentumY = 0;
                this.clearAllTweens();
            };
            ScrollRect.prototype.onDrag = function (e) {
                if (!this.isScrollable() || !this._dragging) {
                    return;
                }
                var contentTrans = this._contentGameObject.rectTransform;
                if (this._direction.get() === ScrollRect.BOTH || this._direction.get() === ScrollRect.HORIZONTAL) {
                    var deltaX = e.x - this._values.lastDragX;
                    var minScrollX = this.getMinScrollX();
                    if (minScrollX === 0 ||
                        (contentTrans.px >= 0 && deltaX > 0) ||
                        (contentTrans.px <= minScrollX && deltaX < 0)) {
                        deltaX /= 10;
                    }
                    contentTrans.px += deltaX;
                    this._values.lastDragX += deltaX;
                    if (!this._bufferBackEnabled.get()) {
                        contentTrans.px = middle(contentTrans.px, minScrollX, 0);
                    }
                }
                if (this._direction.get() === ScrollRect.BOTH || this._direction.get() === ScrollRect.VERTICAL) {
                    var deltaY = e.y - this._values.lastDragY;
                    var minScrollY = this.getMinScrollY();
                    if (minScrollY === 0 ||
                        (contentTrans.py >= 0 && deltaY > 0) ||
                        (contentTrans.py <= minScrollY && deltaY < 0)) {
                        deltaY /= 10;
                    }
                    contentTrans.py += deltaY;
                    this._values.lastDragY += deltaY;
                    if (!this._bufferBackEnabled.get()) {
                        contentTrans.py = middle(contentTrans.py, minScrollY, 0);
                    }
                }
            };
            ScrollRect.prototype.onDragEnd = function (e) {
                if (!this.isScrollable() || !this._dragging) {
                    return;
                }
                if (this._direction.get() === ScrollRect.BOTH || this._direction.get() === ScrollRect.HORIZONTAL) {
                    if (!this.tryBufferBackX()) {
                        if (this._momentumEnabled.get()) {
                            this._values.velocityX = -e.gesture.velocityX;
                            if (this._values.momentumXTween) {
                                this._values.momentumXTween.setPaused(true);
                            }
                            this._values.momentumXTween = WOZLLA.util.Tween.get(this._values).to({
                                velocityX: 0
                            }, 1000);
                        }
                        else {
                            this._values.velocityX = 0;
                            this._values.momentumY = 0;
                        }
                    }
                }
                if (this._direction.get() === ScrollRect.BOTH || this._direction.get() === ScrollRect.VERTICAL) {
                    if (!this.tryBufferBackY()) {
                        if (this._momentumEnabled.get()) {
                            this._values.velocityY = -e.gesture.velocityY;
                            if (this._values.momentumYTween) {
                                this._values.momentumYTween.setPaused(true);
                            }
                            this._values.momentumYTween = WOZLLA.util.Tween.get(this._values).to({
                                velocityY: 0
                            }, 1000);
                        }
                        else {
                            this._values.velocityY = 0;
                            this._values.momentumY = 0;
                        }
                    }
                }
                this._dragging = false;
            };
            ScrollRect.prototype.tryBufferBackX = function () {
                if (!this._bufferBackEnabled.get()) {
                    return false;
                }
                var minScrollX = this.getMinScrollX();
                var contentTrans = this._contentGameObject.rectTransform;
                if (contentTrans.px > 0) {
                    if (this._values.bufferXTween) {
                        this._values.bufferXTween.setPaused(true);
                    }
                    this._values.bufferXTween = contentTrans.tween(false).to({
                        px: 0
                    }, 100);
                    return true;
                }
                else if (contentTrans.px < minScrollX) {
                    if (this._values.bufferXTween) {
                        this._values.bufferXTween.setPaused(true);
                    }
                    this._values.bufferXTween = contentTrans.tween(false).to({
                        px: minScrollX
                    }, 100);
                    return true;
                }
                return false;
            };
            ScrollRect.prototype.tryBufferBackY = function () {
                if (!this._bufferBackEnabled.get()) {
                    return false;
                }
                var minScrollY = this.getMinScrollY();
                var contentTrans = this._contentGameObject.rectTransform;
                if (contentTrans.py > 0) {
                    if (this._values.bufferYTween) {
                        this._values.bufferYTween.setPaused(true);
                    }
                    this._values.bufferYTween = contentTrans.tween(false).to({
                        py: 0
                    }, 100);
                    return true;
                }
                else if (contentTrans.py < minScrollY) {
                    if (this._values.bufferYTween) {
                        this._values.bufferYTween.setPaused(true);
                    }
                    this._values.bufferYTween = contentTrans.tween(false).to({
                        py: minScrollY
                    }, 100);
                    return true;
                }
                return false;
            };
            ScrollRect.globalScrollEnabled = true;
            ScrollRect.HORIZONTAL = 'Horizontal';
            ScrollRect.VERTICAL = 'Vertical';
            ScrollRect.BOTH = 'both';
            __decorate([
                component.property(component.Type.String)
            ], ScrollRect.prototype, "direction", null);
            __decorate([
                component.property(component.Type.Boolean)
            ], ScrollRect.prototype, "scrollEnabled", null);
            __decorate([
                component.property(component.Type.String)
            ], ScrollRect.prototype, "content", null);
            __decorate([
                component.property(component.Type.String)
            ], ScrollRect.prototype, "visibleRect", null);
            __decorate([
                component.property(component.Type.String)
            ], ScrollRect.prototype, "contentRect", null);
            __decorate([
                component.property(component.Type.Boolean)
            ], ScrollRect.prototype, "bufferBackEnabled", null);
            __decorate([
                component.property(component.Type.Boolean)
            ], ScrollRect.prototype, "momentumEnabled", null);
            __decorate([
                component.property(component.Type.String)
            ], ScrollRect.prototype, "interactiveRect", null);
            ScrollRect = __decorate([
                component.component('ScrollRect')
            ], ScrollRect);
            return ScrollRect;
        })(WOZLLA.Behaviour);
        component.ScrollRect = ScrollRect;
    })(component = WOZLLA.component || (WOZLLA.component = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../event/Event.ts"/>
var WOZLLA;
(function (WOZLLA) {
    /**
     * internal class
     * @class WOZLLA.CoreEvent
     * @extends WOZLLA.event.Event
     */
    var CoreEvent = (function (_super) {
        __extends(CoreEvent, _super);
        /**
         * new a CoreEvent
         * @method constructor
         * @param type
         * @param bubbles
         * @param data
         * @param canStopBubbles
         */
        function CoreEvent(type, bubbles, data, canStopBubbles) {
            if (bubbles === void 0) { bubbles = false; }
            if (data === void 0) { data = null; }
            if (canStopBubbles === void 0) { canStopBubbles = true; }
            _super.call(this, type, bubbles, data, canStopBubbles);
        }
        Object.defineProperty(CoreEvent.prototype, "data", {
            get: function () { return this._data; },
            enumerable: true,
            configurable: true
        });
        return CoreEvent;
    })(WOZLLA.event.Event);
    WOZLLA.CoreEvent = CoreEvent;
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../WOZLLA.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var requestAnimationFrame = window.requestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (frameCall, intervalTime) {
            if (intervalTime === void 0) { intervalTime = 1000 / 62; }
            setTimeout(frameCall, intervalTime);
        };
    var Director = (function () {
        function Director(view, options) {
            this._realStartTime = 0;
            this._realNow = 0;
            this._realDeltaTime = 0;
            this._deltaTime = 0;
            this._now = 0;
            this._timeScale = 1;
            this._started = false;
            this._paused = false;
            this._updatedViewport = true;
            this._view = view;
            this._options = options || {};
            WOZLLA.applyIfUndefined(this._options, {
                webgl: true,
                touch: true,
                parallelLoad: false,
                monitorLowNetwork: false,
                bgColor: [0, 0, 0, 1]
            });
            this._scheduler = new WOZLLA.Scheduler();
            this._assetManager = new WOZLLA.asset.AssetManager(this, this._options.parallelLoad, this._options.monitorLowNetwork);
            this._touch = new WOZLLA.Touch(this);
            this._touch.enabled = this._options.touch;
            this._renderContext = this._createRenderer();
            this._renderContext.bgColor = this._options.bgColor;
            this._stage = new WOZLLA.Stage(this);
        }
        Object.defineProperty(Director.prototype, "realStartTime", {
            get: function () {
                return this._realStartTime;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Director.prototype, "realNow", {
            get: function () {
                return this._realNow;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Director.prototype, "realDeltaTime", {
            get: function () {
                return this._realDeltaTime;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Director.prototype, "deltaTime", {
            get: function () {
                return this._deltaTime;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Director.prototype, "now", {
            get: function () {
                return this._now;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Director.prototype, "measureFPS", {
            get: function () {
                return this._measureFPS;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Director.prototype, "timeScale", {
            get: function () {
                return this._timeScale;
            },
            set: function (value) {
                this._timeScale = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Director.prototype, "view", {
            get: function () {
                return this._view;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Director.prototype, "stage", {
            get: function () {
                return this._stage;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Director.prototype, "renderContext", {
            get: function () {
                return this._renderContext;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Director.prototype, "touch", {
            get: function () {
                return this._touch;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Director.prototype, "scheduler", {
            get: function () {
                return this._scheduler;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Director.prototype, "assetManager", {
            get: function () {
                return this._assetManager;
            },
            enumerable: true,
            configurable: true
        });
        Director.prototype.createGameObject = function (useRectTransform) {
            if (useRectTransform === void 0) { useRectTransform = false; }
            return new WOZLLA.GameObject(this, useRectTransform);
        };
        Director.prototype.start = function () {
            var _this = this;
            var frame;
            if (this._started) {
                return;
            }
            this._started = true;
            this._realNow = this._realStartTime = Date.now();
            this._realDeltaTime = this._deltaTime = 1000 / 60;
            this._measureFPS = 60;
            this._now = 0;
            frame = function () {
                if (_this._started) {
                    requestAnimationFrame(frame);
                    _this._realDeltaTime = Date.now() - _this._realNow;
                    _this._realNow += _this._realDeltaTime;
                    _this._measureFPS = 1000 / _this._realDeltaTime;
                    _this._deltaTime = _this._timeScale * _this._realDeltaTime;
                    _this._now += _this._deltaTime;
                    if (!_this._paused) {
                        _this.runStep();
                    }
                }
            };
            requestAnimationFrame(frame);
        };
        Director.prototype.stop = function () {
            this._paused = false;
            this._started = false;
            this._now = 0;
            this._deltaTime = 1000 / 60;
        };
        Director.prototype.pause = function () {
            this._paused = true;
        };
        Director.prototype.resume = function () {
            return this._paused = false;
        };
        Director.prototype.isPaused = function () {
            return this._paused;
        };
        Director.prototype.isStarted = function () {
            return this._started;
        };
        Director.prototype.updateViewport = function (viewport) {
            this._renderContext.updateViewport(viewport);
            this._stage.updateViewRect();
            this._updatedViewport = true;
        };
        Director.prototype.runStep = function () {
            WOZLLA.util.Tween.tick(this.deltaTime);
            this._assetManager.update();
            this._stage.update();
            this._stage.visitStage(this._renderContext, this._updatedViewport);
            this._renderContext.render();
            this._scheduler.runSchedule(this._deltaTime);
            this._updatedViewport = false;
        };
        Director.prototype._createRenderer = function () {
            if (this._options.webgl && WOZLLA.isWebGLSupport) {
                return new WOZLLA.rendering.WebGLRenderContext(this._view);
            }
            else {
                return new WOZLLA.rendering.CanvasRenderContext(this._view);
            }
        };
        return Director;
    })();
    WOZLLA.Director = Director;
})(WOZLLA || (WOZLLA = {}));
/// <reference path="Transform.ts"/>
var WOZLLA;
(function (WOZLLA) {
    /**
     * RectTransform is a subclass of {@link WOZLLA.Transform}, define a rect region
     * for {@WOZLLA.GameObject} and a anchor mode to specify how to related to it's parent.
     * @class WOZLLA.RectTransform
     */
    var RectTransform = (function (_super) {
        __extends(RectTransform, _super);
        function RectTransform() {
            _super.apply(this, arguments);
            this._width = 0;
            this._height = 0;
            this._top = 0;
            this._left = 0;
            this._right = 0;
            this._bottom = 0;
            this._px = 0;
            this._py = 0;
            this._anchorMode = RectTransform.ANCHOR_CENTER | RectTransform.ANCHOR_MIDDLE;
        }
        RectTransform.getMode = function (name) {
            var names = name.split('_');
            var value = 0;
            switch (names[0]) {
                case 'Left':
                    value |= RectTransform.ANCHOR_LEFT;
                    break;
                case 'Right':
                    value |= RectTransform.ANCHOR_RIGHT;
                    break;
                case 'HStrength':
                    value |= RectTransform.ANCHOR_HORIZONTAL_STRENGTH;
                    break;
                default:
                    value |= RectTransform.ANCHOR_CENTER;
                    break;
            }
            switch (names[1]) {
                case 'Top':
                    value |= RectTransform.ANCHOR_TOP;
                    break;
                case 'Bottom':
                    value |= RectTransform.ANCHOR_BOTTOM;
                    break;
                case 'VStrength':
                    value |= RectTransform.ANCHOR_VERTICAL_STRENGTH;
                    break;
                default:
                    value |= RectTransform.ANCHOR_MIDDLE;
                    break;
            }
            return value;
        };
        Object.defineProperty(RectTransform.prototype, "width", {
            /**
             * get or set width, this property only effect on fixed size mode
             * @property {number} width
             */
            get: function () { return this._width; },
            set: function (value) {
                if (this._width === value)
                    return;
                this._width = value;
                this.dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RectTransform.prototype, "height", {
            /**
             * get or set height, this property only effect on fixed size mode
             * @property {number} height
             */
            get: function () { return this._height; },
            set: function (value) {
                if (this._height === value)
                    return;
                this._height = value;
                this.dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RectTransform.prototype, "top", {
            /**
             * get or set top
             * @property {number} top
             */
            get: function () { return this._top; },
            set: function (value) {
                if (this._top === value)
                    return;
                this._top = value;
                this.dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RectTransform.prototype, "left", {
            /**
             * get or set left
             * @property {number} left
             */
            get: function () { return this._left; },
            set: function (value) {
                if (this._left === value)
                    return;
                this._left = value;
                this.dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RectTransform.prototype, "right", {
            /**
             * get or set right
             * @property {number} right
             */
            get: function () { return this._right; },
            set: function (value) {
                if (this._right === value)
                    return;
                this._right = value;
                this.dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RectTransform.prototype, "bottom", {
            /**
             * get or set bottom
             * @property {number} bottom
             */
            get: function () { return this._bottom; },
            set: function (value) {
                if (this._bottom === value)
                    return;
                this._bottom = value;
                this.dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RectTransform.prototype, "px", {
            /**
             * get or set px, this only effect on strengthen mode
             * @property {number} px specify x coords
             */
            get: function () { return this._px; },
            set: function (value) {
                if (this._px === value)
                    return;
                this._px = value;
                this.dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RectTransform.prototype, "py", {
            /**
             * get or set py, this only effect on strengthen mode
             * @property {number} py specify y coords
             */
            get: function () { return this._py; },
            set: function (value) {
                if (this._py === value)
                    return;
                this._py = value;
                this.dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RectTransform.prototype, "anchorMode", {
            /**
             * get or set anchor mode
             * @property {number} anchorMode
             */
            get: function () { return this._anchorMode; },
            set: function (value) {
                if (this._anchorMode === value)
                    return;
                this._anchorMode = value;
                this.dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * set rect transform
         * @param {WOZLLA.RectTransform} rectTransform
         */
        RectTransform.prototype.set = function (rectTransform) {
            var anchorMode = rectTransform.anchorMode;
            if (typeof anchorMode === 'string') {
                anchorMode = RectTransform.getMode(anchorMode);
            }
            this._anchorMode = anchorMode;
            this._width = rectTransform.width || 0;
            this._height = rectTransform.height || 0;
            this._top = rectTransform.top || 0;
            this._left = rectTransform.left || 0;
            this._right = rectTransform.right || 0;
            this._bottom = rectTransform.bottom || 0;
            this._px = rectTransform.px || 0;
            this._py = rectTransform.py || 0;
            if (typeof rectTransform.rotation === 'number') {
                this.rotation = rectTransform.rotation;
            }
            if (typeof rectTransform.scaleX === 'number') {
                this.scaleX = rectTransform.scaleX;
            }
            if (typeof rectTransform.scaleY === 'number') {
                this.scaleY = rectTransform.scaleY;
            }
            if (typeof rectTransform.skewX === 'number') {
                this.skewX = rectTransform.skewX;
            }
            if (typeof rectTransform.skewY === 'number') {
                this.skewY = rectTransform.skewY;
            }
            if (typeof rectTransform.relative !== 'undefined') {
                this.relative = rectTransform.relative;
            }
            this.dirty = true;
        };
        RectTransform.prototype.superSet = function (transform) {
            _super.prototype.set.call(this, transform);
        };
        /**
         * transform with parent transform
         * @param {WOZLLA.Transform} rootTransform
         * @param {WOZLLA.Transform} parentTransform
         */
        RectTransform.prototype.transform = function (rootTransform, parentTransform) {
            if (parentTransform === void 0) { parentTransform = null; }
            var m, R, p;
            if (!parentTransform || !this._relative || !(parentTransform instanceof RectTransform)) {
                p = rootTransform;
            }
            else {
                p = parentTransform;
            }
            m = this._anchorMode;
            R = RectTransform;
            if ((m & R.ANCHOR_LEFT) === R.ANCHOR_LEFT) {
                this.x = this._px;
            }
            else if ((m & R.ANCHOR_RIGHT) === R.ANCHOR_RIGHT) {
                this.x = p._width + this._px;
            }
            else if ((m & R.ANCHOR_HORIZONTAL_STRENGTH) === R.ANCHOR_HORIZONTAL_STRENGTH) {
                this.x = this._left;
                this._width = p._width - this._left - this._right;
            }
            else {
                this.x = p._width / 2 + this._px;
            }
            if ((m & R.ANCHOR_TOP) === R.ANCHOR_TOP) {
                this.y = this._py;
            }
            else if ((m & R.ANCHOR_BOTTOM) === R.ANCHOR_BOTTOM) {
                this.y = p._height + this._py;
            }
            else if ((m & R.ANCHOR_VERTICAL_STRENGTH) === R.ANCHOR_VERTICAL_STRENGTH) {
                this.y = this._top;
                this._height = p._height - this._top - this._bottom;
            }
            else {
                this.y = p._height / 2 + this._py;
            }
            _super.prototype.transform.call(this, rootTransform, p);
        };
        /**
         * vertical anchor mode
         * @property {number} ANCHOR_TOP
         * @readonly
         * @static
         */
        RectTransform.ANCHOR_TOP = 0x1;
        /**
         * vertical anchor mode
         * @property {number} ANCHOR_MIDDLE
         * @readonly
         * @static
         */
        RectTransform.ANCHOR_MIDDLE = 0x10;
        /**
         * vertical anchor mode
         * @property {number} ANCHOR_BOTTOM
         * @readonly
         * @static
         */
        RectTransform.ANCHOR_BOTTOM = 0x100;
        /**
         * vertical anchor mode
         * @property {number} ANCHOR_VERTICAL_STRENGTH
         * @readonly
         * @static
         */
        RectTransform.ANCHOR_VERTICAL_STRENGTH = 0x1000;
        /**
         * horizontal anchor mode
         * @property {number} ANCHOR_LEFT
         * @readonly
         * @static
         */
        RectTransform.ANCHOR_LEFT = 0x10000;
        /**
         * horizontal anchor mode
         * @property {number} ANCHOR_CENTER
         * @readonly
         * @static
         */
        RectTransform.ANCHOR_CENTER = 0x100000;
        /**
         * horizontal anchor mode
         * @property {number} ANCHOR_RIGHT
         * @readonly
         * @static
         */
        RectTransform.ANCHOR_RIGHT = 0x1000000;
        /**
         * horizontal anchor mode
         * @property {number} ANCHOR_HORIZONTAL_STRENGTH
         * @readonly
         * @static
         */
        RectTransform.ANCHOR_HORIZONTAL_STRENGTH = 0x10000000;
        return RectTransform;
    })(WOZLLA.Transform);
    WOZLLA.RectTransform = RectTransform;
})(WOZLLA || (WOZLLA = {}));
/// <reference path="Transform.ts"/>
/// <reference path="RectTransform.ts"/>
/// <reference path="Collider.ts"/>
/// <reference path="../event/EventDispatcher.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var idMap = {};
    var addIndex = 1;
    /**
     * GameObject is the base element in WOZLLA engine. It contains
     * many child instance of {@link WOZLLA.GameObject} and many
     * instance of {@link WOZLLA.Component}.
     * <br/>
     * <br/>
     * Tree structure of the GameObject is the core of WOZLLA engine.
     *
     * @class WOZLLA.GameObject
     * @extends WOZLLA.event.EventDispatcher
     */
    var GameObject = (function (_super) {
        __extends(GameObject, _super);
        function GameObject(director, useRectTransform) {
            if (useRectTransform === void 0) { useRectTransform = false; }
            _super.call(this);
            this._UID = WOZLLA.genUID();
            this._active = true;
            this._visible = true;
            this._initialized = false;
            this._destroyed = false;
            this._touchable = false;
            this._alpha = 1;
            this._alphaDirty = true;
            this._assetLoading = false;
            this._renderOrder = 0;
            this._addIndex = 0;
            this._director = director;
            this._stage = director.stage;
            this._z = 0;
            this._children = [];
            this._childrenByName = {};
            this._components = [];
            this._behaviours = [];
            this._transform = useRectTransform ? new WOZLLA.RectTransform() : new WOZLLA.Transform();
            this._rectTransform = useRectTransform ? this._transform : null;
        }
        /**
         * return the GameObject with the specified id.
         * @method {WOZLLA.GameObject} getById
         * @static
         * @param id the specified id
         * @member WOZLLA.GameObject
         */
        GameObject.getById = function (id) {
            return idMap[id];
        };
        GameObject._getIdMap = function () {
            return idMap;
        };
        Object.defineProperty(GameObject.prototype, "id", {
            /**
             * get or set the id of this game object
             * @property {string} id
             * @member WOZLLA.GameObject
             */
            get: function () { return this._id; },
            set: function (value) {
                var oldId = this._id;
                this._id = value;
                if (oldId) {
                    delete idMap[oldId];
                }
                if (value) {
                    idMap[value] = this;
                }
                this.dispatchEvent(new WOZLLA.CoreEvent('idchange', false));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "name", {
            /**
             * get or set the name of this game object
             * @property {string} name
             * @member WOZLLA.GameObject
             */
            get: function () { return this._name; },
            set: function (value) {
                if (value === this._name)
                    return;
                if (this._parent) {
                    this._parent.removeChildFromNameMap(this);
                }
                this._name = value;
                if (this._parent) {
                    this._parent.addChildToNameMap(this);
                }
                this.dispatchEvent(new WOZLLA.CoreEvent('namechange', false));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "transform", {
            /**
             * get transform of this game object
             * @property {WOZLLA.Transform} transform
             * @member WOZLLA.GameObject
             * @readonly
             */
            get: function () { return this._transform; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "rectTransform", {
            /**
             * get rect transform of this game object
             * @property {WOZLLA.RectTransform} rectTransform
             * @member WOZLLA.GameObject
             * @readonly
             */
            get: function () { return this._rectTransform; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "parent", {
            /**
             * get parent game object
             * @property {WOZLLA.GameObject} parent
             * @member WOZLLA.GameObject
             * @readonly
             */
            get: function () { return this._parent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "children", {
            /**
             * get children of this game object
             * @property {WOZLLA.GameObject[]} children
             * @member WOZLLA.GameObject
             * @readonly
             */
            get: function () { return this._children.slice(0); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "rawChildren", {
            /**
             * get raw children
             * @returns {WOZLLA.GameObject[]}
             */
            get: function () { return this._children; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "rawComponents", {
            get: function () { return this._components; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "childCount", {
            /**
             * get child count
             * @property {number} childCount
             * @member WOZLLA.GameObject
             * @readonly
             */
            get: function () { return this._children.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "z", {
            /**
             * get or set z order of this game object, and then resort children.
             * @property {number} z
             * @member WOZLLA.GameObject
             */
            get: function () { return this._z; },
            set: function (value) {
                this.setZ(value, true);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "active", {
            /**
             * get or set active of this game object.
             * the update method would be call every frame when active was true, false otherwise.
             * if active is set from false to true, the transform dirty would be true.
             * @property {boolean} active
             * @member WOZLLA.GameObject
             */
            get: function () { return this._active; },
            set: function (value) {
                var oldActive;
                if (value === this._active)
                    return;
                oldActive = this._active;
                this._active = value;
                if (!oldActive && value) {
                    this._transform.dirty = true;
                    this._alphaDirty = true;
                }
                this.dispatchEvent(new WOZLLA.CoreEvent('activechange', false));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "visible", {
            /**
             * get visible of this game object.
             * the render method would be call every frame when visible and active both true.
             * @property {boolean} visible
             * @member WOZLLA.GameObject
             */
            get: function () { return this._visible; },
            set: function (value) {
                var oldVisible;
                if (value === this._visible)
                    return;
                oldVisible = this._visible;
                this._visible = value;
                if (!oldVisible && value) {
                    this._transform.dirty = true;
                    this._alphaDirty = true;
                }
                this.dispatchEvent(new WOZLLA.CoreEvent('visiblechange', false));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "enabled", {
            get: function () {
                return this.active && this.visible;
            },
            set: function (value) {
                this.active = value;
                this.visible = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "initialized", {
            /**
             * get initialized of this game object
             * @property {boolean} initialized
             * @member WOZLLA.GameObject
             * @readonly
             */
            get: function () { return this._initialized; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "destroyed", {
            /**
             * get destroyed of this game object
             * @property {boolean} destroyed
             * @member WOZLLA.GameObject
             * @readonly
             */
            get: function () { return this._destroyed; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "touchable", {
            /**
             * get or set touchable of this game object. identify this game object is interactive.
             * @property {boolean} touchable
             * @member WOZLLA.GameObject
             * @readonly
             */
            get: function () { return this._touchable; },
            set: function (value) {
                this._touchable = value;
                this.dispatchEvent(new WOZLLA.CoreEvent('touchablechange', false));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "renderer", {
            /**
             * get renderContext component of this game object
             * @property {WOZLLA.Renderer} renderContext
             * @member WOZLLA.GameObject
             * @readonly
             */
            get: function () { return this._renderer; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "collider", {
            /**
             * get collider of this game object
             * @property {WOZLLA.Collider} collider
             * @member WOZLLA.GameObject
             * @readonly
             */
            get: function () { return this._collider; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "behaviours", {
            /**
             * get behaviours of this game object
             * @property {WOZLLA.Behaviour[]} behaviours
             * @member WOZLLA.GameObject
             * @readonly
             */
            get: function () { return this._behaviours.slice(0); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "director", {
            get: function () { return this._director; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "stage", {
            get: function () { return this._stage; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "renderLayer", {
            get: function () {
                return this._renderLayer;
            },
            set: function (value) {
                this._renderLayer = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "renderOrder", {
            get: function () {
                return this._renderOrder;
            },
            set: function (value) {
                this._renderOrder = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "UID", {
            get: function () {
                return this._UID;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "interactiveRect", {
            get: function () {
                return this._interactiveRect;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "alpha", {
            get: function () {
                return this._alpha;
            },
            set: function (value) {
                if (value === this._alpha) {
                    return;
                }
                this._alpha = value;
                this._alphaDirty = true;
            },
            enumerable: true,
            configurable: true
        });
        GameObject.prototype.data = function (key, value) {
            if (value == void 0) {
                return this._data ? this._data[key] : undefined;
            }
            else {
                if (!this._data) {
                    this._data = {};
                }
                this._data[key] = value;
            }
        };
        /**
         * get active in tree
         * @method isActive
         * @member WOZLLA.GameObject
         * @return {boolean}
         */
        GameObject.prototype.isActive = function () {
            var active;
            var o = this;
            while (active = o._active) {
                o = o._parent;
            }
            return active;
        };
        /**
         * set z order
         * @param value
         * @param sort true is set to resort children
         */
        GameObject.prototype.setZ = function (value, sort) {
            if (sort === void 0) { sort = true; }
            if (this._z === value)
                return;
            this._z = value;
            if (sort) {
                this.sortChildren();
            }
            this.dispatchEvent(new WOZLLA.CoreEvent('zchange', false));
        };
        /**
         * add a child game object, it would be fail when this game object has contains the child.
         * @param child
         * @param sort true is set to resort children
         * @returns {boolean} true is success to, false otherwise.
         */
        GameObject.prototype.addChild = function (child, sort) {
            if (sort === void 0) { sort = true; }
            if (this._children.indexOf(child) !== -1) {
                return false;
            }
            if (child._parent) {
                child.removeMe();
            }
            child.dispatchEvent(new WOZLLA.CoreEvent('beforeadd', false, {
                parent: this
            }));
            this._children.push(child);
            child._addIndex = addIndex++;
            if (sort) {
                this.sortChildren();
            }
            child._parent = this;
            child.setBubbleParent(this);
            child._transform.dirty = true;
            this.addChildToNameMap(child);
            child.dispatchEvent(new WOZLLA.CoreEvent('add', false));
            this.dispatchEvent(new WOZLLA.CoreEvent('childadd', false, {
                child: child
            }));
            this.dispatchEvent(new WOZLLA.CoreEvent('childchange', false));
            return true;
        };
        /**
         * remove the specified child.
         * @param child
         * @returns {boolean} true is success to, false otherwise.
         */
        GameObject.prototype.removeChild = function (child) {
            var idx = this._children.indexOf(child);
            if (idx !== -1) {
                child.dispatchEvent(new WOZLLA.CoreEvent('beforeremove', false));
                this._children.splice(idx, 1);
                child._parent = null;
                child.setBubbleParent(null);
                this.removeChildFromNameMap(child);
                child.dispatchEvent(new WOZLLA.CoreEvent('remove', false, {
                    parent: this
                }));
                this.dispatchEvent(new WOZLLA.CoreEvent('childremove', false, {
                    child: child
                }));
                this.dispatchEvent(new WOZLLA.CoreEvent('childchange', false));
                return true;
            }
            return false;
        };
        /**
         * get the first child with the specified name.
         * @param name
         * @returns {WOZLLA.GameObject}
         */
        GameObject.prototype.getChild = function (name) {
            var childOrArr = this._childrenByName[name];
            if (WOZLLA.isArray(childOrArr)) {
                return childOrArr[0];
            }
            return childOrArr;
        };
        /**
         * get all children with the specified name.
         * @param name
         * @returns {Array}
         */
        GameObject.prototype.getChildren = function (name) {
            if (!name) {
                return this.children;
            }
            var childOrArr = this._childrenByName[name];
            if (WOZLLA.isArray(childOrArr)) {
                return childOrArr;
            }
            return [childOrArr];
        };
        /**
         * remove this game object from parent.
         * @returns {boolean}
         */
        GameObject.prototype.removeMe = function () {
            var parent = this._parent;
            return parent && parent.removeChild(this);
        };
        /**
         * iterator children of this game object
         * @param func interator function.
         */
        GameObject.prototype.eachChild = function (func) {
            this._children.forEach(func);
        };
        /**
         * sort children
         */
        GameObject.prototype.sortChildren = function () {
            this._children.sort(GameObject.Comparator);
            this.dispatchEvent(new WOZLLA.CoreEvent('sort', false));
        };
        /**
         * get path of this game object
         * @param split delimiter
         * @returns {string}
         */
        GameObject.prototype.getPath = function (split) {
            if (split === void 0) { split = '/'; }
            var arr = [];
            var obj = this;
            while (obj) {
                arr.unshift(obj.name);
                obj = obj.parent;
            }
            return arr.join(split);
        };
        /**
         * whether contains the specified game object of this tree structure.
         * @param child
         * @returns {boolean}
         */
        GameObject.prototype.contains = function (child, deep) {
            if (deep === void 0) { deep = false; }
            if (child === this) {
                return true;
            }
            if (!deep) {
                return child.parent === this;
            }
            var parent = child;
            while (parent = parent.parent) {
                if (parent === this) {
                    return true;
                }
            }
            return false;
        };
        /**
         * get first component of type of the specified Type(constructor).
         * @param Type
         * @returns {WOZLLA.Component}
         */
        GameObject.prototype.getComponent = function (Type) {
            var comp, i, len;
            if (this._components.length <= 0) {
                return null;
            }
            for (i = 0, len = this._components.length; i < len; i++) {
                comp = this._components[i];
                if (comp instanceof Type) {
                    return comp;
                }
            }
            return null;
        };
        /**
         * @method hasComponent
         * @param Type
         * @returns {boolean}
         */
        GameObject.prototype.hasComponent = function (Type) {
            var comp, i, len;
            if (Type === WOZLLA.RectTransform) {
                return !!this._rectTransform;
            }
            if (this._components.length <= 0) {
                return false;
            }
            for (i = 0, len = this._components.length; i < len; i++) {
                comp = this._components[i];
                if (comp instanceof Type) {
                    return true;
                }
            }
            return false;
        };
        /**
         * get all components of type of Type(constructor).
         * @param Type
         * @returns {Array}
         */
        GameObject.prototype.getComponents = function (Type) {
            var comp, i, len;
            var result = [];
            if (this._components.length <= 0) {
                return result;
            }
            for (i = 0, len = this._components.length; i < len; i++) {
                comp = this._components[i];
                if (comp instanceof Type) {
                    result.push(comp);
                }
            }
            return result;
        };
        /**
         * add componen to this game object. this method would check component dependency
         * by method of component's listRequiredComponents.
         * @param comp
         * @returns {boolean}
         */
        GameObject.prototype.addComponent = function (comp) {
            if (this._components.indexOf(comp) !== -1) {
                return false;
            }
            this.checkComponentDependency(comp);
            if (comp.gameObject) {
                comp.gameObject.removeComponent(comp);
            }
            this._components.push(comp);
            comp.gameObject = this;
            if (comp instanceof WOZLLA.Behaviour) {
                this._behaviours.push(comp);
            }
            else if (comp instanceof WOZLLA.Renderer) {
                this._renderer = comp;
            }
            else if (comp instanceof WOZLLA.Collider) {
                this._collider = comp;
            }
            this.dispatchEvent(new WOZLLA.CoreEvent('componentadd', false, {
                component: comp
            }));
            return true;
        };
        /**
         * remove the specified component
         * @param comp
         * @returns {boolean}
         */
        GameObject.prototype.removeComponent = function (comp) {
            var i, len, otherComp;
            var idx = this._components.indexOf(comp);
            if (idx !== -1) {
                for (i = 0, len = this._components.length; i < len; i++) {
                    otherComp = this._components[i];
                    if (otherComp !== comp) {
                        this.checkComponentDependency(otherComp, true);
                    }
                }
                this._components.splice(idx, 1);
                if (comp instanceof WOZLLA.Behaviour) {
                    this._behaviours.splice(this._behaviours.indexOf(comp), 1);
                }
                else if (comp instanceof WOZLLA.Renderer) {
                    this._renderer = null;
                }
                else if (comp instanceof WOZLLA.Collider) {
                    this._collider = null;
                }
                comp.gameObject = null;
                this.dispatchEvent(new WOZLLA.CoreEvent('componentremove', false, {
                    component: comp
                }));
                return true;
            }
            return false;
        };
        /**
         * init this game object.
         */
        GameObject.prototype.init = function () {
            var i, len;
            if (this._destroyed || this._initialized)
                return;
            this.dispatchEvent(new WOZLLA.CoreEvent('beforeinit', false));
            if (this._initialized || this._destroyed)
                return;
            for (i = 0, len = this._components.length; i < len; i++) {
                this._components[i].init();
            }
            for (i = 0, len = this._children.length; i < len; i++) {
                this._children[i].init();
            }
            this._initialized = true;
            this.dispatchEvent(new WOZLLA.CoreEvent('init', false));
        };
        /**
         * destroy this game object.
         */
        GameObject.prototype.destroy = function () {
            var _this = this;
            var i, len;
            if (this._destroyed)
                return;
            if (this._assetLoading) {
                this._destroyed = true;
                this.addListener('assetsload', function (e) {
                    e.removeCurrentListener();
                    _this.destroy();
                });
                return;
            }
            this.dispatchEvent(new WOZLLA.CoreEvent('beforedestroy', false));
            for (i = 0, len = this._components.length; i < len; i++) {
                this._components[i].destroy();
            }
            for (i = 0, len = this._children.length; i < len; i++) {
                this._children[i].destroy();
            }
            if (this._id) {
                delete idMap[this._id];
            }
            this._destroyed = true;
            this.dispatchEvent(new WOZLLA.CoreEvent('destroy', false));
            this.clearAllListeners();
        };
        GameObject.prototype.destroyAndRemove = function () {
            this.destroy();
            this.removeMe();
        };
        /**
         * call every frame when active was true.
         */
        GameObject.prototype.update = function () {
            var i, len, behaviour;
            if (!this._active)
                return;
            if (this._behaviours.length > 0) {
                for (i = 0, len = this._behaviours.length; i < len; i++) {
                    behaviour = this._behaviours[i];
                    behaviour.enabled && behaviour.update();
                }
            }
            if (this._children.length > 0) {
                for (i = 0, len = this._children.length; i < len; i++) {
                    this._children[i].update();
                }
            }
        };
        /**
         * visit this game object and it's all children, children of children.
         * @param renderContext
         * @param parentTransform
         * @param transformDirty
         * @param visibleFlag
         * @param renderLayer
         * @param parentAlpha
         */
        GameObject.prototype.visit = function (renderContext, parentTransform, transformDirty, visibleFlag, renderLayer, parentAlpha) {
            if (!this._initialized || this._destroyed) {
                if (transformDirty) {
                    this._transform.dirty = true;
                }
                return;
            }
            renderLayer = this._renderLayer || renderLayer;
            if (this._transform.dirty) {
                transformDirty = transformDirty || this._transform.dirty;
            }
            if (transformDirty) {
                if (this._transform instanceof WOZLLA.RectTransform) {
                    this._transform.transform(this._stage.viewRectTransform, parentTransform);
                }
                else if (this instanceof WOZLLA.Stage) {
                    var stage = this;
                    this._transform.transform(stage.rootTransform, parentTransform);
                }
                else {
                    this._transform.transform(this._stage.rootTransform, parentTransform);
                }
            }
            if (!this._visible) {
                visibleFlag = visibleFlag && this._visible;
            }
            var alpha = this._alpha * parentAlpha;
            if (visibleFlag) {
                if (renderContext.debug) {
                    renderContext.setDebugTag(this.name);
                }
                this.render(renderContext, transformDirty, renderLayer, this._renderOrder, alpha);
            }
            this.visitChildren(renderContext, transformDirty, visibleFlag, renderLayer, alpha);
        };
        GameObject.prototype.visitChildren = function (renderContext, transformDirty, visibleFlag, renderLayer, alpha) {
            var i, len;
            if (this._children.length === 0)
                return;
            for (i = 0, len = this._children.length; i < len; i++) {
                this._children[i].visit(renderContext, this._transform, transformDirty, visibleFlag, renderLayer, alpha);
            }
        };
        GameObject.prototype.render = function (renderContext, transformDirty, renderLayer, renderOrder, alpha) {
            this._renderer && this._renderer.render(renderContext, transformDirty, renderLayer, renderOrder, alpha);
        };
        /**
         * get a game object under the point.
         * @param x
         * @param y
         * @param touchable
         * @returns {WOZLLA.GameObject}
         */
        GameObject.prototype.getUnderPoint = function (x, y, touchable, ignoreVisible) {
            if (touchable === void 0) { touchable = false; }
            if (ignoreVisible === void 0) { ignoreVisible = false; }
            var found, localP, child;
            var childrenArr;
            if (!ignoreVisible && !this._visible)
                return null;
            if (this._interactiveRect) {
                localP = this.transform.globalToLocal(x, y);
                if (!this._interactiveRect.containsXY(localP.x, localP.y)) {
                    return null;
                }
            }
            childrenArr = this._children;
            if (childrenArr.length > 0) {
                for (var i = childrenArr.length - 1; i >= 0; i--) {
                    child = childrenArr[i];
                    found = child.getUnderPoint(x, y, touchable);
                    if (found) {
                        return found;
                    }
                }
            }
            if (!touchable || this._touchable) {
                if (!localP) {
                    localP = this.transform.globalToLocal(x, y);
                }
                if (this.testHit(localP.x, localP.y)) {
                    return this;
                }
            }
            return null;
        };
        /**
         * try to do a hit test
         * @param localX
         * @param localY
         * @returns {boolean}
         */
        GameObject.prototype.testHit = function (localX, localY) {
            var collider = this._collider;
            return collider && collider.collideXY(localX, localY);
        };
        GameObject.prototype.loadAssets = function (callback) {
            var _this = this;
            var i, len, count, comp;
            if (this._destroyed) {
                callback && callback();
                return;
            }
            this._assetLoading = true;
            count = this._components.length + this._children.length;
            if (count === 0) {
                this._assetLoading = false;
                this.dispatchEvent(new WOZLLA.CoreEvent('assetsload', false));
                callback && callback();
                return;
            }
            for (i = 0, len = this._components.length; i < len; i++) {
                comp = this._components[i];
                comp.loadAssets(function () {
                    if (--count === 0) {
                        _this._assetLoading = false;
                        _this.dispatchEvent(new WOZLLA.CoreEvent('assetsload', false));
                        callback && callback();
                    }
                });
            }
            for (i = 0, len = this._children.length; i < len; i++) {
                this._children[i].loadAssets(function () {
                    if (--count === 0) {
                        _this._assetLoading = false;
                        _this.dispatchEvent(new WOZLLA.CoreEvent('assetsload', false));
                        callback && callback();
                    }
                });
            }
        };
        GameObject.prototype.tween = function (override, loop) {
            if (loop === void 0) { loop = false; }
            return WOZLLA.util.Tween.get(this, {
                loop: loop
            }, null, override);
        };
        GameObject.prototype.query = function (expr, record) {
            var result, compExpr, objExpr, compName, attrName;
            var objArr, objName;
            var hasAttr = expr.indexOf('[') !== -1 && expr.indexOf(']') !== -1;
            var hasComp = expr.indexOf(':') !== -1;
            if (hasComp && hasAttr) {
                result = GameObject.QUERY_FULL_REGEX.exec(expr);
                compExpr = result[1];
                objExpr = result[2];
                compName = result[3];
                attrName = result[4];
            }
            else if (hasComp && !hasAttr) {
                result = GameObject.QUERY_COMP_REGEX.exec(expr);
                compExpr = result[1];
                objExpr = result[2];
                compName = result[3];
            }
            else if (!hasComp && hasAttr) {
                result = GameObject.QUERY_OBJ_ATTR_REGEX.exec(expr);
                objExpr = result[1];
                attrName = result[2];
            }
            else {
                objExpr = expr;
            }
            if (record) {
                record.compExpr = compExpr;
                record.objExpr = objExpr;
                record.compName = compName;
                record.attrName = attrName;
            }
            if (!objExpr) {
                result = this;
            }
            else {
                result = this;
                objArr = objExpr.split('/');
                for (var i = 0, len = objArr.length; i < len; i++) {
                    objName = objArr[i];
                    if (!objName) {
                        break;
                    }
                    if (/^#/.test(objName)) {
                        result = GameObject.getById(objName.substr(1));
                    }
                    else if (objName === '$this') {
                        result = this;
                    }
                    else {
                        result = result.getChild(objArr[i]);
                    }
                    if (!result) {
                        break;
                    }
                }
            }
            if (result && compName) {
                if (compName === 'Transform') {
                    result = result.transform;
                }
                else {
                    result = result.getComponent(WOZLLA.component.ComponentFactory.getType(compName));
                }
            }
            if (result && record) {
                record.target = result;
            }
            if (result && attrName) {
                result = result[attrName];
            }
            return result;
        };
        GameObject.prototype.checkComponentDependency = function (comp, isRemove) {
            if (isRemove === void 0) { isRemove = false; }
        };
        GameObject.prototype.addChildToNameMap = function (child) {
            if (!child.name)
                return;
            var childOrArr = this._childrenByName[child.name];
            if (!childOrArr) {
                this._childrenByName[child.name] = child;
                return;
            }
            if (!WOZLLA.isArray(childOrArr)) {
                childOrArr = [childOrArr];
            }
            childOrArr.push(child);
            this._childrenByName[child.name] = childOrArr;
        };
        GameObject.prototype.removeChildFromNameMap = function (child) {
            if (!child.name)
                return;
            var childOrArr = this._childrenByName[child.name];
            if (childOrArr === child) {
                delete this._childrenByName[child.name];
                return;
            }
            var idx = childOrArr.indexOf(child);
            childOrArr.splice(idx, 1);
        };
        GameObject.Comparator = function (a, b) {
            if (a.z === b.z) {
                return a._addIndex - b._addIndex;
            }
            return a.z - b.z <= 0 ? -1 : 1;
        };
        GameObject.QUERY_FULL_REGEX = /((.*?):(.*?))\[(.*?)\]$/;
        GameObject.QUERY_COMP_REGEX = /((.*?):(.*?))$/;
        GameObject.QUERY_OBJ_ATTR_REGEX = /(.*?)\[(.*?)\]$/;
        return GameObject;
    })(WOZLLA.event.EventDispatcher);
    WOZLLA.GameObject = GameObject;
    var QueryRecord = (function () {
        function QueryRecord() {
            this.compExpr = null;
            this.objExpr = null;
            this.compName = null;
            this.attrName = null;
            this.target = null;
        }
        return QueryRecord;
    })();
    WOZLLA.QueryRecord = QueryRecord;
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    /**
     * @class WOZLLA.Scheduler
     * @singleton
     */
    var Scheduler = (function () {
        function Scheduler() {
            this._scheduleCount = 0;
            this._schedules = {};
        }
        Scheduler.prototype.runSchedule = function (deltaTime) {
            var scheduleId, scheduleItem, schedules;
            schedules = this._schedules;
            for (scheduleId in schedules) {
                if (schedules.hasOwnProperty(scheduleId)) {
                    scheduleItem = schedules[scheduleId];
                    if (scheduleItem.isFrame && !scheduleItem.paused) {
                        scheduleItem.frame--;
                        if (scheduleItem.frame < 0) {
                            delete schedules[scheduleId];
                            scheduleItem.task.apply(scheduleItem, scheduleItem.args);
                        }
                    }
                    else if (scheduleItem.isTime && !scheduleItem.paused) {
                        scheduleItem.time -= deltaTime;
                        if (scheduleItem.time < 0) {
                            delete schedules[scheduleId];
                            scheduleItem.task.apply(scheduleItem, scheduleItem.args);
                        }
                    }
                    else if (scheduleItem.isInterval && !scheduleItem.paused) {
                        scheduleItem.time -= deltaTime;
                        if (scheduleItem.time < 0) {
                            scheduleItem.task.apply(scheduleItem, scheduleItem.args);
                            scheduleItem.time += scheduleItem.intervalTime;
                        }
                    }
                    else if (scheduleItem.isLoop && !scheduleItem.paused) {
                        scheduleItem.task.apply(scheduleItem, scheduleItem.args);
                    }
                }
            }
        };
        /**
         * remove the specify schedule by id
         * @param id
         */
        Scheduler.prototype.removeSchedule = function (id) {
            delete this._schedules[id];
        };
        /**
         * schedule the task to each frame
         * @param task
         * @param args
         * @returns {string} schedule id
         */
        Scheduler.prototype.scheduleLoop = function (task, args) {
            var scheduleId = 'Schedule_' + (this._scheduleCount++);
            this._schedules[scheduleId] = {
                task: task,
                args: args,
                isLoop: true
            };
            return scheduleId;
        };
        /**
         * schedule the task to the next speficied frame
         * @param task
         * @param {number} frame
         * @param args
         * @returns {string} schedule id
         */
        Scheduler.prototype.scheduleFrame = function (task, frame, args) {
            if (frame === void 0) { frame = 0; }
            var scheduleId = 'Schedule_' + (this._scheduleCount++);
            this._schedules[scheduleId] = {
                task: task,
                frame: frame,
                args: args,
                isFrame: true
            };
            return scheduleId;
        };
        /**
         * schedule the task to internal, like setInterval
         * @param task
         * @param time
         * @param args
         * @returns {string} schedule id
         */
        Scheduler.prototype.scheduleInterval = function (task, time, args) {
            if (time === void 0) { time = 0; }
            var scheduleId = 'Schedule_' + (this._scheduleCount++);
            this._schedules[scheduleId] = {
                task: task,
                intervalTime: time,
                time: time,
                args: args,
                isInterval: true
            };
            return scheduleId;
        };
        /**
         * schedule the task to time, like setTimeout
         * @param task
         * @param time
         * @param args
         * @returns {string} schedule id
         */
        Scheduler.prototype.scheduleTime = function (task, time, args) {
            if (time === void 0) { time = 0; }
            var scheduleId = 'Schedule_' + (this._scheduleCount++);
            time = time || 0;
            this._schedules[scheduleId] = {
                task: task,
                time: time,
                args: args,
                isTime: true
            };
            return scheduleId;
        };
        /**
         * resume the specified schedule
         * @param scheduleId
         */
        Scheduler.prototype.resumeSchedule = function (scheduleId) {
            var scheduleItem = this._schedules[scheduleId];
            scheduleItem.paused = false;
        };
        /**
         * pause the specified schedule
         * @param scheduleId
         */
        Scheduler.prototype.pauseSchedule = function (scheduleId) {
            var scheduleItem = this._schedules[scheduleId];
            scheduleItem.paused = true;
        };
        Scheduler.prototype.hasSchedule = function (scheduleId) {
            return !!this._schedules[scheduleId];
        };
        return Scheduler;
    })();
    WOZLLA.Scheduler = Scheduler;
})(WOZLLA || (WOZLLA = {}));
/// <reference path="GameObject.ts"/>
var WOZLLA;
(function (WOZLLA) {
    /**
     * the root game object of WOZLLA engine
     * @class WOZLLA.Stage
     * @extends WOZLLA.GameObject
     */
    var Stage = (function (_super) {
        __extends(Stage, _super);
        function Stage(director) {
            _super.call(this, director);
            this._rootAlpha = 1;
            this._domScale = 1;
            this.id = Stage.ID;
            this.name = Stage.ID;
            this._rootTransform = new WOZLLA.Transform();
            this._viewRectTransform = new WOZLLA.RectTransform();
            this._viewRectTransform.anchorMode = WOZLLA.RectTransform.ANCHOR_TOP | WOZLLA.RectTransform.ANCHOR_LEFT;
            this._viewRectTransform.width = director.renderContext.viewport.width;
            this._viewRectTransform.height = director.renderContext.viewport.height;
            this._viewRectTransform.px = 0;
            this._viewRectTransform.py = 0;
            this.init();
        }
        Object.defineProperty(Stage.prototype, "viewRectTransform", {
            get: function () { return this._viewRectTransform; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Stage.prototype, "rootTransform", {
            get: function () { return this._rootTransform; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Stage.prototype, "domScale", {
            get: function () { return this._domScale; },
            set: function (scale) { this._domScale = scale; },
            enumerable: true,
            configurable: true
        });
        Stage.prototype.updateViewRect = function () {
            this._viewRectTransform.width = this.director.renderContext.viewport.width;
            this._viewRectTransform.height = this.director.renderContext.viewport.height;
            this._viewRectTransform.px = 0;
            this._viewRectTransform.py = 0;
            this.dispatchEvent(new WOZLLA.event.Event('resize', false, {
                width: this._viewRectTransform.width,
                height: this._viewRectTransform.height,
                domScale: this._domScale
            }));
        };
        Stage.prototype.visitStage = function (renderer, transformDirty) {
            if (transformDirty === void 0) { transformDirty = false; }
            _super.prototype.visit.call(this, renderer, this._rootTransform, transformDirty, true, this.renderLayer || WOZLLA.rendering.RenderContext.DEFAULT_LAYER, this._rootAlpha);
        };
        Stage.ID = 'WOZLLAStage';
        return Stage;
    })(WOZLLA.GameObject);
    WOZLLA.Stage = Stage;
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../../hammerjs.d.ts" />
/// <reference path="Scheduler.ts"/>
/// <reference path="Director.ts"/>
var WOZLLA;
(function (WOZLLA) {
    function getCanvasOffset(canvas) {
        var obj = canvas;
        var offset = { x: obj.offsetLeft, y: obj.offsetTop };
        while (obj = obj.offsetParent) {
            offset.x += obj.offsetLeft;
            offset.y += obj.offsetTop;
        }
        return offset;
    }
    var GestureEvent = (function (_super) {
        __extends(GestureEvent, _super);
        function GestureEvent(params) {
            _super.call(this, params.type, params.bubbles, params.data);
            this.touchMoveDetection = false;
            this.x = params.x;
            this.y = params.y;
            this.touch = params.touch;
            this.touchMoveDetection = params.touchMoveDetection;
            this.gesture = params.gesture;
            this.identifier = params.identifier;
        }
        GestureEvent.prototype.setTouchMoveDetection = function (value) {
            this.touchMoveDetection = value;
        };
        return GestureEvent;
    })(WOZLLA.event.Event);
    WOZLLA.GestureEvent = GestureEvent;
    /**
     * class for touch management <br/>
     * get the instance form {@link WOZLLA.Director}
     * @class WOZLLA.Touch
     * @protected
     */
    var Touch = (function () {
        function Touch(director, touchScale) {
            if (touchScale === void 0) { touchScale = 1; }
            /**
             * get or set enabled of touch system
             * @property {boolean} enabled
             */
            this.enabled = true;
            this.inSchedule = true;
            this._canvas = null;
            this._canvasOffset = null;
            this._channelMap = {};
            var me = this;
            me._director = director;
            me._canvas = director.view;
            me.touchScale = touchScale;
            me.updateCanvasOffset();
            if (window['Hammer']) {
                me._hammer = new Hammer.Manager(me._canvas);
                me._hammer.add(new Hammer.Tap({ threshold: 100, time: 5000 }));
                me._hammer.add(new Hammer.Pan({ threshold: 5 }));
                me._hammer.on(Touch.enabledGestures || 'hammer.input tap swipe panstart panmove panend pancancel', function (e) {
                    if (e.type === 'hammer.input' && !e.isFinal && !e.isFirst) {
                        return;
                    }
                    if (e.isFinal || me.enabled) {
                        if (me.inSchedule) {
                            director.scheduler.scheduleFrame(function () {
                                me.onGestureEvent(e);
                            });
                        }
                        else {
                            me.onGestureEvent(e);
                        }
                    }
                });
            }
            else {
                me._canvas.addEventListener('touchstart', function () {
                    console.error('please import hammer.js');
                });
                me._canvas.addEventListener('mousedown', function () {
                    console.error('please import hammer.js');
                });
            }
        }
        Touch.setEanbledGestures = function (gestures) {
            this.enabledGestures = gestures;
        };
        Touch.prototype.updateCanvasOffset = function () {
            this._canvasOffset = getCanvasOffset(this._canvas);
        };
        Touch.prototype.onGestureEvent = function (e) {
            var x, y, i, len, touch, identifier, channel, changedTouches, target, type = e.type, stage = this._director.stage;
            var me = this;
            var canvasScale = this.touchScale || 1;
            var isFinalButNotHammerIpnut = type !== 'hammer.input' && e.isFinal;
            if (type === 'hammer.input') {
                if (e.isFirst) {
                    type = 'touch';
                }
                else if (e.isFinal) {
                    type = 'release';
                }
            }
            changedTouches = e.srcEvent.changedTouches;
            if (!changedTouches) {
                identifier = 1;
                x = e.srcEvent.pageX - me._canvasOffset.x;
                y = e.srcEvent.pageY - me._canvasOffset.y;
                x *= canvasScale;
                y *= canvasScale;
                if (type === 'touch') {
                    target = stage.getUnderPoint(x, y, true);
                    if (target) {
                        me._channelMap[identifier] = me.createDispatchChanel(target);
                    }
                }
                channel = me._channelMap[identifier];
                channel && channel.onGestureEvent(e, target, x, y, identifier);
            }
            else {
                len = changedTouches.length;
                for (i = 0; i < len; i++) {
                    touch = changedTouches[i];
                    identifier = parseInt(touch.identifier);
                    x = touch.pageX - me._canvasOffset.x;
                    y = touch.pageY - me._canvasOffset.y;
                    x *= canvasScale;
                    y *= canvasScale;
                    if (type === 'touch') {
                        target = stage.getUnderPoint(x, y, true);
                        if (target) {
                            me._channelMap[identifier] = me.createDispatchChanel(target);
                        }
                    }
                    channel = me._channelMap[identifier];
                    channel && channel.onGestureEvent(e, target, x, y, identifier);
                }
            }
            // do clear channel
            if (isFinalButNotHammerIpnut) {
                delete me._channelMap[identifier];
            }
        };
        Touch.prototype.createDispatchChanel = function (touchTarget) {
            var touchMoveDetection = true;
            var stage = this._director.stage;
            return {
                onGestureEvent: function (e, target, x, y, identifier) {
                    var touchEvent, type = e.type;
                    if (type === 'hammer.input') {
                        if (e.isFirst) {
                            type = 'touch';
                        }
                        else if (e.isFinal) {
                            type = 'release';
                        }
                    }
                    switch (type) {
                        case 'panmove':
                            if (!touchMoveDetection) {
                                target = touchTarget;
                                break;
                            }
                        case 'release':
                        case 'tap':
                            target = stage.getUnderPoint(x, y, true);
                            break;
                    }
                    if (type === 'tap' && touchTarget !== target) {
                        return;
                    }
                    touchEvent = new GestureEvent({
                        x: x,
                        y: y,
                        type: type,
                        bubbles: true,
                        touch: target,
                        gesture: e,
                        identifier: identifier,
                        touchMoveDetection: false
                    });
                    touchTarget.dispatchEvent(touchEvent);
                    touchMoveDetection = touchEvent.touchMoveDetection;
                }
            };
        };
        return Touch;
    })();
    WOZLLA.Touch = Touch;
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../event/Event" />
var WOZLLA;
(function (WOZLLA) {
    var dnd;
    (function (dnd) {
        var DnDEvent = (function (_super) {
            __extends(DnDEvent, _super);
            function DnDEvent(type, gestureEvent) {
                _super.call(this, type, false);
                this._gestureEvent = gestureEvent;
            }
            Object.defineProperty(DnDEvent.prototype, "gestureEvent", {
                get: function () {
                    return this._gestureEvent;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DnDEvent.prototype, "screenX", {
                get: function () {
                    return this._gestureEvent.x;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DnDEvent.prototype, "screenY", {
                get: function () {
                    return this._gestureEvent.y;
                },
                enumerable: true,
                configurable: true
            });
            return DnDEvent;
        })(WOZLLA.event.Event);
        dnd.DnDEvent = DnDEvent;
        var DnDDragEvent = (function (_super) {
            __extends(DnDDragEvent, _super);
            function DnDDragEvent(gestureEvent, source) {
                _super.call(this, DnDDragEvent.TYPE, gestureEvent);
                this._source = source;
            }
            Object.defineProperty(DnDDragEvent.prototype, "source", {
                get: function () {
                    return this._source;
                },
                enumerable: true,
                configurable: true
            });
            DnDDragEvent.TYPE = 'drag';
            return DnDDragEvent;
        })(DnDEvent);
        dnd.DnDDragEvent = DnDDragEvent;
        var DnDDraggingEvent = (function (_super) {
            __extends(DnDDraggingEvent, _super);
            function DnDDraggingEvent(gestureEvent, target, attachedObject) {
                _super.call(this, DnDDraggingEvent.TYPE, gestureEvent);
                this._attachedObject = null;
                this._dropPossible = false;
                this._target = target;
                this._attachedObject = attachedObject;
            }
            Object.defineProperty(DnDDraggingEvent.prototype, "attachedObject", {
                get: function () {
                    return this._attachedObject;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DnDDraggingEvent.prototype, "target", {
                get: function () {
                    return this._target;
                },
                enumerable: true,
                configurable: true
            });
            DnDDraggingEvent.prototype.isDropPossible = function () {
                return this._dropPossible;
            };
            DnDDraggingEvent.prototype.setDropPossible = function (possible) {
                this._dropPossible = possible;
            };
            DnDDraggingEvent.TYPE = 'dragging';
            return DnDDraggingEvent;
        })(DnDEvent);
        dnd.DnDDraggingEvent = DnDDraggingEvent;
        var DnDDropEvent = (function (_super) {
            __extends(DnDDropEvent, _super);
            function DnDDropEvent(gestureEvent, target, attachedObject) {
                _super.call(this, DnDDraggingEvent.TYPE, gestureEvent);
                this._target = target;
                this._attachedObject = attachedObject;
            }
            Object.defineProperty(DnDDropEvent.prototype, "attachedObject", {
                get: function () {
                    return this._attachedObject;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DnDDropEvent.prototype, "target", {
                get: function () {
                    return this._target;
                },
                enumerable: true,
                configurable: true
            });
            DnDDropEvent.TYPE = 'drop';
            return DnDDropEvent;
        })(DnDEvent);
        dnd.DnDDropEvent = DnDDropEvent;
    })(dnd = WOZLLA.dnd || (WOZLLA.dnd = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../util/Assert.ts" />
var WOZLLA;
(function (WOZLLA) {
    var dnd;
    (function (dnd) {
        var DnDManager = (function () {
            function DnDManager() {
                this._sourceMap = {};
                this._targetMap = {};
            }
            DnDManager.getInstance = function () {
                if (!DnDManager.instance) {
                    DnDManager.instance = new DnDManager();
                }
                return DnDManager.instance;
            };
            DnDManager.prototype.registerSource = function (source, dragHandler) {
                WOZLLA.Assert.isUndefined(this._sourceMap[source.UID]);
                var wrapper = new SourceWrapper(source, dragHandler, this);
                wrapper.init();
                this._sourceMap[source.UID] = wrapper;
            };
            DnDManager.prototype.unregisterSource = function (source, dragHandler) {
                var wrapper = this._sourceMap[source.UID];
                WOZLLA.Assert.isNotUndefined(wrapper);
                wrapper.destroy();
                delete this._sourceMap[source.UID];
            };
            DnDManager.prototype.registerTarget = function (target, dropHandler) {
                WOZLLA.Assert.isUndefined(this._targetMap[target.UID]);
                this._targetMap[target.UID] = new TargetWrapper(target, dropHandler);
            };
            DnDManager.prototype.unregisterTarget = function (target, dropHandler) {
                var targetWrapper = this._targetMap[target.UID];
                WOZLLA.Assert.isNotUndefined(targetWrapper);
                WOZLLA.Assert.isTrue(targetWrapper.dropHandler === dropHandler);
                delete this._targetMap[target.UID];
            };
            return DnDManager;
        })();
        dnd.DnDManager = DnDManager;
        var SourceWrapper = (function () {
            function SourceWrapper(source, dragHandler, dndManager) {
                this.source = source;
                this.dragHandler = dragHandler;
                this.dndManager = dndManager;
                this.draggingStart = false;
                this.attactedObject = null;
                this.draggedObjectOriginPoint = { x: 0, y: 0 };
            }
            SourceWrapper.prototype.init = function () {
                this.source.addListenerScope('panstart', this.onPanStart, this);
                this.source.addListenerScope('panmove', this.onPanMove, this);
                this.source.addListenerScope('panend', this.onPanEnd, this);
                this.source.addListenerScope('pancancel', this.onPanCancel, this);
            };
            SourceWrapper.prototype.destroy = function () {
                this.source.removeListenerScope('panstart', this.onPanStart, this);
                this.source.removeListenerScope('panmove', this.onPanMove, this);
                this.source.removeListenerScope('panend', this.onPanEnd, this);
                this.source.removeListenerScope('pancancel', this.onPanCancel, this);
            };
            SourceWrapper.prototype.updateDraggedObjectPosition = function (gestureEvent) {
                var dragStartGesture = this.dragEvent.gestureEvent;
                var startX = dragStartGesture.x;
                var startY = dragStartGesture.y;
                var deltaX = gestureEvent.x - startX;
                var deltaY = gestureEvent.y - startY;
                this.draggedObject.transform.x = this.draggedObjectOriginPoint.x + deltaX;
                this.draggedObject.transform.y = this.draggedObjectOriginPoint.y + deltaY;
            };
            SourceWrapper.prototype.onPanStart = function (e) {
                var dragEvent = new dnd.DnDDragEvent(e, this.source);
                if (this.dragHandler.canStartDragging(dragEvent)) {
                    this.dragEvent = dragEvent;
                    this.draggedObject = this.dragHandler.createDraggedObject(dragEvent);
                    this.draggedObjectOriginPoint.x = this.draggedObject.transform.x;
                    this.draggedObjectOriginPoint.y = this.draggedObject.transform.y;
                    this.updateDraggedObjectPosition(e);
                    this.attactedObject = this.dragHandler.startDragging(dragEvent);
                    this.draggingStart = true;
                }
            };
            SourceWrapper.prototype.onPanMove = function (e) {
                var targetMap;
                var key;
                var targetWrapper;
                var draggingEvent;
                if (this.draggingStart) {
                    this.updateDraggedObjectPosition(e);
                    targetMap = this.dndManager._targetMap;
                    for (key in targetMap) {
                        targetWrapper = targetMap[key];
                        draggingEvent = new dnd.DnDDraggingEvent(e, targetWrapper.target, this.attactedObject);
                        targetWrapper.dragging(draggingEvent);
                    }
                }
            };
            SourceWrapper.prototype.onPanEnd = function (e) {
                var targetMap;
                var key;
                var targetWrapper;
                var dropEvent;
                if (this.draggingStart) {
                    targetMap = this.dndManager._targetMap;
                    for (key in targetMap) {
                        targetWrapper = targetMap[key];
                        dropEvent = new dnd.DnDDropEvent(e, targetWrapper.target, this.attactedObject);
                        targetWrapper.drop(dropEvent);
                        this.dragHandler.dragDropEnd();
                    }
                }
                this.onDragDropEnd();
            };
            SourceWrapper.prototype.onPanCancel = function (e) {
                this.dragHandler.dragDropEnd();
                this.onDragDropEnd();
            };
            SourceWrapper.prototype.onDragDropEnd = function () {
                this.dragEvent = null;
                if (this.draggedObject) {
                    this.draggedObject.destroy();
                    this.draggedObject.removeMe();
                    this.draggedObject = null;
                }
                this.draggedObjectOriginPoint.x = 0;
                this.draggedObjectOriginPoint.y = 0;
                this.draggingStart = false;
                this.attactedObject = null;
            };
            return SourceWrapper;
        })();
        var TargetWrapper = (function () {
            function TargetWrapper(target, dropHandler) {
                this.target = target;
                this.dropHandler = dropHandler;
                this.dropPossible = false;
            }
            TargetWrapper.prototype.dragging = function (event) {
                this.dropHandler.dragging(event);
                this.dropPossible = event.isDropPossible();
            };
            TargetWrapper.prototype.drop = function (event) {
                if (this.dropPossible) {
                    this.dropHandler.drop(event);
                }
            };
            return TargetWrapper;
        })();
    })(dnd = WOZLLA.dnd || (WOZLLA.dnd = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var math;
    (function (math) {
        /**
         * @class WOZLLA.math.Circle
         * a util class for circle
         */
        var Circle = (function () {
            function Circle(centerX, centerY, radius) {
                /**
                 * get or set centerX
                 * @property {number} centerX
                 */
                this.centerX = centerX;
                /**
                 * get or set centerY
                 * @property {number} centerY
                 */
                this.centerY = centerY;
                /**
                 * get or set radius
                 * @property {number} radius
                 */
                this.radius = radius;
            }
            /**
             * @method containsXY
             * @param x
             * @param y
             * @returns {boolean}
             */
            Circle.prototype.containsXY = function (x, y) {
                return Math.pow((x - this.centerX), 2) + Math.pow((y - this.centerY), 2) <= Math.pow(this.radius, 2);
            };
            /**
             * get simple description of this object
             * @returns {string}
             */
            Circle.prototype.toString = function () {
                return 'Circle[' + this.centerX + ',' + this.centerY + ',' + this.radius + ']';
            };
            return Circle;
        })();
        math.Circle = Circle;
    })(math = WOZLLA.math || (WOZLLA.math = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var math;
    (function (math) {
        /**
         * @class WOZLLA.math.Rectangle
         *  a utils class for rectangle, provider some math methods
         */
        var Rectangle = (function () {
            function Rectangle(x, y, width, height) {
                /**
                 * get or set x
                 * @property {number} x
                 */
                this.x = x;
                /**
                 * get or set y
                 * @property {number} y
                 */
                this.y = y;
                /**
                 * get or set width
                 * @property {number} width
                 */
                this.width = width;
                /**
                 * get or set height
                 * @property {number} height
                 */
                this.height = height;
            }
            Object.defineProperty(Rectangle.prototype, "left", {
                /**
                 * @property {number} left x
                 * @readonly
                 */
                get: function () { return this.x; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Rectangle.prototype, "right", {
                /**
                 * @property {number} right x+width
                 * @readonly
                 */
                get: function () { return this.x + this.width; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Rectangle.prototype, "top", {
                /**
                 * @property {number} top y
                 * @readonly
                 */
                get: function () { return this.y; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Rectangle.prototype, "bottom", {
                /**
                 * @property {number} bottom y+height
                 * @readonly
                 */
                get: function () { return this.y + this.height; },
                enumerable: true,
                configurable: true
            });
            Rectangle.prototype.set = function (x, y, width, height) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
            };
            Rectangle.prototype.setRectangle = function (rectangle) {
                this.x = rectangle.x;
                this.y = rectangle.y;
                this.width = rectangle.width;
                this.height = rectangle.height;
            };
            /**
             * @method containsXY
             * @param x
             * @param y
             * @returns {boolean}
             */
            Rectangle.prototype.containsXY = function (x, y) {
                return this.x <= x && this.right > x && this.y <= y && this.bottom > y;
            };
            /**
             * get simple description of this object
             * @returns {string}
             */
            Rectangle.prototype.toString = function () {
                return 'Rectangle[' + this.x + ',' + this.y + ',' + this.width + ',' + this.height + ']';
            };
            return Rectangle;
        })();
        math.Rectangle = Rectangle;
    })(math = WOZLLA.math || (WOZLLA.math = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var rendering;
    (function (rendering) {
        var RenderCommand = (function () {
            function RenderCommand(renderLayer, renderOrder, debugInfo) {
                this.renderLayer = renderLayer;
                this.renderOrder = renderOrder;
                this.debugInfo = debugInfo;
            }
            return RenderCommand;
        })();
        rendering.RenderCommand = RenderCommand;
    })(rendering = WOZLLA.rendering || (WOZLLA.rendering = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="RenderCommand.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var rendering;
    (function (rendering) {
        var TextureRegion = (function () {
            function TextureRegion() {
                this._x = 0;
                this._y = 0;
                this._width = 0;
                this._height = 0;
                this.rotate = TextureRegion.ROTATE_NONE;
                this.dirty = true;
            }
            Object.defineProperty(TextureRegion.prototype, "x", {
                get: function () {
                    return this._x;
                },
                set: function (value) {
                    if (value === this._x)
                        return;
                    this._x = value;
                    this.dirty = true;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TextureRegion.prototype, "y", {
                get: function () {
                    return this._y;
                },
                set: function (value) {
                    if (value === this._y)
                        return;
                    this._y = value;
                    this.dirty = true;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TextureRegion.prototype, "width", {
                get: function () {
                    return this._width;
                },
                set: function (value) {
                    if (value === this._width)
                        return;
                    this._width = value;
                    this.dirty = true;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TextureRegion.prototype, "height", {
                get: function () {
                    return this._height;
                },
                set: function (value) {
                    if (value === this._height)
                        return;
                    this._height = value;
                    this.dirty = true;
                },
                enumerable: true,
                configurable: true
            });
            TextureRegion.prototype.set = function (x, y, width, height) {
                this._x = x;
                this._y = y;
                this._width = width;
                this._height = height;
                this.dirty = true;
            };
            TextureRegion.ROTATE_NONE = 'none';
            TextureRegion.ROTATE_CLOCK = 'clock';
            TextureRegion.ROTATE_ANTI_CLOCK = 'anti-clock';
            return TextureRegion;
        })();
        rendering.TextureRegion = TextureRegion;
        var TextureOffset = (function () {
            function TextureOffset() {
                this._x = 0;
                this._y = 0;
                this.dirty = true;
            }
            Object.defineProperty(TextureOffset.prototype, "x", {
                get: function () {
                    return this._x;
                },
                set: function (value) {
                    if (value === this._x)
                        return;
                    this._x = value;
                    this.dirty = true;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TextureOffset.prototype, "y", {
                get: function () {
                    return this._y;
                },
                set: function (value) {
                    if (value === this._y)
                        return;
                    this._y = value;
                    this.dirty = true;
                },
                enumerable: true,
                configurable: true
            });
            return TextureOffset;
        })();
        rendering.TextureOffset = TextureOffset;
        var QuadCommand = (function (_super) {
            __extends(QuadCommand, _super);
            function QuadCommand(renderLayer, renderOrder, debugInfo) {
                _super.call(this, renderLayer, renderOrder, debugInfo);
                this._texture = null;
                this._textureRegion = new TextureRegion();
                this._textureOffset = new TextureOffset();
                this._color = 0xFFFFFF;
                this._alpha = 1;
                this._matrix = null;
                this._colorDirty = true;
                this._alphaDirty = true;
                this._textureDirty = true;
                this._matrixDirty = true;
            }
            Object.defineProperty(QuadCommand.prototype, "canRender", {
                get: function () {
                    return this._texture != void 0 && this._matrix != void 0 && this._alpha > 0;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QuadCommand.prototype, "dirty", {
                get: function () {
                    return this._textureDirty ||
                        this._textureRegion.dirty ||
                        this._colorDirty ||
                        this._textureOffset.dirty ||
                        this._matrixDirty;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QuadCommand.prototype, "texture", {
                get: function () {
                    return this._texture;
                },
                set: function (value) {
                    if (value === this._texture)
                        return;
                    this._texture = value;
                    this._textureDirty = true;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QuadCommand.prototype, "textureRegion", {
                get: function () {
                    return this._textureRegion;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QuadCommand.prototype, "textureOffset", {
                get: function () {
                    return this._textureOffset;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QuadCommand.prototype, "color", {
                get: function () {
                    return this._color;
                },
                set: function (value) {
                    if (value === this._color)
                        return;
                    this._color = value;
                    this._colorDirty = true;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QuadCommand.prototype, "matrix", {
                get: function () {
                    return this._matrix;
                },
                set: function (value) {
                    this._matrix = value;
                    this._matrixDirty = true;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QuadCommand.prototype, "alpha", {
                get: function () {
                    return this._alpha;
                },
                set: function (value) {
                    if (value === this._alpha)
                        return;
                    this._alpha = value;
                    this._alphaDirty = true;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QuadCommand.prototype, "textureDirty", {
                get: function () {
                    return this._textureDirty;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QuadCommand.prototype, "colorDirty", {
                get: function () {
                    return this._colorDirty;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QuadCommand.prototype, "matrixDirty", {
                get: function () {
                    return this._matrixDirty;
                },
                set: function (value) {
                    this._matrixDirty = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QuadCommand.prototype, "alphaDirty", {
                get: function () {
                    return this._alphaDirty;
                },
                enumerable: true,
                configurable: true
            });
            QuadCommand.prototype.clearDirty = function () {
                this._textureDirty =
                    this._textureRegion.dirty =
                        this._colorDirty =
                            this._textureOffset.dirty =
                                this._matrixDirty = false;
            };
            return QuadCommand;
        })(rendering.RenderCommand);
        rendering.QuadCommand = QuadCommand;
    })(rendering = WOZLLA.rendering || (WOZLLA.rendering = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../QuadCommand.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var rendering;
    (function (rendering) {
        var CanvasQuadCommand = (function (_super) {
            __extends(CanvasQuadCommand, _super);
            function CanvasQuadCommand() {
                _super.apply(this, arguments);
            }
            return CanvasQuadCommand;
        })(rendering.QuadCommand);
        rendering.CanvasQuadCommand = CanvasQuadCommand;
    })(rendering = WOZLLA.rendering || (WOZLLA.rendering = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var rendering;
    (function (rendering) {
        var Profiler = (function () {
            function Profiler() {
                this.drawCall = 0;
                this.fps = 0;
                this.lastTime = 0;
            }
            Profiler.getInstance = function () {
                if (!Profiler._instance) {
                    Profiler._instance = new Profiler();
                }
                return Profiler._instance;
            };
            Profiler.prototype.update = function () {
                if (!this.dom) {
                    this.dom = document.createElement('div');
                    this.dom.style.fontSize = '11px';
                    this.dom.style.position = 'absolute';
                    this.dom.style.zIndex = '999';
                    this.dom.style.top = 0;
                    this.dom.style.right = 0;
                    this.dom.style.backgroundColor = '#000000';
                    this.dom.style.color = '#FFFFFF';
                    document.body.appendChild(this.dom);
                }
                var now = Date.now();
                ;
                if (this.lastTime) {
                    this.fps = Math.floor(1000 / (now - this.lastTime));
                }
                this.lastTime = now;
                this.dom.innerHTML = this.fps + "," + this.drawCall;
            };
            return Profiler;
        })();
        rendering.Profiler = Profiler;
        /**
         * Renderer基类提供了以下基础功能：
         * 1. 渲染层次的管理
         * 2. 渲染命今的排序
         */
        var RenderContext = (function () {
            function RenderContext(view, viewport) {
                this.debug = false;
                this._layerIndexMap = {};
                this._sortedLayers = [];
                this._commandQueueMap = {};
                this._maskStack = [];
                this._view = view;
                this._viewport = viewport || {
                    x: 0,
                    y: 0,
                    width: view.width,
                    height: view.height
                };
                this.define(RenderContext.DEFAULT_LAYER, 0);
            }
            Object.defineProperty(RenderContext.prototype, "view", {
                get: function () { return this._view; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(RenderContext.prototype, "viewport", {
                get: function () { return this._viewport; },
                enumerable: true,
                configurable: true
            });
            RenderContext.prototype.setDebugTag = function (tag) {
                this.debugTag = tag;
            };
            RenderContext.prototype.printDebugRenderQueue = function () {
                if (this.debug) {
                    this.debugRenderQueue.forEach(function (info) {
                        console.log(info);
                    });
                }
            };
            RenderContext.prototype.createTexture = function (image) {
                return image;
            };
            RenderContext.prototype.updateTexture = function (image) {
                return image;
            };
            RenderContext.prototype.deleteTexture = function (image) {
            };
            RenderContext.prototype.addCommand = function (command) {
                var layer = command.renderLayer;
                var commandQueue = this._commandQueueMap[layer];
                if (!commandQueue) {
                    commandQueue = this._commandQueueMap[layer] = new CommandQueue(layer);
                }
                if (this.debug) {
                    command.debugInfo = this.debugTag;
                }
                commandQueue.add(command);
            };
            RenderContext.prototype.render = function () {
                var _this = this;
                if (this.debug) {
                    Profiler.getInstance().drawCall = 0;
                    this.debugRenderQueue = [];
                }
                this.eachCommand(function (command) {
                    if (_this.debug) {
                        try {
                            _this.executeCommand(command);
                        }
                        catch (e) {
                            if (command instanceof rendering.QuadCommand) {
                                WOZLLA.Log.error('execute command', command, "[" + (command.debugInfo || '') + "] " + command.texture.getDebugInfo());
                            }
                            WOZLLA.Log.error(e, e.stack);
                        }
                        if (_this.debug) {
                            if (command instanceof rendering.QuadCommand) {
                                _this.debugRenderQueue.push("  [" + (command.debugInfo || '') + "] [" + command.renderOrder + "] " + command.texture.getDebugInfo());
                            }
                            else {
                                _this.debugRenderQueue.push("  [" + (command.debugInfo || '') + "] [" + command.renderOrder + "] " + command.constructor.name);
                            }
                        }
                    }
                    else {
                        _this.executeCommand(command);
                    }
                });
                this.clearCommands();
                if (this.debug) {
                    Profiler.getInstance().update();
                }
            };
            RenderContext.prototype.updateViewport = function (viewport) {
                this.viewport.x = viewport.x;
                this.viewport.y = viewport.y;
                this.viewport.width = viewport.width;
                this.viewport.height = viewport.height;
            };
            RenderContext.prototype.createQuadCommand = function () {
                throw new Error('this is an abstract method');
            };
            RenderContext.prototype.createSpriteBatch = function (matrix) {
                return new rendering.SpriteBatch(this, matrix);
            };
            RenderContext.prototype.define = function (layer, zindex) {
                var _this = this;
                if (this._layerIndexMap[layer]) {
                    throw new Error('Layer has been defined: ' + layer);
                }
                this._layerIndexMap[layer] = zindex;
                this._sortedLayers.push(layer);
                this._sortedLayers.sort(function (a, b) {
                    return _this.getLayerZOrder(a) - _this.getLayerZOrder(b);
                });
            };
            RenderContext.prototype.undefine = function (layer) {
                this._sortedLayers.splice(this._sortedLayers.indexOf(layer), 1);
                delete this._layerIndexMap[layer];
            };
            RenderContext.prototype.getLayerZOrder = function (layer) {
                return this._layerIndexMap[layer];
            };
            RenderContext.prototype.getSortedLayers = function () {
                return this._sortedLayers.slice(0);
            };
            RenderContext.prototype.pushNormalMask = function (rect, renderLayer, renderOrder) {
                this._maskStack.push({
                    rect: rect,
                    renderLayer: renderLayer,
                    renderOrder: renderOrder
                });
                this.applyNormalMask(rect, renderLayer, renderOrder);
            };
            RenderContext.prototype.popupNormalMask = function () {
                this._maskStack.pop();
                var maskParams = this._maskStack[this._maskStack.length - 1];
                if (maskParams) {
                    this.applyNormalMask(maskParams.rect, maskParams.renderLayer, maskParams.renderOrder);
                }
                else {
                    this.cancelNormalMask();
                }
            };
            RenderContext.prototype.applyNormalMask = function (rect, renderLayer, renderOrder) {
                throw new Error('this is an abstract method');
            };
            RenderContext.prototype.cancelNormalMask = function () {
                throw new Error('this is an abstract method');
            };
            RenderContext.prototype.executeCommand = function (command) {
                throw new Error('this is an abstract method');
            };
            RenderContext.prototype.eachCommand = function (func) {
                var i, len, j, len2;
                var layer;
                var commandQueue;
                var zQueue;
                var command;
                var commandQueueMap = this._commandQueueMap;
                var layers = this._sortedLayers;
                for (i = 0, len = layers.length; i < len; i++) {
                    layer = layers[i];
                    commandQueue = commandQueueMap[layer];
                    if (this.debug) {
                        this.debugRenderQueue.push('[Layer] ' + layer);
                    }
                    if (commandQueue) {
                        if (!commandQueue.sorted) {
                            commandQueue.sort();
                        }
                        zQueue = commandQueue.negativeZQueue;
                        if (zQueue.length > 0) {
                            for (j = 0, len2 = zQueue.length; j < len2; j++) {
                                command = zQueue[j];
                                func(command);
                            }
                        }
                        zQueue = commandQueue.zeroZQueue;
                        if (zQueue.length > 0) {
                            for (j = 0, len2 = zQueue.length; j < len2; j++) {
                                command = zQueue[j];
                                func(command);
                            }
                        }
                        zQueue = commandQueue.positiveZQueue;
                        if (zQueue.length > 0) {
                            for (j = 0, len2 = zQueue.length; j < len2; j++) {
                                command = zQueue[j];
                                func(command);
                            }
                        }
                    }
                }
            };
            RenderContext.prototype.clearCommands = function () {
                var commandQueueMap = this._commandQueueMap;
                for (var layer in commandQueueMap) {
                    commandQueueMap[layer].clear();
                }
            };
            RenderContext.DEFAULT_LAYER = 'RendererDefaultLayer';
            return RenderContext;
        })();
        rendering.RenderContext = RenderContext;
        function compareCommandByRenderOrder(a, b) {
            if (a.renderOrder === b.renderOrder) {
                return a._addIndex - b._addIndex;
            }
            return a.renderOrder - b.renderOrder;
        }
        var CommandQueue = (function () {
            function CommandQueue(layer) {
                this.negativeZQueue = [];
                this.zeroZQueue = [];
                this.positiveZQueue = [];
                this.sorted = false;
                this._addIndex = 0;
                this.layer = layer;
            }
            CommandQueue.prototype.add = function (command) {
                command._addIndex = this._addIndex++;
                // TODO 根据renderOrder添加到指定位置代替简单的push，这样不需要排序会更好？
                if (command.renderOrder === 0) {
                    this.zeroZQueue.push(command);
                }
                else if (command.renderOrder > 0) {
                    this.positiveZQueue.push(command);
                }
                else {
                    this.negativeZQueue.push(command);
                }
                this.sorted = false;
            };
            CommandQueue.prototype.clear = function () {
                this.negativeZQueue.length = 0;
                this.zeroZQueue.length = 0;
                this.positiveZQueue.length = 0;
                this._addIndex = 0;
            };
            CommandQueue.prototype.sort = function () {
                if (this.sorted)
                    return;
                this.positiveZQueue.sort(compareCommandByRenderOrder);
                this.negativeZQueue.sort(compareCommandByRenderOrder);
                this.sorted = true;
            };
            return CommandQueue;
        })();
    })(rendering = WOZLLA.rendering || (WOZLLA.rendering = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../RenderContext.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var rendering;
    (function (rendering) {
        var CanvasRenderContext = (function (_super) {
            __extends(CanvasRenderContext, _super);
            function CanvasRenderContext(view) {
                _super.call(this, view);
                this._context2d = view.getContext('2d', {
                    antialias: true
                });
                rendering.canUseNewCanvasBlendModes = rendering.canUseNewCanvasBlendModes();
            }
            Object.defineProperty(CanvasRenderContext.prototype, "context2d", {
                get: function () {
                    return this._context2d;
                },
                enumerable: true,
                configurable: true
            });
            CanvasRenderContext.prototype.createQuadCommand = function () {
                return new rendering.CanvasQuadCommand(rendering.RenderContext.DEFAULT_LAYER, 0);
            };
            CanvasRenderContext.prototype.render = function () {
                var context = this._context2d;
                context.setTransform(1, 0, 0, 1, 0, 0);
                context.fillStyle = '#000000';
                context.fillRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height);
                _super.prototype.render.call(this);
            };
            CanvasRenderContext.prototype.applyNormalMask = function (rect, renderLayer, renderOrder) {
                var context = this._context2d;
                context.save();
                context.beginPath();
                context.rect(rect.x, rect.y, rect.width, rect.height);
                context.closePath();
                context.clip();
            };
            CanvasRenderContext.prototype.cancelNormalMask = function () {
                var context = this._context2d;
                context.restore();
            };
            CanvasRenderContext.prototype.executeCommand = function (command) {
                if (command instanceof rendering.QuadCommand) {
                    var context = this._context2d;
                    var texture = command.texture;
                    var textureRegion = command.textureRegion;
                    var offset = command.textureOffset;
                    var image;
                    context.globalAlpha = command.alpha;
                    context.setTransform(command.matrix.a, command.matrix.c, command.matrix.b, command.matrix.d, command.matrix.tx, command.matrix.ty);
                    if (command.color !== 0xFFFFFF) {
                        image = rendering.TextureTinter.tint(texture, textureRegion, command.color);
                    }
                    else {
                        image = texture.getSourceTexture();
                    }
                    context.drawImage(image, textureRegion.x, textureRegion.y, textureRegion.width, textureRegion.height, -offset.x * textureRegion.width, -offset.y * textureRegion.height, textureRegion.width, textureRegion.height);
                }
                else if (command instanceof rendering.CustomCommand) {
                    command.execute(this);
                }
            };
            return CanvasRenderContext;
        })(rendering.RenderContext);
        rendering.CanvasRenderContext = CanvasRenderContext;
        rendering.canUseNewCanvasBlendModes = function () {
            if (typeof document === 'undefined') {
                return false;
            }
            var pngHead = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABAQMAAADD8p2OAAAAA1BMVEX/';
            var pngEnd = 'AAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==';
            var magenta = new Image();
            magenta.src = pngHead + 'AP804Oa6' + pngEnd;
            var yellow = new Image();
            yellow.src = pngHead + '/wCKxvRF' + pngEnd;
            var canvas = document.createElement('canvas');
            canvas.width = 6;
            canvas.height = 1;
            var context = canvas.getContext('2d');
            context.globalCompositeOperation = 'multiply';
            context.drawImage(magenta, 0, 0);
            context.drawImage(yellow, 2, 0);
            var data = context.getImageData(2, 0, 1, 1).data;
            return (data[0] === 255 && data[1] === 0 && data[2] === 0);
        };
    })(rendering = WOZLLA.rendering || (WOZLLA.rendering = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var util;
    (function (util) {
        var _hasOwnProperty = Object.prototype.hasOwnProperty;
        var has = function (obj, prop) {
            return _hasOwnProperty.call(obj, prop);
        };
        var HashMap = (function () {
            function HashMap() {
                this._keyMap = {};
                this._valueMap = {};
                this._size = 0;
            }
            HashMap.prototype.containsKey = function (key) {
                return !!this.get(key);
            };
            HashMap.prototype.each = function (func) {
                for (var code in this._keyMap) {
                    if (has(this._keyMap, code)) {
                        func(this._keyMap[code], this._valueMap[code]);
                    }
                }
            };
            HashMap.prototype.keys = function () {
                var result = [];
                for (var code in this._keyMap) {
                    if (has(this._valueMap, code)) {
                        result.push(this._keyMap[code]);
                    }
                }
                return result;
            };
            HashMap.prototype.values = function () {
                var result = [];
                for (var code in this._valueMap) {
                    if (has(this._valueMap, code)) {
                        result.push(this._valueMap[code]);
                    }
                }
                return result;
            };
            HashMap.prototype.get = function (key) {
                var code = key.hashCode();
                return this._valueMap[code];
            };
            HashMap.prototype.remove = function (key) {
                var code = key.hashCode();
                var value = this._valueMap[code];
                if (value) {
                    delete this._valueMap[code];
                    delete this._keyMap[code];
                    this._size--;
                    return true;
                }
                return false;
            };
            HashMap.prototype.put = function (key, value) {
                var code = key.hashCode();
                var oldValue = this._valueMap[code];
                this._keyMap[code] = key;
                this._valueMap[code] = value;
                if (!oldValue) {
                    this._size++;
                }
            };
            HashMap.prototype.size = function () {
                return this._size;
            };
            HashMap.prototype.clear = function () {
                this._size = 0;
                this._keyMap = {};
                this._valueMap = {};
            };
            return HashMap;
        })();
        util.HashMap = HashMap;
    })(util = WOZLLA.util || (WOZLLA.util = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../../util/HashMap.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var rendering;
    (function (rendering) {
        var TextureTinter = (function () {
            function TextureTinter() {
            }
            TextureTinter.tint = function (texture, textureRegion, color) {
                var stringColor = '#' + ('00000' + (color | 0).toString(16)).substr(-6);
                var hashCode = texture.hashCode();
                var cacheKey = 'TextureTintCache_' + hashCode + '_' + stringColor;
                var cache = TextureTinter.tintTextureCache.get(cacheKey);
                if (cache) {
                    return cache;
                }
                //if(canUseNewCanvasBlendModes) {
                //    let canvas = createCanvas(1, 1);
                //    TextureTinter.tintWithMultiply(texture.getSourceTexture(), textureRegion, color, canvas);
                //    return canvas;
                //}
                return texture.getSourceTexture();
            };
            TextureTinter.tintWithMultiply = function (source, textureRegion, color, canvas) {
                var context = canvas.getContext('2d');
                var crop = textureRegion;
                canvas.width = crop.width;
                canvas.height = crop.height;
                context.fillStyle = '#' + ('00000' + (color | 0).toString(16)).substr(-6);
                context.fillRect(0, 0, crop.width, crop.height);
                context.globalCompositeOperation = 'multiply';
                context.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
                context.globalCompositeOperation = 'destination-atop';
                context.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
            };
            TextureTinter.tintTextureCache = new WOZLLA.util.HashMap();
            return TextureTinter;
        })();
        rendering.TextureTinter = TextureTinter;
    })(rendering = WOZLLA.rendering || (WOZLLA.rendering = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="RenderCommand.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var rendering;
    (function (rendering) {
        var CustomCommand = (function (_super) {
            __extends(CustomCommand, _super);
            function CustomCommand() {
                _super.apply(this, arguments);
            }
            CustomCommand.prototype.execute = function (renderer) {
                throw new Error('this is an abstract method');
            };
            return CustomCommand;
        })(rendering.RenderCommand);
        rendering.CustomCommand = CustomCommand;
    })(rendering = WOZLLA.rendering || (WOZLLA.rendering = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var rendering;
    (function (rendering) {
        var PushMaskCommand = (function (_super) {
            __extends(PushMaskCommand, _super);
            function PushMaskCommand() {
                _super.apply(this, arguments);
                this._rect = new WOZLLA.math.Rectangle(0, 0, 0, 0);
            }
            Object.defineProperty(PushMaskCommand.prototype, "rect", {
                get: function () {
                    return this._rect;
                },
                enumerable: true,
                configurable: true
            });
            PushMaskCommand.prototype.execute = function (renderer) {
                renderer.pushNormalMask(this._rect, this.renderLayer, this.renderOrder);
            };
            return PushMaskCommand;
        })(rendering.CustomCommand);
        rendering.PushMaskCommand = PushMaskCommand;
        var PopMaskCommand = (function (_super) {
            __extends(PopMaskCommand, _super);
            function PopMaskCommand() {
                _super.apply(this, arguments);
            }
            PopMaskCommand.prototype.execute = function (renderer) {
                renderer.popupNormalMask();
            };
            return PopMaskCommand;
        })(rendering.CustomCommand);
        rendering.PopMaskCommand = PopMaskCommand;
    })(rendering = WOZLLA.rendering || (WOZLLA.rendering = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var rendering;
    (function (rendering) {
        var SpriteBatch = (function () {
            function SpriteBatch(renderer, matrix) {
                this._alpha = 1;
                this._color = 0xFFFFFF;
                this._renderer = renderer;
                this._matrix = matrix || new WOZLLA.math.Matrix3x3();
                this._commands = [];
                this._unusedCommands = [];
            }
            SpriteBatch.prototype.setRenderLayer = function (layer) {
                this._renderLayer = layer;
            };
            SpriteBatch.prototype.setRenderOrder = function (order) {
                this._renderOrder = order;
            };
            SpriteBatch.prototype.getMatrix = function () {
                return this._matrix;
            };
            SpriteBatch.prototype.setMatrix = function (matrix) {
                this._matrix = matrix;
            };
            SpriteBatch.prototype.setAlpha = function (value) {
                this._alpha = value;
            };
            SpriteBatch.prototype.setColor = function (value) {
                this._color = value;
            };
            SpriteBatch.prototype.drawTexture = function (texture, sx, sy, sw, sh, x, y, w, h) {
                var argsLen = arguments.length;
                switch (argsLen) {
                    case 1:
                        this.drawTexture1(texture);
                        break;
                    case 3:
                        this.drawTexture3(texture, sx, sy);
                        break;
                    case 7:
                        this.drawTexture7(texture, sx, sy, sw, sh, x, y);
                        break;
                    case 9:
                        this.drawTexture9(texture, sx, sy, sw, sh, x, y, w, h);
                        break;
                    default:
                        WOZLLA.Log.error('the length of arguments of drawTexture is only accepting 1, 3, 7, 9 ');
                }
            };
            SpriteBatch.prototype.drawTexture1 = function (texture) {
                if (!this._matrix) {
                    WOZLLA.Log.error('Please set matrix firsit');
                    return;
                }
                var quadCmd = this.createQuadCommand();
                quadCmd.matrix = new WOZLLA.math.Matrix3x3();
                quadCmd.matrix.applyMatrix(this._matrix);
                quadCmd.texture = texture;
                quadCmd.alpha = this._alpha;
                quadCmd.color = this._color;
                quadCmd.textureRegion.set(0, 0, texture.getWidth(), texture.getHeight());
                this._commands.push(quadCmd);
            };
            SpriteBatch.prototype.drawTexture3 = function (texture, x, y) {
                if (!this._matrix) {
                    WOZLLA.Log.error('Please set matrix firsit');
                    return;
                }
                var quadCmd = this.createQuadCommand();
                quadCmd.matrix = new WOZLLA.math.Matrix3x3();
                quadCmd.matrix.applyMatrix(this._matrix);
                quadCmd.matrix.appendTransform(x, y);
                quadCmd.texture = texture;
                quadCmd.alpha = this._alpha;
                quadCmd.color = this._color;
                quadCmd.textureRegion.set(0, 0, texture.getWidth(), texture.getHeight());
                this._commands.push(quadCmd);
            };
            SpriteBatch.prototype.drawTexture7 = function (texture, sx, sy, sw, sh, x, y) {
                if (!this._matrix) {
                    WOZLLA.Log.error('Please set matrix firsit');
                    return;
                }
                var quadCmd = this.createQuadCommand();
                quadCmd.matrix = new WOZLLA.math.Matrix3x3();
                quadCmd.matrix.applyMatrix(this._matrix);
                quadCmd.matrix.appendTransform(x, y);
                quadCmd.texture = texture;
                quadCmd.alpha = this._alpha;
                quadCmd.color = this._color;
                quadCmd.textureRegion.set(sx, sy, sw, sh);
                this._commands.push(quadCmd);
            };
            SpriteBatch.prototype.drawTexture9 = function (texture, sx, sy, sw, sh, x, y, w, h) {
                if (!this._matrix) {
                    WOZLLA.Log.error('Please set matrix firsit');
                    return;
                }
                var quadCmd = this.createQuadCommand();
                quadCmd.matrix = new WOZLLA.math.Matrix3x3();
                quadCmd.matrix.applyMatrix(this._matrix);
                quadCmd.matrix.appendTransform(x, y, w / sw, h / sh);
                quadCmd.texture = texture;
                quadCmd.alpha = this._alpha;
                quadCmd.color = this._color;
                quadCmd.textureRegion.set(sx, sy, sw, sh);
                this._commands.push(quadCmd);
            };
            SpriteBatch.prototype.reset = function () {
                if (this._commands.length !== 0) {
                    this._commands.length = 0;
                    this._unusedCommands.concat(this._commands);
                }
            };
            SpriteBatch.prototype.render = function (renderer) {
                if (!this._matrix || this._commands.length === 0) {
                    return;
                }
                for (var _i = 0, _a = this._commands; _i < _a.length; _i++) {
                    var command = _a[_i];
                    command.renderLayer = this._renderLayer;
                    command.renderOrder = this._renderOrder;
                    renderer.addCommand(command);
                }
            };
            SpriteBatch.prototype.createQuadCommand = function () {
                return this._unusedCommands.shift() || this._renderer.createQuadCommand();
            };
            return SpriteBatch;
        })();
        rendering.SpriteBatch = SpriteBatch;
    })(rendering = WOZLLA.rendering || (WOZLLA.rendering = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var rendering;
    (function (rendering) {
        var QuadType = (function () {
            function QuadType(info) {
                this._info = info;
            }
            Object.defineProperty(QuadType.prototype, "size", {
                get: function () { return this.strade * 4; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QuadType.prototype, "strade", {
                get: function () { return this._info[0]; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QuadType.prototype, "vertexIndex", {
                get: function () { return this._info[1]; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QuadType.prototype, "texCoordIndex", {
                get: function () { return this._info[2]; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QuadType.prototype, "alphaIndex", {
                get: function () { return this._info[3]; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QuadType.prototype, "colorIndex", {
                get: function () { return this._info[4]; },
                enumerable: true,
                configurable: true
            });
            return QuadType;
        })();
        rendering.QuadType = QuadType;
        var Quad = (function () {
            function Quad(count, type) {
                if (type === void 0) { type = Quad.V2T2C1A1; }
                this._count = count;
                this._type = type;
                this._storage = new Array(type.size * count);
                this._renderOffset = 0;
                this._renderCount = count;
            }
            Object.defineProperty(Quad.prototype, "storage", {
                get: function () { return this._storage; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Quad.prototype, "count", {
                get: function () { return this._count; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Quad.prototype, "type", {
                get: function () { return this._type; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Quad.prototype, "renderOffset", {
                get: function () { return this._renderOffset; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Quad.prototype, "renderCount", {
                get: function () { return this._renderCount; },
                enumerable: true,
                configurable: true
            });
            Quad.prototype.setRenderRange = function (offset, count) {
                this._renderOffset = offset;
                this._renderCount = count;
            };
            Quad.prototype.setVertices = function (x1, y1, x2, y2, x3, y3, x4, y4, offset) {
                if (offset === void 0) { offset = 0; }
                var strade = this._type.strade;
                var size = this._type.size;
                var index = this._type.vertexIndex;
                var base = size * offset + index;
                this._storage[0 + base] = x1;
                this._storage[1 + base] = y1;
                this._storage[0 + base + strade * 1] = x2;
                this._storage[1 + base + strade * 1] = y2;
                this._storage[0 + base + strade * 2] = x3;
                this._storage[1 + base + strade * 2] = y3;
                this._storage[0 + base + strade * 3] = x4;
                this._storage[1 + base + strade * 3] = y4;
            };
            Quad.prototype.setTexCoords = function (x1, y1, x2, y2, x3, y3, x4, y4, offset) {
                if (offset === void 0) { offset = 0; }
                var strade = this._type.strade;
                var size = this._type.size;
                var index = this._type.texCoordIndex;
                var base = size * offset + index;
                this._storage[0 + base] = x1;
                this._storage[1 + base] = y1;
                this._storage[0 + base + strade * 1] = x2;
                this._storage[1 + base + strade * 1] = y2;
                this._storage[0 + base + strade * 2] = x3;
                this._storage[1 + base + strade * 2] = y3;
                this._storage[0 + base + strade * 3] = x4;
                this._storage[1 + base + strade * 3] = y4;
            };
            Quad.prototype.setAlpha = function (alpha, offset) {
                if (offset === void 0) { offset = 0; }
                var strade = this._type.strade;
                var size = this._type.size;
                var index = this._type.alphaIndex;
                var base = size * offset + index;
                this._storage[base] = alpha;
                this._storage[base + strade * 1] = alpha;
                this._storage[base + strade * 2] = alpha;
                this._storage[base + strade * 3] = alpha;
            };
            Quad.prototype.setColor = function (color, offset) {
                if (offset === void 0) { offset = 0; }
                var strade = this._type.strade;
                var size = this._type.size;
                var index = this._type.colorIndex;
                var base = size * offset + index;
                this._storage[base] = color;
                this._storage[base + strade * 1] = color;
                this._storage[base + strade * 2] = color;
                this._storage[base + strade * 3] = color;
            };
            Quad.V2T2C1A1 = new QuadType([6, 0, 2, 4, 5]);
            return Quad;
        })();
        rendering.Quad = Quad;
    })(rendering = WOZLLA.rendering || (WOZLLA.rendering = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var rendering;
    (function (rendering) {
        var QuadBatch = (function () {
            function QuadBatch(renderer) {
                this._size = 500;
                this._curVertexIndex = 0;
                this._curBatchSize = 0;
                this._locations = {};
                this._renderer = renderer;
                this._initBuffers();
                this._initProgram();
                this._initLocaitions();
                this._initUniforms();
            }
            QuadBatch.prototype.bindTexture = function (texture) {
                var gl = this._renderer.gl;
                gl.bindTexture(gl.TEXTURE_2D, texture.getSourceTexture());
            };
            QuadBatch.prototype.begin = function () {
                var gl = this._renderer.gl;
                gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
                gl.useProgram(this._compiledProgram.program);
                gl.activeTexture(gl.TEXTURE0);
                var stride = rendering.Quad.V2T2C1A1.strade * 4;
                gl.vertexAttribPointer(this._locations.aVertexPosition, 2, gl.FLOAT, false, stride, 0);
                gl.vertexAttribPointer(this._locations.aTextureCoord, 2, gl.FLOAT, false, stride, 2 * 4);
                gl.vertexAttribPointer(this._locations.aColor, 2, gl.FLOAT, false, stride, 4 * 4);
                gl.enableVertexAttribArray(this._locations.aVertexPosition);
                gl.enableVertexAttribArray(this._locations.aTextureCoord);
                gl.enableVertexAttribArray(this._locations.aColor);
            };
            QuadBatch.prototype.end = function () {
                var gl = this._renderer.gl;
                gl.disableVertexAttribArray(this._locations.aVertexPosition);
                gl.disableVertexAttribArray(this._locations.aTextureCoord);
                gl.disableVertexAttribArray(this._locations.aColor);
                gl.bindTexture(gl.TEXTURE_2D, null);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            };
            QuadBatch.prototype.canFill = function (quad) {
                return this._curVertexIndex + quad.type.size < this._vertices.length;
            };
            QuadBatch.prototype.fillQuad = function (quad) {
                var vertexIndex, storage;
                var vertices = this._vertices;
                vertexIndex = this._curVertexIndex;
                if (quad.count === quad.renderCount) {
                    vertices.set(quad.storage, vertexIndex);
                }
                else {
                    var j = 0;
                    var i = quad.renderOffset * quad.type.size;
                    var len = quad.renderCount * quad.type.size;
                    storage = quad.storage;
                    for (; j < len; i++, j++) {
                        vertices[vertexIndex + j] = storage[i];
                    }
                }
                this._curVertexIndex += quad.renderCount * quad.type.size;
                this._curBatchSize += quad.renderCount;
            };
            QuadBatch.prototype.flush = function () {
                if (this._curBatchSize === 0) {
                    return;
                }
                var gl = this._renderer.gl;
                gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.DYNAMIC_DRAW);
                gl.drawElements(gl.TRIANGLES, this._curBatchSize * 6, gl.UNSIGNED_SHORT, 0);
                this._curVertexIndex = 0;
                this._curBatchSize = 0;
                rendering.Profiler.getInstance().drawCall++;
            };
            QuadBatch.prototype.onUpdateViewport = function () {
                this._initUniforms();
            };
            QuadBatch.prototype._initBuffers = function () {
                var i, j;
                var gl = this._renderer.gl;
                var numVerts = this._size * 4 * 6;
                var numIndices = this._size * 6;
                this._vertices = new Float32Array(numVerts);
                this._indices = new Uint16Array(numIndices);
                for (i = 0, j = 0; i < numIndices; i += 6, j += 4) {
                    this._indices[i] = j;
                    this._indices[i + 1] = j + 1;
                    this._indices[i + 2] = j + 2;
                    this._indices[i + 3] = j;
                    this._indices[i + 4] = j + 2;
                    this._indices[i + 5] = j + 3;
                }
                // create a couple of buffers
                this._vertexBuffer = gl.createBuffer();
                this._indexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.DYNAMIC_DRAW);
            };
            QuadBatch.prototype._initProgram = function () {
                var gl = this._renderer.gl;
                this._compiledProgram = rendering.WebGLUtils.compileProgram(gl, QuadBatch.VERTEX_SOURCE, QuadBatch.FRAGMENT_SOURCE);
            };
            QuadBatch.prototype._initLocaitions = function () {
                var gl = this._renderer.gl;
                var program = this._compiledProgram.program;
                this._locations.uSampler = gl.getUniformLocation(program, 'uSampler');
                this._locations.projectionVector = gl.getUniformLocation(program, 'projectionVector');
                this._locations.offsetVector = gl.getUniformLocation(program, 'offsetVector');
                this._locations.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
                this._locations.aTextureCoord = gl.getAttribLocation(program, 'aTextureCoord');
                this._locations.aColor = gl.getAttribLocation(program, 'aColor');
            };
            QuadBatch.prototype._initUniforms = function () {
                var gl = this._renderer.gl;
                gl.useProgram(this._compiledProgram.program);
                gl.uniform2f(this._locations.projectionVector, this._renderer.viewport.width / 2, -this._renderer.viewport.height / 2);
            };
            QuadBatch.VERTEX_SOURCE = [
                'attribute vec2 aVertexPosition;\n',
                'attribute vec2 aTextureCoord;\n',
                'attribute vec2 aColor;\n',
                'uniform vec2 projectionVector;\n',
                'uniform vec2 offsetVector;\n',
                'varying vec2 vTextureCoord;\n',
                'varying vec4 vColor;\n',
                'const vec2 center = vec2(-1.0, 1.0);\n',
                'void main(void) {\n',
                'gl_Position = vec4( ((aVertexPosition + offsetVector) / projectionVector) + center , 0.0, 1.0);\n',
                'vTextureCoord = aTextureCoord;\n',
                'vec3 color = mod(vec3(aColor.y/65536.0, aColor.y/256.0, aColor.y), 256.0) / 256.0;\n',
                'vColor = vec4(color * aColor.x, aColor.x);\n',
                '}'
            ].join('');
            QuadBatch.FRAGMENT_SOURCE = [
                'precision mediump float;\n',
                'varying vec2 vTextureCoord;\n',
                'varying vec4 vColor;\n',
                'uniform sampler2D uSampler;\n',
                'void main(void) {\n',
                'gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;\n',
                '}'
            ].join('');
            return QuadBatch;
        })();
        rendering.QuadBatch = QuadBatch;
    })(rendering = WOZLLA.rendering || (WOZLLA.rendering = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../QuadCommand.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var rendering;
    (function (rendering) {
        var WebGLQuadCommand = (function (_super) {
            __extends(WebGLQuadCommand, _super);
            function WebGLQuadCommand() {
                _super.apply(this, arguments);
                this._computedUVS = {
                    x0: 0,
                    y0: 0,
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 0,
                    x3: 0,
                    y3: 0
                };
            }
            Object.defineProperty(WebGLQuadCommand.prototype, "quad", {
                get: function () {
                    if (!this._quad) {
                        this._quad = new rendering.Quad(1);
                    }
                    return this._quad;
                },
                enumerable: true,
                configurable: true
            });
            WebGLQuadCommand.prototype.update = function () {
                var uvsUpdateRequired = this.textureDirty || this.textureRegion.dirty;
                var quadVerticeUpdateRequired = uvsUpdateRequired || this.matrixDirty;
                var quadColorUpdateRequired = this.colorDirty;
                var quadAlphaUpdateRequired = this.alphaDirty;
                if (!this._quad) {
                    this._quad = new rendering.Quad(1);
                }
                if (uvsUpdateRequired) {
                    var uvs = this._computedUVS;
                    this._updateUVS();
                    this._quad.setTexCoords(uvs.x0, uvs.y0, uvs.x1, uvs.y1, uvs.x2, uvs.y2, uvs.x3, uvs.y3, 0);
                }
                if (quadVerticeUpdateRequired) {
                    var matrix = this.matrix;
                    var offset = this.textureOffset;
                    var region = this.textureRegion;
                    var a = matrix.a;
                    var c = matrix.c;
                    var b = matrix.b;
                    var d = matrix.d;
                    var tx = matrix.tx;
                    var ty = matrix.ty;
                    var w1 = -offset.x * region.width;
                    var w0 = w1 + region.width;
                    var h1 = -offset.y * region.height;
                    var h0 = h1 + region.height;
                    var x1 = a * w1 + b * h1 + tx;
                    var y1 = d * h1 + c * w1 + ty;
                    var x2 = a * w0 + b * h1 + tx;
                    var y2 = d * h1 + c * w0 + ty;
                    var x3 = a * w0 + b * h0 + tx;
                    var y3 = d * h0 + c * w0 + ty;
                    var x4 = a * w1 + b * h0 + tx;
                    var y4 = d * h0 + c * w1 + ty;
                    this._quad.setVertices(x1, y1, x2, y2, x3, y3, x4, y4, 0);
                }
                if (quadColorUpdateRequired) {
                    this._quad.setColor(this.color);
                }
                if (quadAlphaUpdateRequired) {
                    this._quad.setAlpha(this.alpha);
                }
                this.clearDirty();
            };
            WebGLQuadCommand.prototype._updateUVS = function () {
                var uvs = this._computedUVS;
                var region = this.textureRegion;
                var tw = this.texture.getWidth();
                var th = this.texture.getHeight();
                switch (region.rotate) {
                    case rendering.TextureRegion.ROTATE_ANTI_CLOCK:
                        uvs.x1 = region.x / tw;
                        uvs.y1 = region.y / th;
                        uvs.x2 = (region.x + region.height) / tw;
                        uvs.y2 = region.y / th;
                        uvs.x3 = (region.x + region.height) / tw;
                        uvs.y3 = (region.y + region.width) / th;
                        uvs.x0 = region.x / tw;
                        uvs.y0 = (region.y + region.width) / th;
                        break;
                    case rendering.TextureRegion.ROTATE_CLOCK:
                        uvs.x3 = region.x / tw;
                        uvs.y3 = region.y / th;
                        uvs.x0 = (region.x + region.height) / tw;
                        uvs.y0 = region.y / th;
                        uvs.x1 = (region.x + region.height) / tw;
                        uvs.y1 = (region.y + region.width) / th;
                        uvs.x2 = region.x / tw;
                        uvs.y2 = (region.y + region.width) / th;
                        break;
                    default:
                        uvs.x0 = region.x / tw;
                        uvs.y0 = region.y / th;
                        uvs.x1 = (region.x + region.width) / tw;
                        uvs.y1 = region.y / th;
                        uvs.x2 = (region.x + region.width) / tw;
                        uvs.y2 = (region.y + region.height) / th;
                        uvs.x3 = region.x / tw;
                        uvs.y3 = (region.y + region.height) / th;
                }
            };
            return WebGLQuadCommand;
        })(rendering.QuadCommand);
        rendering.WebGLQuadCommand = WebGLQuadCommand;
    })(rendering = WOZLLA.rendering || (WOZLLA.rendering = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../RenderContext.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var rendering;
    (function (rendering) {
        var WebGLRenderContext = (function (_super) {
            __extends(WebGLRenderContext, _super);
            function WebGLRenderContext(view) {
                _super.call(this, view);
                var gl = this._gl = rendering.WebGLUtils.getGLContext(view);
                gl.disable(gl.DEPTH_TEST);
                gl.disable(gl.CULL_FACE);
                gl.enable(gl.BLEND);
                gl.colorMask(true, true, true, true);
                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                this._quadBatch = new rendering.QuadBatch(this);
            }
            Object.defineProperty(WebGLRenderContext.prototype, "gl", {
                get: function () { return this._gl; },
                enumerable: true,
                configurable: true
            });
            WebGLRenderContext.prototype.createQuadCommand = function () {
                return new rendering.WebGLQuadCommand(rendering.RenderContext.DEFAULT_LAYER, 0);
            };
            WebGLRenderContext.prototype.render = function () {
                var gl = this._gl;
                gl.viewport(0, 0, this.viewport.width, this.viewport.height);
                if (!this.bgColor) {
                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                }
                else {
                    gl.clearColor(this.bgColor[0], this.bgColor[1], this.bgColor[2], this.bgColor[3]);
                }
                gl.clear(gl.COLOR_BUFFER_BIT);
                _super.prototype.render.call(this);
                if (this._lasCommand instanceof rendering.QuadCommand) {
                    this._quadBatch.flush();
                    this._quadBatch.end();
                }
                this._bindingTexture = null;
                this._lasCommand = null;
            };
            WebGLRenderContext.prototype.updateViewport = function (viewport) {
                _super.prototype.updateViewport.call(this, viewport);
                this._quadBatch.onUpdateViewport();
            };
            WebGLRenderContext.prototype.createTexture = function (image) {
                return rendering.WebGLUtils.generateWebGLTexture(this._gl, image);
            };
            WebGLRenderContext.prototype.updateTexture = function (image) {
                return rendering.WebGLUtils.updateWebGLTexture(this._gl, image);
            };
            WebGLRenderContext.prototype.deleteTexture = function (image) {
                rendering.WebGLUtils.deleteWebGLTexture(this._gl, image);
            };
            WebGLRenderContext.prototype.applyNormalMask = function (rect, renderLayer, renderOrder) {
                var gl = this._gl;
                var viewport = this.viewport;
                gl.enable(gl.SCISSOR_TEST);
                gl.scissor(rect.x, viewport.height - rect.y - rect.height, rect.width, rect.height);
            };
            WebGLRenderContext.prototype.cancelNormalMask = function () {
                var gl = this._gl;
                gl.disable(gl.SCISSOR_TEST);
            };
            WebGLRenderContext.prototype.executeCommand = function (command) {
                var lastCommand = this._lasCommand;
                if (command instanceof rendering.QuadCommand) {
                    if (!lastCommand || !(lastCommand instanceof rendering.QuadCommand)) {
                        this._quadBatch.begin();
                    }
                    if (!this._bindingTexture) {
                        this._quadBatch.bindTexture(command.texture);
                        this._bindingTexture = command.texture;
                    }
                    else if (this._bindingTexture.getSourceTexture() !== command.texture.getSourceTexture()) {
                        this._quadBatch.flush();
                        this._quadBatch.bindTexture(command.texture);
                        this._bindingTexture = command.texture;
                    }
                    var webglQuadCommand = command;
                    if (webglQuadCommand.canRender) {
                        if (webglQuadCommand.dirty) {
                            webglQuadCommand.update();
                        }
                        if (this._quadBatch.canFill(webglQuadCommand.quad)) {
                            this._quadBatch.fillQuad(webglQuadCommand.quad);
                        }
                        else {
                            this._quadBatch.flush();
                            this._quadBatch.fillQuad(webglQuadCommand.quad);
                        }
                    }
                }
                else if (command instanceof rendering.CustomCommand) {
                    if (this._lasCommand instanceof rendering.QuadCommand) {
                        this._quadBatch.flush();
                        this._quadBatch.end();
                    }
                    this._bindingTexture = null;
                    command.execute(this);
                }
                else {
                    // doesn't support other comand
                    return;
                }
                this._lasCommand = command;
            };
            return WebGLRenderContext;
        })(rendering.RenderContext);
        rendering.WebGLRenderContext = WebGLRenderContext;
    })(rendering = WOZLLA.rendering || (WOZLLA.rendering = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var rendering;
    (function (rendering) {
        function isPowerOf2(num) {
            return (num & (num - 1)) === 0;
        }
        rendering.isPowerOf2 = isPowerOf2;
        function applyProperties(target, source) {
            for (var i in source) {
                if (typeof target[i] === 'undefined') {
                    target[i] = source[i];
                }
            }
            return target;
        }
        var WebGLUtils = (function () {
            function WebGLUtils() {
            }
            WebGLUtils.getGLContext = function (canvas, options) {
                var gl;
                options = applyProperties(options || {}, {
                    alpha: true,
                    antialias: true,
                    premultipliedAlpha: true,
                    stencil: true
                });
                try {
                    gl = canvas.getContext('experimental-webgl', options);
                }
                catch (e) {
                    try {
                        gl = canvas.getContext('webgl', options);
                    }
                    catch (e2) { }
                }
                return gl;
            };
            WebGLUtils.compileShader = function (gl, shaderType, shaderSrc) {
                var src = shaderSrc;
                var shader = gl.createShader(shaderType);
                gl.shaderSource(shader, src);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    throw new Error(gl.getShaderInfoLog(shader));
                }
                return shader;
            };
            WebGLUtils.compileProgram = function (gl, vertexSrc, fragmentSrc) {
                var vertexShader = WebGLUtils.compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
                var fragmentShader = WebGLUtils.compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);
                var shaderProgram = gl.createProgram();
                gl.attachShader(shaderProgram, vertexShader);
                gl.attachShader(shaderProgram, fragmentShader);
                gl.linkProgram(shaderProgram);
                if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                    throw new Error("Could not initialise program");
                }
                return {
                    program: shaderProgram,
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader
                };
            };
            WebGLUtils.updateWebGLTexture = function (gl, image) {
                var textureId;
                if (!image._webGLTextureId) {
                    textureId = gl.createTexture();
                }
                else {
                    textureId = image._webGLTextureId;
                }
                gl.bindTexture(gl.TEXTURE_2D, textureId);
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                }
                else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                }
                gl.bindTexture(gl.TEXTURE_2D, null);
                image._webGLTextureId = textureId;
                // for CocoonJS
                image.dispose && image.dispose();
                return textureId;
            };
            WebGLUtils.generateWebGLTexture = function (gl, image) {
                if (image._webGLTextureId) {
                    return image._webGLTextureId;
                }
                return WebGLUtils.updateWebGLTexture(gl, image);
            };
            WebGLUtils.deleteWebGLTexture = function (gl, image) {
                if (image._webGLTextureId) {
                    gl.deleteTexture(image._webGLTextureId);
                }
            };
            return WebGLUtils;
        })();
        rendering.WebGLUtils = WebGLUtils;
    })(rendering = WOZLLA.rendering || (WOZLLA.rendering = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var spine;
    (function (spine_1) {
        /******************************************************************************
         * Spine Runtimes Software License
         * Version 2.1
         *
         * Copyright (c) 2013, Esoteric Software
         * All rights reserved.
         *
         * You are granted a perpetual, non-exclusive, non-sublicensable and
         * non-transferable license to install, execute and perform the Spine Runtimes
         * Software (the "Software") solely for internal use. Without the written
         * permission of Esoteric Software (typically granted by licensing Spine), you
         * may not (a) modify, translate, adapt or otherwise create derivative works,
         * improvements of the Software or develop new applications using the Software
         * or (b) remove, delete, alter or obscure any trademarks or any copyright,
         * trademark, patent or other intellectual property or proprietary rights
         * notices on or in the Software, including any copy thereof. Redistributions
         * in binary or source form must include this license and terms.
         *
         * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE "AS IS" AND ANY EXPRESS OR
         * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
         * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
         * EVENT SHALL ESOTERIC SOFTARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
         * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
         * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
         * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
         * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
         * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
         * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
         *****************************************************************************/
        var spine = {
            radDeg: 180 / Math.PI,
            degRad: Math.PI / 180,
            temp: [],
            Float32Array: (typeof (Float32Array) === 'undefined') ? Array : Float32Array,
            Uint16Array: (typeof (Uint16Array) === 'undefined') ? Array : Uint16Array
        };
        spine_1.runtime = spine;
        spine.BoneData = function (name, parent) {
            this.name = name;
            this.parent = parent;
        };
        spine.BoneData.prototype = {
            length: 0,
            x: 0, y: 0,
            rotation: 0,
            scaleX: 1, scaleY: 1,
            inheritScale: true,
            inheritRotation: true,
            flipX: false, flipY: false
        };
        spine.BlendMode = {
            normal: 0,
            additive: 1,
            multiply: 2,
            screen: 3
        };
        spine.SlotData = function (name, boneData) {
            this.name = name;
            this.boneData = boneData;
        };
        spine.SlotData.prototype = {
            r: 1, g: 1, b: 1, a: 1,
            attachmentName: null,
            blendMode: spine.BlendMode.normal
        };
        spine.IkConstraintData = function (name) {
            this.name = name;
            this.bones = [];
        };
        spine.IkConstraintData.prototype = {
            target: null,
            bendDirection: 1,
            mix: 1
        };
        spine.Bone = function (boneData, skeleton, parent) {
            this.data = boneData;
            this.skeleton = skeleton;
            this.parent = parent;
            this.setToSetupPose();
        };
        spine.Bone.yDown = false;
        spine.Bone.prototype = {
            x: 0, y: 0,
            rotation: 0, rotationIK: 0,
            scaleX: 1, scaleY: 1,
            flipX: false, flipY: false,
            m00: 0, m01: 0, worldX: 0,
            m10: 0, m11: 0, worldY: 0,
            worldRotation: 0,
            worldScaleX: 1, worldScaleY: 1,
            worldFlipX: false, worldFlipY: false,
            updateWorldTransform: function () {
                var parent = this.parent;
                if (parent) {
                    this.worldX = this.x * parent.m00 + this.y * parent.m01 + parent.worldX;
                    this.worldY = this.x * parent.m10 + this.y * parent.m11 + parent.worldY;
                    if (this.data.inheritScale) {
                        this.worldScaleX = parent.worldScaleX * this.scaleX;
                        this.worldScaleY = parent.worldScaleY * this.scaleY;
                    }
                    else {
                        this.worldScaleX = this.scaleX;
                        this.worldScaleY = this.scaleY;
                    }
                    this.worldRotation = this.data.inheritRotation ? (parent.worldRotation + this.rotationIK) : this.rotationIK;
                    this.worldFlipX = parent.worldFlipX != this.flipX;
                    this.worldFlipY = parent.worldFlipY != this.flipY;
                }
                else {
                    var skeletonFlipX = this.skeleton.flipX, skeletonFlipY = this.skeleton.flipY;
                    this.worldX = skeletonFlipX ? -this.x : this.x;
                    this.worldY = (skeletonFlipY != spine.Bone.yDown) ? -this.y : this.y;
                    this.worldScaleX = this.scaleX;
                    this.worldScaleY = this.scaleY;
                    this.worldRotation = this.rotationIK;
                    this.worldFlipX = skeletonFlipX != this.flipX;
                    this.worldFlipY = skeletonFlipY != this.flipY;
                }
                var radians = this.worldRotation * spine.degRad;
                var cos = Math.cos(radians);
                var sin = Math.sin(radians);
                if (this.worldFlipX) {
                    this.m00 = -cos * this.worldScaleX;
                    this.m01 = sin * this.worldScaleY;
                }
                else {
                    this.m00 = cos * this.worldScaleX;
                    this.m01 = -sin * this.worldScaleY;
                }
                if (this.worldFlipY != spine.Bone.yDown) {
                    this.m10 = -sin * this.worldScaleX;
                    this.m11 = -cos * this.worldScaleY;
                }
                else {
                    this.m10 = sin * this.worldScaleX;
                    this.m11 = cos * this.worldScaleY;
                }
            },
            setToSetupPose: function () {
                var data = this.data;
                this.x = data.x;
                this.y = data.y;
                this.rotation = data.rotation;
                this.rotationIK = this.rotation;
                this.scaleX = data.scaleX;
                this.scaleY = data.scaleY;
                this.flipX = data.flipX;
                this.flipY = data.flipY;
            },
            worldToLocal: function (world) {
                var dx = world[0] - this.worldX, dy = world[1] - this.worldY;
                var m00 = this.m00, m10 = this.m10, m01 = this.m01, m11 = this.m11;
                if (this.worldFlipX != (this.worldFlipY != spine.Bone.yDown)) {
                    m00 = -m00;
                    m11 = -m11;
                }
                var invDet = 1 / (m00 * m11 - m01 * m10);
                world[0] = dx * m00 * invDet - dy * m01 * invDet;
                world[1] = dy * m11 * invDet - dx * m10 * invDet;
            },
            localToWorld: function (local) {
                var localX = local[0], localY = local[1];
                local[0] = localX * this.m00 + localY * this.m01 + this.worldX;
                local[1] = localX * this.m10 + localY * this.m11 + this.worldY;
            }
        };
        spine.Slot = function (slotData, bone) {
            this.data = slotData;
            this.bone = bone;
            this.setToSetupPose();
        };
        spine.Slot.prototype = {
            r: 1, g: 1, b: 1, a: 1,
            _attachmentTime: 0,
            attachment: null,
            attachmentVertices: [],
            setAttachment: function (attachment) {
                this.attachment = attachment;
                this._attachmentTime = this.bone.skeleton.time;
                this.attachmentVertices.length = 0;
            },
            setAttachmentTime: function (time) {
                this._attachmentTime = this.bone.skeleton.time - time;
            },
            getAttachmentTime: function () {
                return this.bone.skeleton.time - this._attachmentTime;
            },
            setToSetupPose: function () {
                var data = this.data;
                this.r = data.r;
                this.g = data.g;
                this.b = data.b;
                this.a = data.a;
                var slotDatas = this.bone.skeleton.data.slots;
                for (var i = 0, n = slotDatas.length; i < n; i++) {
                    if (slotDatas[i] == data) {
                        this.setAttachment(!data.attachmentName ? null : this.bone.skeleton.getAttachmentBySlotIndex(i, data.attachmentName));
                        break;
                    }
                }
            }
        };
        spine.IkConstraint = function (data, skeleton) {
            this.data = data;
            this.mix = data.mix;
            this.bendDirection = data.bendDirection;
            this.bones = [];
            for (var i = 0, n = data.bones.length; i < n; i++)
                this.bones.push(skeleton.findBone(data.bones[i].name));
            this.target = skeleton.findBone(data.target.name);
        };
        spine.IkConstraint.prototype = {
            apply: function () {
                var target = this.target;
                var bones = this.bones;
                switch (bones.length) {
                    case 1:
                        spine.IkConstraint.apply1(bones[0], target.worldX, target.worldY, this.mix);
                        break;
                    case 2:
                        spine.IkConstraint.apply2(bones[0], bones[1], target.worldX, target.worldY, this.bendDirection, this.mix);
                        break;
                }
            }
        };
        /** Adjusts the bone rotation so the tip is as close to the target position as possible. The target is specified in the world
         * coordinate system. */
        spine.IkConstraint.apply1 = function (bone, targetX, targetY, alpha) {
            var parentRotation = (!bone.data.inheritRotation || !bone.parent) ? 0 : bone.parent.worldRotation;
            var rotation = bone.rotation;
            var rotationIK = Math.atan2(targetY - bone.worldY, targetX - bone.worldX) * spine.radDeg;
            if (bone.worldFlipX != (bone.worldFlipY != spine.Bone.yDown))
                rotationIK = -rotationIK;
            rotationIK -= parentRotation;
            bone.rotationIK = rotation + (rotationIK - rotation) * alpha;
        };
        /** Adjusts the parent and child bone rotations so the tip of the child is as close to the target position as possible. The
         * target is specified in the world coordinate system.*/
        spine.IkConstraint.apply2 = function (parent, child, targetX, targetY, bendDirection, alpha) {
            var childRotation = child.rotation, parentRotation = parent.rotation;
            if (!alpha) {
                child.rotationIK = childRotation;
                parent.rotationIK = parentRotation;
                return;
            }
            var positionX, positionY, tempPosition = spine.temp;
            var parentParent = parent.parent;
            if (parentParent) {
                tempPosition[0] = targetX;
                tempPosition[1] = targetY;
                parentParent.worldToLocal(tempPosition);
                targetX = (tempPosition[0] - parent.x) * parentParent.worldScaleX;
                targetY = (tempPosition[1] - parent.y) * parentParent.worldScaleY;
            }
            else {
                targetX -= parent.x;
                targetY -= parent.y;
            }
            if (child.parent == parent) {
                positionX = child.x;
                positionY = child.y;
            }
            else {
                tempPosition[0] = child.x;
                tempPosition[1] = child.y;
                child.parent.localToWorld(tempPosition);
                parent.worldToLocal(tempPosition);
                positionX = tempPosition[0];
                positionY = tempPosition[1];
            }
            var childX = positionX * parent.worldScaleX, childY = positionY * parent.worldScaleY;
            var offset = Math.atan2(childY, childX);
            var len1 = Math.sqrt(childX * childX + childY * childY), len2 = child.data.length * child.worldScaleX;
            // Based on code by Ryan Juckett with permission: Copyright (c) 2008-2009 Ryan Juckett, http://www.ryanjuckett.com/
            var cosDenom = 2 * len1 * len2;
            if (cosDenom < 0.0001) {
                child.rotationIK = childRotation + (Math.atan2(targetY, targetX) * spine.radDeg - parentRotation - childRotation) * alpha;
                return;
            }
            var cos = (targetX * targetX + targetY * targetY - len1 * len1 - len2 * len2) / cosDenom;
            if (cos < -1)
                cos = -1;
            else if (cos > 1)
                cos = 1;
            var childAngle = Math.acos(cos) * bendDirection;
            var adjacent = len1 + len2 * cos, opposite = len2 * Math.sin(childAngle);
            var parentAngle = Math.atan2(targetY * adjacent - targetX * opposite, targetX * adjacent + targetY * opposite);
            var rotation = (parentAngle - offset) * spine.radDeg - parentRotation;
            if (rotation > 180)
                rotation -= 360;
            else if (rotation < -180)
                rotation += 360;
            parent.rotationIK = parentRotation + rotation * alpha;
            rotation = (childAngle + offset) * spine.radDeg - childRotation;
            if (rotation > 180)
                rotation -= 360;
            else if (rotation < -180)
                rotation += 360;
            child.rotationIK = childRotation + (rotation + parent.worldRotation - child.parent.worldRotation) * alpha;
        };
        spine.Skin = function (name) {
            this.name = name;
            this.attachments = {};
        };
        spine.Skin.prototype = {
            addAttachment: function (slotIndex, name, attachment) {
                this.attachments[slotIndex + ":" + name] = attachment;
            },
            getAttachment: function (slotIndex, name) {
                return this.attachments[slotIndex + ":" + name];
            },
            _attachAll: function (skeleton, oldSkin) {
                for (var key in oldSkin.attachments) {
                    var colon = key.indexOf(":");
                    var slotIndex = parseInt(key.substring(0, colon));
                    var name = key.substring(colon + 1);
                    var slot = skeleton.slots[slotIndex];
                    if (slot.attachment && slot.attachment.name == name) {
                        var attachment = this.getAttachment(slotIndex, name);
                        if (attachment)
                            slot.setAttachment(attachment);
                    }
                }
            }
        };
        spine.Animation = function (name, timelines, duration) {
            this.name = name;
            this.timelines = timelines;
            this.duration = duration;
        };
        spine.Animation.prototype = {
            apply: function (skeleton, lastTime, time, loop, events) {
                if (loop && this.duration != 0) {
                    time %= this.duration;
                    lastTime %= this.duration;
                }
                var timelines = this.timelines;
                for (var i = 0, n = timelines.length; i < n; i++)
                    timelines[i].apply(skeleton, lastTime, time, events, 1);
            },
            mix: function (skeleton, lastTime, time, loop, events, alpha) {
                if (loop && this.duration != 0) {
                    time %= this.duration;
                    lastTime %= this.duration;
                }
                var timelines = this.timelines;
                for (var i = 0, n = timelines.length; i < n; i++)
                    timelines[i].apply(skeleton, lastTime, time, events, alpha);
            }
        };
        spine.Animation.binarySearch = function (values, target, step) {
            var low = 0;
            var high = Math.floor(values.length / step) - 2;
            if (!high)
                return step;
            var current = high >>> 1;
            while (true) {
                if (values[(current + 1) * step] <= target)
                    low = current + 1;
                else
                    high = current;
                if (low == high)
                    return (low + 1) * step;
                current = (low + high) >>> 1;
            }
        };
        spine.Animation.binarySearch1 = function (values, target) {
            var low = 0;
            var high = values.length - 2;
            if (!high)
                return 1;
            var current = high >>> 1;
            while (true) {
                if (values[current + 1] <= target)
                    low = current + 1;
                else
                    high = current;
                if (low == high)
                    return low + 1;
                current = (low + high) >>> 1;
            }
        };
        spine.Animation.linearSearch = function (values, target, step) {
            for (var i = 0, last = values.length - step; i <= last; i += step)
                if (values[i] > target)
                    return i;
            return -1;
        };
        spine.Curves = function (frameCount) {
            this.curves = []; // type, x, y, ...
            //this.curves.length = (frameCount - 1) * 19/*BEZIER_SIZE*/;
        };
        spine.Curves.prototype = {
            setLinear: function (frameIndex) {
                this.curves[frameIndex * 19 /*BEZIER_SIZE*/] = 0 /*LINEAR*/;
            },
            setStepped: function (frameIndex) {
                this.curves[frameIndex * 19 /*BEZIER_SIZE*/] = 1 /*STEPPED*/;
            },
            /** Sets the control handle positions for an interpolation bezier curve used to transition from this keyframe to the next.
             * cx1 and cx2 are from 0 to 1, representing the percent of time between the two keyframes. cy1 and cy2 are the percent of
             * the difference between the keyframe's values. */
            setCurve: function (frameIndex, cx1, cy1, cx2, cy2) {
                var subdiv1 = 1 / 10 /*BEZIER_SEGMENTS*/, subdiv2 = subdiv1 * subdiv1, subdiv3 = subdiv2 * subdiv1;
                var pre1 = 3 * subdiv1, pre2 = 3 * subdiv2, pre4 = 6 * subdiv2, pre5 = 6 * subdiv3;
                var tmp1x = -cx1 * 2 + cx2, tmp1y = -cy1 * 2 + cy2, tmp2x = (cx1 - cx2) * 3 + 1, tmp2y = (cy1 - cy2) * 3 + 1;
                var dfx = cx1 * pre1 + tmp1x * pre2 + tmp2x * subdiv3, dfy = cy1 * pre1 + tmp1y * pre2 + tmp2y * subdiv3;
                var ddfx = tmp1x * pre4 + tmp2x * pre5, ddfy = tmp1y * pre4 + tmp2y * pre5;
                var dddfx = tmp2x * pre5, dddfy = tmp2y * pre5;
                var i = frameIndex * 19;
                var curves = this.curves;
                curves[i++] = 2 /*BEZIER*/;
                var x = dfx, y = dfy;
                for (var n = i + 19 /*BEZIER_SIZE*/ - 1; i < n; i += 2) {
                    curves[i] = x;
                    curves[i + 1] = y;
                    dfx += ddfx;
                    dfy += ddfy;
                    ddfx += dddfx;
                    ddfy += dddfy;
                    x += dfx;
                    y += dfy;
                }
            },
            getCurvePercent: function (frameIndex, percent) {
                percent = percent < 0 ? 0 : (percent > 1 ? 1 : percent);
                var curves = this.curves;
                var i = frameIndex * 19;
                var type = curves[i];
                if (type === 0 /*LINEAR*/)
                    return percent;
                if (type == 1 /*STEPPED*/)
                    return 0;
                i++;
                var x = 0;
                for (var start = i, n = i + 19 /*BEZIER_SIZE*/ - 1; i < n; i += 2) {
                    x = curves[i];
                    if (x >= percent) {
                        var prevX, prevY;
                        if (i == start) {
                            prevX = 0;
                            prevY = 0;
                        }
                        else {
                            prevX = curves[i - 2];
                            prevY = curves[i - 1];
                        }
                        return prevY + (curves[i + 1] - prevY) * (percent - prevX) / (x - prevX);
                    }
                }
                var y = curves[i - 1];
                return y + (1 - y) * (percent - x) / (1 - x); // Last point is 1,1.
            }
        };
        spine.RotateTimeline = function (frameCount) {
            this.curves = new spine.Curves(frameCount);
            this.frames = []; // time, angle, ...
            this.frames.length = frameCount * 2;
        };
        spine.RotateTimeline.prototype = {
            boneIndex: 0,
            getFrameCount: function () {
                return this.frames.length / 2;
            },
            setFrame: function (frameIndex, time, angle) {
                frameIndex *= 2;
                this.frames[frameIndex] = time;
                this.frames[frameIndex + 1] = angle;
            },
            apply: function (skeleton, lastTime, time, firedEvents, alpha) {
                var frames = this.frames;
                if (time < frames[0])
                    return; // Time is before first frame.
                var bone = skeleton.bones[this.boneIndex];
                if (time >= frames[frames.length - 2]) {
                    var amount = bone.data.rotation + frames[frames.length - 1] - bone.rotation;
                    while (amount > 180)
                        amount -= 360;
                    while (amount < -180)
                        amount += 360;
                    bone.rotation += amount * alpha;
                    return;
                }
                // Interpolate between the previous frame and the current frame.
                var frameIndex = spine.Animation.binarySearch(frames, time, 2);
                var prevFrameValue = frames[frameIndex - 1];
                var frameTime = frames[frameIndex];
                var percent = 1 - (time - frameTime) / (frames[frameIndex - 2 /*PREV_FRAME_TIME*/] - frameTime);
                percent = this.curves.getCurvePercent(frameIndex / 2 - 1, percent);
                var amount = frames[frameIndex + 1 /*FRAME_VALUE*/] - prevFrameValue;
                while (amount > 180)
                    amount -= 360;
                while (amount < -180)
                    amount += 360;
                amount = bone.data.rotation + (prevFrameValue + amount * percent) - bone.rotation;
                while (amount > 180)
                    amount -= 360;
                while (amount < -180)
                    amount += 360;
                bone.rotation += amount * alpha;
            }
        };
        spine.TranslateTimeline = function (frameCount) {
            this.curves = new spine.Curves(frameCount);
            this.frames = []; // time, x, y, ...
            this.frames.length = frameCount * 3;
        };
        spine.TranslateTimeline.prototype = {
            boneIndex: 0,
            getFrameCount: function () {
                return this.frames.length / 3;
            },
            setFrame: function (frameIndex, time, x, y) {
                frameIndex *= 3;
                this.frames[frameIndex] = time;
                this.frames[frameIndex + 1] = x;
                this.frames[frameIndex + 2] = y;
            },
            apply: function (skeleton, lastTime, time, firedEvents, alpha) {
                var frames = this.frames;
                if (time < frames[0])
                    return; // Time is before first frame.
                var bone = skeleton.bones[this.boneIndex];
                if (time >= frames[frames.length - 3]) {
                    bone.x += (bone.data.x + frames[frames.length - 2] - bone.x) * alpha;
                    bone.y += (bone.data.y + frames[frames.length - 1] - bone.y) * alpha;
                    return;
                }
                // Interpolate between the previous frame and the current frame.
                var frameIndex = spine.Animation.binarySearch(frames, time, 3);
                var prevFrameX = frames[frameIndex - 2];
                var prevFrameY = frames[frameIndex - 1];
                var frameTime = frames[frameIndex];
                var percent = 1 - (time - frameTime) / (frames[frameIndex + -3 /*PREV_FRAME_TIME*/] - frameTime);
                percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);
                bone.x += (bone.data.x + prevFrameX + (frames[frameIndex + 1 /*FRAME_X*/] - prevFrameX) * percent - bone.x) * alpha;
                bone.y += (bone.data.y + prevFrameY + (frames[frameIndex + 2 /*FRAME_Y*/] - prevFrameY) * percent - bone.y) * alpha;
            }
        };
        spine.ScaleTimeline = function (frameCount) {
            this.curves = new spine.Curves(frameCount);
            this.frames = []; // time, x, y, ...
            this.frames.length = frameCount * 3;
        };
        spine.ScaleTimeline.prototype = {
            boneIndex: 0,
            getFrameCount: function () {
                return this.frames.length / 3;
            },
            setFrame: function (frameIndex, time, x, y) {
                frameIndex *= 3;
                this.frames[frameIndex] = time;
                this.frames[frameIndex + 1] = x;
                this.frames[frameIndex + 2] = y;
            },
            apply: function (skeleton, lastTime, time, firedEvents, alpha) {
                var frames = this.frames;
                if (time < frames[0])
                    return; // Time is before first frame.
                var bone = skeleton.bones[this.boneIndex];
                if (time >= frames[frames.length - 3]) {
                    bone.scaleX += (bone.data.scaleX * frames[frames.length - 2] - bone.scaleX) * alpha;
                    bone.scaleY += (bone.data.scaleY * frames[frames.length - 1] - bone.scaleY) * alpha;
                    return;
                }
                // Interpolate between the previous frame and the current frame.
                var frameIndex = spine.Animation.binarySearch(frames, time, 3);
                var prevFrameX = frames[frameIndex - 2];
                var prevFrameY = frames[frameIndex - 1];
                var frameTime = frames[frameIndex];
                var percent = 1 - (time - frameTime) / (frames[frameIndex + -3 /*PREV_FRAME_TIME*/] - frameTime);
                percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);
                bone.scaleX += (bone.data.scaleX * (prevFrameX + (frames[frameIndex + 1 /*FRAME_X*/] - prevFrameX) * percent) - bone.scaleX) * alpha;
                bone.scaleY += (bone.data.scaleY * (prevFrameY + (frames[frameIndex + 2 /*FRAME_Y*/] - prevFrameY) * percent) - bone.scaleY) * alpha;
            }
        };
        spine.ColorTimeline = function (frameCount) {
            this.curves = new spine.Curves(frameCount);
            this.frames = []; // time, r, g, b, a, ...
            this.frames.length = frameCount * 5;
        };
        spine.ColorTimeline.prototype = {
            slotIndex: 0,
            getFrameCount: function () {
                return this.frames.length / 5;
            },
            setFrame: function (frameIndex, time, r, g, b, a) {
                frameIndex *= 5;
                this.frames[frameIndex] = time;
                this.frames[frameIndex + 1] = r;
                this.frames[frameIndex + 2] = g;
                this.frames[frameIndex + 3] = b;
                this.frames[frameIndex + 4] = a;
            },
            apply: function (skeleton, lastTime, time, firedEvents, alpha) {
                var frames = this.frames;
                if (time < frames[0])
                    return; // Time is before first frame.
                var r, g, b, a;
                if (time >= frames[frames.length - 5]) {
                    // Time is after last frame.
                    var i = frames.length - 1;
                    r = frames[i - 3];
                    g = frames[i - 2];
                    b = frames[i - 1];
                    a = frames[i];
                }
                else {
                    // Interpolate between the previous frame and the current frame.
                    var frameIndex = spine.Animation.binarySearch(frames, time, 5);
                    var prevFrameR = frames[frameIndex - 4];
                    var prevFrameG = frames[frameIndex - 3];
                    var prevFrameB = frames[frameIndex - 2];
                    var prevFrameA = frames[frameIndex - 1];
                    var frameTime = frames[frameIndex];
                    var percent = 1 - (time - frameTime) / (frames[frameIndex - 5 /*PREV_FRAME_TIME*/] - frameTime);
                    percent = this.curves.getCurvePercent(frameIndex / 5 - 1, percent);
                    r = prevFrameR + (frames[frameIndex + 1 /*FRAME_R*/] - prevFrameR) * percent;
                    g = prevFrameG + (frames[frameIndex + 2 /*FRAME_G*/] - prevFrameG) * percent;
                    b = prevFrameB + (frames[frameIndex + 3 /*FRAME_B*/] - prevFrameB) * percent;
                    a = prevFrameA + (frames[frameIndex + 4 /*FRAME_A*/] - prevFrameA) * percent;
                }
                var slot = skeleton.slots[this.slotIndex];
                if (alpha < 1) {
                    slot.r += (r - slot.r) * alpha;
                    slot.g += (g - slot.g) * alpha;
                    slot.b += (b - slot.b) * alpha;
                    slot.a += (a - slot.a) * alpha;
                }
                else {
                    slot.r = r;
                    slot.g = g;
                    slot.b = b;
                    slot.a = a;
                }
            }
        };
        spine.AttachmentTimeline = function (frameCount) {
            this.curves = new spine.Curves(frameCount);
            this.frames = []; // time, ...
            this.frames.length = frameCount;
            this.attachmentNames = [];
            this.attachmentNames.length = frameCount;
        };
        spine.AttachmentTimeline.prototype = {
            slotIndex: 0,
            getFrameCount: function () {
                return this.frames.length;
            },
            setFrame: function (frameIndex, time, attachmentName) {
                this.frames[frameIndex] = time;
                this.attachmentNames[frameIndex] = attachmentName;
            },
            apply: function (skeleton, lastTime, time, firedEvents, alpha) {
                var frames = this.frames;
                if (time < frames[0]) {
                    if (lastTime > time)
                        this.apply(skeleton, lastTime, Number.MAX_VALUE, null, 0);
                    return;
                }
                else if (lastTime > time)
                    lastTime = -1;
                var frameIndex = time >= frames[frames.length - 1] ? frames.length - 1 : spine.Animation.binarySearch1(frames, time) - 1;
                if (frames[frameIndex] < lastTime)
                    return;
                var attachmentName = this.attachmentNames[frameIndex];
                skeleton.slots[this.slotIndex].setAttachment(!attachmentName ? null : skeleton.getAttachmentBySlotIndex(this.slotIndex, attachmentName));
            }
        };
        spine.EventTimeline = function (frameCount) {
            this.frames = []; // time, ...
            this.frames.length = frameCount;
            this.events = [];
            this.events.length = frameCount;
        };
        spine.EventTimeline.prototype = {
            getFrameCount: function () {
                return this.frames.length;
            },
            setFrame: function (frameIndex, time, event) {
                this.frames[frameIndex] = time;
                this.events[frameIndex] = event;
            },
            /** Fires events for frames > lastTime and <= time. */
            apply: function (skeleton, lastTime, time, firedEvents, alpha) {
                if (!firedEvents)
                    return;
                var frames = this.frames;
                var frameCount = frames.length;
                if (lastTime > time) {
                    this.apply(skeleton, lastTime, Number.MAX_VALUE, firedEvents, alpha);
                    lastTime = -1;
                }
                else if (lastTime >= frames[frameCount - 1])
                    return;
                if (time < frames[0])
                    return; // Time is before first frame.
                var frameIndex;
                if (lastTime < frames[0])
                    frameIndex = 0;
                else {
                    frameIndex = spine.Animation.binarySearch1(frames, lastTime);
                    var frame = frames[frameIndex];
                    while (frameIndex > 0) {
                        if (frames[frameIndex - 1] != frame)
                            break;
                        frameIndex--;
                    }
                }
                var events = this.events;
                for (; frameIndex < frameCount && time >= frames[frameIndex]; frameIndex++)
                    firedEvents.push(events[frameIndex]);
            }
        };
        spine.DrawOrderTimeline = function (frameCount) {
            this.frames = []; // time, ...
            this.frames.length = frameCount;
            this.drawOrders = [];
            this.drawOrders.length = frameCount;
        };
        spine.DrawOrderTimeline.prototype = {
            getFrameCount: function () {
                return this.frames.length;
            },
            setFrame: function (frameIndex, time, drawOrder) {
                this.frames[frameIndex] = time;
                this.drawOrders[frameIndex] = drawOrder;
            },
            apply: function (skeleton, lastTime, time, firedEvents, alpha) {
                var frames = this.frames;
                if (time < frames[0])
                    return; // Time is before first frame.
                var frameIndex;
                if (time >= frames[frames.length - 1])
                    frameIndex = frames.length - 1;
                else
                    frameIndex = spine.Animation.binarySearch1(frames, time) - 1;
                var drawOrder = skeleton.drawOrder;
                var slots = skeleton.slots;
                var drawOrderToSetupIndex = this.drawOrders[frameIndex];
                if (!drawOrderToSetupIndex) {
                    for (var i = 0, n = slots.length; i < n; i++)
                        drawOrder[i] = slots[i];
                }
                else {
                    for (var i = 0, n = drawOrderToSetupIndex.length; i < n; i++)
                        drawOrder[i] = skeleton.slots[drawOrderToSetupIndex[i]];
                }
            }
        };
        spine.FfdTimeline = function (frameCount) {
            this.curves = new spine.Curves(frameCount);
            this.frames = [];
            this.frames.length = frameCount;
            this.frameVertices = [];
            this.frameVertices.length = frameCount;
        };
        spine.FfdTimeline.prototype = {
            slotIndex: 0,
            attachment: 0,
            getFrameCount: function () {
                return this.frames.length;
            },
            setFrame: function (frameIndex, time, vertices) {
                this.frames[frameIndex] = time;
                this.frameVertices[frameIndex] = vertices;
            },
            apply: function (skeleton, lastTime, time, firedEvents, alpha) {
                var slot = skeleton.slots[this.slotIndex];
                if (slot.attachment != this.attachment)
                    return;
                var frames = this.frames;
                if (time < frames[0])
                    return; // Time is before first frame.
                var frameVertices = this.frameVertices;
                var vertexCount = frameVertices[0].length;
                var vertices = slot.attachmentVertices;
                if (vertices.length != vertexCount)
                    alpha = 1;
                vertices.length = vertexCount;
                if (time >= frames[frames.length - 1]) {
                    var lastVertices = frameVertices[frames.length - 1];
                    if (alpha < 1) {
                        for (var i = 0; i < vertexCount; i++)
                            vertices[i] += (lastVertices[i] - vertices[i]) * alpha;
                    }
                    else {
                        for (var i = 0; i < vertexCount; i++)
                            vertices[i] = lastVertices[i];
                    }
                    return;
                }
                // Interpolate between the previous frame and the current frame.
                var frameIndex = spine.Animation.binarySearch1(frames, time);
                var frameTime = frames[frameIndex];
                var percent = 1 - (time - frameTime) / (frames[frameIndex - 1] - frameTime);
                percent = this.curves.getCurvePercent(frameIndex - 1, percent < 0 ? 0 : (percent > 1 ? 1 : percent));
                var prevVertices = frameVertices[frameIndex - 1];
                var nextVertices = frameVertices[frameIndex];
                if (alpha < 1) {
                    for (var i = 0; i < vertexCount; i++) {
                        var prev = prevVertices[i] || 0;
                        var next = nextVertices[i] || 0;
                        vertices[i] += (prev + (next - prev) * percent - vertices[i]) * alpha;
                    }
                }
                else {
                    for (var i = 0; i < vertexCount; i++) {
                        var prev = prevVertices[i] || 0;
                        var next = nextVertices[i] || 0;
                        vertices[i] = prev + (next - prev) * percent;
                    }
                }
            }
        };
        spine.IkConstraintTimeline = function (frameCount) {
            this.curves = new spine.Curves(frameCount);
            this.frames = []; // time, mix, bendDirection, ...
            this.frames.length = frameCount * 3;
        };
        spine.IkConstraintTimeline.prototype = {
            ikConstraintIndex: 0,
            getFrameCount: function () {
                return this.frames.length / 3;
            },
            setFrame: function (frameIndex, time, mix, bendDirection) {
                frameIndex *= 3;
                this.frames[frameIndex] = time;
                this.frames[frameIndex + 1] = mix;
                this.frames[frameIndex + 2] = bendDirection;
            },
            apply: function (skeleton, lastTime, time, firedEvents, alpha) {
                var frames = this.frames;
                if (time < frames[0])
                    return; // Time is before first frame.
                var ikConstraint = skeleton.ikConstraints[this.ikConstraintIndex];
                if (time >= frames[frames.length - 3]) {
                    ikConstraint.mix += (frames[frames.length - 2] - ikConstraint.mix) * alpha;
                    ikConstraint.bendDirection = frames[frames.length - 1];
                    return;
                }
                // Interpolate between the previous frame and the current frame.
                var frameIndex = spine.Animation.binarySearch(frames, time, 3);
                var prevFrameMix = frames[frameIndex + -2 /*PREV_FRAME_MIX*/];
                var frameTime = frames[frameIndex];
                var percent = 1 - (time - frameTime) / (frames[frameIndex + -3 /*PREV_FRAME_TIME*/] - frameTime);
                percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);
                var mix = prevFrameMix + (frames[frameIndex + 1 /*FRAME_MIX*/] - prevFrameMix) * percent;
                ikConstraint.mix += (mix - ikConstraint.mix) * alpha;
                ikConstraint.bendDirection = frames[frameIndex + -1 /*PREV_FRAME_BEND_DIRECTION*/];
            }
        };
        spine.FlipXTimeline = function (frameCount) {
            this.curves = new spine.Curves(frameCount);
            this.frames = []; // time, flip, ...
            this.frames.length = frameCount * 2;
        };
        spine.FlipXTimeline.prototype = {
            boneIndex: 0,
            getFrameCount: function () {
                return this.frames.length / 2;
            },
            setFrame: function (frameIndex, time, flip) {
                frameIndex *= 2;
                this.frames[frameIndex] = time;
                this.frames[frameIndex + 1] = flip ? 1 : 0;
            },
            apply: function (skeleton, lastTime, time, firedEvents, alpha) {
                var frames = this.frames;
                if (time < frames[0]) {
                    if (lastTime > time)
                        this.apply(skeleton, lastTime, Number.MAX_VALUE, null, 0);
                    return;
                }
                else if (lastTime > time)
                    lastTime = -1;
                var frameIndex = (time >= frames[frames.length - 2] ? frames.length : spine.Animation.binarySearch(frames, time, 2)) - 2;
                if (frames[frameIndex] < lastTime)
                    return;
                skeleton.bones[this.boneIndex].flipX = frames[frameIndex + 1] != 0;
            }
        };
        spine.FlipYTimeline = function (frameCount) {
            this.curves = new spine.Curves(frameCount);
            this.frames = []; // time, flip, ...
            this.frames.length = frameCount * 2;
        };
        spine.FlipYTimeline.prototype = {
            boneIndex: 0,
            getFrameCount: function () {
                return this.frames.length / 2;
            },
            setFrame: function (frameIndex, time, flip) {
                frameIndex *= 2;
                this.frames[frameIndex] = time;
                this.frames[frameIndex + 1] = flip ? 1 : 0;
            },
            apply: function (skeleton, lastTime, time, firedEvents, alpha) {
                var frames = this.frames;
                if (time < frames[0]) {
                    if (lastTime > time)
                        this.apply(skeleton, lastTime, Number.MAX_VALUE, null, 0);
                    return;
                }
                else if (lastTime > time)
                    lastTime = -1;
                var frameIndex = (time >= frames[frames.length - 2] ? frames.length : spine.Animation.binarySearch(frames, time, 2)) - 2;
                if (frames[frameIndex] < lastTime)
                    return;
                skeleton.bones[this.boneIndex].flipY = frames[frameIndex + 1] != 0;
            }
        };
        spine.SkeletonData = function () {
            this.bones = [];
            this.slots = [];
            this.skins = [];
            this.events = [];
            this.animations = [];
            this.ikConstraints = [];
        };
        spine.SkeletonData.prototype = {
            name: null,
            defaultSkin: null,
            width: 0, height: 0,
            version: null, hash: null,
            /** @return May be null. */
            findBone: function (boneName) {
                var bones = this.bones;
                for (var i = 0, n = bones.length; i < n; i++)
                    if (bones[i].name == boneName)
                        return bones[i];
                return null;
            },
            /** @return -1 if the bone was not found. */
            findBoneIndex: function (boneName) {
                var bones = this.bones;
                for (var i = 0, n = bones.length; i < n; i++)
                    if (bones[i].name == boneName)
                        return i;
                return -1;
            },
            /** @return May be null. */
            findSlot: function (slotName) {
                var slots = this.slots;
                for (var i = 0, n = slots.length; i < n; i++) {
                    if (slots[i].name == slotName)
                        return slots[i];
                }
                return null;
            },
            /** @return -1 if the bone was not found. */
            findSlotIndex: function (slotName) {
                var slots = this.slots;
                for (var i = 0, n = slots.length; i < n; i++)
                    if (slots[i].name == slotName)
                        return i;
                return -1;
            },
            /** @return May be null. */
            findSkin: function (skinName) {
                var skins = this.skins;
                for (var i = 0, n = skins.length; i < n; i++)
                    if (skins[i].name == skinName)
                        return skins[i];
                return null;
            },
            /** @return May be null. */
            findEvent: function (eventName) {
                var events = this.events;
                for (var i = 0, n = events.length; i < n; i++)
                    if (events[i].name == eventName)
                        return events[i];
                return null;
            },
            /** @return May be null. */
            findAnimation: function (animationName) {
                var animations = this.animations;
                for (var i = 0, n = animations.length; i < n; i++)
                    if (animations[i].name == animationName)
                        return animations[i];
                return null;
            },
            /** @return May be null. */
            findIkConstraint: function (ikConstraintName) {
                var ikConstraints = this.ikConstraints;
                for (var i = 0, n = ikConstraints.length; i < n; i++)
                    if (ikConstraints[i].name == ikConstraintName)
                        return ikConstraints[i];
                return null;
            }
        };
        spine.Skeleton = function (skeletonData) {
            this.data = skeletonData;
            this.bones = [];
            for (var i = 0, n = skeletonData.bones.length; i < n; i++) {
                var boneData = skeletonData.bones[i];
                var parent = !boneData.parent ? null : this.bones[skeletonData.bones.indexOf(boneData.parent)];
                this.bones.push(new spine.Bone(boneData, this, parent));
            }
            this.slots = [];
            this.drawOrder = [];
            for (var i = 0, n = skeletonData.slots.length; i < n; i++) {
                var slotData = skeletonData.slots[i];
                var bone = this.bones[skeletonData.bones.indexOf(slotData.boneData)];
                var slot = new spine.Slot(slotData, bone);
                this.slots.push(slot);
                this.drawOrder.push(slot);
            }
            this.ikConstraints = [];
            for (var i = 0, n = skeletonData.ikConstraints.length; i < n; i++)
                this.ikConstraints.push(new spine.IkConstraint(skeletonData.ikConstraints[i], this));
            this.boneCache = [];
            this.updateCache();
        };
        spine.Skeleton.prototype = {
            x: 0, y: 0,
            skin: null,
            r: 1, g: 1, b: 1, a: 1,
            time: 0,
            flipX: false, flipY: false,
            /** Caches information about bones and IK constraints. Must be called if bones or IK constraints are added or removed. */
            updateCache: function () {
                var ikConstraints = this.ikConstraints;
                var ikConstraintsCount = ikConstraints.length;
                var arrayCount = ikConstraintsCount + 1;
                var boneCache = this.boneCache;
                if (boneCache.length > arrayCount)
                    boneCache.length = arrayCount;
                for (var i = 0, n = boneCache.length; i < n; i++)
                    boneCache[i].length = 0;
                while (boneCache.length < arrayCount)
                    boneCache[boneCache.length] = [];
                var nonIkBones = boneCache[0];
                var bones = this.bones;
                outer: for (var i = 0, n = bones.length; i < n; i++) {
                    var bone = bones[i];
                    var current = bone;
                    do {
                        for (var ii = 0; ii < ikConstraintsCount; ii++) {
                            var ikConstraint = ikConstraints[ii];
                            var parent = ikConstraint.bones[0];
                            var child = ikConstraint.bones[ikConstraint.bones.length - 1];
                            while (true) {
                                if (current == child) {
                                    boneCache[ii].push(bone);
                                    boneCache[ii + 1].push(bone);
                                    continue outer;
                                }
                                if (child == parent)
                                    break;
                                child = child.parent;
                            }
                        }
                        current = current.parent;
                    } while (current);
                    nonIkBones[nonIkBones.length] = bone;
                }
            },
            /** Updates the world transform for each bone. */
            updateWorldTransform: function () {
                var bones = this.bones;
                for (var i = 0, n = bones.length; i < n; i++) {
                    var bone = bones[i];
                    bone.rotationIK = bone.rotation;
                }
                var i = 0, last = this.boneCache.length - 1;
                while (true) {
                    var cacheBones = this.boneCache[i];
                    for (var ii = 0, nn = cacheBones.length; ii < nn; ii++)
                        cacheBones[ii].updateWorldTransform();
                    if (i == last)
                        break;
                    this.ikConstraints[i].apply();
                    i++;
                }
            },
            /** Sets the bones and slots to their setup pose values. */
            setToSetupPose: function () {
                this.setBonesToSetupPose();
                this.setSlotsToSetupPose();
            },
            setBonesToSetupPose: function () {
                var bones = this.bones;
                for (var i = 0, n = bones.length; i < n; i++)
                    bones[i].setToSetupPose();
                var ikConstraints = this.ikConstraints;
                for (var i = 0, n = ikConstraints.length; i < n; i++) {
                    var ikConstraint = ikConstraints[i];
                    ikConstraint.bendDirection = ikConstraint.data.bendDirection;
                    ikConstraint.mix = ikConstraint.data.mix;
                }
            },
            setSlotsToSetupPose: function () {
                var slots = this.slots;
                var drawOrder = this.drawOrder;
                for (var i = 0, n = slots.length; i < n; i++) {
                    drawOrder[i] = slots[i];
                    slots[i].setToSetupPose(i);
                }
            },
            /** @return May return null. */
            getRootBone: function () {
                return this.bones.length ? this.bones[0] : null;
            },
            /** @return May be null. */
            findBone: function (boneName) {
                var bones = this.bones;
                for (var i = 0, n = bones.length; i < n; i++)
                    if (bones[i].data.name == boneName)
                        return bones[i];
                return null;
            },
            /** @return -1 if the bone was not found. */
            findBoneIndex: function (boneName) {
                var bones = this.bones;
                for (var i = 0, n = bones.length; i < n; i++)
                    if (bones[i].data.name == boneName)
                        return i;
                return -1;
            },
            /** @return May be null. */
            findSlot: function (slotName) {
                var slots = this.slots;
                for (var i = 0, n = slots.length; i < n; i++)
                    if (slots[i].data.name == slotName)
                        return slots[i];
                return null;
            },
            /** @return -1 if the bone was not found. */
            findSlotIndex: function (slotName) {
                var slots = this.slots;
                for (var i = 0, n = slots.length; i < n; i++)
                    if (slots[i].data.name == slotName)
                        return i;
                return -1;
            },
            setSkinByName: function (skinName) {
                var skin = this.data.findSkin(skinName);
                if (!skin)
                    throw "Skin not found: " + skinName;
                this.setSkin(skin);
            },
            /** Sets the skin used to look up attachments before looking in the {@link SkeletonData#getDefaultSkin() default skin}.
             * Attachments from the new skin are attached if the corresponding attachment from the old skin was attached. If there was
             * no old skin, each slot's setup mode attachment is attached from the new skin.
             * @param newSkin May be null. */
            setSkin: function (newSkin) {
                if (newSkin) {
                    if (this.skin)
                        newSkin._attachAll(this, this.skin);
                    else {
                        var slots = this.slots;
                        for (var i = 0, n = slots.length; i < n; i++) {
                            var slot = slots[i];
                            var name = slot.data.attachmentName;
                            if (name) {
                                var attachment = newSkin.getAttachment(i, name);
                                if (attachment)
                                    slot.setAttachment(attachment);
                            }
                        }
                    }
                }
                this.skin = newSkin;
            },
            /** @return May be null. */
            getAttachmentBySlotName: function (slotName, attachmentName) {
                return this.getAttachmentBySlotIndex(this.data.findSlotIndex(slotName), attachmentName);
            },
            /** @return May be null. */
            getAttachmentBySlotIndex: function (slotIndex, attachmentName) {
                if (this.skin) {
                    var attachment = this.skin.getAttachment(slotIndex, attachmentName);
                    if (attachment)
                        return attachment;
                }
                if (this.data.defaultSkin)
                    return this.data.defaultSkin.getAttachment(slotIndex, attachmentName);
                return null;
            },
            /** @param attachmentName May be null. */
            setAttachment: function (slotName, attachmentName) {
                var slots = this.slots;
                for (var i = 0, n = slots.length; i < n; i++) {
                    var slot = slots[i];
                    if (slot.data.name == slotName) {
                        var attachment = null;
                        if (attachmentName) {
                            attachment = this.getAttachmentBySlotIndex(i, attachmentName);
                            if (!attachment)
                                throw "Attachment not found: " + attachmentName + ", for slot: " + slotName;
                        }
                        slot.setAttachment(attachment);
                        return;
                    }
                }
                throw "Slot not found: " + slotName;
            },
            /** @return May be null. */
            findIkConstraint: function (ikConstraintName) {
                var ikConstraints = this.ikConstraints;
                for (var i = 0, n = ikConstraints.length; i < n; i++)
                    if (ikConstraints[i].data.name == ikConstraintName)
                        return ikConstraints[i];
                return null;
            },
            update: function (delta) {
                this.time += delta;
            }
        };
        spine.EventData = function (name) {
            this.name = name;
        };
        spine.EventData.prototype = {
            intValue: 0,
            floatValue: 0,
            stringValue: null
        };
        spine.Event = function (data) {
            this.data = data;
        };
        spine.Event.prototype = {
            intValue: 0,
            floatValue: 0,
            stringValue: null
        };
        spine.AttachmentType = {
            region: 0,
            boundingbox: 1,
            mesh: 2,
            skinnedmesh: 3
        };
        spine.RegionAttachment = function (name) {
            this.name = name;
            this.offset = [];
            this.offset.length = 8;
            this.uvs = [];
            this.uvs.length = 8;
        };
        spine.RegionAttachment.prototype = {
            type: spine.AttachmentType.region,
            x: 0, y: 0,
            rotation: 0,
            scaleX: 1, scaleY: 1,
            width: 0, height: 0,
            r: 1, g: 1, b: 1, a: 1,
            path: null,
            rendererObject: null,
            regionOffsetX: 0, regionOffsetY: 0,
            regionWidth: 0, regionHeight: 0,
            regionOriginalWidth: 0, regionOriginalHeight: 0,
            setUVs: function (u, v, u2, v2, rotate) {
                var uvs = this.uvs;
                if (rotate) {
                    uvs[2 /*X2*/] = u;
                    uvs[3 /*Y2*/] = v2;
                    uvs[4 /*X3*/] = u;
                    uvs[5 /*Y3*/] = v;
                    uvs[6 /*X4*/] = u2;
                    uvs[7 /*Y4*/] = v;
                    uvs[0 /*X1*/] = u2;
                    uvs[1 /*Y1*/] = v2;
                }
                else {
                    uvs[0 /*X1*/] = u;
                    uvs[1 /*Y1*/] = v2;
                    uvs[2 /*X2*/] = u;
                    uvs[3 /*Y2*/] = v;
                    uvs[4 /*X3*/] = u2;
                    uvs[5 /*Y3*/] = v;
                    uvs[6 /*X4*/] = u2;
                    uvs[7 /*Y4*/] = v2;
                }
            },
            updateOffset: function () {
                //var regionScaleX = this.width / this.regionOriginalWidth * this.scaleX;
                //var regionScaleY = this.height / this.regionOriginalHeight * this.scaleY;
                //var localX = -this.width / 2 * this.scaleX + this.regionOffsetX * regionScaleX;
                //var localY = -this.height / 2 * this.scaleY + this.regionOffsetY * regionScaleY;
                //var localX2 = localX + this.regionWidth * regionScaleX;
                //var localY2 = localY + this.regionHeight * regionScaleY;
                //var radians = this.rotation * spine.degRad;
                //var cos = Math.cos(radians);
                //var sin = Math.sin(radians);
                //var localXCos = localX * cos + this.x;
                //var localXSin = localX * sin;
                //var localYCos = localY * cos + this.y;
                //var localYSin = localY * sin;
                //var localX2Cos = localX2 * cos + this.x;
                //var localX2Sin = localX2 * sin;
                //var localY2Cos = localY2 * cos + this.y;
                //var localY2Sin = localY2 * sin;
                //var offset = this.offset;
                //offset[0/*X1*/] = localXCos - localYSin;
                //offset[1/*Y1*/] = localYCos + localXSin;
                //offset[2/*X2*/] = localXCos - localY2Sin;
                //offset[3/*Y2*/] = localY2Cos + localXSin;
                //offset[4/*X3*/] = localX2Cos - localY2Sin;
                //offset[5/*Y3*/] = localY2Cos + localX2Sin;
                //offset[6/*X4*/] = localX2Cos - localYSin;
                //offset[7/*Y4*/] = localYCos + localX2Sin;
            },
            computeVertices: function (x, y, bone, vertices) {
                x += bone.worldX;
                y += bone.worldY;
                var m00 = bone.m00, m01 = bone.m01, m10 = bone.m10, m11 = bone.m11;
                var offset = this.offset;
                vertices[0 /*X1*/] = offset[0 /*X1*/] * m00 + offset[1 /*Y1*/] * m01 + x;
                vertices[1 /*Y1*/] = offset[0 /*X1*/] * m10 + offset[1 /*Y1*/] * m11 + y;
                vertices[2 /*X2*/] = offset[2 /*X2*/] * m00 + offset[3 /*Y2*/] * m01 + x;
                vertices[3 /*Y2*/] = offset[2 /*X2*/] * m10 + offset[3 /*Y2*/] * m11 + y;
                vertices[4 /*X3*/] = offset[4 /*X3*/] * m00 + offset[5 /*X3*/] * m01 + x;
                vertices[5 /*X3*/] = offset[4 /*X3*/] * m10 + offset[5 /*X3*/] * m11 + y;
                vertices[6 /*X4*/] = offset[6 /*X4*/] * m00 + offset[7 /*Y4*/] * m01 + x;
                vertices[7 /*Y4*/] = offset[6 /*X4*/] * m10 + offset[7 /*Y4*/] * m11 + y;
            }
        };
        spine.MeshAttachment = function (name) {
            this.name = name;
        };
        spine.MeshAttachment.prototype = {
            type: spine.AttachmentType.mesh,
            vertices: null,
            uvs: null,
            regionUVs: null,
            triangles: null,
            hullLength: 0,
            r: 1, g: 1, b: 1, a: 1,
            path: null,
            rendererObject: null,
            regionU: 0, regionV: 0, regionU2: 0, regionV2: 0, regionRotate: false,
            regionOffsetX: 0, regionOffsetY: 0,
            regionWidth: 0, regionHeight: 0,
            regionOriginalWidth: 0, regionOriginalHeight: 0,
            edges: null,
            width: 0, height: 0,
            updateUVs: function () {
                var width = this.regionU2 - this.regionU, height = this.regionV2 - this.regionV;
                var n = this.regionUVs.length;
                if (!this.uvs || this.uvs.length != n) {
                    this.uvs = new spine.Float32Array(n);
                }
                if (this.regionRotate) {
                    for (var i = 0; i < n; i += 2) {
                        this.uvs[i] = this.regionU + this.regionUVs[i + 1] * width;
                        this.uvs[i + 1] = this.regionV + height - this.regionUVs[i] * height;
                    }
                }
                else {
                    for (var i = 0; i < n; i += 2) {
                        this.uvs[i] = this.regionU + this.regionUVs[i] * width;
                        this.uvs[i + 1] = this.regionV + this.regionUVs[i + 1] * height;
                    }
                }
            },
            computeWorldVertices: function (x, y, slot, worldVertices) {
                var bone = slot.bone;
                x += bone.worldX;
                y += bone.worldY;
                var m00 = bone.m00, m01 = bone.m01, m10 = bone.m10, m11 = bone.m11;
                var vertices = this.vertices;
                var verticesCount = vertices.length;
                if (slot.attachmentVertices.length == verticesCount)
                    vertices = slot.attachmentVertices;
                for (var i = 0; i < verticesCount; i += 2) {
                    var vx = vertices[i];
                    var vy = vertices[i + 1];
                    worldVertices[i] = vx * m00 + vy * m01 + x;
                    worldVertices[i + 1] = vx * m10 + vy * m11 + y;
                }
            }
        };
        spine.SkinnedMeshAttachment = function (name) {
            this.name = name;
        };
        spine.SkinnedMeshAttachment.prototype = {
            type: spine.AttachmentType.skinnedmesh,
            bones: null,
            weights: null,
            uvs: null,
            regionUVs: null,
            triangles: null,
            hullLength: 0,
            r: 1, g: 1, b: 1, a: 1,
            path: null,
            rendererObject: null,
            regionU: 0, regionV: 0, regionU2: 0, regionV2: 0, regionRotate: false,
            regionOffsetX: 0, regionOffsetY: 0,
            regionWidth: 0, regionHeight: 0,
            regionOriginalWidth: 0, regionOriginalHeight: 0,
            edges: null,
            width: 0, height: 0,
            updateUVs: function (u, v, u2, v2, rotate) {
                var width = this.regionU2 - this.regionU, height = this.regionV2 - this.regionV;
                var n = this.regionUVs.length;
                if (!this.uvs || this.uvs.length != n) {
                    this.uvs = new spine.Float32Array(n);
                }
                if (this.regionRotate) {
                    for (var i = 0; i < n; i += 2) {
                        this.uvs[i] = this.regionU + this.regionUVs[i + 1] * width;
                        this.uvs[i + 1] = this.regionV + height - this.regionUVs[i] * height;
                    }
                }
                else {
                    for (var i = 0; i < n; i += 2) {
                        this.uvs[i] = this.regionU + this.regionUVs[i] * width;
                        this.uvs[i + 1] = this.regionV + this.regionUVs[i + 1] * height;
                    }
                }
            },
            computeWorldVertices: function (x, y, slot, worldVertices) {
                var skeletonBones = slot.bone.skeleton.bones;
                var weights = this.weights;
                var bones = this.bones;
                var w = 0, v = 0, b = 0, f = 0, n = bones.length, nn;
                var wx, wy, bone, vx, vy, weight;
                if (!slot.attachmentVertices.length) {
                    for (; v < n; w += 2) {
                        wx = 0;
                        wy = 0;
                        nn = bones[v++] + v;
                        for (; v < nn; v++, b += 3) {
                            bone = skeletonBones[bones[v]];
                            vx = weights[b];
                            vy = weights[b + 1];
                            weight = weights[b + 2];
                            wx += (vx * bone.m00 + vy * bone.m01 + bone.worldX) * weight;
                            wy += (vx * bone.m10 + vy * bone.m11 + bone.worldY) * weight;
                        }
                        worldVertices[w] = wx + x;
                        worldVertices[w + 1] = wy + y;
                    }
                }
                else {
                    var ffd = slot.attachmentVertices;
                    for (; v < n; w += 2) {
                        wx = 0;
                        wy = 0;
                        nn = bones[v++] + v;
                        for (; v < nn; v++, b += 3, f += 2) {
                            bone = skeletonBones[bones[v]];
                            vx = weights[b] + (ffd[f] || 0);
                            vy = weights[b + 1] + (ffd[f + 1] || 0);
                            weight = weights[b + 2];
                            wx += (vx * bone.m00 + vy * bone.m01 + bone.worldX) * weight;
                            wy += (vx * bone.m10 + vy * bone.m11 + bone.worldY) * weight;
                        }
                        worldVertices[w] = wx + x;
                        worldVertices[w + 1] = wy + y;
                    }
                }
            }
        };
        spine.BoundingBoxAttachment = function (name) {
            this.name = name;
            this.vertices = [];
        };
        spine.BoundingBoxAttachment.prototype = {
            type: spine.AttachmentType.boundingbox,
            computeWorldVertices: function (x, y, bone, worldVertices) {
                x += bone.worldX;
                y += bone.worldY;
                var m00 = bone.m00, m01 = bone.m01, m10 = bone.m10, m11 = bone.m11;
                var vertices = this.vertices;
                for (var i = 0, n = vertices.length; i < n; i += 2) {
                    var px = vertices[i];
                    var py = vertices[i + 1];
                    worldVertices[i] = px * m00 + py * m01 + x;
                    worldVertices[i + 1] = px * m10 + py * m11 + y;
                }
            }
        };
        spine.AnimationStateData = function (skeletonData) {
            this.skeletonData = skeletonData;
            this.animationToMixTime = {};
        };
        spine.AnimationStateData.prototype = {
            defaultMix: 0,
            setMixByName: function (fromName, toName, duration) {
                var from = this.skeletonData.findAnimation(fromName);
                if (!from)
                    throw "Animation not found: " + fromName;
                var to = this.skeletonData.findAnimation(toName);
                if (!to)
                    throw "Animation not found: " + toName;
                this.setMix(from, to, duration);
            },
            setMix: function (from, to, duration) {
                this.animationToMixTime[from.name + ":" + to.name] = duration;
            },
            getMix: function (from, to) {
                var key = from.name + ":" + to.name;
                return this.animationToMixTime.hasOwnProperty(key) ? this.animationToMixTime[key] : this.defaultMix;
            }
        };
        spine.TrackEntry = function () { };
        spine.TrackEntry.prototype = {
            next: null, previous: null,
            animation: null,
            loop: false,
            delay: 0, time: 0, lastTime: -1, endTime: 0,
            timeScale: 1,
            mixTime: 0, mixDuration: 0, mix: 1,
            onStart: null, onEnd: null, onComplete: null, onEvent: null
        };
        spine.AnimationState = function (stateData) {
            this.data = stateData;
            this.tracks = [];
            this.events = [];
        };
        spine.AnimationState.prototype = {
            onStart: null,
            onEnd: null,
            onComplete: null,
            onEvent: null,
            timeScale: 1,
            update: function (delta) {
                delta *= this.timeScale;
                for (var i = 0; i < this.tracks.length; i++) {
                    var current = this.tracks[i];
                    if (!current)
                        continue;
                    current.time += delta * current.timeScale;
                    if (current.previous) {
                        var previousDelta = delta * current.previous.timeScale;
                        current.previous.time += previousDelta;
                        current.mixTime += previousDelta;
                    }
                    var next = current.next;
                    if (next) {
                        next.time = current.lastTime - next.delay;
                        if (next.time >= 0)
                            this.setCurrent(i, next);
                    }
                    else {
                        // End non-looping animation when it reaches its end time and there is no next entry.
                        if (!current.loop && current.lastTime >= current.endTime)
                            this.clearTrack(i);
                    }
                }
            },
            apply: function (skeleton) {
                for (var i = 0; i < this.tracks.length; i++) {
                    var current = this.tracks[i];
                    if (!current)
                        continue;
                    this.events.length = 0;
                    var time = current.time;
                    var lastTime = current.lastTime;
                    var endTime = current.endTime;
                    var loop = current.loop;
                    if (!loop && time > endTime)
                        time = endTime;
                    var previous = current.previous;
                    if (!previous) {
                        if (current.mix == 1)
                            current.animation.apply(skeleton, current.lastTime, time, loop, this.events);
                        else
                            current.animation.mix(skeleton, current.lastTime, time, loop, this.events, current.mix);
                    }
                    else {
                        var previousTime = previous.time;
                        if (!previous.loop && previousTime > previous.endTime)
                            previousTime = previous.endTime;
                        previous.animation.apply(skeleton, previousTime, previousTime, previous.loop, null);
                        var alpha = current.mixTime / current.mixDuration * current.mix;
                        if (alpha >= 1) {
                            alpha = 1;
                            current.previous = null;
                        }
                        current.animation.mix(skeleton, current.lastTime, time, loop, this.events, alpha);
                    }
                    for (var ii = 0, nn = this.events.length; ii < nn; ii++) {
                        var event = this.events[ii];
                        if (current.onEvent)
                            current.onEvent(i, event);
                        if (this.onEvent)
                            this.onEvent(i, event);
                    }
                    // Check if completed the animation or a loop iteration.
                    if (loop ? (lastTime % endTime > time % endTime) : (lastTime < endTime && time >= endTime)) {
                        var count = Math.floor(time / endTime);
                        if (current.onComplete)
                            current.onComplete(i, count);
                        if (this.onComplete)
                            this.onComplete(i, count);
                    }
                    current.lastTime = current.time;
                }
            },
            clearTracks: function () {
                for (var i = 0, n = this.tracks.length; i < n; i++)
                    this.clearTrack(i);
                this.tracks.length = 0;
            },
            clearTrack: function (trackIndex) {
                if (trackIndex >= this.tracks.length)
                    return;
                var current = this.tracks[trackIndex];
                if (!current)
                    return;
                if (current.onEnd)
                    current.onEnd(trackIndex);
                if (this.onEnd)
                    this.onEnd(trackIndex);
                this.tracks[trackIndex] = null;
            },
            _expandToIndex: function (index) {
                if (index < this.tracks.length)
                    return this.tracks[index];
                while (index >= this.tracks.length)
                    this.tracks.push(null);
                return null;
            },
            setCurrent: function (index, entry) {
                var current = this._expandToIndex(index);
                if (current) {
                    var previous = current.previous;
                    current.previous = null;
                    if (current.onEnd)
                        current.onEnd(index);
                    if (this.onEnd)
                        this.onEnd(index);
                    entry.mixDuration = this.data.getMix(current.animation, entry.animation);
                    if (entry.mixDuration > 0) {
                        entry.mixTime = 0;
                        // If a mix is in progress, mix from the closest animation.
                        if (previous && current.mixTime / current.mixDuration < 0.5)
                            entry.previous = previous;
                        else
                            entry.previous = current;
                    }
                }
                this.tracks[index] = entry;
                if (entry.onStart)
                    entry.onStart(index);
                if (this.onStart)
                    this.onStart(index);
            },
            setAnimationByName: function (trackIndex, animationName, loop) {
                var animation = this.data.skeletonData.findAnimation(animationName);
                if (!animation)
                    throw "Animation not found: " + animationName;
                return this.setAnimation(trackIndex, animation, loop);
            },
            /** Set the current animation. Any queued animations are cleared. */
            setAnimation: function (trackIndex, animation, loop) {
                var entry = new spine.TrackEntry();
                entry.animation = animation;
                entry.loop = loop;
                entry.endTime = animation.duration;
                this.setCurrent(trackIndex, entry);
                return entry;
            },
            addAnimationByName: function (trackIndex, animationName, loop, delay) {
                var animation = this.data.skeletonData.findAnimation(animationName);
                if (!animation)
                    throw "Animation not found: " + animationName;
                return this.addAnimation(trackIndex, animation, loop, delay);
            },
            /** Adds an animation to be played delay seconds after the current or last queued animation.
             * @param delay May be <= 0 to use duration of previous animation minus any mix duration plus the negative delay. */
            addAnimation: function (trackIndex, animation, loop, delay) {
                var entry = new spine.TrackEntry();
                entry.animation = animation;
                entry.loop = loop;
                entry.endTime = animation.duration;
                var last = this._expandToIndex(trackIndex);
                if (last) {
                    while (last.next)
                        last = last.next;
                    last.next = entry;
                }
                else
                    this.tracks[trackIndex] = entry;
                if (delay <= 0) {
                    if (last)
                        delay += last.endTime - this.data.getMix(last.animation, animation);
                    else
                        delay = 0;
                }
                entry.delay = delay;
                return entry;
            },
            /** May be null. */
            getCurrent: function (trackIndex) {
                if (trackIndex >= this.tracks.length)
                    return null;
                return this.tracks[trackIndex];
            }
        };
        spine.SkeletonJson = function (attachmentLoader) {
            this.attachmentLoader = attachmentLoader;
        };
        spine.SkeletonJson.prototype = {
            scale: 1,
            readSkeletonData: function (root, name) {
                var skeletonData = new spine.SkeletonData();
                skeletonData.name = name;
                // Skeleton.
                var skeletonMap = root["skeleton"];
                if (skeletonMap) {
                    skeletonData.hash = skeletonMap["hash"];
                    skeletonData.version = skeletonMap["spine"];
                    skeletonData.width = skeletonMap["width"] || 0;
                    skeletonData.height = skeletonMap["height"] || 0;
                }
                // Bones.
                var bones = root["bones"];
                for (var i = 0, n = bones.length; i < n; i++) {
                    var boneMap = bones[i];
                    var parent = null;
                    if (boneMap["parent"]) {
                        parent = skeletonData.findBone(boneMap["parent"]);
                        if (!parent)
                            throw "Parent bone not found: " + boneMap["parent"];
                    }
                    var boneData = new spine.BoneData(boneMap["name"], parent);
                    boneData.length = (boneMap["length"] || 0) * this.scale;
                    boneData.x = (boneMap["x"] || 0) * this.scale;
                    boneData.y = (boneMap["y"] || 0) * this.scale;
                    boneData.rotation = (boneMap["rotation"] || 0);
                    boneData.scaleX = boneMap.hasOwnProperty("scaleX") ? boneMap["scaleX"] : 1;
                    boneData.scaleY = boneMap.hasOwnProperty("scaleY") ? boneMap["scaleY"] : 1;
                    boneData.inheritScale = boneMap.hasOwnProperty("inheritScale") ? boneMap["inheritScale"] : true;
                    boneData.inheritRotation = boneMap.hasOwnProperty("inheritRotation") ? boneMap["inheritRotation"] : true;
                    skeletonData.bones.push(boneData);
                }
                // IK constraints.
                var ik = root["ik"];
                if (ik) {
                    for (var i = 0, n = ik.length; i < n; i++) {
                        var ikMap = ik[i];
                        var ikConstraintData = new spine.IkConstraintData(ikMap["name"]);
                        var bones = ikMap["bones"];
                        for (var ii = 0, nn = bones.length; ii < nn; ii++) {
                            var bone = skeletonData.findBone(bones[ii]);
                            if (!bone)
                                throw "IK bone not found: " + bones[ii];
                            ikConstraintData.bones.push(bone);
                        }
                        ikConstraintData.target = skeletonData.findBone(ikMap["target"]);
                        if (!ikConstraintData.target)
                            throw "Target bone not found: " + ikMap["target"];
                        ikConstraintData.bendDirection = (!ikMap.hasOwnProperty("bendPositive") || ikMap["bendPositive"]) ? 1 : -1;
                        ikConstraintData.mix = ikMap.hasOwnProperty("mix") ? ikMap["mix"] : 1;
                        skeletonData.ikConstraints.push(ikConstraintData);
                    }
                }
                // Slots.
                var slots = root["slots"];
                for (var i = 0, n = slots.length; i < n; i++) {
                    var slotMap = slots[i];
                    var boneData = skeletonData.findBone(slotMap["bone"]);
                    if (!boneData)
                        throw "Slot bone not found: " + slotMap["bone"];
                    var slotData = new spine.SlotData(slotMap["name"], boneData);
                    var color = slotMap["color"];
                    if (color) {
                        slotData.r = this.toColor(color, 0);
                        slotData.g = this.toColor(color, 1);
                        slotData.b = this.toColor(color, 2);
                        slotData.a = this.toColor(color, 3);
                    }
                    slotData.attachmentName = slotMap["attachment"];
                    slotData.blendMode = spine.AttachmentType[slotMap["blend"] || "normal"];
                    skeletonData.slots.push(slotData);
                }
                // Skins.
                var skins = root["skins"];
                for (var skinName in skins) {
                    if (!skins.hasOwnProperty(skinName))
                        continue;
                    var skinMap = skins[skinName];
                    var skin = new spine.Skin(skinName);
                    for (var slotName in skinMap) {
                        if (!skinMap.hasOwnProperty(slotName))
                            continue;
                        var slotIndex = skeletonData.findSlotIndex(slotName);
                        var slotEntry = skinMap[slotName];
                        for (var attachmentName in slotEntry) {
                            if (!slotEntry.hasOwnProperty(attachmentName))
                                continue;
                            var attachment = this.readAttachment(skin, attachmentName, slotEntry[attachmentName]);
                            if (attachment)
                                skin.addAttachment(slotIndex, attachmentName, attachment);
                        }
                    }
                    skeletonData.skins.push(skin);
                    if (skin.name == "default")
                        skeletonData.defaultSkin = skin;
                }
                // Events.
                var events = root["events"];
                for (var eventName in events) {
                    if (!events.hasOwnProperty(eventName))
                        continue;
                    var eventMap = events[eventName];
                    var eventData = new spine.EventData(eventName);
                    eventData.intValue = eventMap["int"] || 0;
                    eventData.floatValue = eventMap["float"] || 0;
                    eventData.stringValue = eventMap["string"] || null;
                    skeletonData.events.push(eventData);
                }
                // Animations.
                var animations = root["animations"];
                for (var animationName in animations) {
                    if (!animations.hasOwnProperty(animationName))
                        continue;
                    this.readAnimation(animationName, animations[animationName], skeletonData);
                }
                return skeletonData;
            },
            readAttachment: function (skin, name, map) {
                name = map["name"] || name;
                var type = spine.AttachmentType[map["type"] || "region"];
                var path = map["path"] || name;
                var scale = this.scale;
                if (type == spine.AttachmentType.region) {
                    var region = this.attachmentLoader.newRegionAttachment(skin, name, path);
                    if (!region)
                        return null;
                    region.path = path;
                    region.x = (map["x"] || 0) * scale;
                    region.y = (map["y"] || 0) * scale;
                    region.scaleX = map.hasOwnProperty("scaleX") ? map["scaleX"] : 1;
                    region.scaleY = map.hasOwnProperty("scaleY") ? map["scaleY"] : 1;
                    region.rotation = map["rotation"] || 0;
                    region.width = (map["width"] || 0) * scale;
                    region.height = (map["height"] || 0) * scale;
                    var color = map["color"];
                    if (color) {
                        region.r = this.toColor(color, 0);
                        region.g = this.toColor(color, 1);
                        region.b = this.toColor(color, 2);
                        region.a = this.toColor(color, 3);
                    }
                    region.updateOffset();
                    return region;
                }
                else if (type == spine.AttachmentType.mesh) {
                    var mesh = this.attachmentLoader.newMeshAttachment(skin, name, path);
                    if (!mesh)
                        return null;
                    mesh.path = path;
                    mesh.vertices = this.getFloatArray(map, "vertices", scale);
                    mesh.triangles = this.getIntArray(map, "triangles");
                    mesh.regionUVs = this.getFloatArray(map, "uvs", 1);
                    mesh.updateUVs();
                    color = map["color"];
                    if (color) {
                        mesh.r = this.toColor(color, 0);
                        mesh.g = this.toColor(color, 1);
                        mesh.b = this.toColor(color, 2);
                        mesh.a = this.toColor(color, 3);
                    }
                    mesh.hullLength = (map["hull"] || 0) * 2;
                    if (map["edges"])
                        mesh.edges = this.getIntArray(map, "edges");
                    mesh.width = (map["width"] || 0) * scale;
                    mesh.height = (map["height"] || 0) * scale;
                    return mesh;
                }
                else if (type == spine.AttachmentType.skinnedmesh) {
                    var mesh = this.attachmentLoader.newSkinnedMeshAttachment(skin, name, path);
                    if (!mesh)
                        return null;
                    mesh.path = path;
                    var uvs = this.getFloatArray(map, "uvs", 1);
                    var vertices = this.getFloatArray(map, "vertices", 1);
                    var weights = [];
                    var bones = [];
                    for (var i = 0, n = vertices.length; i < n;) {
                        var boneCount = vertices[i++] | 0;
                        bones[bones.length] = boneCount;
                        for (var nn = i + boneCount * 4; i < nn;) {
                            bones[bones.length] = vertices[i];
                            weights[weights.length] = vertices[i + 1] * scale;
                            weights[weights.length] = vertices[i + 2] * scale;
                            weights[weights.length] = vertices[i + 3];
                            i += 4;
                        }
                    }
                    mesh.bones = bones;
                    mesh.weights = weights;
                    mesh.triangles = this.getIntArray(map, "triangles");
                    mesh.regionUVs = uvs;
                    mesh.updateUVs();
                    color = map["color"];
                    if (color) {
                        mesh.r = this.toColor(color, 0);
                        mesh.g = this.toColor(color, 1);
                        mesh.b = this.toColor(color, 2);
                        mesh.a = this.toColor(color, 3);
                    }
                    mesh.hullLength = (map["hull"] || 0) * 2;
                    if (map["edges"])
                        mesh.edges = this.getIntArray(map, "edges");
                    mesh.width = (map["width"] || 0) * scale;
                    mesh.height = (map["height"] || 0) * scale;
                    return mesh;
                }
                else if (type == spine.AttachmentType.boundingbox) {
                    var attachment = this.attachmentLoader.newBoundingBoxAttachment(skin, name);
                    var vertices = map["vertices"];
                    for (var i = 0, n = vertices.length; i < n; i++)
                        attachment.vertices.push(vertices[i] * scale);
                    return attachment;
                }
                throw "Unknown attachment type: " + type;
            },
            readAnimation: function (name, map, skeletonData) {
                var timelines = [];
                var duration = 0;
                var slots = map["slots"];
                for (var slotName in slots) {
                    if (!slots.hasOwnProperty(slotName))
                        continue;
                    var slotMap = slots[slotName];
                    var slotIndex = skeletonData.findSlotIndex(slotName);
                    for (var timelineName in slotMap) {
                        if (!slotMap.hasOwnProperty(timelineName))
                            continue;
                        var values = slotMap[timelineName];
                        if (timelineName == "color") {
                            var timeline = new spine.ColorTimeline(values.length);
                            timeline.slotIndex = slotIndex;
                            var frameIndex = 0;
                            for (var i = 0, n = values.length; i < n; i++) {
                                var valueMap = values[i];
                                var color = valueMap["color"];
                                var r = this.toColor(color, 0);
                                var g = this.toColor(color, 1);
                                var b = this.toColor(color, 2);
                                var a = this.toColor(color, 3);
                                timeline.setFrame(frameIndex, valueMap["time"], r, g, b, a);
                                this.readCurve(timeline, frameIndex, valueMap);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 5 - 5]);
                        }
                        else if (timelineName == "attachment") {
                            var timeline = new spine.AttachmentTimeline(values.length);
                            timeline.slotIndex = slotIndex;
                            var frameIndex = 0;
                            for (var i = 0, n = values.length; i < n; i++) {
                                var valueMap = values[i];
                                timeline.setFrame(frameIndex++, valueMap["time"], valueMap["name"]);
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
                        }
                        else
                            throw "Invalid timeline type for a slot: " + timelineName + " (" + slotName + ")";
                    }
                }
                var bones = map["bones"];
                for (var boneName in bones) {
                    if (!bones.hasOwnProperty(boneName))
                        continue;
                    var boneIndex = skeletonData.findBoneIndex(boneName);
                    if (boneIndex == -1)
                        throw "Bone not found: " + boneName;
                    var boneMap = bones[boneName];
                    for (var timelineName in boneMap) {
                        if (!boneMap.hasOwnProperty(timelineName))
                            continue;
                        var values = boneMap[timelineName];
                        if (timelineName == "rotate") {
                            var timeline = new spine.RotateTimeline(values.length);
                            timeline.boneIndex = boneIndex;
                            var frameIndex = 0;
                            for (var i = 0, n = values.length; i < n; i++) {
                                var valueMap = values[i];
                                timeline.setFrame(frameIndex, valueMap["time"], valueMap["angle"]);
                                this.readCurve(timeline, frameIndex, valueMap);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 2 - 2]);
                        }
                        else if (timelineName == "translate" || timelineName == "scale") {
                            var timeline;
                            var timelineScale = 1;
                            if (timelineName == "scale")
                                timeline = new spine.ScaleTimeline(values.length);
                            else {
                                timeline = new spine.TranslateTimeline(values.length);
                                timelineScale = this.scale;
                            }
                            timeline.boneIndex = boneIndex;
                            var frameIndex = 0;
                            for (var i = 0, n = values.length; i < n; i++) {
                                var valueMap = values[i];
                                var x = (valueMap["x"] || 0) * timelineScale;
                                var y = (valueMap["y"] || 0) * timelineScale;
                                timeline.setFrame(frameIndex, valueMap["time"], x, y);
                                this.readCurve(timeline, frameIndex, valueMap);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 3 - 3]);
                        }
                        else if (timelineName == "flipX" || timelineName == "flipY") {
                            var x_1 = timelineName == "flipX";
                            var timeline = x_1 ? new spine.FlipXTimeline(values.length) : new spine.FlipYTimeline(values.length);
                            timeline.boneIndex = boneIndex;
                            var field = x_1 ? "x" : "y";
                            var frameIndex = 0;
                            for (var i = 0, n = values.length; i < n; i++) {
                                var valueMap = values[i];
                                timeline.setFrame(frameIndex, valueMap["time"], valueMap[field] || false);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 2 - 2]);
                        }
                        else
                            throw "Invalid timeline type for a bone: " + timelineName + " (" + boneName + ")";
                    }
                }
                var ikMap = map["ik"];
                for (var ikConstraintName in ikMap) {
                    if (!ikMap.hasOwnProperty(ikConstraintName))
                        continue;
                    var ikConstraint = skeletonData.findIkConstraint(ikConstraintName);
                    var values = ikMap[ikConstraintName];
                    var timeline = new spine.IkConstraintTimeline(values.length);
                    timeline.ikConstraintIndex = skeletonData.ikConstraints.indexOf(ikConstraint);
                    var frameIndex = 0;
                    for (var i = 0, n = values.length; i < n; i++) {
                        var valueMap = values[i];
                        var mix = valueMap.hasOwnProperty("mix") ? valueMap["mix"] : 1;
                        var bendDirection = (!valueMap.hasOwnProperty("bendPositive") || valueMap["bendPositive"]) ? 1 : -1;
                        timeline.setFrame(frameIndex, valueMap["time"], mix, bendDirection);
                        this.readCurve(timeline, frameIndex, valueMap);
                        frameIndex++;
                    }
                    timelines.push(timeline);
                    duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 3 - 3]);
                }
                var ffd = map["ffd"];
                for (var skinName in ffd) {
                    var skin = skeletonData.findSkin(skinName);
                    var slotMap = ffd[skinName];
                    for (slotName in slotMap) {
                        var slotIndex = skeletonData.findSlotIndex(slotName);
                        var meshMap = slotMap[slotName];
                        for (var meshName in meshMap) {
                            var values = meshMap[meshName];
                            var timeline = new spine.FfdTimeline(values.length);
                            var attachment = skin.getAttachment(slotIndex, meshName);
                            if (!attachment)
                                throw "FFD attachment not found: " + meshName;
                            timeline.slotIndex = slotIndex;
                            timeline.attachment = attachment;
                            var isMesh = attachment.type == spine.AttachmentType.mesh;
                            var vertexCount;
                            if (isMesh)
                                vertexCount = attachment.vertices.length;
                            else
                                vertexCount = attachment.weights.length / 3 * 2;
                            var frameIndex = 0;
                            for (var i = 0, n = values.length; i < n; i++) {
                                var valueMap = values[i];
                                var vertices;
                                if (!valueMap["vertices"]) {
                                    if (isMesh)
                                        vertices = attachment.vertices;
                                    else {
                                        vertices = [];
                                        vertices.length = vertexCount;
                                    }
                                }
                                else {
                                    var verticesValue = valueMap["vertices"];
                                    vertices = [];
                                    vertices.length = vertexCount;
                                    var start = valueMap["offset"] || 0;
                                    var nn = verticesValue.length;
                                    if (this.scale == 1) {
                                        for (var ii = 0; ii < nn; ii++)
                                            vertices[ii + start] = verticesValue[ii];
                                    }
                                    else {
                                        for (var ii = 0; ii < nn; ii++)
                                            vertices[ii + start] = verticesValue[ii] * this.scale;
                                    }
                                    if (isMesh) {
                                        var meshVertices = attachment.vertices;
                                        for (var ii = 0, nn = vertices.length; ii < nn; ii++)
                                            vertices[ii] += meshVertices[ii];
                                    }
                                }
                                timeline.setFrame(frameIndex, valueMap["time"], vertices);
                                this.readCurve(timeline, frameIndex, valueMap);
                                frameIndex++;
                            }
                            timelines[timelines.length] = timeline;
                            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
                        }
                    }
                }
                var drawOrderValues = map["drawOrder"];
                if (!drawOrderValues)
                    drawOrderValues = map["draworder"];
                if (drawOrderValues) {
                    var timeline = new spine.DrawOrderTimeline(drawOrderValues.length);
                    var slotCount = skeletonData.slots.length;
                    var frameIndex = 0;
                    for (var i = 0, n = drawOrderValues.length; i < n; i++) {
                        var drawOrderMap = drawOrderValues[i];
                        var drawOrder = null;
                        if (drawOrderMap["offsets"]) {
                            drawOrder = [];
                            drawOrder.length = slotCount;
                            for (var ii = slotCount - 1; ii >= 0; ii--)
                                drawOrder[ii] = -1;
                            var offsets = drawOrderMap["offsets"];
                            var unchanged = [];
                            unchanged.length = slotCount - offsets.length;
                            var originalIndex = 0, unchangedIndex = 0;
                            for (var ii = 0, nn = offsets.length; ii < nn; ii++) {
                                var offsetMap = offsets[ii];
                                var slotIndex = skeletonData.findSlotIndex(offsetMap["slot"]);
                                if (slotIndex == -1)
                                    throw "Slot not found: " + offsetMap["slot"];
                                // Collect unchanged items.
                                while (originalIndex != slotIndex)
                                    unchanged[unchangedIndex++] = originalIndex++;
                                // Set changed items.
                                drawOrder[originalIndex + offsetMap["offset"]] = originalIndex++;
                            }
                            // Collect remaining unchanged items.
                            while (originalIndex < slotCount)
                                unchanged[unchangedIndex++] = originalIndex++;
                            // Fill in unchanged items.
                            for (var ii = slotCount - 1; ii >= 0; ii--)
                                if (drawOrder[ii] == -1)
                                    drawOrder[ii] = unchanged[--unchangedIndex];
                        }
                        timeline.setFrame(frameIndex++, drawOrderMap["time"], drawOrder);
                    }
                    timelines.push(timeline);
                    duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
                }
                var events = map["events"];
                if (events) {
                    var timeline = new spine.EventTimeline(events.length);
                    var frameIndex = 0;
                    for (var i = 0, n = events.length; i < n; i++) {
                        var eventMap = events[i];
                        var eventData = skeletonData.findEvent(eventMap["name"]);
                        if (!eventData)
                            throw "Event not found: " + eventMap["name"];
                        var event = new spine.Event(eventData);
                        event.intValue = eventMap.hasOwnProperty("int") ? eventMap["int"] : eventData.intValue;
                        event.floatValue = eventMap.hasOwnProperty("float") ? eventMap["float"] : eventData.floatValue;
                        event.stringValue = eventMap.hasOwnProperty("string") ? eventMap["string"] : eventData.stringValue;
                        timeline.setFrame(frameIndex++, eventMap["time"], event);
                    }
                    timelines.push(timeline);
                    duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
                }
                skeletonData.animations.push(new spine.Animation(name, timelines, duration));
            },
            readCurve: function (timeline, frameIndex, valueMap) {
                var curve = valueMap["curve"];
                if (!curve)
                    timeline.curves.setLinear(frameIndex);
                else if (curve == "stepped")
                    timeline.curves.setStepped(frameIndex);
                else if (curve instanceof Array)
                    timeline.curves.setCurve(frameIndex, curve[0], curve[1], curve[2], curve[3]);
            },
            toColor: function (hexString, colorIndex) {
                if (hexString.length != 8)
                    throw "Color hexidecimal length must be 8, recieved: " + hexString;
                return parseInt(hexString.substring(colorIndex * 2, (colorIndex * 2) + 2), 16) / 255;
            },
            getFloatArray: function (map, name, scale) {
                var list = map[name];
                var values = new spine.Float32Array(list.length);
                var i = 0, n = list.length;
                if (scale == 1) {
                    for (; i < n; i++)
                        values[i] = list[i];
                }
                else {
                    for (; i < n; i++)
                        values[i] = list[i] * scale;
                }
                return values;
            },
            getIntArray: function (map, name) {
                var list = map[name];
                var values = new spine.Uint16Array(list.length);
                for (var i = 0, n = list.length; i < n; i++)
                    values[i] = list[i] | 0;
                return values;
            }
        };
        spine.Atlas = function (atlasText, textureLoader) {
            this.textureLoader = textureLoader;
            this.pages = [];
            this.regions = [];
            var reader = new spine.AtlasReader(atlasText);
            var tuple = [];
            tuple.length = 4;
            var page = null;
            while (true) {
                var line = reader.readLine();
                if (line === null)
                    break;
                line = reader.trim(line);
                if (!line.length)
                    page = null;
                else if (!page) {
                    page = new spine.AtlasPage();
                    page.name = line;
                    if (reader.readTuple(tuple) == 2) {
                        page.width = parseInt(tuple[0]);
                        page.height = parseInt(tuple[1]);
                        reader.readTuple(tuple);
                    }
                    page.format = spine.Atlas.Format[tuple[0]];
                    reader.readTuple(tuple);
                    page.minFilter = spine.Atlas.TextureFilter[tuple[0]];
                    page.magFilter = spine.Atlas.TextureFilter[tuple[1]];
                    var direction = reader.readValue();
                    page.uWrap = spine.Atlas.TextureWrap.clampToEdge;
                    page.vWrap = spine.Atlas.TextureWrap.clampToEdge;
                    if (direction == "x")
                        page.uWrap = spine.Atlas.TextureWrap.repeat;
                    else if (direction == "y")
                        page.vWrap = spine.Atlas.TextureWrap.repeat;
                    else if (direction == "xy")
                        page.uWrap = page.vWrap = spine.Atlas.TextureWrap.repeat;
                    textureLoader && textureLoader.load(page, line, this);
                    this.pages.push(page);
                }
                else {
                    var region = new spine.AtlasRegion();
                    region.name = line;
                    region.page = page;
                    region.rotate = reader.readValue() == "true";
                    reader.readTuple(tuple);
                    var x = parseInt(tuple[0]);
                    var y = parseInt(tuple[1]);
                    reader.readTuple(tuple);
                    var width = parseInt(tuple[0]);
                    var height = parseInt(tuple[1]);
                    region.u = x / page.width;
                    region.v = y / page.height;
                    if (region.rotate) {
                        region.u2 = (x + height) / page.width;
                        region.v2 = (y + width) / page.height;
                    }
                    else {
                        region.u2 = (x + width) / page.width;
                        region.v2 = (y + height) / page.height;
                    }
                    region.x = x;
                    region.y = y;
                    region.width = Math.abs(width);
                    region.height = Math.abs(height);
                    if (reader.readTuple(tuple) == 4) {
                        region.splits = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];
                        if (reader.readTuple(tuple) == 4) {
                            region.pads = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];
                            reader.readTuple(tuple);
                        }
                    }
                    region.originalWidth = parseInt(tuple[0]);
                    region.originalHeight = parseInt(tuple[1]);
                    reader.readTuple(tuple);
                    region.offsetX = parseInt(tuple[0]);
                    region.offsetY = parseInt(tuple[1]);
                    region.index = parseInt(reader.readValue());
                    this.regions.push(region);
                }
            }
        };
        spine.Atlas.prototype = {
            findRegion: function (name) {
                var regions = this.regions;
                for (var i = 0, n = regions.length; i < n; i++)
                    if (regions[i].name == name)
                        return regions[i];
                return null;
            },
            dispose: function () {
                var pages = this.pages;
                for (var i = 0, n = pages.length; i < n; i++)
                    this.textureLoader && this.textureLoader.unload(pages[i].rendererObject);
            },
            updateUVs: function (page) {
                var regions = this.regions;
                for (var i = 0, n = regions.length; i < n; i++) {
                    var region = regions[i];
                    if (region.page != page)
                        continue;
                    region.u = region.x / page.width;
                    region.v = region.y / page.height;
                    if (region.rotate) {
                        region.u2 = (region.x + region.height) / page.width;
                        region.v2 = (region.y + region.width) / page.height;
                    }
                    else {
                        region.u2 = (region.x + region.width) / page.width;
                        region.v2 = (region.y + region.height) / page.height;
                    }
                }
            }
        };
        spine.Atlas.Format = {
            alpha: 0,
            intensity: 1,
            luminanceAlpha: 2,
            rgb565: 3,
            rgba4444: 4,
            rgb888: 5,
            rgba8888: 6
        };
        spine.Atlas.TextureFilter = {
            nearest: 0,
            linear: 1,
            mipMap: 2,
            mipMapNearestNearest: 3,
            mipMapLinearNearest: 4,
            mipMapNearestLinear: 5,
            mipMapLinearLinear: 6
        };
        spine.Atlas.TextureWrap = {
            mirroredRepeat: 0,
            clampToEdge: 1,
            repeat: 2
        };
        spine.AtlasPage = function () { };
        spine.AtlasPage.prototype = {
            name: null,
            format: null,
            minFilter: null,
            magFilter: null,
            uWrap: null,
            vWrap: null,
            rendererObject: null,
            width: 0,
            height: 0
        };
        spine.AtlasRegion = function () { };
        spine.AtlasRegion.prototype = {
            page: null,
            name: null,
            x: 0, y: 0,
            width: 0, height: 0,
            u: 0, v: 0, u2: 0, v2: 0,
            offsetX: 0, offsetY: 0,
            originalWidth: 0, originalHeight: 0,
            index: 0,
            rotate: false,
            splits: null,
            pads: null
        };
        spine.AtlasReader = function (text) {
            this.lines = text.split(/\r\n|\r|\n/);
        };
        spine.AtlasReader.prototype = {
            index: 0,
            trim: function (value) {
                return value.replace(/^\s+|\s+$/g, "");
            },
            readLine: function () {
                if (this.index >= this.lines.length)
                    return null;
                return this.lines[this.index++];
            },
            readValue: function () {
                var line = this.readLine();
                var colon = line.indexOf(":");
                if (colon == -1)
                    throw "Invalid line: " + line;
                return this.trim(line.substring(colon + 1));
            },
            /** Returns the number of tuple values read (1, 2 or 4). */
            readTuple: function (tuple) {
                var line = this.readLine();
                var colon = line.indexOf(":");
                if (colon == -1)
                    throw "Invalid line: " + line;
                var i = 0, lastMatch = colon + 1;
                for (; i < 3; i++) {
                    var comma = line.indexOf(",", lastMatch);
                    if (comma == -1)
                        break;
                    tuple[i] = this.trim(line.substr(lastMatch, comma - lastMatch));
                    lastMatch = comma + 1;
                }
                tuple[i] = this.trim(line.substring(lastMatch));
                return i + 1;
            }
        };
        spine.AtlasAttachmentLoader = function (atlas) {
            this.atlas = atlas;
        };
        spine.AtlasAttachmentLoader.prototype = {
            newRegionAttachment: function (skin, name, path) {
                var region = this.atlas.findRegion(path);
                if (!region)
                    throw "Region not found in atlas: " + path + " (region attachment: " + name + ")";
                var attachment = new spine.RegionAttachment(name);
                attachment.rendererObject = region;
                attachment.setUVs(region.u, region.v, region.u2, region.v2, region.rotate);
                attachment.regionOffsetX = region.offsetX;
                attachment.regionOffsetY = region.offsetY;
                attachment.regionWidth = region.width;
                attachment.regionHeight = region.height;
                attachment.regionOriginalWidth = region.originalWidth;
                attachment.regionOriginalHeight = region.originalHeight;
                return attachment;
            },
            newMeshAttachment: function (skin, name, path) {
                var region = this.atlas.findRegion(path);
                if (!region)
                    throw "Region not found in atlas: " + path + " (mesh attachment: " + name + ")";
                var attachment = new spine.MeshAttachment(name);
                attachment.rendererObject = region;
                attachment.regionU = region.u;
                attachment.regionV = region.v;
                attachment.regionU2 = region.u2;
                attachment.regionV2 = region.v2;
                attachment.regionRotate = region.rotate;
                attachment.regionOffsetX = region.offsetX;
                attachment.regionOffsetY = region.offsetY;
                attachment.regionWidth = region.width;
                attachment.regionHeight = region.height;
                attachment.regionOriginalWidth = region.originalWidth;
                attachment.regionOriginalHeight = region.originalHeight;
                return attachment;
            },
            newSkinnedMeshAttachment: function (skin, name, path) {
                var region = this.atlas.findRegion(path);
                if (!region)
                    throw "Region not found in atlas: " + path + " (skinned mesh attachment: " + name + ")";
                var attachment = new spine.SkinnedMeshAttachment(name);
                attachment.rendererObject = region;
                attachment.regionU = region.u;
                attachment.regionV = region.v;
                attachment.regionU2 = region.u2;
                attachment.regionV2 = region.v2;
                attachment.regionRotate = region.rotate;
                attachment.regionOffsetX = region.offsetX;
                attachment.regionOffsetY = region.offsetY;
                attachment.regionWidth = region.width;
                attachment.regionHeight = region.height;
                attachment.regionOriginalWidth = region.originalWidth;
                attachment.regionOriginalHeight = region.originalHeight;
                return attachment;
            },
            newBoundingBoxAttachment: function (skin, name) {
                return new spine.BoundingBoxAttachment(name);
            }
        };
        spine.SkeletonBounds = function () {
            this.polygonPool = [];
            this.polygons = [];
            this.boundingBoxes = [];
        };
        spine.SkeletonBounds.prototype = {
            minX: 0, minY: 0, maxX: 0, maxY: 0,
            update: function (skeleton, updateAabb) {
                var slots = skeleton.slots;
                var slotCount = slots.length;
                var x = skeleton.x, y = skeleton.y;
                var boundingBoxes = this.boundingBoxes;
                var polygonPool = this.polygonPool;
                var polygons = this.polygons;
                boundingBoxes.length = 0;
                for (var i = 0, n = polygons.length; i < n; i++)
                    polygonPool.push(polygons[i]);
                polygons.length = 0;
                for (var i = 0; i < slotCount; i++) {
                    var slot = slots[i];
                    var boundingBox = slot.attachment;
                    if (boundingBox.type != spine.AttachmentType.boundingbox)
                        continue;
                    boundingBoxes.push(boundingBox);
                    var poolCount = polygonPool.length, polygon;
                    if (poolCount > 0) {
                        polygon = polygonPool[poolCount - 1];
                        polygonPool.splice(poolCount - 1, 1);
                    }
                    else
                        polygon = [];
                    polygons.push(polygon);
                    polygon.length = boundingBox.vertices.length;
                    boundingBox.computeWorldVertices(x, y, slot.bone, polygon);
                }
                if (updateAabb)
                    this.aabbCompute();
            },
            aabbCompute: function () {
                var polygons = this.polygons;
                var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE, maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;
                for (var i = 0, n = polygons.length; i < n; i++) {
                    var vertices = polygons[i];
                    for (var ii = 0, nn = vertices.length; ii < nn; ii += 2) {
                        var x = vertices[ii];
                        var y = vertices[ii + 1];
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                }
                this.minX = minX;
                this.minY = minY;
                this.maxX = maxX;
                this.maxY = maxY;
            },
            /** Returns true if the axis aligned bounding box contains the point. */
            aabbContainsPoint: function (x, y) {
                return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY;
            },
            /** Returns true if the axis aligned bounding box intersects the line segment. */
            aabbIntersectsSegment: function (x1, y1, x2, y2) {
                var minX = this.minX, minY = this.minY, maxX = this.maxX, maxY = this.maxY;
                if ((x1 <= minX && x2 <= minX) || (y1 <= minY && y2 <= minY) || (x1 >= maxX && x2 >= maxX) || (y1 >= maxY && y2 >= maxY))
                    return false;
                var m = (y2 - y1) / (x2 - x1);
                var y = m * (minX - x1) + y1;
                if (y > minY && y < maxY)
                    return true;
                y = m * (maxX - x1) + y1;
                if (y > minY && y < maxY)
                    return true;
                var x = (minY - y1) / m + x1;
                if (x > minX && x < maxX)
                    return true;
                x = (maxY - y1) / m + x1;
                if (x > minX && x < maxX)
                    return true;
                return false;
            },
            /** Returns true if the axis aligned bounding box intersects the axis aligned bounding box of the specified bounds. */
            aabbIntersectsSkeleton: function (bounds) {
                return this.minX < bounds.maxX && this.maxX > bounds.minX && this.minY < bounds.maxY && this.maxY > bounds.minY;
            },
            /** Returns the first bounding box attachment that contains the point, or null. When doing many checks, it is usually more
             * efficient to only call this method if {@link #aabbContainsPoint(float, float)} returns true. */
            containsPoint: function (x, y) {
                var polygons = this.polygons;
                for (var i = 0, n = polygons.length; i < n; i++)
                    if (this.polygonContainsPoint(polygons[i], x, y))
                        return this.boundingBoxes[i];
                return null;
            },
            /** Returns the first bounding box attachment that contains the line segment, or null. When doing many checks, it is usually
             * more efficient to only call this method if {@link #aabbIntersectsSegment(float, float, float, float)} returns true. */
            intersectsSegment: function (x1, y1, x2, y2) {
                var polygons = this.polygons;
                for (var i = 0, n = polygons.length; i < n; i++)
                    if (polygons[i].intersectsSegment(x1, y1, x2, y2))
                        return this.boundingBoxes[i];
                return null;
            },
            /** Returns true if the polygon contains the point. */
            polygonContainsPoint: function (polygon, x, y) {
                var nn = polygon.length;
                var prevIndex = nn - 2;
                var inside = false;
                for (var ii = 0; ii < nn; ii += 2) {
                    var vertexY = polygon[ii + 1];
                    var prevY = polygon[prevIndex + 1];
                    if ((vertexY < y && prevY >= y) || (prevY < y && vertexY >= y)) {
                        var vertexX = polygon[ii];
                        if (vertexX + (y - vertexY) / (prevY - vertexY) * (polygon[prevIndex] - vertexX) < x)
                            inside = !inside;
                    }
                    prevIndex = ii;
                }
                return inside;
            },
            /** Returns true if the polygon contains the line segment. */
            polygonIntersectsSegment: function (polygon, x1, y1, x2, y2) {
                var nn = polygon.length;
                var width12 = x1 - x2, height12 = y1 - y2;
                var det1 = x1 * y2 - y1 * x2;
                var x3 = polygon[nn - 2], y3 = polygon[nn - 1];
                for (var ii = 0; ii < nn; ii += 2) {
                    var x4 = polygon[ii], y4 = polygon[ii + 1];
                    var det2 = x3 * y4 - y3 * x4;
                    var width34 = x3 - x4, height34 = y3 - y4;
                    var det3 = width12 * height34 - height12 * width34;
                    var x = (det1 * width34 - width12 * det2) / det3;
                    if (((x >= x3 && x <= x4) || (x >= x4 && x <= x3)) && ((x >= x1 && x <= x2) || (x >= x2 && x <= x1))) {
                        var y = (det1 * height34 - height12 * det2) / det3;
                        if (((y >= y3 && y <= y4) || (y >= y4 && y <= y3)) && ((y >= y1 && y <= y2) || (y >= y2 && y <= y1)))
                            return true;
                    }
                    x3 = x4;
                    y3 = y4;
                }
                return false;
            },
            getPolygon: function (attachment) {
                var index = this.boundingBoxes.indexOf(attachment);
                return index == -1 ? null : this.polygons[index];
            },
            getWidth: function () {
                return this.maxX - this.minX;
            },
            getHeight: function () {
                return this.maxY - this.minY;
            }
        };
    })(spine = WOZLLA.spine || (WOZLLA.spine = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../asset/impl/PlainText.ts"/>
/// <reference path="../asset/AssetManager.ts"/>
/// <reference path="../asset/LoaderManager.ts"/>
/// <reference path="runtime.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var spine;
    (function (spine) {
        var SpineAtlasDescriptor = (function (_super) {
            __extends(SpineAtlasDescriptor, _super);
            function SpineAtlasDescriptor(options) {
                _super.call(this, options);
                this.options.responseType = 'text';
            }
            SpineAtlasDescriptor.prototype.getClass = function () {
                return SpineAtlas.CLASS;
            };
            return SpineAtlasDescriptor;
        })(WOZLLA.asset.AjaxDescriptor);
        spine.SpineAtlasDescriptor = SpineAtlasDescriptor;
        var SpineAtlas = (function (_super) {
            __extends(SpineAtlas, _super);
            function SpineAtlas(descriptor, plainText, assetManager) {
                _super.call(this, descriptor, plainText, assetManager);
                this._spineRuntimeAtlas = new spine.runtime.Atlas(plainText);
            }
            Object.defineProperty(SpineAtlas.prototype, "spineRuntimeAtlas", {
                get: function () {
                    return this._spineRuntimeAtlas;
                },
                enumerable: true,
                configurable: true
            });
            SpineAtlas.CLASS = "SpineAtlas";
            return SpineAtlas;
        })(WOZLLA.asset.PlainTextAsset);
        spine.SpineAtlas = SpineAtlas;
        var SpineAtlasLoader = (function (_super) {
            __extends(SpineAtlasLoader, _super);
            function SpineAtlasLoader() {
                _super.apply(this, arguments);
            }
            SpineAtlasLoader.prototype.onAjaxSuccess = function (decriptor, xhr, callback) {
                callback(null, new SpineAtlas(decriptor, xhr.responseText, this.assetManager));
            };
            return SpineAtlasLoader;
        })(WOZLLA.asset.PlainTextLoader);
        spine.SpineAtlasLoader = SpineAtlasLoader;
        WOZLLA.asset.LoaderManager.getInstance().register(SpineAtlas.CLASS, function (assetManager) {
            return new SpineAtlasLoader(assetManager);
        });
    })(spine = WOZLLA.spine || (WOZLLA.spine = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../component/Property.ts"/>
/// <reference path="runtime.ts"/>
/// <reference path="SpineAtlas.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var spine;
    (function (spine) {
        spine.runtime.Bone.yDown = true;
        var AbstractSkeletonRenderer = (function (_super) {
            __extends(AbstractSkeletonRenderer, _super);
            function AbstractSkeletonRenderer() {
                _super.call(this);
                this._speed = new WOZLLA.component.Property(1);
                this._skeletonJsonSrc = new WOZLLA.component.JsonProperty(this);
                this.addAssetProxy(this._skeletonJsonSrc);
            }
            Object.defineProperty(AbstractSkeletonRenderer.prototype, "skeletonJsonSrc", {
                get: function () {
                    return this._skeletonJsonSrc;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AbstractSkeletonRenderer.prototype, "state", {
                get: function () {
                    return this._state;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AbstractSkeletonRenderer.prototype, "speed", {
                get: function () {
                    return this._speed;
                },
                enumerable: true,
                configurable: true
            });
            AbstractSkeletonRenderer.prototype.render = function (renderContext, transformDirty, renderLayer, renderOrder) {
                if (this._skeleton) {
                    if (this._state) {
                        this._skeleton.x = this.transform.worldX;
                        this._skeleton.y = this.transform.worldY;
                        this._state.update(this.director.deltaTime * this.speed.get() / 1000);
                        this._state.apply(this._skeleton);
                        this._skeleton.updateWorldTransform();
                    }
                    var drawOrder = this._skeleton.drawOrder;
                    for (var i = 0, n = drawOrder.length; i < n; i++) {
                        var slot = drawOrder[i];
                        this.renderSlot(renderContext, slot, renderLayer, renderOrder);
                    }
                }
            };
            AbstractSkeletonRenderer.prototype.loadAssets = function (callback) {
                var _this = this;
                _super.prototype.loadAssets.call(this, function () {
                    var jsonAsset = _this._skeletonJsonSrc.getAsset();
                    if (!jsonAsset) {
                        callback && callback();
                        return;
                    }
                    var json = new spine.runtime.SkeletonJson({
                        newRegionAttachment: function (skin, name, path) {
                            return _this.newRegionAttachment(skin, name, path);
                        },
                        newMeshAttachment: function (skin, name, path) {
                            return _this.newMeshAttachment(skin, name, path);
                        },
                        newSkinnedMeshAttachment: function (skin, name, path) {
                            return _this.newSkinnedMeshAttachment(skin, name, path);
                        },
                        newBoundingBoxAttachment: function (skin, name) {
                            return _this.newBoundingBoxAttachment(skin, name);
                        }
                    });
                    var skeletonData = json.readSkeletonData(jsonAsset.getJson(), null);
                    _this._skeleton = new spine.runtime.Skeleton(skeletonData);
                    _this._state = new spine.runtime.AnimationState(new spine.runtime.AnimationStateData(skeletonData));
                    callback && callback();
                });
            };
            AbstractSkeletonRenderer.prototype.newRegionAttachment = function (skin, name, path) {
                return null;
            };
            AbstractSkeletonRenderer.prototype.newMeshAttachment = function (skin, name, path) {
                return null;
            };
            AbstractSkeletonRenderer.prototype.newSkinnedMeshAttachment = function (skin, name, path) {
                return null;
            };
            AbstractSkeletonRenderer.prototype.newBoundingBoxAttachment = function (skin, name) {
                return new spine.runtime.BoundingBoxAttachment(name);
            };
            AbstractSkeletonRenderer.prototype.renderSlot = function (renderContext, slot, renderLayer, renderOrder) {
                throw new Error('This is an abstract method');
            };
            return AbstractSkeletonRenderer;
        })(WOZLLA.Renderer);
        spine.AbstractSkeletonRenderer = AbstractSkeletonRenderer;
    })(spine = WOZLLA.spine || (WOZLLA.spine = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="AbstractSkeletonRenderer.ts"/>
/// <reference path="../math/Matrix3x3.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var spine;
    (function (spine) {
        var SpineAtlasProperty = (function (_super) {
            __extends(SpineAtlasProperty, _super);
            function SpineAtlasProperty() {
                _super.apply(this, arguments);
            }
            SpineAtlasProperty.prototype.createAssetDescriptor = function () {
                var assetPath = this.get();
                if (!assetPath)
                    return null;
                return new spine.SpineAtlasDescriptor(assetPath);
            };
            return SpineAtlasProperty;
        })(WOZLLA.component.AssetProxyProperty);
        spine.SpineAtlasProperty = SpineAtlasProperty;
        var SkeletonRenderer = (function (_super) {
            __extends(SkeletonRenderer, _super);
            function SkeletonRenderer() {
                _super.call(this);
                this._spineAtlasSrc = new SpineAtlasProperty(this);
                this._imageSrc = new WOZLLA.component.ImageProperty(this);
                this.addAssetProxy(this._spineAtlasSrc);
                this.addAssetProxy(this._imageSrc);
            }
            Object.defineProperty(SkeletonRenderer.prototype, "spineAtlasSrc", {
                get: function () {
                    return this._spineAtlasSrc;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SkeletonRenderer.prototype, "imageSrc", {
                get: function () {
                    return this._imageSrc;
                },
                enumerable: true,
                configurable: true
            });
            SkeletonRenderer.prototype.newRegionAttachment = function (skin, name, path) {
                var asset = this._spineAtlasSrc.getAsset();
                if (!asset) {
                    return;
                }
                var region = asset.spineRuntimeAtlas.findRegion(name);
                if (!region)
                    return;
                var attachment = new spine.runtime.RegionAttachment(name);
                var quadCmd = this.director.renderContext.createQuadCommand();
                quadCmd.matrix = new WOZLLA.math.Matrix3x3();
                quadCmd.texture = this._imageSrc.getAsset();
                quadCmd.textureRegion.set(region.x, region.y, region.width, region.height);
                quadCmd.textureRegion.rotate = region.rotate ? WOZLLA.rendering.TextureRegion.ROTATE_ANTI_CLOCK : WOZLLA.rendering.TextureRegion.ROTATE_NONE;
                quadCmd.textureOffset.x = 0.5;
                quadCmd.textureOffset.y = 0.5;
                attachment.rendererObject = quadCmd;
                return attachment;
            };
            SkeletonRenderer.prototype.newMeshAttachment = function (skin, name, path) {
                throw new Error('MeshAttachment is not supported');
            };
            SkeletonRenderer.prototype.newSkinnedMeshAttachment = function (skin, name, path) {
                throw new Error('SkinnedMeshAttachment is not supported');
            };
            SkeletonRenderer.prototype.renderSlot = function (renderContext, slot, renderLayer, renderOrder) {
                var attachment = slot.attachment;
                var bone = slot.bone;
                if (attachment instanceof spine.runtime.RegionAttachment) {
                    var quadCmd = attachment.rendererObject;
                    var x = bone.worldX + attachment.x * bone.m00 + attachment.y * bone.m01;
                    var y = bone.worldY + attachment.x * bone.m10 + attachment.y * bone.m11;
                    var rotation = -(bone.worldRotation + attachment.rotation);
                    quadCmd.renderLayer = renderLayer;
                    quadCmd.renderOrder = renderOrder;
                    quadCmd.matrix.identity();
                    quadCmd.matrix.applyMatrix(this.transform.worldMatrix);
                    quadCmd.matrix.appendTransform(x, y, bone.worldScaleX, bone.worldScaleY, rotation, bone.worldFlipX ? 180 : 0, bone.worldFlipY ? 180 : 0);
                    quadCmd.matrixDirty = true;
                    renderContext.addCommand(quadCmd);
                }
            };
            return SkeletonRenderer;
        })(spine.AbstractSkeletonRenderer);
        spine.SkeletonRenderer = SkeletonRenderer;
    })(spine = WOZLLA.spine || (WOZLLA.spine = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var state;
    (function (state_1) {
        /**
         * Transition grouping to faciliate fluent api
         * @class Transitions<T>
         */
        var Transitions = (function () {
            function Transitions(fsm) {
                this.fsm = fsm;
            }
            /**
          * Specify the end state(s) of a transition function
          * @method to
          * @param ...states {T[]}
          */
            Transitions.prototype.to = function () {
                var states = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    states[_i - 0] = arguments[_i];
                }
                this.toStates = states;
                this.fsm.addTransitions(this);
            };
            Transitions.prototype.toAny = function (states) {
                var toStates = [];
                for (var s in states) {
                    if (states.hasOwnProperty(s)) {
                        toStates.push(states[s]);
                    }
                }
                this.toStates = toStates;
                this.fsm.addTransitions(this);
            };
            return Transitions;
        })();
        state_1.Transitions = Transitions;
        /**
         * Internal representation of a transition function
         * @class TransitionFunction<T>
         */
        var TransitionFunction = (function () {
            function TransitionFunction(fsm, from, to) {
                this.fsm = fsm;
                this.from = from;
                this.to = to;
            }
            return TransitionFunction;
        })();
        state_1.TransitionFunction = TransitionFunction;
        /***
         * A simple finite state machine implemented in TypeScript, the templated argument is meant to be used
         * with an enumeration.
         * @class FiniteStateMachine<T>
         */
        var FiniteStateMachine = (function () {
            /**
          * @constructor
          * @param startState {T} Intial starting state
          */
            function FiniteStateMachine(startState) {
                this._transitionFunctions = [];
                this._onCallbacks = {};
                this._exitCallbacks = {};
                this._enterCallbacks = {};
                this.currentState = startState;
                this._startState = startState;
            }
            FiniteStateMachine.prototype.addTransitions = function (fcn) {
                var _this = this;
                fcn.fromStates.forEach(function (from) {
                    fcn.toStates.forEach(function (to) {
                        // self transitions are invalid and don't add duplicates
                        if (from !== to && !_this._validTransition(from, to)) {
                            _this._transitionFunctions.push(new TransitionFunction(_this, from, to));
                        }
                    });
                });
            };
            /**
          * Listen for the transition to this state and fire the associated callback
          * @method on
          * @param state {T} State to listen to
          * @param callback {fcn} Callback to fire
          */
            FiniteStateMachine.prototype.on = function (state, callback) {
                var key = state.toString();
                if (!this._onCallbacks[key]) {
                    this._onCallbacks[key] = [];
                }
                this._onCallbacks[key].push(callback);
                return this;
            };
            /**
                * Listen for the transition to this state and fire the associated callback, returning
                * false in the callback will block the transition to this state.
                * @method on
                * @param state {T} State to listen to
                * @param callback {fcn} Callback to fire
                */
            FiniteStateMachine.prototype.onEnter = function (state, callback) {
                var key = state.toString();
                if (!this._enterCallbacks[key]) {
                    this._enterCallbacks[key] = [];
                }
                this._enterCallbacks[key].push(callback);
                return this;
            };
            /**
                * Listen for the transition to this state and fire the associated callback, returning
                * false in the callback will block the transition from this state.
                * @method on
                * @param state {T} State to listen to
                * @param callback {fcn} Callback to fire
                */
            FiniteStateMachine.prototype.onExit = function (state, callback) {
                var key = state.toString();
                if (!this._exitCallbacks[key]) {
                    this._exitCallbacks[key] = [];
                }
                this._exitCallbacks[key].push(callback);
                return this;
            };
            /**
                * Declares the start state(s) of a transition function, must be followed with a '.to(...endStates)'
                * @method from
                * @param ...states {T[]}
                */
            FiniteStateMachine.prototype.from = function () {
                var states = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    states[_i - 0] = arguments[_i];
                }
                var _transition = new Transitions(this);
                _transition.fromStates = states;
                return _transition;
            };
            FiniteStateMachine.prototype.fromAny = function (states) {
                var fromStates = [];
                for (var s in states) {
                    if (states.hasOwnProperty(s)) {
                        fromStates.push(states[s]);
                    }
                }
                var _transition = new Transitions(this);
                _transition.fromStates = fromStates;
                return _transition;
            };
            FiniteStateMachine.prototype._validTransition = function (from, to) {
                return this._transitionFunctions.some(function (tf) {
                    return (tf.from === from && tf.to === to);
                });
            };
            /**
          * Check whether a transition to a new state is valide
          * @method canGo
          * @param state {T}
          */
            FiniteStateMachine.prototype.canGo = function (state) {
                return this.currentState === state || this._validTransition(this.currentState, state);
            };
            /**
          * Transition to another valid state
          * @method go
          * @param state {T}
          */
            FiniteStateMachine.prototype.go = function (state) {
                if (!this.canGo(state)) {
                    throw new Error('Error no transition function exists from state ' + this.currentState.toString() + ' to ' + state.toString());
                }
                this._transitionTo(state);
            };
            /**
             * This method is availble for overridding for the sake of extensibility.
             * It is called in the event of a successful transition.
             * @method onTransition
             * @param from {T}
             * @param to {T}
             */
            FiniteStateMachine.prototype.onTransition = function (from, to) {
                // pass, does nothing untill overidden
            };
            /**
          * Reset the finite state machine back to the start state, DO NOT USE THIS AS A SHORTCUT for a transition. This is for starting the fsm from the beginning.
          * @method reset
          */
            FiniteStateMachine.prototype.reset = function () {
                this.currentState = this._startState;
            };
            FiniteStateMachine.prototype._transitionTo = function (state) {
                var _this = this;
                if (!this._exitCallbacks[this.currentState.toString()]) {
                    this._exitCallbacks[this.currentState.toString()] = [];
                }
                if (!this._enterCallbacks[state.toString()]) {
                    this._enterCallbacks[state.toString()] = [];
                }
                if (!this._onCallbacks[state.toString()]) {
                    this._onCallbacks[state.toString()] = [];
                }
                var canExit = this._exitCallbacks[this.currentState.toString()].reduce(function (accum, next) {
                    return accum && next.call(_this, state);
                }, true);
                var canEnter = this._enterCallbacks[state.toString()].reduce(function (accum, next) {
                    return accum && next.call(_this, _this.currentState);
                }, true);
                if (canExit && canEnter) {
                    var old = this.currentState;
                    this.currentState = state;
                    this._onCallbacks[this.currentState.toString()].forEach(function (fcn) {
                        fcn.call(_this, old);
                    });
                    this.onTransition(old, state);
                }
            };
            return FiniteStateMachine;
        })();
        state_1.FiniteStateMachine = FiniteStateMachine;
    })(state = WOZLLA.state || (WOZLLA.state = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var state;
    (function (state_2) {
        var StateBehaviour = (function (_super) {
            __extends(StateBehaviour, _super);
            function StateBehaviour(startState) {
                _super.call(this);
                this.fsm = new state_2.FiniteStateMachine(startState);
            }
            Object.defineProperty(StateBehaviour.prototype, "currentState", {
                get: function () {
                    return this.fsm.currentState;
                },
                enumerable: true,
                configurable: true
            });
            StateBehaviour.prototype.onEnter = function (state, callback) {
                this.fsm.onEnter(state, callback);
            };
            StateBehaviour.prototype.onExit = function (state, callback) {
                this.fsm.onExit(state, callback);
            };
            StateBehaviour.prototype.from = function () {
                var states = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    states[_i - 0] = arguments[_i];
                }
                return (_a = this.fsm).from.apply(_a, states);
                var _a;
            };
            StateBehaviour.prototype.fromAny = function (states) {
                return this.fsm.fromAny(states);
            };
            StateBehaviour.prototype.canGo = function (state) {
                return this.fsm.canGo(state);
            };
            StateBehaviour.prototype.go = function (state) {
                this.fsm.go(state);
            };
            StateBehaviour.prototype.onTransition = function (from, to) {
                this.fsm.onTransition(from, to);
            };
            StateBehaviour.prototype.reset = function () {
                this.fsm.reset();
            };
            StateBehaviour.prototype.emit = function (event) {
                this.dispatchEvent(event);
            };
            StateBehaviour.prototype.on = function (type, listener, useCapture) {
                if (useCapture === void 0) { useCapture = false; }
                this.addListener(type, listener, useCapture);
            };
            return StateBehaviour;
        })(WOZLLA.Behaviour);
        state_2.StateBehaviour = StateBehaviour;
    })(state = WOZLLA.state || (WOZLLA.state = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var state;
    (function (state_3) {
        var StateEventDispatch = (function (_super) {
            __extends(StateEventDispatch, _super);
            function StateEventDispatch(startState) {
                _super.call(this);
                this.fsm = new state_3.FiniteStateMachine(startState);
            }
            Object.defineProperty(StateEventDispatch.prototype, "currentState", {
                get: function () {
                    return this.fsm.currentState;
                },
                enumerable: true,
                configurable: true
            });
            StateEventDispatch.prototype.onEnter = function (state, callback) {
                this.fsm.onEnter(state, callback);
            };
            StateEventDispatch.prototype.onExit = function (state, callback) {
                this.fsm.onExit(state, callback);
            };
            StateEventDispatch.prototype.from = function () {
                var states = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    states[_i - 0] = arguments[_i];
                }
                return (_a = this.fsm).from.apply(_a, states);
                var _a;
            };
            StateEventDispatch.prototype.fromAny = function (states) {
                return this.fsm.fromAny(states);
            };
            StateEventDispatch.prototype.canGo = function (state) {
                return this.fsm.canGo(state);
            };
            StateEventDispatch.prototype.go = function (state) {
                this.fsm.go(state);
            };
            StateEventDispatch.prototype.onTransition = function (from, to) {
                this.fsm.onTransition(from, to);
            };
            StateEventDispatch.prototype.reset = function () {
                this.fsm.reset();
            };
            StateEventDispatch.prototype.emit = function (event) {
                this.dispatchEvent(event);
            };
            StateEventDispatch.prototype.on = function (type, listener, useCapture) {
                if (useCapture === void 0) { useCapture = false; }
                this.addListener(type, listener, useCapture);
            };
            return StateEventDispatch;
        })(WOZLLA.event.EventDispatcher);
        state_3.StateEventDispatch = StateEventDispatch;
    })(state = WOZLLA.state || (WOZLLA.state = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var state;
    (function (state_4) {
        var StateGameObject = (function (_super) {
            __extends(StateGameObject, _super);
            function StateGameObject(director, useRectTransform, startState) {
                if (useRectTransform === void 0) { useRectTransform = false; }
                _super.call(this, director, useRectTransform);
                this.fsm = new state_4.FiniteStateMachine(startState);
            }
            Object.defineProperty(StateGameObject.prototype, "currentState", {
                get: function () {
                    return this.fsm.currentState;
                },
                enumerable: true,
                configurable: true
            });
            StateGameObject.prototype.onEnter = function (state, callback) {
                this.fsm.onEnter(state, callback);
            };
            StateGameObject.prototype.onExit = function (state, callback) {
                this.fsm.onExit(state, callback);
            };
            StateGameObject.prototype.from = function () {
                var states = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    states[_i - 0] = arguments[_i];
                }
                return (_a = this.fsm).from.apply(_a, states);
                var _a;
            };
            StateGameObject.prototype.fromAny = function (states) {
                return this.fsm.fromAny(states);
            };
            StateGameObject.prototype.canGo = function (state) {
                return this.fsm.canGo(state);
            };
            StateGameObject.prototype.go = function (state) {
                this.fsm.go(state);
            };
            StateGameObject.prototype.onTransition = function (from, to) {
                this.fsm.onTransition(from, to);
            };
            StateGameObject.prototype.reset = function () {
                this.fsm.reset();
            };
            StateGameObject.prototype.emit = function (event) {
                this.dispatchEvent(event);
            };
            StateGameObject.prototype.on = function (type, listener, useCapture) {
                if (useCapture === void 0) { useCapture = false; }
                this.addListener(type, listener, useCapture);
            };
            return StateGameObject;
        })(WOZLLA.GameObject);
        state_4.StateGameObject = StateGameObject;
    })(state = WOZLLA.state || (WOZLLA.state = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var util;
    (function (util) {
        var Ease = (function () {
            function Ease() {
            }
            Ease.get = function (amount) {
                if (amount < -1) {
                    amount = -1;
                }
                if (amount > 1) {
                    amount = 1;
                }
                return function (t) {
                    if (amount == 0) {
                        return t;
                    }
                    if (amount < 0) {
                        return t * (t * -amount + 1 + amount);
                    }
                    return t * ((2 - t) * amount + (1 - amount));
                };
            };
            Ease.getPowIn = function (pow) {
                return function (t) {
                    return Math.pow(t, pow);
                };
            };
            Ease.getPowOut = function (pow) {
                return function (t) {
                    return 1 - Math.pow(1 - t, pow);
                };
            };
            Ease.getPowInOut = function (pow) {
                return function (t) {
                    if ((t *= 2) < 1)
                        return 0.5 * Math.pow(t, pow);
                    return 1 - 0.5 * Math.abs(Math.pow(2 - t, pow));
                };
            };
            Ease.sineIn = function (t) {
                return 1 - Math.cos(t * Math.PI / 2);
            };
            Ease.sineOut = function (t) {
                return Math.sin(t * Math.PI / 2);
            };
            Ease.sineInOut = function (t) {
                return -0.5 * (Math.cos(Math.PI * t) - 1);
            };
            Ease.getBackIn = function (amount) {
                return function (t) {
                    return t * t * ((amount + 1) * t - amount);
                };
            };
            Ease.getBackOut = function (amount) {
                return function (t) {
                    t = t - 1;
                    return (t * t * ((amount + 1) * t + amount) + 1);
                };
            };
            Ease.getBackInOut = function (amount) {
                amount *= 1.525;
                return function (t) {
                    if ((t *= 2) < 1)
                        return 0.5 * (t * t * ((amount + 1) * t - amount));
                    return 0.5 * ((t -= 2) * t * ((amount + 1) * t + amount) + 2);
                };
            };
            Ease.circIn = function (t) {
                return -(Math.sqrt(1 - t * t) - 1);
            };
            Ease.circOut = function (t) {
                return Math.sqrt(1 - (t) * t);
            };
            Ease.circInOut = function (t) {
                if ((t *= 2) < 1) {
                    return -0.5 * (Math.sqrt(1 - t * t) - 1);
                }
                return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
            };
            Ease.bounceIn = function (t) {
                return 1 - Ease.bounceOut(1 - t);
            };
            Ease.bounceOut = function (t) {
                if (t < 1 / 2.75) {
                    return (7.5625 * t * t);
                }
                else if (t < 2 / 2.75) {
                    return (7.5625 * (t -= 1.5 / 2.75) * t + 0.75);
                }
                else if (t < 2.5 / 2.75) {
                    return (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375);
                }
                else {
                    return (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
                }
            };
            Ease.bounceInOut = function (t) {
                if (t < 0.5)
                    return Ease.bounceIn(t * 2) * .5;
                return Ease.bounceOut(t * 2 - 1) * 0.5 + 0.5;
            };
            Ease.getElasticIn = function (amplitude, period) {
                var pi2 = Math.PI * 2;
                return function (t) {
                    if (t == 0 || t == 1)
                        return t;
                    var s = period / pi2 * Math.asin(1 / amplitude);
                    return -(amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
                };
            };
            Ease.getElasticOut = function (amplitude, period) {
                var pi2 = Math.PI * 2;
                return function (t) {
                    if (t == 0 || t == 1)
                        return t;
                    var s = period / pi2 * Math.asin(1 / amplitude);
                    return (amplitude * Math.pow(2, -10 * t) * Math.sin((t - s) * pi2 / period) + 1);
                };
            };
            Ease.getElasticInOut = function (amplitude, period) {
                var pi2 = Math.PI * 2;
                return function (t) {
                    var s = period / pi2 * Math.asin(1 / amplitude);
                    if ((t *= 2) < 1)
                        return -0.5 * (amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
                    return amplitude * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * pi2 / period) * 0.5 + 1;
                };
            };
            Ease.linear = function (t) { return t; };
            Ease.expoIn = function (time) {
                return time == 0 ? 0 : Math.pow(2, 10 * (time - 1)) - 0.001;
            };
            Ease.expoOut = function (time) {
                return time == 1 ? 1 : (-Math.pow(2, -10 * time) + 1);
            };
            Ease.expoInOut = function (time) {
                time /= 0.5;
                if (time < 1) {
                    time = 0.5 * Math.pow(2, 10 * (time - 1));
                }
                else {
                    time = 0.5 * (-Math.pow(2, -10 * (time - 1)) + 2);
                }
                return time;
            };
            Ease.getByKey = function (key) {
                return Ease[Ease.keyMap[key]];
            };
            Ease.quadIn = Ease.getPowIn(2);
            Ease.quadOut = Ease.getPowOut(2);
            Ease.quadInOut = Ease.getPowInOut(2);
            Ease.cubicIn = Ease.getPowIn(3);
            Ease.cubicOut = Ease.getPowOut(3);
            Ease.cubicInOut = Ease.getPowInOut(3);
            Ease.quartIn = Ease.getPowIn(4);
            Ease.quartOut = Ease.getPowOut(4);
            Ease.quartInOut = Ease.getPowInOut(4);
            Ease.quintIn = Ease.getPowIn(5);
            Ease.quintOut = Ease.getPowOut(5);
            Ease.quintInOut = Ease.getPowInOut(5);
            Ease.backIn = Ease.getBackIn(1.7);
            Ease.backOut = Ease.getBackOut(1.7);
            Ease.backInOut = Ease.getBackInOut(1.7);
            Ease.elasticIn = Ease.getElasticIn(1, 0.3);
            Ease.elasticOut = Ease.getElasticOut(1, 0.3);
            Ease.elasticInOut = Ease.getElasticInOut(1, 0.3 * 1.5);
            Ease.keyMap = {
                0: 'linear',
                1: 'sineIn',
                2: 'sineOut',
                3: 'sineInOut',
                4: 'quadIn',
                5: 'quadOut',
                6: 'quadInOut',
                7: 'cubicIn',
                8: 'cubicOut',
                9: 'cubicInOut',
                10: 'quartIn',
                11: 'quartOut',
                12: 'quartInOut',
                13: 'quintIn',
                14: 'quintOut',
                15: 'quintInOut',
                16: 'expoIn',
                17: 'expoOut',
                18: 'expoInOut',
                19: 'circIn',
                20: 'circOut',
                21: 'circInOut',
                22: 'elasticIn',
                23: 'elasticOut',
                24: 'elasticInOut',
                25: 'backIn',
                26: 'backOut',
                27: 'backInOut',
                28: 'bounceIn',
                29: 'bounceOut',
                30: 'bounceInOut'
            };
            return Ease;
        })();
        util.Ease = Ease;
    })(util = WOZLLA.util || (WOZLLA.util = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var util;
    (function (util) {
        var ObjectPool = (function () {
            function ObjectPool(minCount, factory) {
                this._minCount = minCount;
                this._factory = factory;
                this._pool = [];
                for (var i = 0; i < this._minCount; i++) {
                    this._pool.push(this._factory());
                }
            }
            ObjectPool.prototype.retain = function () {
                var object = this._pool.shift();
                if (object) {
                    return object;
                }
                return this._factory();
            };
            ObjectPool.prototype.release = function (obj) {
                if (this._pool.indexOf(obj) !== -1) {
                    return;
                }
                this._pool.push(obj);
            };
            return ObjectPool;
        })();
        util.ObjectPool = ObjectPool;
    })(util = WOZLLA.util || (WOZLLA.util = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var wson;
    (function (wson) {
        var builderFactory;
        var WSONBuilder = (function () {
            function WSONBuilder() {
            }
            WSONBuilder.prototype.build = function (director, filePath, callback) {
                var _this = this;
                var jsonDesc = new WOZLLA.asset.JsonDescriptor({
                    url: filePath
                });
                director.assetManager.load(jsonDesc, function (error, asset) {
                    if (error) {
                        callback(error, null);
                        return;
                    }
                    _this.buildWithData(director, asset.getJson(), callback);
                });
            };
            WSONBuilder.prototype.buildWithData = function (director, data, callback) {
                this.buildGameObject(director, data.root, callback);
            };
            WSONBuilder.prototype.buildWithDataSync = function (director, data) {
                var gameObj;
                this.buildWithData(director, data, function (err, root) {
                    if (err) {
                        throw err;
                    }
                    gameObj = root;
                });
                return gameObj;
            };
            WSONBuilder.prototype.buildGameObject = function (director, data, callback) {
                var gameObj = this.newGameObject(director, data.rect);
                gameObj.id = data.id;
                gameObj.name = data.name;
                if (data.active != void 0) {
                    gameObj.active = !!data.active;
                }
                if (data.visible != void 0) {
                    gameObj.visible = !!data.visible;
                }
                if (data.touchable != void 0) {
                    gameObj.touchable = !!data.touchable;
                }
                if (data.z != void 0) {
                    gameObj.z = parseInt(data.z);
                }
                if (data.renderLayer) {
                    gameObj.renderLayer = data.renderLayer;
                }
                if (data.renderOrder) {
                    gameObj.renderOrder = parseInt(data.renderOrder);
                }
                if (data.alpha) {
                    gameObj.alpha = parseFloat(data.alpha);
                }
                if (data.transform) {
                    for (var key in data.transform) {
                        if (key === 'anchorMode') {
                            continue;
                        }
                        if (key === 'relative') {
                            if (typeof data.transform[key] === 'string') {
                                data.transform[key] = data.transform[key] !== 'false';
                            }
                            else {
                                data.transform[key] = !!data.transform[key];
                            }
                        }
                        else {
                            data.transform[key] = parseFloat(data.transform[key]);
                        }
                    }
                    gameObj.transform.set(data.transform);
                }
                // build component
                if (data.components) {
                    for (var _i = 0, _a = data.components; _i < _a.length; _i++) {
                        var compData = _a[_i];
                        var comp = this.buildComponent(compData, gameObj);
                        gameObj.addComponent(comp);
                    }
                }
                // build children
                var me = this;
                var index = 0;
                var childrenData = data.children;
                if (!childrenData || childrenData.length === 0) {
                    callback(null, gameObj);
                    return;
                }
                function buildNextChild() {
                    var childData = childrenData[index++];
                    if (!childData) {
                        gameObj.sortChildren();
                        callback(null, gameObj);
                        return;
                    }
                    if (childData.reference) {
                        me.buildReference(director, childData, function (error, child) {
                            if (error) {
                                callback(error, null);
                                return;
                            }
                            gameObj.addChild(child, false);
                            buildNextChild();
                        });
                    }
                    else {
                        me.buildGameObject(director, childData, function (error, child) {
                            if (error) {
                                callback(error, null);
                                return;
                            }
                            gameObj.addChild(child, false);
                            buildNextChild();
                        });
                    }
                }
                buildNextChild();
            };
            WSONBuilder.prototype.buildReference = function (director, data, callback) {
                var _this = this;
                var refPath = data.name;
                this.build(director, refPath, function (error, root) {
                    if (error) {
                        callback(error, null);
                        return;
                    }
                    var gameObj = _this.newGameObject(director, data.rect);
                    if (data.transform) {
                        gameObj.transform.set(data.transform);
                    }
                    gameObj.addChild(root);
                    callback(null, gameObj);
                });
            };
            WSONBuilder.prototype.buildComponent = function (data, owner) {
                var compName = data.name;
                var compAnno = WOZLLA.component.ComponentFactory.getAnnotation(compName);
                var properties = data.properties;
                var component = this.newComponent(compName);
                for (var prop in properties) {
                    var property = component[prop];
                    if (property) {
                        var value = properties[prop];
                        var propAnno = compAnno.getPropertyAnnotation(prop);
                        if (propAnno.propertyType === WOZLLA.component.Type.Int) {
                            value = parseInt(value);
                        }
                        else if (propAnno.propertyType === WOZLLA.component.Type.Number) {
                            value = parseFloat(value);
                        }
                        property.convert(value);
                    }
                }
                return component;
            };
            WSONBuilder.prototype.newGameObject = function (director, useRectTransform) {
                if (useRectTransform === void 0) { useRectTransform = false; }
                return new WOZLLA.GameObject(director, useRectTransform);
            };
            WSONBuilder.prototype.newComponent = function (compName) {
                return WOZLLA.component.ComponentFactory.create(compName);
            };
            return WSONBuilder;
        })();
        wson.WSONBuilder = WSONBuilder;
        builderFactory = function () { return new WSONBuilder(); };
        function setBuilderFactory(factory) {
            builderFactory = factory;
        }
        wson.setBuilderFactory = setBuilderFactory;
        function newBuilder() {
            return builderFactory();
        }
        wson.newBuilder = newBuilder;
    })(wson = WOZLLA.wson || (WOZLLA.wson = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var cocos2d;
    (function (cocos2d) {
        var CocosBoneRenderer = (function (_super) {
            __extends(CocosBoneRenderer, _super);
            function CocosBoneRenderer() {
                _super.apply(this, arguments);
                this._exportJson = new WOZLLA.component.Property();
                this._spriteSrc = new WOZLLA.component.Property();
                this._imgSrc = new WOZLLA.component.Property();
                this._defaultAction = new WOZLLA.component.Property();
                this._frameTime = new WOZLLA.component.Property(100);
                this._ticker = new AnimationFrameTicker();
            }
            Object.defineProperty(CocosBoneRenderer.prototype, "exportJson", {
                get: function () {
                    return this._exportJson;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CocosBoneRenderer.prototype, "spriteSrc", {
                get: function () {
                    return this._spriteSrc;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CocosBoneRenderer.prototype, "imageSrc", {
                get: function () {
                    return this._imgSrc;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CocosBoneRenderer.prototype, "defaultAction", {
                get: function () {
                    return this._defaultAction;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CocosBoneRenderer.prototype, "frameTime", {
                get: function () {
                    return this._frameTime;
                },
                enumerable: true,
                configurable: true
            });
            CocosBoneRenderer.prototype.init = function () {
                _super.prototype.init.call(this);
                if (this._defaultAction.get()) {
                    this.play();
                }
            };
            CocosBoneRenderer.prototype.render = function (renderContext, transformDirty, renderLayer, renderOrder, alpha) {
                if (this._rootBoneObj) {
                    this.updateBone();
                    this._rootBoneObj.visit(renderContext, this.gameObject.transform, transformDirty, true, renderLayer, alpha);
                    this._ticker.update(this.director.deltaTime, this.director.now);
                }
            };
            CocosBoneRenderer.prototype.loadAssets = function (callback) {
                var _this = this;
                if (!this._exportJson.get() || !this._spriteSrc.get() || !this._imgSrc.get()) {
                    WOZLLA.Log.warn('asset path dosent configure completely.');
                    callback();
                    return;
                }
                var assetGroup = new WOZLLA.asset.AssetGroup();
                var xpJsonDesc = new WOZLLA.asset.JsonDescriptor(this._exportJson.get());
                var spriteDesc = new WOZLLA.asset.JsonDescriptor(this._spriteSrc.get());
                var imgDesc = new WOZLLA.asset.ImageDescriptor(this._imgSrc.get());
                assetGroup.put(xpJsonDesc);
                assetGroup.put(spriteDesc);
                assetGroup.put(imgDesc);
                this.assetManager.loadGroup(assetGroup, {
                    onLoadOne: function (err) {
                        if (err) {
                            WOZLLA.Log.error(err);
                        }
                    },
                    onFinish: function () {
                        _this._rootBoneObj = _this.parseData(_this.assetManager.getAsset(xpJsonDesc), _this.assetManager.getAsset(spriteDesc), _this.assetManager.getAsset(imgDesc));
                        _this._rootBoneObj.loadAssets(function () {
                            _this._rootBoneObj.init();
                            callback();
                        });
                    }
                });
            };
            CocosBoneRenderer.prototype.playAction = function (action) {
                this._ticker.play();
                this._playingAction = action;
                this.updateBone();
            };
            CocosBoneRenderer.prototype.playActionOnce = function (action, callback) {
                var me = this;
                me.addListener('animationend', function (e) {
                    e.removeCurrentListener();
                    me._ticker.pause();
                    callback && callback();
                });
                me.playAction(action);
            };
            CocosBoneRenderer.prototype.play = function () {
                this.playAction(this._defaultAction.get());
            };
            CocosBoneRenderer.prototype.playOnce = function (callback) {
                this.playActionOnce(this._defaultAction.get(), callback);
            };
            CocosBoneRenderer.prototype.parseData = function (xpJsonAsset, spriteJsonAsset, imgAsset) {
                var xpJsonData = xpJsonAsset.getJson();
                var spriteAtlas = this.parseSpriteAtlas(xpJsonData, spriteJsonAsset, imgAsset);
                var newXpJsonData = this.parseExportJson(xpJsonData);
                this.assetManager.addAsset(spriteAtlas);
                this._contentScale = xpJsonData.content_scale;
                return this.buildBoneObject(newXpJsonData, spriteAtlas);
            };
            CocosBoneRenderer.prototype.buildBoneObject = function (boneData, spriteAtlas) {
                var i, len, j, len2;
                var displayObj = this.director.createGameObject();
                // build armature
                var armature_data = boneData.armature_data;
                var armature;
                var bone;
                var bone_data;
                var display_data;
                var armatureObj;
                var boneObj;
                var boneDisplay;
                len = armature_data.length;
                for (i = 0; i < len; i++) {
                    armature = armature_data[i];
                    armatureObj = this.director.createGameObject();
                    armatureObj.name = armature.name;
                    armatureObj.data('armatureData', armature);
                    armatureObj.data('animationData', boneData.animation_data[armature.name]);
                    armatureObj.transform.useGLCoords = true;
                    bone_data = armature.bone_data;
                    len2 = bone_data.length;
                    for (j = 0; j < len2; j++) {
                        bone = bone_data[j];
                        boneObj = this.director.createGameObject();
                        boneObj.name = bone.name;
                        boneObj.data('boneData', bone);
                        boneObj.setZ(bone.z, false);
                        boneObj.rendererOrder = this.gameObject.renderOrder;
                        boneObj.transform.useGLCoords = true;
                        boneObj.transform.set({
                            x: bone.x,
                            y: bone.y,
                            scaleX: bone.cX,
                            scaleY: bone.cY,
                            rotation: bone.kX
                        });
                        display_data = bone.display_data;
                        subBoneObj = null;
                        if (bone.effectbyskeleton) {
                            var skin_data = display_data[0].skin_data[0];
                            var x = skin_data.x;
                            var y = skin_data.y;
                            var angle = skin_data.kX / WOZLLA.Transform.DEG_TO_RAD;
                            var rotatedP = this._antiRotateXY(0, 0, angle, x, y);
                            var subBoneObj = this.director.createGameObject();
                            subBoneObj.name = 'SubBone';
                            subBoneObj.renderOrder = this.gameObject.renderOrder;
                            boneObj.addChild(subBoneObj);
                            subBoneObj.transform.setPosition(rotatedP.x, -rotatedP.y);
                        }
                        if (display_data && display_data[0]) {
                            boneDisplay = new WOZLLA.component.SpriteRenderer();
                            boneDisplay.setUseOffset(true);
                            boneDisplay.spriteAtlas.set(spriteAtlas.descriptor.assetPath);
                            boneDisplay.frame.set(display_data[0].name);
                            if (subBoneObj) {
                                subBoneObj.addComponent(boneDisplay);
                            }
                            else {
                                boneObj.addComponent(boneDisplay);
                            }
                        }
                        armatureObj.addChild(boneObj);
                    }
                    displayObj.addChild(armatureObj);
                }
                return displayObj;
            };
            CocosBoneRenderer.prototype.parseExportJson = function (xpJsonData) {
                var boneData = xpJsonData;
                var animation_data = boneData.animation_data;
                var new_animation_data = {};
                animation_data.forEach(function (anim) {
                    var mov_data = anim.mov_data;
                    var new_move_data = {};
                    mov_data.forEach(function (mov) {
                        var mov_bone_data = mov.mov_bone_data;
                        var new_move_bone_data = {};
                        mov_bone_data.forEach(function (movBone) {
                            var frame_data = movBone.frame_data;
                            var new_frame_data = {};
                            var preFrame;
                            frame_data.forEach(function (frame) {
                                new_frame_data[frame.fi] = frame;
                                if (preFrame) {
                                    preFrame.nextFrame = frame;
                                }
                                preFrame = frame;
                            });
                            movBone.frame_data = new_frame_data;
                            new_move_bone_data[movBone.name] = movBone;
                        });
                        mov.mov_bone_data = new_move_bone_data;
                        new_move_data[mov.name] = mov;
                    });
                    anim.mov_data = new_move_data;
                    new_animation_data[anim.name] = anim;
                });
                boneData.animation_data = new_animation_data;
                return boneData;
            };
            CocosBoneRenderer.prototype.parseSpriteAtlas = function (xpJsonData, spriteJsonAsset, imgAsset) {
                var boneData = xpJsonData;
                var textureData = spriteJsonAsset.getJson();
                var boneTextureData = boneData.texture_data;
                var boneTextureDataMap = {};
                boneTextureData.forEach(function (data) {
                    boneTextureDataMap[data.name] = data;
                });
                var frames = textureData.frames;
                var data = {
                    frames: {},
                    meta: {
                        image: textureData.imagePath
                    }
                };
                var f;
                var bf;
                var bKey;
                for (var key in frames) {
                    f = frames[key];
                    bKey = key.replace('.png', '').replace('.jpg', '');
                    bf = boneTextureDataMap[bKey];
                    data.frames[key] = {
                        filename: key,
                        frame: {
                            x: f.x,
                            y: f.y,
                            w: f.width,
                            h: f.height,
                            offsetX: -f.width * (1 - bf.pX) + f.offsetX,
                            offsetY: -f.height * (1 - bf.pY) - f.offsetY
                        },
                        rotated: false,
                        trimmed: false,
                        spriteSourceSize: {
                            x: f.x,
                            y: f.y,
                            w: f.width,
                            h: f.height
                        },
                        sourceSize: {
                            w: f.width,
                            h: f.height
                        }
                    };
                }
                var descriptor = new WOZLLA.asset.SpriteAtlasDescriptor(WOZLLA.genUUID());
                var spriteAtlas = new WOZLLA.asset.SpriteAtlas(descriptor, new ParsedJsonAsset(data, this.assetManager), imgAsset);
                return spriteAtlas;
            };
            CocosBoneRenderer.prototype._antiRotateXY = function (cx, cy, angle, px, py) {
                var s = Math.sin(angle * WOZLLA.Transform.DEG_TO_RAD);
                var c = Math.cos(angle * WOZLLA.Transform.DEG_TO_RAD);
                var p = { x: px, y: py };
                // translate point back to origin:
                p.x -= cx;
                p.y -= cy;
                // rotate point
                var xnew = p.x * c - p.y * s;
                var ynew = p.x * s + p.y * c;
                // translate point back:
                p.x = xnew + cx;
                p.y = ynew + cy;
                return p;
            };
            CocosBoneRenderer.prototype.updateBone = function () {
                if (!this._rootBoneObj) {
                    return;
                }
                var contentScale = this._contentScale;
                var displayObj = this._rootBoneObj;
                var armatureObj;
                var boneObj;
                var armatureArr = displayObj.rawChildren;
                var boneArr;
                var j, len2;
                var boneData;
                var animationData;
                var actionData;
                var boneMoveData;
                var boneFrameData;
                var curBoneFrame;
                var nextBoneData;
                var displayBoneData;
                var nextDisplayBoneData;
                var colorData;
                var nextColorData;
                var animationFrame;
                var lastAnimationFrame;
                var tweenAttrs;
                var tweenTotalFrameTime;
                var tweenTime;
                var ratio;
                var easeFunc;
                this._ticker.frameTime = this._frameTime.get();
                armatureObj = armatureArr[0];
                animationData = armatureObj.data('animationData');
                actionData = animationData.mov_data[this._playingAction];
                if (!actionData) {
                    return;
                }
                animationFrame = this._ticker.getCurrentFrame(actionData.dr);
                lastAnimationFrame = armatureObj.data('animationFrame');
                if (lastAnimationFrame !== animationFrame) {
                    this._scheduleToDispatchEvent(new WOZLLA.event.Event('framechanged', false, animationFrame));
                    armatureObj.data('animationFrame', animationFrame);
                }
                if (animationFrame === actionData.dr - 1) {
                    this._scheduleToDispatchEvent(new WOZLLA.event.Event('animationend', false));
                }
                boneArr = armatureObj.rawChildren;
                len2 = boneArr.length;
                for (j = 0; j < len2; j++) {
                    boneObj = boneArr[j];
                    boneData = boneObj.data('boneData');
                    boneMoveData = actionData.mov_bone_data[boneData.name];
                    if (boneMoveData) {
                        boneObj.enabled = true;
                        boneFrameData = actionData.mov_bone_data[boneData.name].frame_data;
                    }
                    else {
                        boneObj.enabled = false;
                        continue;
                    }
                    curBoneFrame = boneObj.data('curBoneFrame') || 0;
                    nextBoneData = boneFrameData[animationFrame];
                    if (nextBoneData) {
                        boneObj.data('curBoneFrame', animationFrame);
                    }
                    displayBoneData = nextBoneData || boneFrameData[curBoneFrame];
                    if (!displayBoneData) {
                        continue;
                    }
                    nextDisplayBoneData = displayBoneData.nextFrame;
                    colorData = displayBoneData.color || { a: 255 };
                    if (displayBoneData.dI < 0) {
                        boneObj.enabled = false;
                    }
                    else if (displayBoneData.tweenFrame && nextDisplayBoneData && nextDisplayBoneData.dI >= 0) {
                        boneObj.enabled = true;
                        nextColorData = nextDisplayBoneData.color || { a: 255 };
                        tweenTotalFrameTime = (nextDisplayBoneData.fi - displayBoneData.fi) * this._ticker.frameTime;
                        if (animationFrame > nextDisplayBoneData.fi) {
                            animationFrame = nextDisplayBoneData.fi;
                        }
                        tweenTime = (animationFrame - displayBoneData.fi) * this._ticker.frameTime + this._ticker.currentFrameShowingTime;
                        tweenAttrs = {
                            x: nextDisplayBoneData.x - displayBoneData.x,
                            y: nextDisplayBoneData.y - displayBoneData.y,
                            cX: nextDisplayBoneData.cX - displayBoneData.cX,
                            cY: nextDisplayBoneData.cY - displayBoneData.cY,
                            kX: nextDisplayBoneData.kX - displayBoneData.kX,
                            kY: nextDisplayBoneData.kY - displayBoneData.kY,
                            color: {
                                a: nextColorData.a - colorData.a
                            }
                        };
                        ratio = tweenTime / tweenTotalFrameTime;
                        if (ratio > 1) {
                            ratio = 1;
                        }
                        easeFunc = WOZLLA.util.Ease.getByKey(displayBoneData.twE);
                        if (easeFunc) {
                            ratio = easeFunc(ratio);
                        }
                        boneObj.transform.set({
                            x: boneData.x + displayBoneData.x + tweenAttrs.x * ratio,
                            y: boneData.y + displayBoneData.y + tweenAttrs.y * ratio,
                            scaleX: boneData.cX * (displayBoneData.cX + tweenAttrs.cX * ratio),
                            scaleY: boneData.cY * (displayBoneData.cY + tweenAttrs.cY * ratio),
                            rotation: (boneData.kX + displayBoneData.kX + tweenAttrs.kX * ratio) / WOZLLA.Transform.DEG_TO_RAD
                        });
                        boneObj.alpha = (colorData.a + tweenAttrs.color.a * ratio) / 255;
                    }
                    else {
                        boneObj.enabled = true;
                        boneObj.transform.set({
                            x: displayBoneData.x + boneData.x,
                            y: displayBoneData.y + boneData.y,
                            scaleX: boneData.cX * displayBoneData.cX,
                            scaleY: boneData.cY * displayBoneData.cY,
                            rotation: boneData.kX + displayBoneData.kX / WOZLLA.Transform.DEG_TO_RAD
                        });
                        if (displayBoneData.color) {
                            boneObj.alpha = displayBoneData.color.a / 255;
                        }
                    }
                    boneObj.setZ(displayBoneData.z + boneData.z, false);
                    boneObj.renderOrder = this.gameObject.renderOrder;
                    boneObj.transform.x *= contentScale;
                    boneObj.transform.y *= contentScale;
                    var subBoneObj = boneObj.getChild('SubBone');
                    if (subBoneObj) {
                        subBoneObj.renderOrder = this.gameObject.renderOrder;
                    }
                }
                this._rootBoneObj.sortChildren();
            };
            CocosBoneRenderer.prototype._scheduleToDispatchEvent = function (e) {
                var _this = this;
                this.director.scheduler.scheduleFrame(function () { return _this.dispatchEvent(e); });
            };
            return CocosBoneRenderer;
        })(WOZLLA.Renderer);
        cocos2d.CocosBoneRenderer = CocosBoneRenderer;
        var ParsedJsonAsset = (function (_super) {
            __extends(ParsedJsonAsset, _super);
            function ParsedJsonAsset(jsonData, assetManager) {
                _super.call(this, null, null, assetManager);
                this._jsonData = jsonData;
            }
            ParsedJsonAsset.prototype.getJson = function () {
                return this._jsonData;
            };
            ParsedJsonAsset.prototype.getPlainText = function () {
                return null;
            };
            return ParsedJsonAsset;
        })(WOZLLA.asset.JsonAsset);
        cocos2d.ParsedJsonAsset = ParsedJsonAsset;
        var AnimationFrameTicker = (function () {
            function AnimationFrameTicker() {
                this.frameTime = 0;
                this.frameLength = 9999999999;
                this.currentFrame = 0;
                this.currentFrameShowingTime = 0;
                this.paused = true;
                this.stopFrame = -1;
            }
            AnimationFrameTicker.prototype.getCurrentFrame = function (frameLength) {
                return this.currentFrame % frameLength;
            };
            AnimationFrameTicker.prototype.update = function (deltaTime, now) {
                var frameChanged = false;
                if (this.paused) {
                    return frameChanged;
                }
                do {
                    if (this.currentFrameShowingTime >= this.frameTime) {
                        if (this.stopFrame >= 0 && this.currentFrame >= this.stopFrame) {
                            break;
                        }
                        this.currentFrame++;
                        if (this.currentFrame >= this.frameLength) {
                            this.currentFrame = 0;
                        }
                        this.currentFrameShowingTime = this.currentFrameShowingTime - this.frameTime;
                        frameChanged = true;
                    }
                    this.currentFrameShowingTime += deltaTime;
                } while (0);
                return frameChanged;
            };
            AnimationFrameTicker.prototype.resume = function () {
                this.paused = false;
            };
            AnimationFrameTicker.prototype.pause = function () {
                this.paused = true;
            };
            AnimationFrameTicker.prototype.play = function () {
                this.paused = false;
                this.currentFrame = 0;
                this.currentFrameShowingTime = 0;
            };
            AnimationFrameTicker.prototype.continuePlay = function () {
                this.paused = false;
            };
            AnimationFrameTicker.prototype.setStopFrame = function (stopFrame) {
                this.stopFrame = stopFrame;
            };
            return AnimationFrameTicker;
        })();
        cocos2d.AnimationFrameTicker = AnimationFrameTicker;
    })(cocos2d = WOZLLA.cocos2d || (WOZLLA.cocos2d = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var action;
    (function (action) {
        var Action = (function () {
            function Action(name, data) {
                this._name = name;
                this._data = data;
            }
            Object.defineProperty(Action.prototype, "name", {
                get: function () {
                    return this._name;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Action.prototype, "data", {
                get: function () {
                    return this._data;
                },
                enumerable: true,
                configurable: true
            });
            return Action;
        })();
        action.Action = Action;
    })(action = WOZLLA.action || (WOZLLA.action = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var action;
    (function (action) {
        var Broadcast = (function () {
            function Broadcast(name, data) {
                this._name = name;
                this._data = data;
            }
            Object.defineProperty(Broadcast.prototype, "name", {
                get: function () {
                    return this._name;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Broadcast.prototype, "data", {
                get: function () {
                    return this._data;
                },
                enumerable: true,
                configurable: true
            });
            return Broadcast;
        })();
        action.Broadcast = Broadcast;
    })(action = WOZLLA.action || (WOZLLA.action = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var IoC;
    (function (IoC) {
        var MANAGED_NAME_KEY = '__iocManagedName';
        var MANAGED_SINGLETON_KEY = '__iocManagedSingleton';
        var SINGLETON_ON_STARTUP_KEY = ' __iocSingletonOnStartup';
        var SUPER_CLASS = '__iocSuperClass';
        var APPLICATION_NAME = 'WOZLLA.IoC.Application';
        var managedClassMap = {};
        var managedClassInjectMap = {};
        var classBuilders = [];
        var singletonContainer = {};
        var tempInjectList;
        var randomName = (function () {
            var id = 0;
            return function () {
                return MANAGED_NAME_KEY + '_' + (++id);
            };
        })();
        function checkManaged(name) {
            if (typeof name === 'string') {
                if (!managedClassMap.hasOwnProperty(name)) {
                    throw new Error("Not exists managed class name is " + name);
                }
            }
            else {
                if (!name.hasOwnProperty(MANAGED_NAME_KEY)) {
                    throw new Error('Fail to create this class as it`s not a managed class');
                }
            }
        }
        IoC.checkManaged = checkManaged;
        function get(name) {
            var construct;
            var instance;
            var theInjectList;
            var superClass;
            checkManaged(name);
            if (typeof name === 'string') {
                construct = managedClassMap[name];
            }
            else {
                construct = name;
                name = construct[MANAGED_NAME_KEY];
            }
            instance = singletonContainer[name];
            if (instance) {
                return instance;
            }
            instance = new construct();
            if (construct[MANAGED_SINGLETON_KEY]) {
                singletonContainer[name] = instance;
            }
            theInjectList = managedClassInjectMap[name];
            if (theInjectList && theInjectList.length >= 0) {
                for (var _i = 0; _i < theInjectList.length; _i++) {
                    var item = theInjectList[_i];
                    instance[item.propName] = get(item.injectName);
                }
            }
            var therClassCtor = construct;
            while (superClass = therClassCtor[SUPER_CLASS]) {
                var superClassName = superClass[MANAGED_NAME_KEY];
                therClassCtor = superClass;
                theInjectList = managedClassInjectMap[superClassName];
                if (theInjectList && theInjectList.length >= 0) {
                    for (var _a = 0; _a < theInjectList.length; _a++) {
                        var item = theInjectList[_a];
                        instance[item.propName] = get(item.injectName);
                    }
                }
            }
            for (var _b = 0; _b < classBuilders.length; _b++) {
                var builder = classBuilders[_b];
                var newInstance = builder.build(instance);
                if (newInstance) {
                    instance = newInstance;
                }
            }
            if (instance.onInstantiate) {
                instance.onInstantiate();
            }
            return instance;
        }
        IoC.get = get;
        function RegisterBuilder() {
            return function (target) {
                classBuilders.push(new target());
            };
        }
        IoC.RegisterBuilder = RegisterBuilder;
        function Managed(name) {
            return function (target) {
                if (!name) {
                    name = randomName();
                }
                if (managedClassMap.hasOwnProperty(name)) {
                    console.warn("Managed class was override, name is " + name);
                }
                managedClassMap[name] = target;
                if (tempInjectList) {
                    if (managedClassInjectMap[name]) {
                        managedClassInjectMap[name] = managedClassInjectMap[name].concat(tempInjectList);
                    }
                    else {
                        managedClassInjectMap[name] = tempInjectList;
                    }
                    tempInjectList = null;
                }
                target[MANAGED_NAME_KEY] = name;
            };
        }
        IoC.Managed = Managed;
        function Inject(name) {
            return function (target, propName) {
                checkManaged(name);
                if (typeof name !== 'string') {
                    name = name[MANAGED_NAME_KEY];
                }
                var construct = target.constructor;
                var managedName = construct[MANAGED_NAME_KEY];
                if (!managedName) {
                    tempInjectList = tempInjectList || [];
                    tempInjectList.push({
                        propName: propName,
                        injectName: name
                    });
                }
                else {
                    managedClassInjectMap[managedName] = managedClassInjectMap[managedName] || [];
                    managedClassInjectMap[managedName].push({
                        propName: propName,
                        injectName: name
                    });
                }
            };
        }
        IoC.Inject = Inject;
        function Extends(superClass) {
            return function (target) {
                target[SUPER_CLASS] = superClass;
            };
        }
        IoC.Extends = Extends;
        function Singleton(onStartup) {
            if (onStartup === void 0) { onStartup = false; }
            return function (target) {
                target[MANAGED_SINGLETON_KEY] = true;
                target[SINGLETON_ON_STARTUP_KEY] = onStartup;
            };
        }
        IoC.Singleton = Singleton;
        function Application() {
            return function (target) {
                Managed(APPLICATION_NAME)(target);
                Singleton()(target);
            };
        }
        IoC.Application = Application;
        function startup() {
            var application = get(APPLICATION_NAME);
            application.startup && application.startup();
            startupSingleton();
            application.init && application.init();
        }
        IoC.startup = startup;
        function getApplication() {
            return get(APPLICATION_NAME);
        }
        IoC.getApplication = getApplication;
        function startupSingleton() {
            for (var key in managedClassMap) {
                var ctor = managedClassMap[key];
                if (ctor[MANAGED_SINGLETON_KEY] && ctor[SINGLETON_ON_STARTUP_KEY]) {
                    get(ctor);
                }
            }
        }
    })(IoC = WOZLLA.IoC || (WOZLLA.IoC = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../../core/WOZLLA.ts"/>
/// <reference path="../IoC.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var action;
    (function (action_1) {
        var CTRL_ACTION_MAP_KEY = 'WOZLLA_Ctrl_Action_Map';
        var CTRL_BROADCAST_MAP_KEY = 'WOZLLA_Ctrl_Broadcast_Map';
        var CTRL_NAME_KEY = 'WOZLLA_Ctrl_Name';
        var FILTER_NAME_KEY = 'WOZLLA_Filter_Name';
        var registedControllers = [];
        var registedFilters = [];
        var Dispatcher = (function () {
            function Dispatcher() {
                this._controllerMap = {};
                this._broadcastMap = {};
                this._filterList = [];
                Dispatcher.instance = this;
            }
            Dispatcher.getInstance = function () {
                return Dispatcher.instance;
            };
            Dispatcher.prototype.startup = function () {
            };
            Dispatcher.prototype.init = function () {
                this.initFilter();
                this.initController();
            };
            Dispatcher.prototype.initController = function () {
                for (var _i = 0; _i < registedControllers.length; _i++) {
                    var name_1 = registedControllers[_i];
                    var ctrl = WOZLLA.IoC.get(name_1);
                    var actionMap = getCtrlActionMap(ctrl);
                    for (var actionName in actionMap) {
                        var funcName = actionMap[actionName];
                        if (this._controllerMap[actionName]) {
                            WOZLLA.Log.warn("action[" + actionName + "] of Controller[" + name_1 + "] has been registered");
                            continue;
                        }
                        this._controllerMap[actionName] = {
                            controller: ctrl,
                            funcName: funcName
                        };
                    }
                    var broadcastMap = getCtrlBroadcastMap(ctrl);
                    for (var broadcastName in broadcastMap) {
                        var funcName = broadcastMap[broadcastName];
                        this._broadcastMap[broadcastName] = this._broadcastMap[broadcastName] || [];
                        this._broadcastMap[broadcastName].push({
                            controller: ctrl,
                            funcName: funcName
                        });
                    }
                }
            };
            Dispatcher.prototype.initFilter = function () {
                registedFilters.sort(function (a, b) {
                    return a.priority - b.priority;
                });
                for (var _i = 0; _i < registedFilters.length; _i++) {
                    var filterRegister = registedFilters[_i];
                    var filterName = filterRegister.name;
                    var filter = WOZLLA.IoC.get(filterName);
                    this._filterList.push(filter);
                }
            };
            Dispatcher.prototype.dispatch = function (action) {
                var ctrlRegister = this._controllerMap[action.name];
                if (!ctrlRegister)
                    return;
                var ctrl = ctrlRegister.controller;
                for (var _i = 0, _a = this._filterList; _i < _a.length; _i++) {
                    var filter = _a[_i];
                    filter.onBeforeAction && filter.onBeforeAction(action);
                }
                ctrl[ctrlRegister.funcName](action);
                for (var _b = 0, _c = this._filterList; _b < _c.length; _b++) {
                    var filter = _c[_b];
                    filter.onAfterAction && filter.onAfterAction(action);
                }
            };
            Dispatcher.prototype.broadcast = function (broadcast) {
                var broadcastName = broadcast.name;
                var ctrlArr = this._broadcastMap[broadcastName];
                if (!ctrlArr)
                    return;
                for (var _i = 0; _i < ctrlArr.length; _i++) {
                    var item = ctrlArr[_i];
                    item.controller[item.funcName](broadcast);
                }
            };
            return Dispatcher;
        })();
        action_1.Dispatcher = Dispatcher;
        function getCtrlActionMap(ctrl) {
            return ctrl.constructor[CTRL_ACTION_MAP_KEY];
        }
        function getCtrlBroadcastMap(ctrl) {
            return ctrl.constructor[CTRL_BROADCAST_MAP_KEY];
        }
        function isController(ctrl) {
            return ctrl.constructor[CTRL_NAME_KEY];
        }
        function Filter(name, priority) {
            if (priority === void 0) { priority = 0; }
            return function (target) {
                name = name || WOZLLA.genUUID();
                target[FILTER_NAME_KEY] = name;
                registedFilters.push({
                    name: name,
                    priority: priority
                });
                WOZLLA.IoC.Managed(name)(target);
                WOZLLA.IoC.Singleton()(target);
            };
        }
        action_1.Filter = Filter;
        function Controller(name) {
            return function (target) {
                name = name || WOZLLA.genUUID();
                target[CTRL_NAME_KEY] = name;
                registedControllers.push(name);
                WOZLLA.IoC.Managed(name)(target);
                WOZLLA.IoC.Singleton()(target);
            };
        }
        action_1.Controller = Controller;
        function OnAction(name) {
            return function (target, propName) {
                var construct = target.constructor;
                construct[CTRL_ACTION_MAP_KEY] = construct[CTRL_ACTION_MAP_KEY] || {};
                construct[CTRL_ACTION_MAP_KEY][name] = propName;
            };
        }
        action_1.OnAction = OnAction;
        function OnBroadcast(name) {
            return function (target, propName) {
                var construct = target.constructor;
                construct[CTRL_BROADCAST_MAP_KEY] = construct[CTRL_BROADCAST_MAP_KEY] || {};
                construct[CTRL_BROADCAST_MAP_KEY][name] = propName;
            };
        }
        action_1.OnBroadcast = OnBroadcast;
        var ControllerBuilder = (function () {
            function ControllerBuilder() {
            }
            ControllerBuilder.prototype.build = function (instance) {
                if (isController(instance)) {
                    instance.init && instance.init();
                }
                return instance;
            };
            ControllerBuilder = __decorate([
                WOZLLA.IoC.RegisterBuilder()
            ], ControllerBuilder);
            return ControllerBuilder;
        })();
        action_1.ControllerBuilder = ControllerBuilder;
    })(action = WOZLLA.action || (WOZLLA.action = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../../core/event/EventDispatcher.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var data;
    (function (data) {
        var Store = (function (_super) {
            __extends(Store, _super);
            function Store() {
                _super.apply(this, arguments);
            }
            return Store;
        })(WOZLLA.event.EventDispatcher);
        data.Store = Store;
    })(data = WOZLLA.data || (WOZLLA.data = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../../core/event/EventDispatcher.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var data;
    (function (data_1) {
        var Model = (function (_super) {
            __extends(Model, _super);
            function Model(data) {
                _super.call(this);
                this._data = data;
            }
            Model.prototype.set = function (field, value, source, silent) {
                if (silent === void 0) { silent = false; }
                if (!this._data) {
                    this._data = {};
                }
                if (this._data[field] !== value) {
                    this._data[field] = value;
                    if (!silent) {
                        this.dispatchEvent(new WOZLLA.event.Event('fieldchange', true, {
                            field: field,
                            value: value,
                            source: source
                        }));
                    }
                }
            };
            Model.prototype.get = function (field) {
                return this._data[field];
            };
            return Model;
        })(WOZLLA.event.EventDispatcher);
        data_1.Model = Model;
    })(data = WOZLLA.data || (WOZLLA.data = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="Store.ts"/>
/// <reference path="Model.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var data;
    (function (data) {
        var ArrayStore = (function (_super) {
            __extends(ArrayStore, _super);
            function ArrayStore() {
                _super.apply(this, arguments);
                this.list = [];
            }
            Object.defineProperty(ArrayStore.prototype, "count", {
                get: function () { return this.list.length; },
                enumerable: true,
                configurable: true
            });
            ArrayStore.prototype.add = function (item, silent) {
                if (silent === void 0) { silent = false; }
                this.addAt(item, this.list.length, silent);
            };
            ArrayStore.prototype.addAt = function (item, index, silent) {
                if (silent === void 0) { silent = false; }
                this.list.splice(index, 0, item);
                if (!silent) {
                    this.dispatchEvent(new WOZLLA.event.Event('add', true, new ArrayStoreEventData(item, index)));
                }
            };
            ArrayStore.prototype.remove = function (item, silent) {
                if (silent === void 0) { silent = false; }
                var index = this.indexOf(item);
                if (index !== -1) {
                    this.removeAt(index, silent);
                }
            };
            ArrayStore.prototype.removeAt = function (index, silent) {
                if (silent === void 0) { silent = false; }
                var item = this.list[index];
                this.list.splice(index, 1);
                if (!silent) {
                    this.dispatchEvent(new WOZLLA.event.Event('remove', true, new ArrayStoreEventData(item, index)));
                }
            };
            ArrayStore.prototype.clear = function (silent) {
                if (silent === void 0) { silent = false; }
                this.list.length = 0;
                if (!silent) {
                    this.dispatchEvent(new WOZLLA.event.Event('clear', true));
                }
            };
            ArrayStore.prototype.getAt = function (index) {
                return this.list[index];
            };
            ArrayStore.prototype.getRange = function (start, count) {
                return this.list.slice(start, start + count);
            };
            ArrayStore.prototype.indexOf = function (item) {
                return this.list.indexOf(item);
            };
            ArrayStore.prototype.each = function (func) {
                var list = this.list.slice(0);
                for (var i = 0, len = list.length; i < len; i++) {
                    if (false === func(list[i], i)) {
                        break;
                    }
                }
            };
            ArrayStore.prototype.query = function (func) {
                var result = [];
                this.each(function (item, index) {
                    if (func(item, index)) {
                        result.push(item);
                    }
                });
                return result;
            };
            ArrayStore.prototype.find = function (field, value) {
                var result;
                this.each(function (item) {
                    if (item.get(field) === value) {
                        result = item;
                        return false;
                    }
                });
                return result;
            };
            ArrayStore.prototype.sort = function (func, silent) {
                if (silent === void 0) { silent = false; }
                this.list.sort(func);
                if (!silent) {
                    this.dispatchEvent(new WOZLLA.event.Event('sort', true));
                }
            };
            return ArrayStore;
        })(data.Store);
        data.ArrayStore = ArrayStore;
        var ArrayStoreEventData = (function () {
            function ArrayStoreEventData(item, index) {
                this.item = item;
                this.index = index;
            }
            return ArrayStoreEventData;
        })();
        data.ArrayStoreEventData = ArrayStoreEventData;
    })(data = WOZLLA.data || (WOZLLA.data = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="./Model.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var data;
    (function (data_2) {
        var SyncModel = (function (_super) {
            __extends(SyncModel, _super);
            function SyncModel(data) {
                _super.call(this, data);
                this.syncList = {};
            }
            SyncModel.prototype.setSync = function (fieldDes, fieldSrc, modelSrc) {
                this.set(fieldDes, modelSrc.get(fieldSrc), this);
                modelSrc.addListenerScope('fieldchange', this.onModelSrcFieldChange, this);
                this.syncList[fieldSrc] = fieldDes;
            };
            SyncModel.prototype.onModelSrcFieldChange = function (e) {
                var fieldSrc = e.data.field;
                var fieldDes = this.syncList[fieldSrc];
                if (fieldDes !== undefined) {
                    this.set(fieldDes, e.data.value, this);
                }
            };
            return SyncModel;
        })(data_2.Model);
        data_2.SyncModel = SyncModel;
    })(data = WOZLLA.data || (WOZLLA.data = {}));
})(WOZLLA || (WOZLLA = {}));
var WOZLLA;
(function (WOZLLA) {
    var view;
    (function (view_1) {
        var LayoutManager = (function () {
            function LayoutManager(view) {
                this.view = view;
            }
            LayoutManager.prototype.doLayout = function () { };
            return LayoutManager;
        })();
        view_1.LayoutManager = LayoutManager;
        var Margin = (function () {
            function Margin() {
                this.left = 0;
                this.right = 0;
                this.top = 0;
                this.bottom = 0;
            }
            return Margin;
        })();
        view_1.Margin = Margin;
    })(view = WOZLLA.view || (WOZLLA.view = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="LayoutManager.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var view;
    (function (view_2) {
        var GridLayout = (function (_super) {
            __extends(GridLayout, _super);
            function GridLayout(view) {
                _super.call(this, view);
                this.columnCount = 1;
                this.margin = new view_2.Margin();
                this.cellMargin = new view_2.Margin();
                this.view.addListenerScope('childchange', this.onViewChildChange, this);
                this.view.addListenerScope('sort', this.onViewChildChange, this);
                this.view.addListenerScope('destroy', this.onViewDestroy, this);
            }
            GridLayout.prototype.doLayout = function () {
                var _this = this;
                // compute cell size
                var cellSize;
                if (this.fixedCellSize) {
                    cellSize = this.fixedCellSize;
                }
                else {
                    cellSize = { width: 0, height: 0 };
                    this.view.eachChild(function (child) {
                        if (child.rectTransform.width > cellSize.width) {
                            cellSize.width = child.rectTransform.width;
                        }
                        if (child.rectTransform.height > cellSize.height) {
                            cellSize.height = child.rectTransform.height;
                        }
                    });
                }
                var x = 0, y = 0, layoutTargetCount = 0;
                x += this.margin.left;
                y += this.margin.top;
                this.view.eachChild(function (child, idx) {
                    if (_this.filterChild(child)) {
                        var col_1 = idx % _this.columnCount;
                        var row_1 = Math.floor(idx / _this.columnCount);
                        child.rectTransform.anchorMode = WOZLLA.RectTransform.ANCHOR_TOP | WOZLLA.RectTransform.ANCHOR_LEFT;
                        child.rectTransform.px = x + col_1 * (_this.cellMargin.left + cellSize.width + _this.cellMargin.right) + _this.cellMargin.left;
                        child.rectTransform.py = y + row_1 * (_this.cellMargin.top + cellSize.height + _this.cellMargin.bottom) + _this.cellMargin.top;
                        layoutTargetCount++;
                    }
                });
                // set view size
                var col = this.columnCount;
                var row = Math.ceil(layoutTargetCount / col);
                this.view.rectTransform.width = this.margin.left + this.margin.right +
                    col * (this.cellMargin.left + this.cellMargin.right);
                this.view.rectTransform.height = this.margin.top + this.margin.bottom +
                    row * (this.cellMargin.top + this.cellMargin.bottom);
            };
            GridLayout.prototype.filterChild = function (child) {
                return child instanceof view_2.View;
            };
            GridLayout.prototype.onViewDestroy = function () {
                this.view.removeListenerScope('childchange', this.onViewChildChange, this);
                this.view.removeListenerScope('destroy', this.onViewDestroy, this);
            };
            GridLayout.prototype.onViewChildChange = function () {
                this.view.requestLayout();
            };
            return GridLayout;
        })(view_2.LayoutManager);
        view_2.GridLayout = GridLayout;
    })(view = WOZLLA.view || (WOZLLA.view = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="../../core/core/GameObject.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var view;
    (function (view) {
        var View = (function (_super) {
            __extends(View, _super);
            function View(director) {
                _super.call(this, director, true);
                this._layoutManager = this.initLayoutManager();
                this.constructView();
                this.requestLayout();
            }
            Object.defineProperty(View.prototype, "layoutManager", {
                get: function () {
                    return this._layoutManager;
                },
                enumerable: true,
                configurable: true
            });
            View.prototype.requestLayout = function () {
                var _this = this;
                if (this._layoutSchedule) {
                    return;
                }
                this._layoutSchedule = this.director.scheduler.scheduleFrame(function () {
                    _this._layoutManager && _this._layoutManager.doLayout();
                    _this._layoutSchedule = null;
                });
            };
            View.prototype.dispatch = function (act) {
                WOZLLA.action.Dispatcher.getInstance().dispatch(act);
            };
            View.prototype.constructView = function () {
            };
            View.prototype.initLayoutManager = function () {
                return null;
            };
            return View;
        })(WOZLLA.GameObject);
        view.View = View;
    })(view = WOZLLA.view || (WOZLLA.view = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="View.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var view;
    (function (view_3) {
        var ListView = (function (_super) {
            __extends(ListView, _super);
            function ListView() {
                _super.apply(this, arguments);
                this._itemZ = 0;
                this._itemViews = [];
                this._itemViewHashMap = new WOZLLA.util.HashMap();
            }
            ListView.prototype.sortItemViews = function (comparator) {
                this._itemViews.sort(comparator);
                this.sortChildren();
            };
            ListView.prototype.getItemZ = function () {
                return this._itemZ;
            };
            ListView.prototype.setItemZ = function (itemZ) {
                this._itemZ = itemZ;
            };
            ListView.prototype.getViewByItem = function (item) {
                return this._itemViewHashMap.get(item);
            };
            ListView.prototype.addItemViewAt = function (itemView, index) {
                if (index >= this._itemViews.length) {
                    this.addItemView(itemView);
                    return;
                }
                this._itemViews.splice(index, 0, itemView);
                this.updateItemsZOrder();
                this.sortChildren();
            };
            ListView.prototype.addItemView = function (itemView) {
                this.addChild(itemView);
                this._itemViews.push(itemView);
                this.updateItemsZOrder();
            };
            ListView.prototype.removeItemView = function (itemView) {
                var idx = this._itemViews.indexOf(itemView);
                if (idx !== -1) {
                    this.removeChild(itemView);
                    this._itemViews.splice(idx, 1);
                    this.updateItemsZOrder();
                }
            };
            ListView.prototype.removeItemViewAt = function (index) {
                var itemView = this._itemViews[index];
                if (itemView) {
                    this.removeItemView(itemView);
                    this.updateItemsZOrder();
                }
            };
            ListView.prototype.clearItemViews = function () {
                for (var i = this._itemViews.length - 1; i >= 0; i--) {
                    this.removeItemView(this._itemViews[i]);
                }
            };
            ListView.prototype.updateItemsZOrder = function () {
                var _this = this;
                this._itemViews.forEach(function (itemView, idx) {
                    itemView.setZ(idx + _this._itemZ, false);
                });
                this._itemViews.sort(WOZLLA.GameObject.Comparator);
                this.sortChildren();
            };
            ListView.prototype.createListItemView = function (item) {
                var view = this.constructListItemView(item);
                this._itemViewHashMap.put(item, view);
                if (this.initialized && !view.initialized) {
                    view.loadAssets(function () {
                        view.init();
                    });
                }
                return view;
            };
            ListView.prototype.constructListItemView = function (item) {
                throw new Error('abstract method');
            };
            ListView.prototype.initLayoutManager = function () {
                return new view_3.GridLayout(this);
            };
            return ListView;
        })(view_3.View);
        view_3.ListView = ListView;
    })(view = WOZLLA.view || (WOZLLA.view = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="ListView.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var view;
    (function (view) {
        var SimpleListView = (function (_super) {
            __extends(SimpleListView, _super);
            function SimpleListView() {
                _super.apply(this, arguments);
            }
            SimpleListView.prototype.getArrayStore = function () {
                return this._arrayStore;
            };
            SimpleListView.prototype.destroy = function () {
                this.unbindArrayStore();
                _super.prototype.destroy.call(this);
            };
            SimpleListView.prototype.bindArrayStore = function (store) {
                var _this = this;
                this._arrayStore = store;
                this._arrayStore.addListenerScope('add', this.onStoreItemAdd, this);
                this._arrayStore.addListenerScope('remove', this.onStoreItemRemove, this);
                this._arrayStore.addListenerScope('clear', this.onStoreClear, this);
                this._arrayStore.addListenerScope('sort', this.onStoreSort, this);
                this.clearItemViews();
                this._arrayStore.each(function (item) {
                    _this.addItemView(_this.createListItemView(item));
                });
            };
            SimpleListView.prototype.unbindArrayStore = function () {
                if (!this._arrayStore)
                    return;
                this._arrayStore.removeListenerScope('add', this.onStoreItemAdd, this);
                this._arrayStore.removeListenerScope('remove', this.onStoreItemRemove, this);
                this._arrayStore.removeListenerScope('clear', this.onStoreClear, this);
                this._arrayStore.removeListenerScope('sort', this.onStoreSort, this);
            };
            SimpleListView.prototype.onStoreItemAdd = function (e) {
                var itemView = this.createListItemView(e.data.item);
                this.addItemViewAt(itemView, e.data.index);
            };
            SimpleListView.prototype.onStoreItemRemove = function (e) {
                var itemView = this.getViewByItem(e.data.item);
                if (itemView) {
                    this.removeItemView(itemView);
                }
            };
            SimpleListView.prototype.onStoreClear = function () {
                this.clearItemViews();
            };
            SimpleListView.prototype.onStoreSort = function () {
                var _this = this;
                this._arrayStore.each(function (item, idx) {
                    var itemView = _this.getViewByItem(item);
                    itemView.setZ(idx + _this.getItemZ(), false);
                });
                this.sortItemViews(WOZLLA.GameObject.Comparator);
            };
            return SimpleListView;
        })(view.ListView);
        view.SimpleListView = SimpleListView;
    })(view = WOZLLA.view || (WOZLLA.view = {}));
})(WOZLLA || (WOZLLA = {}));
/// <reference path="View.ts"/>
var WOZLLA;
(function (WOZLLA) {
    var view;
    (function (view) {
        var helpRecord = {};
        var emptyGetter = function (model, field) {
            return model.get(field);
        };
        var SimpleView = (function (_super) {
            __extends(SimpleView, _super);
            function SimpleView() {
                _super.apply(this, arguments);
            }
            SimpleView.prototype.destroy = function () {
                this.unbindModel();
                _super.prototype.destroy.call(this);
            };
            SimpleView.prototype.getModel = function () {
                return this._model;
            };
            SimpleView.prototype.bindModel = function (model) {
                this.unbindModel();
                model.addListenerScope('fieldchange', this.onModelFieldChange, this);
                this._model = model;
                this.syncBindings();
            };
            SimpleView.prototype.unbindModel = function () {
                if (this._model) {
                    this._model.removeListenerScope('fieldchange', this.onModelFieldChange, this);
                    this._model = null;
                }
            };
            SimpleView.prototype.setBindings = function (bindings) {
                this._bindings = bindings;
            };
            SimpleView.prototype.syncBindings = function () {
                for (var field in this._bindings) {
                    var binding = this._bindings[field];
                    if (WOZLLA.isArray(binding)) {
                        for (var _i = 0; _i < binding.length; _i++) {
                            var subBinding = binding[_i];
                            this.syncBinding(field, subBinding);
                        }
                    }
                    else {
                        this.syncBinding(field, binding);
                    }
                }
            };
            SimpleView.prototype.syncBinding = function (field, binding) {
                if (typeof binding === 'string') {
                    binding = this._bindings[field] = {
                        expr: binding
                    };
                }
                else if (WOZLLA.isArray(binding)) {
                    for (var _i = 0; _i < binding.length; _i++) {
                        var subBinding = binding[_i];
                        this.syncBinding(field, subBinding);
                    }
                    return;
                }
                this.query(binding.expr, helpRecord);
                var target = helpRecord.target;
                if (!target) {
                    WOZLLA.Log.error("Can't bind target by expression: " + binding.expr);
                    return;
                }
                var getter = binding.get || emptyGetter;
                if (target instanceof WOZLLA.GameObject) {
                    target[helpRecord.attrName] = getter(this._model, field);
                }
                else {
                    target[helpRecord.attrName].convert(getter(this._model, field));
                }
            };
            SimpleView.prototype.onModelFieldChange = function (e) {
                var field = e.data.field;
                if (this._bindings) {
                    var binding = this._bindings[field];
                    if (binding) {
                        this.syncBinding(field, binding);
                    }
                }
            };
            return SimpleView;
        })(view.View);
        view.SimpleView = SimpleView;
    })(view = WOZLLA.view || (WOZLLA.view = {}));
})(WOZLLA || (WOZLLA = {}));
//# sourceMappingURL=WOZLLA.js.map
;if ( typeof module === "object" && module && typeof module.exports === "object" ) {
    module.exports = WOZLLA;
} else {
    if ( typeof define === "function" && define.amd ) {
        define( "WOZLLA", [], function () { return WOZLLA; } );
    }
}