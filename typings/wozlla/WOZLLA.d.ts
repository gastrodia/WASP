/// <reference path="hammerjs.d.ts" />
declare module WOZLLA {
    var ajax: any;
}
declare module WOZLLA.asset {
    class AssetLoader {
        static CANCEL_ERROR: string;
        static LOADING_ERROR: string;
        protected assetManager: AssetManager;
        protected canceled: boolean;
        protected loading: boolean;
        constructor(assetManager?: AssetManager);
        loadAsync(decriptor: AssetDescriptor, callback: (error: any, asset: Asset) => void): void;
        cancel(): void;
        isLoading(): boolean;
        isCanceled(): boolean;
        protected begin(): void;
        protected end(): void;
        protected doLoadAsync(decriptor: AssetDescriptor, callback: (error: any, asset: Asset) => void): void;
    }
}
declare module WOZLLA.asset {
    class AssetDescriptor implements IManagedReference, util.IHashable {
        private _hashCode;
        private _assetPath;
        private _loader;
        assetPath: string;
        constructor(assetPath: string);
        getLoader(): AssetLoader;
        setLoader(loader: AssetLoader): void;
        getReferenceKey(): string;
        getClass(): string;
        hashCode(): number;
    }
}
declare module WOZLLA.asset {
    interface AjaxOptions {
        url: string;
        responseType?: string;
        async?: boolean;
        method?: string;
        timeout?: number;
        withCredentials?: boolean;
    }
    class AjaxDescriptor extends AssetDescriptor {
        options: AjaxOptions;
        private _options;
        constructor(options: string | AjaxOptions);
    }
}
declare module WOZLLA.asset {
    class AbstractAjaxLoader extends AssetLoader {
        protected doLoadAsync(decriptor: AjaxDescriptor, callback: (error: any, asset: ImageAsset) => void): void;
        protected onAjaxSuccess(decriptor: AjaxDescriptor, xhr: XMLHttpRequest, callback: (error: any, asset: Asset) => void): void;
    }
}
declare module WOZLLA.event {
    /**
     * @enum {number} WOZLLA.event.EventPhase
     * all enumerations of event phase
     */
    enum EventPhase {
        /** @property {number} [CAPTURE] */
        CAPTURE = 0,
        /** @property {number} [BUBBLE] */
        BUBBLE = 1,
        /** @property {number} [TARGET] */
        TARGET = 2,
    }
    /**
     * @class WOZLLA.event.Event
     * Base class for all event object of WOZLLA engine.    <br/>
     * see also:    <br/>
     * {@link WOZLLA.event.EventPhase}  <br/>
     * {@link WOZLLA.event.EventDispatcher}     <br/>
     */
    class Event {
        /**
         * event data.
         * @member WOZLLA.event.Event
         * @property {any} data
         * @readonly
         */
        data: any;
        /**
         * event type.
         * @member WOZLLA.event.Event
         * @property {string} type
         * @readonly
         */
        type: string;
        /**
         * event origin target.
         * @member WOZLLA.event.Event
         * @property {WOZLLA.event.EventDispatcher} target
         * @readonly
         */
        target: EventDispatcher;
        /**
         * current event target in event bubbling.
         * @member WOZLLA.event.Event
         * @property {WOZLLA.event.EventDispatcher} currentTarget
         * @readonly
         */
        currentTarget: EventDispatcher;
        /**
         * which phase this event is in.
         * @member WOZLLA.event.Event
         * @property {WOZLLA.event.EventPhase} eventPhase
         * @readonly
         */
        eventPhase: EventPhase;
        /**
         * true to identify this event could be bubbled, false otherwise.
         * @member WOZLLA.event.Event
         * @property {boolean} bubbles
         * @readonly
         */
        bubbles: boolean;
        /**
         * true to identify this event could be stop bubbles, false otherwise.
         * @member WOZLLA.event.Event
         * @property {boolean} canStopBubbles
         * @readonly
         */
        canStopBubbles: boolean;
        _type: string;
        _target: EventDispatcher;
        _currentTarget: EventDispatcher;
        _data: any;
        _bubbles: boolean;
        _canStopBubbles: boolean;
        _eventPhase: EventPhase;
        _immediatePropagationStoped: boolean;
        _propagationStoped: boolean;
        _listenerRemove: boolean;
        /**
         * @method constructor
         * create a new Event object
         * @member WOZLLA.event.Event
         * @param {string} type
         * @param {boolean} bubbles
         * @param {any} data
         * @param {boolean} canStopBubbles
         */
        constructor(type: string, bubbles?: boolean, data?: any, canStopBubbles?: boolean);
        /**
         * @method isStopPropagation
         * @member WOZLLA.event.Event
         * @returns {boolean}
         */
        isStopPropagation(): boolean;
        /**
         * stop bubble to next parent
         * @method stopPropagation
         * @member WOZLLA.event.Event
         */
        stopPropagation(): void;
        /**
         * @method isStopImmediatePropagation
         * @member WOZLLA.event.Event
         * @returns {boolean}
         */
        isStopImmediatePropagation(): boolean;
        /**
         * stop event bubble immediately even other listeners dosen't receive this event.
         * @method stopImmediatePropagation
         * @member WOZLLA.event.Event
         */
        stopImmediatePropagation(): void;
        /**
         * call from current listener to remove the current listener
         */
        removeCurrentListener(): void;
    }
}
declare module WOZLLA.event {
    class ListenerList {
        _listeners: any[];
        add(listener: any): void;
        remove(listener: any, scope?: any): boolean;
        removeAt(idx: any): any;
        get(idx: any): any;
        length(): number;
        clear(): void;
    }
    /**
     * @class WOZLLA.event.EventDispatcher
     * Base class for bubblable event system
     *
     */
    class EventDispatcher {
        private _captureDict;
        private _bubbleDict;
        private _bubbleParent;
        /**
         * @method setBubbleParent
         * set bubble parent of this dispatcher
         * @param {WOZLLA.event.EventDispatcher} bubbleParent
         */
        setBubbleParent(bubbleParent: EventDispatcher): void;
        /**
         * @method hasListener
         * @param {string} type
         * @param {boolean} useCapture true to check capture phase, false to check bubble and target phases.
         */
        hasListener(type: string, useCapture?: boolean): boolean;
        /**
         * @method getListenerCount
         * @param {string} type
         * @param {boolean} useCapture true to check capture phase, false to check bubble and target phases.
         * @returns {number}
         */
        getListenerCount(type: string, useCapture: boolean): number;
        /**
         * @method addListener
         * @param {string} type
         * @param {boolean} useCapture true to check capture phase, false to check bubble and target phases.
         */
        addListener(type: string, listener: any, useCapture?: boolean): void;
        addListenerScope(type: string, listener: any, scope: any, useCapture?: boolean): void;
        /**
         * @method removeListener
         * @param {string} type
         * @param {boolean} useCapture true to check capture phase, false to check bubble and target phases.
         */
        removeListener(type: string, listener: any, useCapture?: boolean): boolean;
        removeListenerScope(type: string, listener: any, scope: any, userCapture?: boolean): boolean;
        /**
         * @method clearListeners
         * @param {string} type
         * @param {boolean} useCapture true to check capture phase, false to check bubble and target phases.
         */
        clearListeners(type: string, useCapture: boolean): void;
        /**
         * @method clearAllListeners
         *  clear all listeners
         */
        clearAllListeners(): void;
        /**
         * @method dispatch an event
         * @param {WOZLLA.event.Event} event
         */
        dispatchEvent(event: Event): void;
        _dispatchEventInPhase(event: Event, phase: EventPhase): boolean;
        _getAncients(): any[];
        _getListenerList(type: string, useCapture: boolean): ListenerList;
    }
}
declare module WOZLLA.asset {
    class Asset extends event.EventDispatcher {
        private _descriptor;
        descriptor: AssetDescriptor;
        constructor(descriptor: AssetDescriptor);
        unload(): void;
    }
}
declare module WOZLLA.asset {
    interface AssetGroupLoaderCallback {
        onLoadOne?(error: any, asset: Asset): void;
        onFinish?(): void;
    }
    class AssetGroup {
        static LOADING_ERROR: string;
        private _loadPairs;
        private _loadedCount;
        private _loading;
        put(descriptor: AssetDescriptor, loader?: AssetLoader): void;
        loadAsync(callback: AssetGroupLoaderCallback): void;
        loadWithAssetManager(assetManager: AssetManager, callback: AssetGroupLoaderCallback): void;
        forEach(func: (descriptor: AssetDescriptor, loader: AssetLoader) => void): void;
        getProgress(total?: number): number;
        getTotalCount(): number;
        getLoadedCount(): number;
        isFinish(): boolean;
        isLoading(): boolean;
        private onLoadOne(error, asset, callback);
    }
}
declare module WOZLLA.asset {
    interface IAssetLoadStrategy {
        load(task: AssetLoadingTask): any;
        isIdle(): boolean;
        onClear(): any;
        update(): any;
    }
    class ParallelAssetLoadStrategy implements IAssetLoadStrategy {
        private _queueStrategyMap;
        load(task: AssetLoadingTask): void;
        isIdle(): boolean;
        onClear(): void;
        update(): void;
    }
    class QueueAssetLoadStrategy implements IAssetLoadStrategy {
        private _taskQueue;
        private _taskMap;
        private _loadingTask;
        load(task: AssetLoadingTask): void;
        isIdle(): boolean;
        onClear(): void;
        update(): void;
    }
}
declare module WOZLLA.asset {
    interface IManagedReference {
        getReferenceKey(): string;
    }
    interface IAssetPathResolver {
        resolvePath(path: string, assetManager: AssetManager): string;
    }
    class AssetManager {
        director: Director;
        private _baseURL;
        private _director;
        private _assetMap;
        private _assetPathResolver;
        private _assetLoadStrategy;
        private _monitorLowNetwork;
        constructor(director: any, parallelLoad?: boolean, monitorLowNetwork?: boolean);
        isMonitorLowNetwork(): boolean;
        setAssetPathResolver(resolver: IAssetPathResolver): void;
        getBaseURL(): string;
        setBaseURL(baseURL: any): void;
        resolveURL(assetPath: any): string;
        load(descriptor: AssetDescriptor, callback: (error: any, asset: Asset) => void): void;
        loadGroup(assetGroup: AssetGroup, callback: AssetGroupLoaderCallback): void;
        loadWithLoader(descriptor: AssetDescriptor, loader: AssetLoader, callback: (error: any, asset: Asset) => void): void;
        update(): void;
        clear(): void;
        contains(descriptor: AssetDescriptor): boolean;
        unload(descriptor: AssetDescriptor | Asset): void;
        getAsset(descriptor: AssetDescriptor): Asset;
        addAsset(asset: asset.Asset): void;
        _add(decriptor: AssetDescriptor, asset: Asset): void;
        _retain(descriptor: AssetDescriptor): Asset;
        _release(descriptor: AssetDescriptor): void;
    }
    class AssetLoadingTask {
        assetManager: AssetManager;
        descriptor: AssetDescriptor;
        loader: AssetLoader;
        asset: Asset;
        error: any;
        canceled: boolean;
        callbacks: any[];
        private _loading;
        loaded: boolean;
        cancel(): void;
        callback(): void;
        setLoading(loading: boolean): void;
        addCallback(callback: any): void;
    }
}
declare module WOZLLA.asset {
    class LoaderManager {
        private static instance;
        static getInstance(): LoaderManager;
        private _loaderMap;
        register(assetClass: string, loaderFactory: (assetManager: AssetManager) => AssetLoader): void;
        createLoader(assetClass: string, assetManager?: AssetManager): any;
    }
}
declare module WOZLLA.util {
    interface IHashable {
        hashCode?(): number;
    }
    module IHashable {
        const KEY: string;
        function randomHashCode(): number;
    }
}
declare module WOZLLA.rendering {
    interface ITexture extends util.IHashable {
        getSourceTexture(): any;
        getWidth(): number;
        getHeight(): number;
        getDebugInfo(): string;
    }
}
declare module WOZLLA.asset {
    class ImageDescriptor extends AssetDescriptor {
        constructor(assetPath: string);
        getClass(): string;
    }
    class ImageAsset extends Asset implements rendering.ITexture {
        static CLASS: string;
        private _sourceTexture;
        private _sourceWebGLTexture;
        private _width;
        private _height;
        private _assetManager;
        constructor(descriptor: ImageDescriptor, sourceTexture: any, assetManager?: AssetManager);
        getDebugInfo(): string;
        getSourceImage(): any;
        getSourceTexture(): any;
        getWidth(): number;
        getHeight(): number;
        unload(): void;
        bindAssetManager(assetManager: AssetManager): void;
    }
    class ImageLoader extends AssetLoader {
        static FAIL_ERROR: string;
        constructor(assetManager?: AssetManager);
        protected doLoadAsync(decriptor: AssetDescriptor, callback: (error: any, asset: ImageAsset) => void): void;
        protected loadImage(descriptor: AssetDescriptor, callback: (error: any, asset: ImageAsset) => void): void;
    }
}
declare module WOZLLA.asset {
    class PlainTextDescriptor extends AjaxDescriptor {
        getClass(): string;
    }
    class PlainTextAsset extends Asset {
        static CLASS: string;
        private _plainText;
        private _assetManager;
        constructor(descriptor: PlainTextDescriptor, plainText: string, assetManager?: AssetManager);
        getPlainText(): string;
    }
    class PlainTextLoader extends AbstractAjaxLoader {
        protected onAjaxSuccess(decriptor: PlainTextDescriptor, xhr: XMLHttpRequest, callback: (error: any, asset: Asset) => void): void;
    }
}
declare module WOZLLA.asset {
    class JsonDescriptor extends AjaxDescriptor {
        constructor(options: string | AjaxOptions);
        getClass(): string;
    }
    class JsonAsset extends PlainTextAsset {
        static CLASS: string;
        getJson(): any;
    }
    class JsonLoader extends PlainTextLoader {
        protected onAjaxSuccess(decriptor: PlainTextDescriptor, xhr: XMLHttpRequest, callback: (error: any, asset: Asset) => void): void;
    }
}
declare module WOZLLA.asset {
    interface SpriteFrameData {
        frame: {
            x: number;
            y: number;
            w: number;
            h: number;
            offsetX?: number;
            offsetY?: number;
        };
        spriteSourceSize: {
            x: number;
            y: number;
            w: number;
            h: number;
        };
        sourceSize: {
            x: number;
            y: number;
        };
        trimed: boolean;
        rotated: boolean;
    }
    interface SpriteAtlasDescriptorOptions {
        jsonPath: string;
        imagePath?: string;
    }
    class SpriteAtlasDescriptor extends AssetDescriptor {
        imageDescriptor: ImageDescriptor;
        jsonDescriptor: JsonDescriptor;
        private _imageDescriptor;
        private _jsonDescriptor;
        constructor(options: string | SpriteAtlasDescriptorOptions);
        getReferenceKey(): string;
        getClass(): string;
    }
    class SpriteAtlas extends Asset {
        static CLASS: string;
        private _jsonAsset;
        private _imageAsset;
        private _spriteData;
        private _spriteCanche;
        constructor(spriteAtlasDescriptor: SpriteAtlasDescriptor, jsonAsset: JsonAsset, imageAsset: ImageAsset);
        getSourceImage(): any;
        getTexture(): rendering.ITexture;
        getSprite(name: string | number): Sprite;
        getSpriteCount(): number;
    }
    class SpriteAtlasLoader extends AssetLoader {
        private _jsonLoader;
        private _imageLoader;
        constructor(assetManager?: AssetManager);
        protected doLoadAsync(decriptor: SpriteAtlasDescriptor, callback: (error: any, asset: SpriteAtlas) => void): void;
    }
    class Sprite implements rendering.ITexture {
        spriteAtlas: SpriteAtlas;
        name: string | number;
        x: number;
        y: number;
        width: number;
        height: number;
        offsetX: number;
        offsetY: number;
        rotated: boolean;
        trimed: boolean;
        private _spiteAtlas;
        private _name;
        private _frameData;
        private _offsetX;
        private _offsetY;
        constructor(spriteAtlas: SpriteAtlas, name: string | number, frameData: SpriteFrameData);
        getSourceTexture(): any;
        getWidth(): number;
        getHeight(): number;
        getDebugInfo(): string;
    }
}
declare module WOZLLA.component {
    class ComponentAnnotation {
        name: string;
        ctor: Function;
        properties: PropertyAnnotation[];
        propertiesRaw: PropertyAnnotation[];
        requires: Function[];
        requiresRaw: Function[];
        private _name;
        private _ctor;
        private _properties;
        private _propertyMap;
        private _requires;
        constructor(name: any, ctor: Function);
        addPropertyAnnotation(propertyAnnotation: PropertyAnnotation): void;
        getPropertyAnnotation(name: string): PropertyAnnotation;
        addRequired(compType: Function): void;
    }
    interface PropertyAnnotation {
        propertyName: string;
        propertyType: string;
        defaultValue: any;
        editorConfig: any;
    }
    class ComponentFactory {
        private static _typeMap;
        private static _annotationMap;
        static eachComponent(func: (name: string) => void): void;
        static getName(arg: any): string;
        static getType(name: string): any;
        static create(name: string): any;
        static getSuperClass(compCtor: Function): any;
        static getAnnotation(name: string | Function): ComponentAnnotation;
        static setAbstract(target: Function, isAbstarct?: boolean): void;
        static isAbstract(target: Function): boolean;
        static register(name: string, compCtor: Function, superClass?: Function): void;
        static unregister(name: string): void;
        static registerProperty(compCtor: Function, propertyName: string, propertyType: string, defaultValue: any, editorConfig?: any): void;
        static registerRequired(compCtor: Function, compType: Function): void;
    }
}
declare module WOZLLA.component {
    module Type {
        const Boolean: string;
        const Int: string;
        const Number: string;
        const String: string;
        const Image: string;
        const SpriteAtlas: string;
        const SpriteFrame: string;
        const Align: string;
        const Valign: string;
        const Json: string;
    }
    function component(name: string, superClass?: Function): (target: Function) => void;
    function abstract(): (target: Function) => void;
    function property(propertyType: string, defaultValue?: any, editorConfig?: any): (targetPrototype: Object, propertyName: string) => void;
    function required(compType: Function): (target: Function) => void;
}
declare module WOZLLA.component {
    interface IProperty {
        convert(data: any): any;
    }
    class Property<T> extends event.EventDispatcher implements IProperty {
        private _dirty;
        private _defaultValue;
        private _value;
        constructor(defaultValue?: T);
        convert(data: any): void;
        get(): T;
        set(value: T): void;
        setDefault(): void;
        setDirty(dirty?: boolean): void;
        clearDirty(): void;
        isDirty(): boolean;
    }
    class ComplexProperty extends event.EventDispatcher implements IProperty {
        private _dirty;
        setDirty(dirty?: boolean): void;
        clearDirty(): void;
        isDirty(): boolean;
        convert(data: any): void;
    }
    class DelegateProperty<T> extends event.EventDispatcher implements IProperty {
        private _getter;
        private _setter;
        constructor(getter: () => T, setter: (value: T) => void);
        get(): T;
        set(value: T): void;
        convert(data: any): void;
    }
    class AssetChangeEvent extends event.Event {
        property: AssetProxyProperty<any, any>;
        private _property;
        constructor(property: AssetProxyProperty<any, any>);
    }
    class AssetProxyProperty<T, E extends asset.Asset> extends Property<T> implements IAssetProxy {
        protected asset: E;
        protected component: Component;
        constructor(component: Component, defaultValue?: any);
        getAsset(): E;
        destroy(): void;
        loadAssets(callback?: Function): void;
        unloadAsset(): void;
        protected createAssetDescriptor(): asset.AssetDescriptor;
    }
    class ImageProperty extends AssetProxyProperty<string, asset.ImageAsset> {
        protected createAssetDescriptor(): asset.AssetDescriptor;
    }
    class SpriteAtlasProperty extends AssetProxyProperty<string, asset.SpriteAtlas> {
        protected createAssetDescriptor(): asset.SpriteAtlasDescriptor;
    }
    class JsonProperty extends AssetProxyProperty<string, asset.JsonAsset> {
        protected createAssetDescriptor(): asset.AssetDescriptor;
    }
    class SizeProperty extends ComplexProperty implements ISize, IProperty {
        width: number;
        height: number;
        private _width;
        private _height;
        constructor(defaultValue?: ISize);
        setSize(width: number, height: number): void;
        convert(data: any): void;
    }
    class PointProperty extends ComplexProperty implements IProperty {
        x: number;
        y: number;
        private _x;
        private _y;
        constructor(defaultValue?: IPoint);
        setPoint(x: number, y: number): void;
        convert(data: any): void;
    }
    class RectProperty extends SizeProperty {
        x: number;
        y: number;
        private _x;
        private _y;
        constructor(defaultValue?: IRect);
        setRect(x: number, y: number, width: number, height: number): void;
        convert(data: any): void;
    }
    class CanvasStyleProperty extends ComplexProperty implements IProperty {
        alpha: number;
        stroke: boolean;
        strokeColor: string;
        strokeWidth: number;
        fill: boolean;
        fillColor: string;
        font: string;
        shadow: boolean;
        shadowOffsetX: number;
        shadowOffsetY: number;
        shadowColor: string;
        _font: string;
        _shadow: boolean;
        _shadowOffsetX: number;
        _shadowOffsetY: number;
        _shadowColor: string;
        _stroke: boolean;
        _strokeColor: string;
        _strokeWidth: number;
        _alpha: number;
        _fill: boolean;
        _fillColor: string;
        applyStyle(context: CanvasRenderingContext2D, useFont?: boolean): void;
        convert(data: any): void;
    }
}
declare module WOZLLA.math {
    /**
     * @class WOZLLA.math.Matrix
     * a util class for 3x3 matrix
     */
    class Matrix3x3 {
        /**
         * @property DEG_TO_RAD
         * @member WOZLLA.math.Matrix
         * @readonly
         * @static
         */
        static DEG_TO_RAD: number;
        values: Float32Array;
        a: number;
        c: number;
        b: number;
        d: number;
        tx: number;
        ty: number;
        constructor();
        /**
         * apply from another matrix
         * @param matrix
         */
        applyMatrix(matrix: Matrix3x3): void;
        /**
         * identify this matrix
         */
        identity(): void;
        /**
         * invert this matrix
         */
        invert(): void;
        /**
         * prepend 2d params to this matrix
         * @param a
         * @param b
         * @param c
         * @param d
         * @param tx
         * @param ty
         */
        prepend(a: number, b: number, c: number, d: number, tx: number, ty: any): void;
        /**
         * append 2d params to this matrix
         * @param a
         * @param b
         * @param c
         * @param d
         * @param tx
         * @param ty
         */
        append(a: number, b: number, c: number, d: number, tx: number, ty: any): void;
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
        prependTransform(x: any, y: any, scaleX: any, scaleY: any, rotation: any, skewX: any, skewY: any, regX: any, regY: any): Matrix3x3;
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
        appendTransform(x: any, y: any, scaleX?: number, scaleY?: number, rotation?: number, skewX?: number, skewY?: number, regX?: number, regY?: number): Matrix3x3;
    }
}
declare module WOZLLA {
    /**
     * this class define the position, scale, rotation and about transform information of {@link WOZLLA.GameObject}
     * @class WOZLLA.Transform
     */
    class Transform {
        __local_matrix: any;
        /**
         * @property {number} DEG_TO_RAD
         * @readonly
         * @static
         */
        static DEG_TO_RAD: number;
        /**
         * @property {WOZLLA.math.Matrix} worldMatrix
         * @readonly
         */
        worldMatrix: WOZLLA.math.Matrix3x3;
        /**
         * specify this tranform
         * @type {boolean}
         */
        useGLCoords: boolean;
        _values: Array<number>;
        _relative: boolean;
        _dirty: boolean;
        constructor();
        x: any;
        y: any;
        worldX: number;
        worldY: number;
        rotation: any;
        scaleX: any;
        scaleY: any;
        skewX: any;
        skewY: any;
        relative: boolean;
        dirty: boolean;
        setPosition(x: any, y: any): void;
        setScale(scaleX: any, scaleY: any): void;
        setSkew(skewX: any, skewY: any): void;
        reset(): void;
        set(transform: any): void;
        transform(rootTransform: Transform, parentTransform?: Transform): void;
        globalToLocal(x: any, y: any, out?: {
            x: number;
            y: number;
        }): {
            x: number;
            y: number;
        };
        localToGlobal(x: any, y: any, out?: {
            x: number;
            y: number;
        }): {
            x: number;
            y: number;
        };
        localToLocal(x: any, y: any, trans: Transform, out?: {
            x: number;
            y: number;
        }): {
            x: number;
            y: number;
        };
        tween(override: boolean, loop?: boolean): util.Tween;
        clearTweens(): void;
    }
}
declare module WOZLLA {
    var sharedHelpTransform: Transform;
    /**
     * Top class of all components
     * @class WOZLLA.Component
     * @extends WOZLLA.event.EventDispatcher
     * @abstract
     */
    class Component extends WOZLLA.event.EventDispatcher {
        UID: string;
        private _UID;
        /**
         * get the GameObject of this component belongs to.
         * @property {WOZLLA.GameObject} gameObject
         */
        gameObject: GameObject;
        /**
         *  get transform of the gameObject of this component
         *  @property {WOZLLA.Transform} transform
         */
        transform: Transform;
        rectTransform: RectTransform;
        director: Director;
        stage: Stage;
        assetManager: asset.AssetManager;
        private _gameObject;
        private _assetProxyList;
        /**
         * init this component
         */
        init(): void;
        /**
         * destroy this component
         */
        destroy(): void;
        loadAssets(callback?: Function): void;
        protected addAssetProxy(proxy: IAssetProxy): void;
        protected removeAssetProxy(proxy: IAssetProxy): void;
    }
    interface IAssetProxy {
        getAsset(): asset.Asset;
        destroy(): any;
        loadAssets(callback?: Function): any;
    }
}
declare module WOZLLA {
    /**
     * Abstract base class for RenderContext component
     * @class WOZLLA.Renderer
     * @abstract
     */
    class Renderer extends Component {
        render(renderContext: rendering.RenderContext, transformDirty: boolean, renderLayer: string, renderOrder: number, alpha: number): void;
    }
}
declare module WOZLLA {
    const isWebGLSupport: boolean;
    function empty(): void;
    const ALIGN_START: string;
    const ALIGN_CENTER: string;
    const ALIGN_END: string;
    const VALIGN_TOP: string;
    const VALIGN_MIDDLE: string;
    const VALIGN_BOTTOM: string;
    interface IPoint {
        x: number;
        y: number;
    }
    interface ISize {
        width: number;
        height: number;
    }
    interface IRect extends ISize, IPoint {
    }
    function genUID(): string;
    function genUUID(): string;
    function applyIfUndefined(target: any, source: any): any;
    function isArray(test: any): boolean;
    function createCanvas(width: any, height: any): HTMLCanvasElement;
    module Log {
        var NONE: number;
        var ERROR: number;
        var WARN: number;
        var INFO: number;
        var DEBUG: number;
        var logLevel: number;
        function debug(...args: any[]): void;
        function info(...args: any[]): void;
        function warn(...args: any[]): void;
        function error(...args: any[]): void;
    }
    function ajaxRequest(options: any): void;
}
declare module WOZLLA.component {
    class AbstractSpriteRenderer extends WOZLLA.Renderer {
        spriteAtlas: SpriteAtlasProperty;
        align: Property<string>;
        valign: Property<string>;
        frame: Property<string | number>;
        private _spriteAtlas;
        private _frame;
        private _align;
        private _valign;
        constructor();
        render(renderContext: rendering.RenderContext, transformDirty: boolean, renderLayer: string, renderOrder: number, alpha: number): void;
        getSprite(): asset.Sprite;
    }
}
declare module WOZLLA.component {
    class SpriteRenderer extends AbstractSpriteRenderer {
        private _useOffset;
        private _quadCommand;
        setUseOffset(useOffset: boolean): void;
        render(renderContext: rendering.RenderContext, transformDirty: boolean, renderLayer: string, renderOrder: number, alpha: number): void;
    }
}
declare module WOZLLA {
    /**
     * Abstract base class for all behaviours, the {@link WOZLLA.Behaviour#update} function would be call
     * by WOZLLA engine every frame when the gameObject is actived and the property enabled of this behaviour is true
     * @class WOZLLA.Behaviour
     * @extends WOZLLA.Component
     * @abstract
     */
    class Behaviour extends Component {
        /**
         * enabled or disabled this behaviour
         * @property {boolean} [enabled=true]
         */
        enabled: boolean;
        /**
         * call by Engine every frame
         * @method update
         */
        update(): void;
    }
}
declare module WOZLLA.util {
    class Tween {
        static NONE: number;
        static LOOP: number;
        static REVERSE: number;
        private static _tweens;
        private static IGNORE;
        private static _plugins;
        private static _inited;
        private _target;
        private _useTicks;
        private ignoreGlobalPause;
        private loop;
        private pluginData;
        private _curQueueProps;
        private _initQueueProps;
        private _steps;
        private _actions;
        private paused;
        private duration;
        private _prevPos;
        private position;
        private _prevPosition;
        private _stepPosition;
        private passive;
        static get(target: any, props?: any, pluginData?: any, override?: boolean): Tween;
        static removeTweens(target: any): void;
        static tick(delta: any, paused?: boolean): void;
        private static _register(tween, value);
        static removeAllTweens(): void;
        constructor(target: any, props: any, pluginData: any);
        private initialize(target, props, pluginData);
        private setPosition(value, actionsMode?);
        private _runActions(startPos, endPos, includeStart?);
        private _updateTargetProps(step, ratio);
        setPaused(value: boolean): Tween;
        private _cloneProps(props);
        private _addStep(o);
        private _appendQueueProps(o);
        private _addAction(o);
        private _set(props, o);
        wait(duration: number, passive?: boolean): Tween;
        to(props: any, duration: number, ease?: any): Tween;
        call(callback: Function, thisObj?: any, params?: any): Tween;
        set(props: any, target?: any): Tween;
        play(tween: Tween): Tween;
        pause(tween: Tween): Tween;
        tick(delta: number): void;
    }
}
declare module WOZLLA.component {
    class SpriteAnimation extends Behaviour {
        static DEFAULT_ANIMATION: string;
        loop: Property<boolean>;
        pause: Property<boolean>;
        animation: Property<string>;
        duration: Property<number>;
        private _animation;
        private _loop;
        private _pause;
        private _duration;
        private _animationMap;
        private _playedTime;
        private _playingAnimation;
        private _playingFrame;
        init(): void;
        update(): void;
        play(options?: PlayOptions): void;
        protected initAnimations(): void;
        protected getFrameDelta(): number;
    }
    interface PlayOptions {
        animation?: string;
        loop?: boolean;
        duration?: number;
    }
    interface AnimationFrame {
        x: number;
        y: number;
        width: number;
        height: number;
        offsetX: number;
        offsetY: number;
    }
    class Animation {
        length: number;
        private _frames;
        constructor();
        addFrame(frame: AnimationFrame | asset.Sprite): void;
        getFrame(index: number): any;
    }
}
declare module WOZLLA.component {
    class CanvasTextureWrapper implements rendering.ITexture {
        private _UUID;
        getSourceTexture(): any;
        getWidth(): number;
        getHeight(): number;
        _sourceTexture: any;
        _width: number;
        _height: number;
        constructor(width: any, height: any, sourceTexture: any);
        reset(width: any, height: any, sourceTexture: any): void;
        getDebugInfo(): string;
    }
    class CanvasRenderer extends WOZLLA.Renderer {
        align: Property<string>;
        valign: Property<string>;
        canvasStyle: CanvasStyleProperty;
        canvasSize: SizeProperty;
        private _align;
        private _valign;
        private _canvasSize;
        private _canvasStyle;
        private _canvas;
        private _context;
        private _quadCommand;
        render(renderContext: rendering.RenderContext, transformDirty: boolean, renderLayer: string, renderOrder: number, alpha: number): void;
        destroy(): void;
        protected measureCanvasSize(helpContext: any, size: ISize): void;
        protected isGraphicsDirty(): boolean;
        protected clearGraphicsDirty(): void;
        protected draw(context: any, canvas: any): void;
        protected initCanvas(size: ISize): HTMLCanvasElement;
    }
}
declare module WOZLLA {
    /**
     * abstract base class for all colliders
     * @class WOZLLA.Collider
     * @extends WOZLLA.Component
     * @abstract
     */
    class Collider extends Component {
        /**
         * @method {boolean} containsXY
         * @param localX x coords relate to the gameObject of this collider
         * @param localY y coords relate to the gameObject of this collider
         * @returns {boolean}
         */
        collideXY(localX: number, localY: number): boolean;
        collide(collider: Collider): boolean;
    }
}
declare module WOZLLA.component {
    class CircleCollider extends Collider {
        centerX: Property<number>;
        centerY: Property<number>;
        radius: Property<number>;
        reverse: Property<boolean>;
        private _centerX;
        private _centerY;
        private _radius;
        private _reverse;
        collideXY(localX: number, localY: number): boolean;
        setRegion(centerX: number, centerY: number, radius: number): void;
    }
}
declare module WOZLLA.component {
    class InfiniteCollider extends Collider {
        collideXY(localX: number, localY: number): boolean;
    }
}
declare module WOZLLA.component {
    class RectCollider extends Collider {
        x: Property<number>;
        y: Property<number>;
        width: Property<number>;
        height: Property<number>;
        reverse: Property<boolean>;
        private _x;
        private _y;
        private _width;
        private _height;
        private _reverse;
        collideXY(localX: number, localY: number): boolean;
        setRegion(x: number, y: number, width: number, height: number): void;
    }
}
declare module WOZLLA.math {
    /**
     * @class WOZLLA.math.Point
     * a util class contains x and y properties
     */
    class Point {
        x: number;
        y: number;
        /**
         * @method constructor
         * create a new instance of Point
         * @member WOZLLA.math.Point
         * @param {number} x
         * @param {number} y
         */
        constructor(x: number, y: number);
        /**
         * get simple description of this object
         * @returns {string}
         */
        toString(): string;
    }
}
declare module WOZLLA.component {
    class NormalRectMask extends Renderer {
        rect: RectProperty;
        startOrder: Property<number>;
        endOrder: Property<number>;
        private _rect;
        private _startOrder;
        private _endOrder;
        private _pushMaskCommand;
        private _popMaskCommand;
        render(renderContext: rendering.RenderContext, transformDirty: boolean, renderLayer: string, renderOrder: number, alpha: number): void;
    }
}
declare module WOZLLA.component {
    class CircleRenderer extends CanvasRenderer {
        radius: Property<number>;
        private _radius;
        private _center;
        protected measureCanvasSize(helpContext: any, sizeOut: ISize): void;
        protected isGraphicsDirty(): boolean;
        protected clearGraphicsDirty(): void;
        protected draw(context: any): void;
    }
}
declare module WOZLLA.component {
    class PureColorBgRenderer extends WOZLLA.Renderer {
        color: Property<string>;
        private _color;
        private _canvas;
        private _quadCommand;
        private _scaleMatrix;
        private getCanvas();
        render(renderContext: rendering.RenderContext, transformDirty: boolean, renderLayer: string, renderOrder: number, alpha: number): void;
    }
}
declare module WOZLLA.component {
    class RectRenderer extends CanvasRenderer {
        size: SizeProperty;
        private _rectSize;
        protected measureCanvasSize(helpContext: any, sizeOut: ISize): void;
        protected isGraphicsDirty(): boolean;
        protected clearGraphicsDirty(): void;
        protected draw(context: any): void;
    }
}
declare module WOZLLA.component {
    class Reference extends WOZLLA.Component {
        viewJson: Property<string>;
        private _viewJson;
        loadAssets(callback: () => void): void;
    }
}
declare module WOZLLA.component {
    class ImageRenderer extends WOZLLA.Renderer {
        imageSrc: Property<string>;
        align: Property<string>;
        valign: Property<string>;
        private _imageSrc;
        private _align;
        private _valign;
        private _quadCommand;
        constructor();
        render(renderContext: rendering.RenderContext, transformDirty: boolean, renderLayer: string, renderOrder: number, alpha: number): void;
    }
}
declare module WOZLLA.component {
    class Sprite9Patch extends AbstractSpriteRenderer {
        patchTop: Property<number>;
        patchBottom: Property<number>;
        patchLeft: Property<number>;
        patchRight: Property<number>;
        renderWidth: Property<number>;
        renderHeight: Property<number>;
        private _patchTop;
        private _patchBottom;
        private _patchLeft;
        private _patchRight;
        private _renderWidth;
        private _renderHeight;
        private _createdCommands;
        private _topLeftCommand;
        private _topCenterCommand;
        private _topRightCommand;
        private _middleLeftCommand;
        private _middleCenterCommand;
        private _middleRightCommand;
        private _bottomLeftCommand;
        private _bottomCenterCommand;
        private _bottomRightCommand;
        private _commandArray;
        render(renderContext: rendering.RenderContext, transformDirty: boolean, renderLayer: string, renderOrder: number, alpha: number): void;
        private render9Patch(renderContext, transformDirty, renderLayer, renderOrder, alpha, asset, sprite);
        private _alignToOffsetValue(align, texSize);
        private _clearCommandsTexture();
        private _setCommandsTexture(texture);
        private _create9PatchCommands(renderer);
    }
}
declare module WOZLLA.component {
    class TilingSpriteRenderer extends AbstractSpriteRenderer {
        size: SizeProperty;
        private _size;
        margin: SizeProperty;
        private _margin;
        private _spriteBatch;
        private _drawingTexture;
        render(renderContext: rendering.RenderContext, transformDirty: boolean, renderLayer: string, renderOrder: number, alpha: number): void;
    }
}
declare module WOZLLA.component {
    class SpriteText extends AbstractSpriteRenderer {
        sample: Property<string>;
        text: Property<string>;
        wordMargin: Property<number>;
        private _sample;
        private _text;
        private _wordMargin;
        private _spriteBatch;
        private _drawingTexture;
        render(renderContext: rendering.RenderContext, transformDirty: boolean, renderLayer: string, renderOrder: number): void;
    }
}
declare module WOZLLA.component {
    class TextRenderer extends CanvasRenderer {
        static measureText(helpContext: any, style: CanvasStyleProperty, text: string): {
            width: any;
            height: any;
        };
        text: Property<string>;
        private _text;
        protected measureCanvasSize(helpContext: CanvasRenderingContext2D, sizeOut: ISize): void;
        protected isGraphicsDirty(): boolean;
        protected clearGraphicsDirty(): void;
        protected draw(context: any): void;
        protected drawText(context: any, measuredWidth: any, measuredHeight: any): void;
    }
}
declare module WOZLLA {
    class Assert {
        static DEFAULT_MESSAGE: string;
        static isTrue(test: any, msg?: string): void;
        static isFalse(test: any, msg?: string): void;
        static isTypeof(test: any, type: string, msg?: string): void;
        static isNotTypeof(test: any, type: string, msg?: string): void;
        static isString(test: any, msg?: string): void;
        static isObject(test: any, msg?: string): void;
        static isUndefined(test: any, msg?: string): void;
        static isNotUndefined(test: any, msg?: string): void;
        static isFunction(test: any, msg?: string): void;
    }
}
declare module WOZLLA.util {
    class StateMachine extends WOZLLA.event.EventDispatcher {
        static INIT: string;
        static CHANGE: string;
        _defaultState: string;
        _currentState: string;
        _currentTransition: ITransition;
        _stateConfig: any;
        defineState(name: string, isDefault?: boolean): void;
        getStateData(state: string, key: string): any;
        setStateData(state: string, key: string, data: any): void;
        defineTransition(fromState: string, toState: string, transition: ITransition): void;
        init(): void;
        getCurrentState(): string;
        changeState(state: string): void;
    }
    class StateEventData {
        state: string;
        constructor(state: string);
    }
    interface ITransition {
        reset(): any;
        cancel(): any;
        execute(fromState: string, toState: string, onComplete: Function): any;
    }
    class EmptyTransition implements ITransition {
        private static instance;
        static getInstance(): EmptyTransition;
        _canceled: boolean;
        reset(): void;
        cancel(): void;
        execute(fromState: string, toState: string, onComplete: Function): void;
    }
}
declare module WOZLLA.component {
    class StateWidget extends SpriteRenderer {
        _stateMachine: WOZLLA.util.StateMachine;
        constructor();
        init(): void;
        destroy(): void;
        protected initStates(): void;
        protected getStateSpriteName(state: string): string;
        protected setStateSpriteName(state: string, spriteName: string): void;
        protected onStateChange(e: any): void;
    }
}
declare module WOZLLA.component {
    class Button extends StateWidget {
        static STATE_NORMAL: string;
        static STATE_DISABLED: string;
        static STATE_PRESSED: string;
        normalSpriteName: DelegateProperty<string>;
        disabledSpriteName: DelegateProperty<string>;
        pressedSpriteName: DelegateProperty<string>;
        scaleOnPress: Property<number>;
        private _scaleOnPress;
        private _normalSpriteName;
        private _disabledSpriteName;
        private _pressedSpriteName;
        _originScaleX: number;
        _originScaleY: number;
        _touchTime: number;
        _touchTween: util.Tween;
        _scaleTimer: any;
        init(): void;
        isEnabled(): boolean;
        setEnabled(enabled?: boolean): void;
        protected initStates(): void;
        protected onTouch(e: any): void;
        protected onRelease(e: any): void;
    }
}
declare module WOZLLA.component {
    class Progress extends WOZLLA.component.AbstractSpriteRenderer {
        value: Property<number>;
        private _value;
        private _quadCommand;
        render(renderContext: rendering.RenderContext, transformDirty: boolean, renderLayer: string, renderOrder: number, alpha: number): void;
    }
}
declare module WOZLLA.math {
    module MathUtils {
        function rectIntersect(a: any, b: any): boolean;
        function rectIntersect2(ax: any, ay: any, aw: any, ah: any, bx: any, by: any, bw: any, bh: any): boolean;
    }
}
declare module WOZLLA.component {
    class ScrollRect extends Behaviour {
        static globalScrollEnabled: boolean;
        static HORIZONTAL: string;
        static VERTICAL: string;
        static BOTH: string;
        direction: component.Property<string>;
        scrollEnabled: Property<boolean>;
        content: Property<string>;
        visibleRect: RectProperty;
        contentRect: RectProperty;
        bufferBackEnabled: Property<boolean>;
        momentumEnabled: Property<boolean>;
        interactiveRect: WOZLLA.math.Rectangle;
        private _scrollEnabled;
        private _bufferBackEnabled;
        private _momentumEnabled;
        private _direction;
        private _content;
        private _visibleRect;
        private _contentRect;
        _dragMovedInLastSession: boolean;
        _dragging: boolean;
        _values: {
            velocityX: number;
            velocityY: number;
            momentumX: number;
            momentumY: number;
            lastDragX: number;
            lastDragY: number;
            momentumXTween: any;
            momentumYTween: any;
            bufferXTween: any;
            bufferYTween: any;
        };
        _contentGameObject: GameObject;
        _bufferBackCheckRequired: boolean;
        init(): void;
        destroy(): void;
        update(): void;
        isScrollable(): boolean;
        requestCheckBufferBack(): void;
        stopScroll(): void;
        protected clearAllTweens(): void;
        protected getMinScrollX(): number;
        protected getMinScrollY(): number;
        protected onDragStart(e: any): void;
        protected onDrag(e: any): void;
        protected onDragEnd(e: any): void;
        protected tryBufferBackX(): boolean;
        protected tryBufferBackY(): boolean;
    }
}
declare module WOZLLA {
    /**
     * internal class
     * @class WOZLLA.CoreEvent
     * @extends WOZLLA.event.Event
     */
    class CoreEvent extends WOZLLA.event.Event {
        data: CoreEventData;
        /**
         * new a CoreEvent
         * @method constructor
         * @param type
         * @param bubbles
         * @param data
         * @param canStopBubbles
         */
        constructor(type: string, bubbles?: boolean, data?: CoreEventData, canStopBubbles?: boolean);
    }
    interface CoreEventData {
        parent?: GameObject;
        child?: GameObject;
        component?: Component;
    }
}
declare module WOZLLA {
    interface DirectorOptions {
        webgl: boolean;
        parallelLoad: boolean;
        monitorLowNetwork: boolean;
        bgColor: number[];
        touch: boolean;
    }
    class Director {
        private _realStartTime;
        private _realNow;
        private _realDeltaTime;
        private _deltaTime;
        private _now;
        private _measureFPS;
        private _timeScale;
        private _started;
        private _paused;
        private _view;
        private _options;
        private _stage;
        private _renderContext;
        private _touch;
        private _scheduler;
        private _assetManager;
        private _updatedViewport;
        realStartTime: number;
        realNow: number;
        realDeltaTime: number;
        deltaTime: number;
        now: number;
        measureFPS: number;
        timeScale: number;
        view: any;
        stage: Stage;
        renderContext: rendering.RenderContext;
        touch: Touch;
        scheduler: Scheduler;
        assetManager: asset.AssetManager;
        constructor(view: any, options?: any);
        createGameObject(useRectTransform?: boolean): GameObject;
        start(): void;
        stop(): void;
        pause(): void;
        resume(): boolean;
        isPaused(): boolean;
        isStarted(): boolean;
        updateViewport(viewport: rendering.Viewport): void;
        runStep(): void;
        private _createRenderer();
    }
}
declare module WOZLLA {
    /**
     * RectTransform is a subclass of {@link WOZLLA.Transform}, define a rect region
     * for {@WOZLLA.GameObject} and a anchor mode to specify how to related to it's parent.
     * @class WOZLLA.RectTransform
     */
    class RectTransform extends Transform {
        static getMode(name: any): number;
        /**
         * vertical anchor mode
         * @property {number} ANCHOR_TOP
         * @readonly
         * @static
         */
        static ANCHOR_TOP: number;
        /**
         * vertical anchor mode
         * @property {number} ANCHOR_MIDDLE
         * @readonly
         * @static
         */
        static ANCHOR_MIDDLE: number;
        /**
         * vertical anchor mode
         * @property {number} ANCHOR_BOTTOM
         * @readonly
         * @static
         */
        static ANCHOR_BOTTOM: number;
        /**
         * vertical anchor mode
         * @property {number} ANCHOR_VERTICAL_STRENGTH
         * @readonly
         * @static
         */
        static ANCHOR_VERTICAL_STRENGTH: number;
        /**
         * horizontal anchor mode
         * @property {number} ANCHOR_LEFT
         * @readonly
         * @static
         */
        static ANCHOR_LEFT: number;
        /**
         * horizontal anchor mode
         * @property {number} ANCHOR_CENTER
         * @readonly
         * @static
         */
        static ANCHOR_CENTER: number;
        /**
         * horizontal anchor mode
         * @property {number} ANCHOR_RIGHT
         * @readonly
         * @static
         */
        static ANCHOR_RIGHT: number;
        /**
         * horizontal anchor mode
         * @property {number} ANCHOR_HORIZONTAL_STRENGTH
         * @readonly
         * @static
         */
        static ANCHOR_HORIZONTAL_STRENGTH: number;
        /**
         * get or set width, this property only effect on fixed size mode
         * @property {number} width
         */
        width: number;
        /**
         * get or set height, this property only effect on fixed size mode
         * @property {number} height
         */
        height: number;
        /**
         * get or set top
         * @property {number} top
         */
        top: number;
        /**
         * get or set left
         * @property {number} left
         */
        left: number;
        /**
         * get or set right
         * @property {number} right
         */
        right: number;
        /**
         * get or set bottom
         * @property {number} bottom
         */
        bottom: number;
        /**
         * get or set px, this only effect on strengthen mode
         * @property {number} px specify x coords
         */
        px: number;
        /**
         * get or set py, this only effect on strengthen mode
         * @property {number} py specify y coords
         */
        py: number;
        /**
         * get or set anchor mode
         * @property {number} anchorMode
         */
        anchorMode: number;
        _width: number;
        _height: number;
        _top: number;
        _left: number;
        _right: number;
        _bottom: number;
        _px: number;
        _py: number;
        _anchorMode: number;
        /**
         * set rect transform
         * @param {WOZLLA.RectTransform} rectTransform
         */
        set(rectTransform: any): void;
        superSet(transform: Transform): void;
        /**
         * transform with parent transform
         * @param {WOZLLA.Transform} rootTransform
         * @param {WOZLLA.Transform} parentTransform
         */
        transform(rootTransform: Transform, parentTransform?: Transform): void;
    }
}
declare module WOZLLA {
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
    class GameObject extends WOZLLA.event.EventDispatcher {
        static Comparator: (a: GameObject, b: GameObject) => number;
        /**
         * return the GameObject with the specified id.
         * @method {WOZLLA.GameObject} getById
         * @static
         * @param id the specified id
         * @member WOZLLA.GameObject
         */
        static getById(id: string): GameObject;
        static _getIdMap(): any;
        /**
         * get or set the id of this game object
         * @property {string} id
         * @member WOZLLA.GameObject
         */
        id: string;
        /**
         * get or set the name of this game object
         * @property {string} name
         * @member WOZLLA.GameObject
         */
        name: string;
        /**
         * get transform of this game object
         * @property {WOZLLA.Transform} transform
         * @member WOZLLA.GameObject
         * @readonly
         */
        transform: Transform;
        /**
         * get rect transform of this game object
         * @property {WOZLLA.RectTransform} rectTransform
         * @member WOZLLA.GameObject
         * @readonly
         */
        rectTransform: RectTransform;
        /**
         * get parent game object
         * @property {WOZLLA.GameObject} parent
         * @member WOZLLA.GameObject
         * @readonly
         */
        parent: GameObject;
        /**
         * get children of this game object
         * @property {WOZLLA.GameObject[]} children
         * @member WOZLLA.GameObject
         * @readonly
         */
        children: GameObject[];
        /**
         * get raw children
         * @returns {WOZLLA.GameObject[]}
         */
        rawChildren: GameObject[];
        rawComponents: Component[];
        /**
         * get child count
         * @property {number} childCount
         * @member WOZLLA.GameObject
         * @readonly
         */
        childCount: number;
        /**
         * get or set z order of this game object, and then resort children.
         * @property {number} z
         * @member WOZLLA.GameObject
         */
        z: number;
        /**
         * get or set active of this game object.
         * the update method would be call every frame when active was true, false otherwise.
         * if active is set from false to true, the transform dirty would be true.
         * @property {boolean} active
         * @member WOZLLA.GameObject
         */
        active: boolean;
        /**
         * get visible of this game object.
         * the render method would be call every frame when visible and active both true.
         * @property {boolean} visible
         * @member WOZLLA.GameObject
         */
        visible: boolean;
        enabled: boolean;
        /**
         * get initialized of this game object
         * @property {boolean} initialized
         * @member WOZLLA.GameObject
         * @readonly
         */
        initialized: boolean;
        /**
         * get destroyed of this game object
         * @property {boolean} destroyed
         * @member WOZLLA.GameObject
         * @readonly
         */
        destroyed: boolean;
        /**
         * get or set touchable of this game object. identify this game object is interactive.
         * @property {boolean} touchable
         * @member WOZLLA.GameObject
         * @readonly
         */
        touchable: boolean;
        /**
         * get renderContext component of this game object
         * @property {WOZLLA.Renderer} renderContext
         * @member WOZLLA.GameObject
         * @readonly
         */
        renderer: Renderer;
        /**
         * get collider of this game object
         * @property {WOZLLA.Collider} collider
         * @member WOZLLA.GameObject
         * @readonly
         */
        collider: Collider;
        /**
         * get behaviours of this game object
         * @property {WOZLLA.Behaviour[]} behaviours
         * @member WOZLLA.GameObject
         * @readonly
         */
        behaviours: Behaviour[];
        director: Director;
        stage: Stage;
        renderLayer: string;
        renderOrder: number;
        UID: string;
        interactiveRect: math.Rectangle;
        alpha: number;
        private _UID;
        private _id;
        private _name;
        private _active;
        private _visible;
        private _initialized;
        private _destroyed;
        private _touchable;
        private _children;
        private _childrenByName;
        private _components;
        private _transform;
        private _rectTransform;
        private _parent;
        private _z;
        private _alpha;
        private _alphaDirty;
        private _assetLoading;
        private _renderLayer;
        private _renderOrder;
        private _renderer;
        private _collider;
        private _behaviours;
        private _data;
        private _interactiveRect;
        private _stage;
        private _director;
        private _addIndex;
        constructor(director: Director, useRectTransform?: boolean);
        data(key: string, value?: any): any;
        /**
         * get active in tree
         * @method isActive
         * @member WOZLLA.GameObject
         * @return {boolean}
         */
        isActive(): boolean;
        /**
         * get visible in tree
         * @method isVisible
         * @member WOZLLA.GameObject
         * @return {boolean}
         */
        isVisible(): boolean;
        /**
         * set z order
         * @param value
         * @param sort true is set to resort children
         */
        setZ(value: number, sort?: boolean): void;
        /**
         * add a child game object, it would be fail when this game object has contains the child.
         * @param child
         * @param sort true is set to resort children
         * @returns {boolean} true is success to, false otherwise.
         */
        addChild(child: GameObject, sort?: boolean): boolean;
        /**
         * remove the specified child.
         * @param child
         * @returns {boolean} true is success to, false otherwise.
         */
        removeChild(child: GameObject): boolean;
        /**
         * get the first child with the specified name.
         * @param name
         * @returns {WOZLLA.GameObject}
         */
        getChild(name: string): GameObject;
        /**
         * get all children with the specified name.
         * @param name
         * @returns {Array}
         */
        getChildren(name: string): GameObject[];
        /**
         * remove this game object from parent.
         * @returns {boolean}
         */
        removeMe(): boolean;
        /**
         * iterator children of this game object
         * @param func interator function.
         */
        eachChild(func: (value: GameObject, index?: number, array?: GameObject[]) => any): void;
        /**
         * sort children
         */
        sortChildren(): void;
        /**
         * get path of this game object
         * @param split delimiter
         * @returns {string}
         */
        getPath(split?: string): string;
        /**
         * whether contains the specified game object of this tree structure.
         * @param child
         * @returns {boolean}
         */
        contains(child: GameObject, deep?: boolean): boolean;
        /**
         * get first component of type of the specified Type(constructor).
         * @param Type
         * @returns {WOZLLA.Component}
         */
        getComponent(Type: Function): Component;
        /**
         * @method hasComponent
         * @param Type
         * @returns {boolean}
         */
        hasComponent(Type: Function): boolean;
        /**
         * get all components of type of Type(constructor).
         * @param Type
         * @returns {Array}
         */
        getComponents(Type: Function): Component[];
        /**
         * add componen to this game object. this method would check component dependency
         * by method of component's listRequiredComponents.
         * @param comp
         * @returns {boolean}
         */
        addComponent(comp: Component): boolean;
        /**
         * remove the specified component
         * @param comp
         * @returns {boolean}
         */
        removeComponent(comp: Component): boolean;
        /**
         * init this game object.
         */
        init(): void;
        /**
         * destroy this game object.
         */
        destroy(): void;
        destroyAndRemove(): void;
        /**
         * call every frame when active was true.
         */
        update(): void;
        /**
         * visit this game object and it's all children, children of children.
         * @param renderContext
         * @param parentTransform
         * @param transformDirty
         * @param visibleFlag
         * @param renderLayer
         * @param parentAlpha
         */
        visit(renderContext: rendering.RenderContext, parentTransform: Transform, transformDirty: boolean, visibleFlag: boolean, renderLayer: string, parentAlpha: number): void;
        protected visitChildren(renderContext: rendering.RenderContext, transformDirty: boolean, visibleFlag: boolean, renderLayer: string, alpha: number): void;
        render(renderContext: rendering.RenderContext, transformDirty: boolean, renderLayer: string, renderOrder: number, alpha: number): void;
        /**
         * get a game object under the point.
         * @param x
         * @param y
         * @param touchable
         * @returns {WOZLLA.GameObject}
         */
        getUnderPoint(x: number, y: number, touchable?: boolean, ignoreVisible?: boolean): GameObject;
        /**
         * try to do a hit test
         * @param localX
         * @param localY
         * @returns {boolean}
         */
        testHit(localX: number, localY: number): boolean;
        loadAssets(callback?: Function): void;
        tween(override: boolean, loop?: boolean): util.Tween;
        static QUERY_FULL_REGEX: RegExp;
        static QUERY_COMP_REGEX: RegExp;
        static QUERY_OBJ_ATTR_REGEX: RegExp;
        query(expr: string, record?: QueryRecord): any;
        protected checkComponentDependency(comp: Component, isRemove?: boolean): void;
        protected addChildToNameMap(child: GameObject): void;
        protected removeChildFromNameMap(child: GameObject): void;
    }
    class QueryRecord {
        compExpr: any;
        objExpr: any;
        compName: any;
        attrName: any;
        target: any;
    }
}
declare module WOZLLA {
    /**
     * @class WOZLLA.Scheduler
     * @singleton
     */
    class Scheduler {
        private _scheduleCount;
        private _schedules;
        runSchedule(deltaTime: number): void;
        /**
         * remove the specify schedule by id
         * @param id
         */
        removeSchedule(id: any): void;
        /**
         * schedule the task to each frame
         * @param task
         * @param args
         * @returns {string} schedule id
         */
        scheduleLoop(task: any, args?: any): string;
        /**
         * schedule the task to the next speficied frame
         * @param task
         * @param {number} frame
         * @param args
         * @returns {string} schedule id
         */
        scheduleFrame(task: any, frame?: number, args?: any): string;
        /**
         * schedule the task to internal, like setInterval
         * @param task
         * @param time
         * @param args
         * @returns {string} schedule id
         */
        scheduleInterval(task: any, time?: number, args?: any): string;
        /**
         * schedule the task to time, like setTimeout
         * @param task
         * @param time
         * @param args
         * @returns {string} schedule id
         */
        scheduleTime(task: any, time?: number, args?: any): string;
        /**
         * resume the specified schedule
         * @param scheduleId
         */
        resumeSchedule(scheduleId: any): void;
        /**
         * pause the specified schedule
         * @param scheduleId
         */
        pauseSchedule(scheduleId: any): void;
        hasSchedule(scheduleId: any): boolean;
    }
}
declare module WOZLLA {
    interface VisitSession {
        transformDirty: boolean;
        visible: boolean;
    }
    /**
     * the root game object of WOZLLA engine
     * @class WOZLLA.Stage
     * @extends WOZLLA.GameObject
     */
    class Stage extends GameObject {
        static ID: string;
        viewRectTransform: RectTransform;
        rootTransform: Transform;
        domScale: number;
        private _rootTransform;
        private _viewRectTransform;
        private _rootAlpha;
        private _domScale;
        constructor(director: Director);
        updateViewRect(): void;
        visitStage(renderer: rendering.RenderContext, transformDirty?: boolean): void;
    }
}
declare module WOZLLA {
    class GestureEvent extends WOZLLA.event.Event {
        x: number;
        y: number;
        touch: any;
        touchMoveDetection: boolean;
        gesture: any;
        identifier: any;
        constructor(params: any);
        setTouchMoveDetection(value: boolean): void;
    }
    /**
     * class for touch management <br/>
     * get the instance form {@link WOZLLA.Director}
     * @class WOZLLA.Touch
     * @protected
     */
    class Touch {
        private static enabledGestures;
        static setEanbledGestures(gestures: any): void;
        /**
         * get or set enabled of touch system
         * @property {boolean} enabled
         */
        enabled: boolean;
        inSchedule: boolean;
        touchScale: number;
        private _canvas;
        private _canvasOffset;
        private _hammer;
        private _channelMap;
        private _director;
        constructor(director: Director, touchScale?: number);
        updateCanvasOffset(): void;
        onGestureEvent(e: any): void;
        createDispatchChanel(touchTarget: any): {
            onGestureEvent: (e: any, target: any, x: any, y: any, identifier: any) => void;
        };
    }
}
declare module WOZLLA.dnd {
    class DnDEvent extends WOZLLA.event.Event {
        gestureEvent: GestureEvent;
        screenX: number;
        screenY: number;
        _gestureEvent: GestureEvent;
        constructor(type: string, gestureEvent: GestureEvent);
    }
    class DnDDragEvent extends DnDEvent {
        static TYPE: string;
        source: WOZLLA.GameObject;
        _source: WOZLLA.GameObject;
        constructor(gestureEvent: GestureEvent, source: WOZLLA.GameObject);
    }
    class DnDDraggingEvent extends DnDEvent {
        static TYPE: string;
        attachedObject: any;
        target: WOZLLA.GameObject;
        _target: WOZLLA.GameObject;
        _attachedObject: any;
        _dropPossible: boolean;
        constructor(gestureEvent: GestureEvent, target: WOZLLA.GameObject, attachedObject: any);
        isDropPossible(): boolean;
        setDropPossible(possible: boolean): void;
    }
    class DnDDropEvent extends DnDEvent {
        static TYPE: string;
        attachedObject: any;
        target: WOZLLA.GameObject;
        _attachedObject: any;
        _target: WOZLLA.GameObject;
        constructor(gestureEvent: GestureEvent, target: WOZLLA.GameObject, attachedObject: any);
    }
}
declare module WOZLLA.dnd {
    class DnDManager {
        private static instance;
        static getInstance(): DnDManager;
        _sourceMap: any;
        _targetMap: any;
        registerSource(source: WOZLLA.GameObject, dragHandler: DragHandler): void;
        unregisterSource(source: WOZLLA.GameObject, dragHandler: DragHandler): void;
        registerTarget(target: WOZLLA.GameObject, dropHandler: DropHandler): void;
        unregisterTarget(target: WOZLLA.GameObject, dropHandler: DropHandler): void;
    }
}
declare module WOZLLA.dnd {
    interface DragHandler {
        canStartDragging(event: DnDDragEvent): boolean;
        startDragging(event: DnDDragEvent): any;
        createDraggedObject(event: DnDDragEvent): WOZLLA.GameObject;
        dragDropEnd(): void;
    }
}
declare module WOZLLA.dnd {
    interface DropHandler {
        dragging(event: DnDDraggingEvent): any;
        drop(event: DnDDropEvent): any;
    }
}
declare module WOZLLA.math {
    /**
     * @class WOZLLA.math.Circle
     * a util class for circle
     */
    class Circle {
        centerX: number;
        centerY: number;
        radius: number;
        constructor(centerX: number, centerY: number, radius: number);
        /**
         * @method containsXY
         * @param x
         * @param y
         * @returns {boolean}
         */
        containsXY(x: number, y: number): boolean;
        /**
         * get simple description of this object
         * @returns {string}
         */
        toString(): string;
    }
}
declare module WOZLLA.math {
    /**
     * @class WOZLLA.math.Rectangle
     *  a utils class for rectangle, provider some math methods
     */
    class Rectangle implements IRect {
        x: number;
        y: number;
        width: number;
        height: number;
        /**
         * @property {number} left x
         * @readonly
         */
        left: number;
        /**
         * @property {number} right x+width
         * @readonly
         */
        right: number;
        /**
         * @property {number} top y
         * @readonly
         */
        top: number;
        /**
         * @property {number} bottom y+height
         * @readonly
         */
        bottom: number;
        constructor(x: number, y: number, width: number, height: number);
        set(x: number, y: number, width: number, height: number): void;
        setRectangle(rectangle: Rectangle): void;
        /**
         * @method containsXY
         * @param x
         * @param y
         * @returns {boolean}
         */
        containsXY(x: number, y: number): boolean;
        /**
         * get simple description of this object
         * @returns {string}
         */
        toString(): string;
    }
}
declare module WOZLLA.rendering {
    class RenderCommand {
        renderLayer: string;
        renderOrder: number;
        debugInfo: string;
        _addIndex: number;
        constructor(renderLayer: string, renderOrder: number, debugInfo?: string);
    }
}
declare module WOZLLA.rendering {
    class TextureRegion {
        private _x;
        private _y;
        private _width;
        private _height;
        static ROTATE_NONE: string;
        static ROTATE_CLOCK: string;
        static ROTATE_ANTI_CLOCK: string;
        rotate: string;
        dirty: boolean;
        x: number;
        y: number;
        width: number;
        height: number;
        set(x: number, y: number, width: number, height: number): void;
    }
    class TextureOffset {
        private _x;
        private _y;
        dirty: boolean;
        x: number;
        y: number;
    }
    class QuadCommand extends RenderCommand {
        private _texture;
        private _textureRegion;
        private _textureOffset;
        private _color;
        private _alpha;
        private _matrix;
        private _colorDirty;
        private _alphaDirty;
        private _textureDirty;
        private _matrixDirty;
        canRender: boolean;
        dirty: boolean;
        texture: ITexture;
        textureRegion: TextureRegion;
        textureOffset: TextureOffset;
        color: number;
        matrix: WOZLLA.math.Matrix3x3;
        alpha: number;
        textureDirty: boolean;
        colorDirty: boolean;
        matrixDirty: boolean;
        alphaDirty: boolean;
        constructor(renderLayer: string, renderOrder: number, debugInfo?: string);
        clearDirty(): void;
    }
}
declare module WOZLLA.rendering {
    class CanvasQuadCommand extends QuadCommand {
    }
}
declare module WOZLLA.rendering {
    interface Viewport {
        x: number;
        y: number;
        width: number;
        height: number;
    }
    class Profiler {
        private static _instance;
        drawCall: number;
        fps: number;
        private lastTime;
        private dom;
        static getInstance(): Profiler;
        update(): void;
    }
    /**
     * Renderer基类提供了以下基础功能：
     * 1. 渲染层次的管理
     * 2. 渲染命今的排序
     */
    class RenderContext {
        static DEFAULT_LAYER: string;
        view: any;
        viewport: Viewport;
        bgColor: number[];
        debug: boolean;
        debugTag: string;
        debugRenderQueue: any;
        private _view;
        private _viewport;
        private _layerIndexMap;
        private _sortedLayers;
        private _commandQueueMap;
        private _maskStack;
        constructor(view: any, viewport?: Viewport);
        setDebugTag(tag: string): void;
        printDebugRenderQueue(): void;
        createTexture(image: any): any;
        updateTexture(image: any): any;
        deleteTexture(image: any): void;
        addCommand(command: RenderCommand): void;
        render(): void;
        updateViewport(viewport: Viewport): void;
        createQuadCommand(): QuadCommand;
        createSpriteBatch(matrix?: math.Matrix3x3): SpriteBatch;
        define(layer: string, zindex: number): void;
        undefine(layer: string): void;
        getLayerZOrder(layer: string): number;
        getSortedLayers(): Array<string>;
        pushNormalMask(rect: IRect, renderLayer: string, renderOrder: number): void;
        popupNormalMask(): void;
        applyNormalMask(rect: IRect, renderLayer: string, renderOrder: number): void;
        cancelNormalMask(): void;
        protected executeCommand(command: RenderCommand): void;
        protected eachCommand(func: Function): void;
        protected clearCommands(): void;
    }
}
declare module WOZLLA.rendering {
    class CanvasRenderContext extends RenderContext {
        context2d: any;
        private _context2d;
        constructor(view: any);
        createQuadCommand(): QuadCommand;
        render(): void;
        applyNormalMask(rect: IRect, renderLayer: string, renderOrder: number): void;
        cancelNormalMask(): void;
        protected executeCommand(command: RenderCommand): void;
    }
    var canUseNewCanvasBlendModes: any;
}
declare module WOZLLA.util {
    class HashMap<K extends IHashable, V> {
        private _keyMap;
        private _valueMap;
        private _size;
        containsKey(key: K): boolean;
        each(func: (key: K, value: V) => void): void;
        keys(): Array<K>;
        values(): Array<V>;
        get(key: K): V;
        remove(key: K): boolean;
        put(key: K, value: V): void;
        size(): number;
        clear(): void;
    }
}
declare module WOZLLA.rendering {
    class TextureTinter {
        private static tintTextureCache;
        static tint(texture: ITexture, textureRegion: TextureRegion, color: number): any;
        static tintWithMultiply(source: any, textureRegion: TextureRegion, color: any, canvas: any): void;
    }
}
declare module WOZLLA.rendering {
    class CustomCommand extends RenderCommand {
        execute(renderer: RenderContext): void;
    }
}
declare module WOZLLA.rendering {
    class PushMaskCommand extends CustomCommand {
        rect: IRect;
        private _rect;
        execute(renderer: RenderContext): void;
    }
    class PopMaskCommand extends CustomCommand {
        execute(renderer: RenderContext): void;
    }
}
declare module WOZLLA.rendering {
    class SpriteBatch {
        protected _matrix: math.Matrix3x3;
        protected _renderLayer: string;
        protected _renderOrder: number;
        protected _alpha: number;
        protected _color: number;
        protected _commands: QuadCommand[];
        protected _renderer: RenderContext;
        protected _unusedCommands: QuadCommand[];
        constructor(renderer: RenderContext, matrix?: math.Matrix3x3);
        setRenderLayer(layer: string): void;
        setRenderOrder(order: number): void;
        getMatrix(): math.Matrix3x3;
        setMatrix(matrix: math.Matrix3x3): void;
        setAlpha(value: number): void;
        setColor(value: number): void;
        drawTexture(texture: ITexture, sx?: number, sy?: number, sw?: number, sh?: number, x?: number, y?: number, w?: number, h?: number): void;
        drawTexture1(texture: ITexture): void;
        drawTexture3(texture: ITexture, x: number, y: number): void;
        drawTexture7(texture: ITexture, sx: number, sy: number, sw: number, sh: number, x: number, y: number): void;
        drawTexture9(texture: ITexture, sx: number, sy: number, sw: number, sh: number, x: number, y: number, w: number, h: number): void;
        reset(): void;
        render(renderer: RenderContext): void;
        protected createQuadCommand(): WOZLLA.rendering.QuadCommand;
    }
}
declare module WOZLLA.rendering {
    class QuadType {
        size: number;
        strade: any;
        vertexIndex: any;
        texCoordIndex: any;
        alphaIndex: any;
        colorIndex: any;
        private _info;
        constructor(info: any);
    }
    class Quad {
        static V2T2C1A1: QuadType;
        storage: number[];
        count: number;
        type: QuadType;
        renderOffset: number;
        renderCount: number;
        private _storage;
        private _count;
        private _type;
        private _renderOffset;
        private _renderCount;
        constructor(count: number, type?: QuadType);
        setRenderRange(offset: number, count: number): void;
        setVertices(x1: any, y1: any, x2: any, y2: any, x3: any, y3: any, x4: any, y4: any, offset?: number): void;
        setTexCoords(x1: any, y1: any, x2: any, y2: any, x3: any, y3: any, x4: any, y4: any, offset?: number): void;
        setAlpha(alpha: number, offset?: number): void;
        setColor(color: any, offset?: number): void;
    }
}
declare module WOZLLA.rendering {
    class QuadBatch {
        private static VERTEX_SOURCE;
        private static FRAGMENT_SOURCE;
        private _renderer;
        private _compiledProgram;
        private _size;
        private _vertices;
        private _indices;
        private _vertexBuffer;
        private _indexBuffer;
        private _curVertexIndex;
        private _curBatchSize;
        private _locations;
        constructor(renderer: WebGLRenderContext);
        bindTexture(texture: ITexture): void;
        begin(): void;
        end(): void;
        canFill(quad: Quad): boolean;
        fillQuad(quad: Quad): void;
        flush(): void;
        onUpdateViewport(): void;
        private _initBuffers();
        private _initProgram();
        private _initLocaitions();
        private _initUniforms();
    }
}
declare module WOZLLA.rendering {
    class WebGLQuadCommand extends QuadCommand {
        private _computedUVS;
        private _quad;
        quad: WOZLLA.rendering.Quad;
        update(): void;
        private _updateUVS();
    }
}
declare module WOZLLA.rendering {
    class WebGLRenderContext extends RenderContext {
        gl: any;
        private _gl;
        private _quadBatch;
        private _bindingTexture;
        private _lasCommand;
        constructor(view: any);
        createQuadCommand(): QuadCommand;
        render(): void;
        updateViewport(viewport: Viewport): void;
        createTexture(image: any): any;
        updateTexture(image: any): any;
        deleteTexture(image: any): void;
        applyNormalMask(rect: IRect, renderLayer: string, renderOrder: number): void;
        cancelNormalMask(): void;
        protected executeCommand(command: RenderCommand): void;
    }
}
declare module WOZLLA.rendering {
    function isPowerOf2(num: any): boolean;
    class WebGLUtils {
        static getGLContext(canvas: any, options?: any): any;
        static compileShader(gl: any, shaderType: any, shaderSrc: any): any;
        static compileProgram(gl: any, vertexSrc: any, fragmentSrc: any): {
            program: any;
            vertexShader: any;
            fragmentShader: any;
        };
        static updateWebGLTexture(gl: any, image: any): any;
        static generateWebGLTexture(gl: any, image: any): any;
        static deleteWebGLTexture(gl: any, image: any): void;
    }
}
declare module WOZLLA.spine {
    var runtime: any;
}
declare module WOZLLA.spine {
    class SpineAtlasDescriptor extends asset.AjaxDescriptor {
        constructor(options: string | asset.AjaxOptions);
        getClass(): string;
    }
    class SpineAtlas extends asset.PlainTextAsset {
        static CLASS: string;
        spineRuntimeAtlas: any;
        private _spineRuntimeAtlas;
        constructor(descriptor: asset.PlainTextDescriptor, plainText: string, assetManager?: asset.AssetManager);
    }
    class SpineAtlasLoader extends asset.PlainTextLoader {
        protected onAjaxSuccess(decriptor: asset.PlainTextDescriptor, xhr: XMLHttpRequest, callback: (error: any, asset: asset.Asset) => void): void;
    }
}
declare module WOZLLA.spine {
    class AbstractSkeletonRenderer extends WOZLLA.Renderer {
        skeletonJsonSrc: component.Property<string>;
        state: any;
        speed: component.Property<number>;
        private _speed;
        private _skeletonJsonSrc;
        private _skeleton;
        private _state;
        constructor();
        render(renderContext: rendering.RenderContext, transformDirty: boolean, renderLayer: string, renderOrder: number): void;
        loadAssets(callback: Function): void;
        protected newRegionAttachment(skin: any, name: any, path: any): any;
        protected newMeshAttachment(skin: any, name: any, path: any): any;
        protected newSkinnedMeshAttachment(skin: any, name: any, path: any): any;
        protected newBoundingBoxAttachment(skin: any, name: any): any;
        protected renderSlot(renderContext: rendering.RenderContext, slot: any, renderLayer: string, renderOrder: number): void;
    }
}
declare module WOZLLA.spine {
    class SpineAtlasProperty extends component.AssetProxyProperty<string, SpineAtlas> {
        protected createAssetDescriptor(): asset.AssetDescriptor;
    }
    class SkeletonRenderer extends AbstractSkeletonRenderer {
        spineAtlasSrc: SpineAtlasProperty;
        imageSrc: component.ImageProperty;
        private _spineAtlasSrc;
        private _imageSrc;
        constructor();
        protected newRegionAttachment(skin: any, name: any, path: any): any;
        protected newMeshAttachment(skin: any, name: any, path: any): any;
        protected newSkinnedMeshAttachment(skin: any, name: any, path: any): any;
        protected renderSlot(renderContext: rendering.RenderContext, slot: any, renderLayer: string, renderOrder: number): void;
    }
}
declare module WOZLLA.util {
    class Ease {
        static get(amount: any): Function;
        static getPowIn(pow: any): Function;
        static getPowOut(pow: any): Function;
        static getPowInOut(pow: any): Function;
        static quadIn: Function;
        static quadOut: Function;
        static quadInOut: Function;
        static cubicIn: Function;
        static cubicOut: Function;
        static cubicInOut: Function;
        static quartIn: Function;
        static quartOut: Function;
        static quartInOut: Function;
        static quintIn: Function;
        static quintOut: Function;
        static quintInOut: Function;
        static sineIn(t: any): number;
        static sineOut(t: any): number;
        static sineInOut(t: any): number;
        static getBackIn(amount: any): Function;
        static backIn: Function;
        static getBackOut(amount: any): Function;
        static backOut: Function;
        static getBackInOut(amount: any): Function;
        static backInOut: Function;
        static circIn(t: any): number;
        static circOut(t: any): number;
        static circInOut(t: any): number;
        static bounceIn(t: any): number;
        static bounceOut(t: any): number;
        static bounceInOut(t: any): number;
        static getElasticIn(amplitude: any, period: any): Function;
        static elasticIn: Function;
        static getElasticOut(amplitude: any, period: any): Function;
        static elasticOut: Function;
        static getElasticInOut(amplitude: any, period: any): Function;
        static elasticInOut: Function;
        static linear(t: any): any;
        static expoIn(time: any): number;
        static expoOut(time: any): number;
        static expoInOut(time: any): any;
        static keyMap: {
            0: string;
            1: string;
            2: string;
            3: string;
            4: string;
            5: string;
            6: string;
            7: string;
            8: string;
            9: string;
            10: string;
            11: string;
            12: string;
            13: string;
            14: string;
            15: string;
            16: string;
            17: string;
            18: string;
            19: string;
            20: string;
            21: string;
            22: string;
            23: string;
            24: string;
            25: string;
            26: string;
            27: string;
            28: string;
            29: string;
            30: string;
        };
        static getByKey(key: any): any;
    }
}
declare module WOZLLA.util {
    interface Poolable {
        isPoolable: boolean;
        release(): any;
    }
    class ObjectPool<T extends Poolable> {
        _minCount: any;
        _factory: any;
        _pool: Array<T>;
        constructor(minCount: number, factory: () => T);
        retain(): T;
        release(obj: T): void;
    }
}
declare module WOZLLA.wson {
    class WSONBuilder {
        build(director: Director, filePath: string, callback: (error: any, root: GameObject) => void): void;
        buildWithData(director: Director, data: any, callback: (error: any, root: GameObject) => void): void;
        buildWithDataSync(director: Director, data: any): WOZLLA.GameObject;
        buildGameObject(director: Director, data: any, callback: (error: any, root: GameObject) => void): void;
        buildReference(director: Director, data: any, callback: (error: any, root: GameObject) => void): void;
        buildComponent(data: any, owner: GameObject): Component;
        newGameObject(director: Director, useRectTransform?: boolean): GameObject;
        newComponent(compName: string): Component;
    }
    function setBuilderFactory(factory: () => WSONBuilder): void;
    function newBuilder(): WSONBuilder;
}
declare module WOZLLA.cocos2d {
    class CocosBoneRenderer extends WOZLLA.Renderer {
        exportJson: component.Property<string>;
        spriteSrc: component.Property<string>;
        imageSrc: component.Property<string>;
        defaultAction: component.Property<string>;
        frameTime: component.Property<number>;
        private _exportJson;
        private _spriteSrc;
        private _imgSrc;
        private _defaultAction;
        private _frameTime;
        private _rootBoneObj;
        private _contentScale;
        private _ticker;
        private _playingAction;
        init(): void;
        render(renderContext: rendering.RenderContext, transformDirty: boolean, renderLayer: string, renderOrder: number, alpha: number): void;
        loadAssets(callback: () => void): void;
        playAction(action: string): void;
        playActionOnce(action: string, callback: Function): void;
        play(): void;
        playOnce(callback: Function): void;
        protected parseData(xpJsonAsset: asset.JsonAsset, spriteJsonAsset: asset.JsonAsset, imgAsset: asset.ImageAsset): GameObject;
        protected buildBoneObject(boneData: any, spriteAtlas: asset.SpriteAtlas): GameObject;
        protected parseExportJson(xpJsonData: any): any;
        protected parseSpriteAtlas(xpJsonData: any, spriteJsonAsset: asset.JsonAsset, imgAsset: asset.ImageAsset): asset.SpriteAtlas;
        private _antiRotateXY(cx, cy, angle, px, py);
        protected updateBone(): void;
        _scheduleToDispatchEvent(e: event.Event): void;
    }
    class ParsedJsonAsset extends asset.JsonAsset {
        private _jsonData;
        constructor(jsonData: any, assetManager?: asset.AssetManager);
        getJson(): any;
        getPlainText(): string;
    }
    class AnimationFrameTicker {
        frameTime: number;
        frameLength: number;
        currentFrame: number;
        currentFrameShowingTime: number;
        paused: boolean;
        stopFrame: number;
        getCurrentFrame(frameLength: any): number;
        update(deltaTime: number, now: number): boolean;
        resume(): void;
        pause(): void;
        play(): void;
        continuePlay(): void;
        setStopFrame(stopFrame: any): void;
    }
}
declare module WOZLLA.action {
    class Action {
        name: string;
        data: any;
        private _name;
        private _data;
        constructor(name: any, data?: any);
    }
}
declare module WOZLLA.action {
    class Broadcast {
        name: string;
        data: any;
        private _name;
        private _data;
        constructor(name: any, data?: any);
    }
}
declare module WOZLLA.IoC {
    interface Builder {
        build(instance: any): any;
    }
    function checkManaged(name: string | Function): void;
    function get(name: string | Function): any;
    function RegisterBuilder(): (target: Function) => void;
    function Managed(name?: string): (target: Function) => void;
    function Inject(name: string | Function): (target: Object, propName: string) => void;
    function Extends(superClass: any): (target: Function) => void;
    function Singleton(onStartup?: boolean): (target: Function) => void;
    function Application(): (target: Function) => void;
    interface IApplication {
        startup(): any;
        init(): any;
    }
    interface IInstantiateAware {
        onInstantiate(): any;
    }
    function startup(): void;
    function getApplication(): any;
}
declare module WOZLLA.action {
    interface IFilter {
        onBeforeAction?(action: Action): any;
        onAfterAction?(action: Action): any;
    }
    class Dispatcher implements IoC.IApplication {
        private static instance;
        static getInstance(): Dispatcher;
        private _controllerMap;
        private _broadcastMap;
        private _filterList;
        constructor();
        startup(): void;
        init(): void;
        initController(): void;
        initFilter(): void;
        dispatch(action: Action): void;
        broadcast(broadcast: Broadcast): void;
    }
    function Filter(name?: string, priority?: number): (target: Function) => void;
    function Controller(name?: string): (target: Function) => void;
    function OnAction(name: string): (target: Object, propName: string) => void;
    function OnBroadcast(name: string): (target: Object, propName: string) => void;
    class ControllerBuilder {
        build(instance: any): any;
    }
}
declare module WOZLLA.data {
    class Store extends event.EventDispatcher {
    }
}
declare module WOZLLA.data {
    class Model extends event.EventDispatcher {
        protected _data: any;
        constructor(data?: any);
        set(field: string, value: any, source: any, silent?: boolean): void;
        get(field: string): any;
    }
}
declare module WOZLLA.data {
    class ArrayStore<T> extends Store {
        protected list: T[];
        count: number;
        add(item: T, silent?: boolean): void;
        addAt(item: T, index: number, silent?: boolean): void;
        remove(item: T, silent?: boolean): void;
        removeAt(index: number, silent?: boolean): void;
        clear(silent?: boolean): void;
        getAt(index: number): T;
        getRange(start: number, count: number): Array<T>;
        indexOf(item: T): number;
        each(func: (item: T, index: number) => any): void;
        query(func: (item: T, index: number) => any): Array<T>;
        find(field: string, value: string): T;
        sort(func: (a: T, b: T) => any, silent?: boolean): void;
    }
    class ArrayStoreEventData {
        item: any;
        index: number;
        constructor(item: any, index: number);
    }
}
declare module WOZLLA.view {
    class LayoutManager {
        protected view: View;
        constructor(view: View);
        doLayout(): void;
    }
    class Margin {
        left: number;
        right: number;
        top: number;
        bottom: number;
    }
}
declare module WOZLLA.view {
    class GridLayout extends LayoutManager {
        columnCount: number;
        margin: Margin;
        cellMargin: Margin;
        /**
         * 如果设置此属性则格子按固定尺寸计算，否则使用子元素的最大宽高计算
         */
        fixedCellSize: ISize;
        constructor(view: View);
        doLayout(): void;
        protected filterChild(child: GameObject): boolean;
        protected onViewDestroy(): void;
        protected onViewChildChange(): void;
    }
}
declare module WOZLLA.view {
    class View extends GameObject {
        layoutManager: LayoutManager;
        protected _layoutManager: LayoutManager;
        private _layoutSchedule;
        constructor(director: Director);
        requestLayout(): void;
        dispatch(act: action.Action): void;
        protected constructView(): void;
        protected initLayoutManager(): LayoutManager;
    }
}
declare module WOZLLA.view {
    class ListView extends View {
        private _itemZ;
        private _itemViews;
        private _itemViewHashMap;
        sortItemViews(comparator: (a: GameObject, b: GameObject) => number): void;
        getItemZ(): number;
        setItemZ(itemZ: number): void;
        getViewByItem(item: any): View;
        addItemViewAt(itemView: View, index: number): void;
        addItemView(itemView: View): void;
        removeItemView(itemView: View): void;
        removeItemViewAt(index: any): void;
        clearItemViews(): void;
        protected updateItemsZOrder(): void;
        protected createListItemView(item: any): View;
        protected constructListItemView(item: any): View;
        protected initLayoutManager(): LayoutManager;
    }
}
declare module WOZLLA.view {
    class SimpleListView<T> extends ListView {
        protected _arrayStore: data.ArrayStore<T>;
        getArrayStore(): data.ArrayStore<T>;
        destroy(): void;
        bindArrayStore(store: data.ArrayStore<T>): void;
        unbindArrayStore(): void;
        protected onStoreItemAdd(e: any): void;
        protected onStoreItemRemove(e: any): void;
        protected onStoreClear(): void;
        protected onStoreSort(): void;
    }
}
declare module WOZLLA.view {
    interface IBinding {
        expr: string;
        get?: Function;
        set?: Function;
    }
    class SimpleView extends View {
        protected _model: data.Model;
        protected _bindings: any;
        destroy(): void;
        getModel(): data.Model;
        bindModel(model: any): void;
        unbindModel(): void;
        setBindings(bindings: any): void;
        syncBindings(): void;
        protected syncBinding(field: any, binding: any): void;
        protected onModelFieldChange(e: event.Event): void;
    }
}
declare module "wozllajs" {
    export = WOZLLA;
}
