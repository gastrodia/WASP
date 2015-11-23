import AllCityData = require('./CityData');
declare var navmesh:any;
declare var App:any;
module Layer {
  export const SCENE_LAYER = 0;
  export const UI_LAYER = 20;
  export const DIALOGUE_LAYER = 100;
  export const Battle_LAYER = 200;
  export const WINDOW_LAYER = 300;

  export const LOAINDG_LAYER = 10000;
}
module RenderLayer {
   export const Scene = {
       NAME: 'Scene',
       ORDER: 0
   };
   export const SceneMap = {
       NAME: 'SceneMap',
       ORDER: 10
   };
   export const SceneObject = {
       NAME: 'SceneObject',
       ORDER: 20
   };
   export const UI = {
       NAME: 'UI',
       ORDER: 70
   };
   export const Dialogue = {
       NAME: 'Dialogue',
       ORDER: 75
   };
   export const Window = {
       NAME: 'Window',
       ORDER: 80
   };
   export const ScrollPanel = {
       NAME: 'ScrollPanel',
       ORDER: 100
   };
   export const PartnerList = {
       NAME: 'PartnerList',
       ORDER: 100
   };
   export const PetList = {
       NAME: 'PetList',
       ORDER: 200
   };
   export const PetListText = {
       NAME: 'PetListText',
       ORDER: 300
   };
   export const ItemList = {
       NAME: 'ItemList',
       ORDER: 100
   };

   export const BattleLayer = {
       NAME: 'Battle',
       ORDER:200
   }
   export const Popup = {
       NAME: 'Popup',
       ORDER: 5000
   };

   export const LoadingLayer = {
       NAME: 'LoadingLayer',
       ORDER: 10000
   };

   export const All = [
       Scene, SceneMap, SceneObject, UI, Dialogue, Window, ScrollPanel, Popup, LoadingLayer,BattleLayer,
       PartnerList, PetList, PetListText, ItemList
   ];
}



(function(){



  class MapModel extends WOZLLA.data.Model{
    public static MAP_UNIT_SIZE = 510;
    public static MAP_SCALE = 1.5;
    getMapSize():WOZLLA.IRect {
        return {
            x: 0,
            y: 0,
            width: this.get('col') * MapModel.MAP_UNIT_SIZE * MapModel.MAP_SCALE,
            height: this.get('row') * MapModel.MAP_UNIT_SIZE * MapModel.MAP_SCALE
        };
    }
  }
  class CityModel extends WOZLLA.data.Model{
    public get mapModel():MapModel {
        return this._mapModel;
    }

    public get cityId():string {
        return this.get('cityId') || this.get('sceneId');
    }

    private _mapModel:MapModel;

    constructor(data) {
        super(data);
        this._mapModel = new MapModel(data.map);
    }
  }

  class Scene extends WOZLLA.GameObject{
    private _sceneId:string;
    private _mapLayer:WOZLLA.GameObject;
    private _sceneObjLayer:WOZLLA.GameObject;
    private _hiddenLayer:WOZLLA.GameObject;
    private _sceneObjLayerSorter:SceneObjectLayerSorter;
    private _sceneCamera:SceneCamera;

      private _sceneObjMap:any = {};

    constructor(director:WOZLLA.Director, sceneId:string) {
      super(director);
      this._sceneId = sceneId;
      this.z = Layer.SCENE_LAYER;
      this.renderLayer = RenderLayer.Scene.NAME;

      this._mapLayer = new WOZLLA.GameObject(director);
      this._mapLayer.renderLayer = RenderLayer.SceneMap.NAME;
      this._mapLayer.name = 'Map';
      this._mapLayer.touchable = true;
      this._mapLayer.addComponent(new WOZLLA.component.InfiniteCollider());
      this.addChild(this._mapLayer);

      this._mapLayer.addListener('tap', (e) => {
           var scenePoint = this._mapLayer.transform.globalToLocal(e.x, e.y);
           console.log('scene:tapGround', scenePoint);
       });

       this._sceneObjLayer = new WOZLLA.GameObject(director);
       this._sceneObjLayer.renderLayer = RenderLayer.SceneObject.NAME;
       this._sceneObjLayer.name = 'SceneObjectLayer';
       this._sceneObjLayerSorter = new SceneObjectLayerSorter();
      this._sceneObjLayer.addComponent(this._sceneObjLayerSorter);
      this.addChild(this._sceneObjLayer);

      this._hiddenLayer = director.createGameObject();
      this._hiddenLayer.enabled = false;

      this._sceneCamera = new SceneCamera(this);
      this.addComponent(new SceneObjectCollideManager());
    }

    addSceneObject(obj:SceneObject) {

            this._sceneObjLayer.addChild(obj);
            this._sceneObjLayerSorter.sortSceneObjectLayer();
            this._sceneObjMap[obj.getSceneObjectId()] = obj;
            obj.onAddToScene(this);

        }


    addMap(map:WOZLLA.GameObject) {
           this._mapLayer.addChild(map);
       }

   removeSceneObject(obj:SceneObject) {

   }

   getMapSize():WOZLLA.IRect {
        return {
            x     :-444444444,
            y     :-444444444,
            width : 999999999,
            height: 999999999
        };
    }

  }

  class SceneCamera {

       private _scene:Scene;
       private _sceneSize:WOZLLA.IRect;
       private _loopAtTarget:SceneObject;

       constructor(scene:Scene) {
           this._scene = scene;
       }

       setPosition(x:number, y:number) {
           if(!this._sceneSize) {
               this._sceneSize = this._scene.getMapSize();
           }
           var viewRect = this._scene.stage.viewRectTransform;
           var minX = viewRect.width - this._sceneSize.width;
           var minY = viewRect.height - this._sceneSize.height;
           x = -x + viewRect.width/2;
           y = -y + viewRect.height/2;
           if(x > -this._sceneSize.x) x = -this._sceneSize.x;
           if(y > -this._sceneSize.y) y = -this._sceneSize.y;
           if(x < minX) x = minX;
           if(y < minY) y = minY;
           this._scene.transform.setPosition(x, y);
       }

       lookAt(sceneObj:SceneObject) {
           this._loopAtTarget = sceneObj;
       }

       update() {
           if(this._loopAtTarget) {
               this.setPosition(this._loopAtTarget.transform.x , this._loopAtTarget.transform.y);
           }
       }

   }

 class SceneObject extends WOZLLA.GameObject {

        private _scene:Scene;

        isCollideSource() {
            return false;
        }

        isCollideTarget() {
            return false;
        }

        colllide(target:SceneObject):boolean {
            return false;
        }

        getScene() {
            return this._scene;
        }

        onAddToScene(scene:Scene) {
            this._scene = scene;
        }

        onRemoveFromScene(scene:Scene) {
            this._scene = null;
        }

        getSceneObjectId():string {
            throw new Error('abstract method');
        }

        getFootPosition():WOZLLA.IPoint {
            return {
                x: this.transform.x,
                y: this.transform.y
            };
        }

        getPosition():WOZLLA.IPoint {
            return this.getFootPosition();
        }

        removeFromScene() {
            this._scene && this._scene.removeSceneObject(this);
        }

    }

  class SceneObjectCollideManager extends WOZLLA.Behaviour {

       private _sourceList:SceneObject[] = [];
       private _targetList:SceneObject[] = [];

       private _stataCache = {};

       init() {
           super.init();
           this.gameObject.addListenerScope('scene:addSceneObject', this.onAddSceneObject, this);
           this.gameObject.addListenerScope('scene:removeSceneObject', this.onRemoveSceneObject, this);
       }

       destroy() {
           super.destroy();
           this.gameObject.removeListenerScope('scene:addSceneObject', this.onAddSceneObject, this);
           this.gameObject.removeListenerScope('scene:removeSceneObject', this.onRemoveSceneObject, this);
       }

       update() {
           for(let source of this._sourceList) {
               if(!source.enabled) continue;
               for(let target of this._targetList) {
                   let stateKey = source.getSceneObjectId() + ' fuck ' + target.getSceneObjectId();
                   let state = this._stataCache[stateKey] || false;
                   let newState = target.colllide(source) || false;
                   if(newState !== state) {
                       this._stataCache[stateKey] = newState;
                       console.log('scene:collide', {
                           source: source,
                           target: target,
                           state: newState
                       });
                   }
               }
           }
       }

       protected onAddSceneObject(e) {
           var sceneObj = e.data;
           if(sceneObj.isCollideSource()) {
               this._sourceList.push(sceneObj);
           }
           if(sceneObj.isCollideTarget()) {
               this._targetList.push(sceneObj);
           }
       }

       protected onRemoveSceneObject(e) {
           var sceneObj = e.data;
           if(sceneObj.isCollideSource()) {
               var idx = this._sourceList.indexOf(sceneObj);
               if(idx !== -1) {
                   this._sourceList.splice(idx, 1);
               }
           }
           if(sceneObj.isCollideTarget()) {
               var idx = this._targetList.indexOf(sceneObj);
               if(idx !== -1) {
                   this._targetList.splice(idx, 1);
               }
           }

       }

   }

   class SceneObjectLayerSorter extends WOZLLA.Behaviour {

       private _frame:number = 0;

       update() {
           if(this._frame > 99999999) {
               this._frame = 0;
           }
           if(this._frame ++ % 3 === 0) {
               this.sortSceneObjectLayer();
           }
       }

       sortSceneObjectLayer() {
           this.gameObject.eachChild((child:SceneObject) => {
               child.setZ(child.getFootPosition().y, false);
           });
           this.gameObject.sortChildren();
       }

   }

  class City extends Scene{
    private _collision:CityCollision;
       private _cityModel:CityModel;
       private _map:Map;

    constructor(director:WOZLLA.Director, cityModel:CityModel) {
      super(director,cityModel.cityId);
      this.id = 'cityxxx'
      this._cityModel = cityModel;

      this._map = new Map(director, cityModel.mapModel);
      this.addMap(this._map);

      this._collision = new CityCollision(this._cityModel.cityId);
      this.addComponent(this._collision);

    }

    init(){
      super.init();
      this.showCollision();
    }

   public isInCross(x, y) {
       return this._collision.isInCross(x, y);
   }

   public isInCollision(x, y) {
       return this._collision.isInCollision(x, y);
   }

   public findPath(from, to, findWalkable) {
       return this._collision.findPath(from, to, findWalkable);
   }

   private flagsObj:WOZLLA.GameObject;
   public showCollision(bool?:boolean){
     class FlagLayerObj extends SceneObject{
       getSceneObjectId():string {
            return 'flagLayerObj'
        }
     }
     if(!this.flagsObj && !bool){

       var flagsObj = new FlagLayerObj(director);
       flagsObj.addChild( this._collision.getMeshFlags());
       flagsObj.loadAssets(()=>{
         flagsObj.init();
         this.addSceneObject(flagsObj);
       })

     }else{
       if(this.flagsObj){
         this.flagsObj.removeMe();
         this.flagsObj = null;
       }
     }

   }
  }

  class NavMeshCollision extends WOZLLA.Component {

       private _paths;
       private _path;
       private _crossTriangulation;

       getMeshFlags():WOZLLA.GameObject{

         function point2flag(point){
           var flag = director.createGameObject();
           var imageRenderer = new WOZLLA.component.ImageRenderer();
           imageRenderer.imageSrc.set('./resource/flag.jpg');

           flag.addComponent(imageRenderer);
           flag.transform.scaleX = 0.1;
           flag.transform.scaleY = 0.1;
           flag.transform.x = point.x;
           flag.transform.y = point.y;
           return flag;
         }

         var path = this._path;
         var flags = new WOZLLA.GameObject(director,false);
         for(var i in path.cellV){
            var cellData = path.cellV[i];
            flags.addChild(point2flag(cellData.pointA));
            flags.addChild(point2flag(cellData.pointB));
            flags.addChild(point2flag(cellData.pointC));
          }

         return flags;
       }



       public isInCross(x, y) {
           return this._crossTriangulation && this._crossTriangulation.isCoordsIn(x, y);
       }

       public isInCollision(x, y) {

           if(this._paths) {
               for(var i= 0,len=this._paths.length; i<len; i++) {
                   if(this._paths[i].isPointIn(x, y)) {
                       return true;
                   }
               }
           } else if(this._path) {
               return this._path.isPointIn(x, y);
           }
           return false;
       }

       findPath(from, to, findWalkable) {
           var result;
           if(this._paths) {
               for(var i= 0,len=this._paths.length; i<len; i++) {
                   result = this._paths[i].find(from, to, findWalkable);
                   if(result && result.path) {
                       result.path.shift();
                       break;
                   }
               }
           } else if(this._path) {
               result = this._path.find(from, to, findWalkable);
               result && result.path && result.path.shift();
           }
           return result;
       }

       public loadAssets(callback?:Function) {
           var meshDesc = new WOZLLA.asset.JsonDescriptor(this.getCollisionPath());
           var crossPath = this.getCrossPath();
           var crossDesc = crossPath && new WOZLLA.asset.JsonDescriptor(crossPath);
           var assetGroup = new WOZLLA.asset.AssetGroup();
           assetGroup.put(meshDesc);
           if(crossDesc) {
           assetGroup.put(crossDesc);
         }

           assetGroup.loadWithAssetManager(this.assetManager, {
               onLoadOne: () => {},
               onFinish: () => {
                   var meshJsonAsset:WOZLLA.asset.JsonAsset = <WOZLLA.asset.JsonAsset>this.assetManager.getAsset(meshDesc);
                   var crosJsonAsset:WOZLLA.asset.JsonAsset;
                   if(crossDesc) {
                       crosJsonAsset = <WOZLLA.asset.JsonAsset>this.assetManager.getAsset(crossDesc);
                   }

                   this._buildCollision(meshJsonAsset.getJson(), () => {
                       if(!crosJsonAsset) {
                           callback && callback();
                           return;
                       }
                       this._buildCross(crosJsonAsset.getJson(), callback);
                   });
               }
           });
       }

       protected getCollisionPath() {
           return null;
       }

       protected getCrossPath() {
           return null;
       }

       private _buildCollision(meshJson, callback:Function) {
           var me = this;
           var queueBuild;
           var data = meshJson;
           if(data.group) {
               queueBuild = function(index, meshGroup, pathGroup, onFinished) {
                   var mesh = meshGroup[index];
                   if(!mesh) {
                       onFinished && onFinished(pathGroup);
                       return;
                   }
                   navmesh.Path.asyncBuild(mesh, function (path) {
                       pathGroup.push(path);
                       queueBuild(++index, meshGroup, pathGroup, onFinished);
                   });
               };
               queueBuild(0, data.meshGroups, [], function(paths) {
                   me._paths = paths;
               });
           } else {
               navmesh.Path.asyncBuild(data, function (path) {
                   me._path = path;
                   callback && callback();
               });
           }

           console.log(me._path);

       }

       private _buildCross(crosJson, callback:Function) {
           var navmesh:any = window['navmesh'];
           this._crossTriangulation =  new navmesh.Triangulation(crosJson, true);
           callback && callback();
       }

   }


  class CityCollision extends NavMeshCollision {

        private _cityId:string;

        constructor(cityId:string) {
            super();
            this._cityId = cityId;
        }

        protected getCollisionPath() {
            return 'export/scene/collision/' + this._cityId + '_mesh.json';
        }

        protected getCrossPath() {
            return 'export/scene/collision/' + this._cityId + '_cross.json';
        }

  }


  function getMapImagePathByName(mapName:string) {
      return 'res/map/images/' + mapName;
  }

  class Map extends WOZLLA.GameObject{
    private _mapModel:MapModel;
    constructor(director:WOZLLA.Director, mapModel:MapModel){
      super(director,false);
      this._mapModel = mapModel;
      let mapRenderer:any = new MapRenderer();
      if(mapModel.get('crop')) {
              mapRenderer = new MapRenderer();
              mapRenderer.row.set(mapModel.get('row'));
              mapRenderer.col.set(mapModel.get('col'));
              mapRenderer.mapImagePath.set(getMapImagePathByName(mapModel.get('name')));
          } else {
              mapRenderer = new WOZLLA.component.ImageRenderer();
              mapRenderer.imageSrc.set(getMapImagePathByName(mapModel.get('name')) + '/0.jpg');
              mapRenderer.align.set(WOZLLA.ALIGN_START);
              mapRenderer.valign.set(WOZLLA.VALIGN_TOP);
          }

          this.addComponent(mapRenderer);
    }
  }

  const helpPoint:any = { x:0, y:0 };
  const helpPoint2:any = { x:0, y:0 };
  const rectIntersect2 = WOZLLA.math.MathUtils.rectIntersect2;
  class MapRenderer extends WOZLLA.Renderer{
    public static mapUnitSize = 510;

     public mapImagePath = new WOZLLA.component.Property<string>();
     public row = new WOZLLA.component.Property<number>(0);
     public col = new WOZLLA.component.Property<number>(0);

     private _mapAsset:MapAsset;
     private _spriteBatch:WOZLLA.rendering.SpriteBatch;

     public get mapImageCount():number {
         return Math.ceil(this.row.get()) * Math.ceil(this.col.get());
     }

     public destroy():void {
         if(this._mapAsset) {
             this.assetManager.unload(this._mapAsset);
         }
         super.destroy();
     }

     public loadAssets(callback?:Function) {
         if(this._mapAsset || !this.mapImagePath.get() || this.mapImageCount <= 0) {
             callback && callback();
             return;
         }
         let mapAssetDesc = new MapAssetDescriptor(this.mapImagePath.get(), this.mapImageCount);
         this.assetManager.load(mapAssetDesc, (err:any, asset:MapAsset) => {
             this._mapAsset = asset;
             callback && callback();
         });
     }

     public render(renderContext:WOZLLA.rendering.RenderContext, transformDirty:boolean, renderLayer:string, renderOrder:number):void {
         if(!this._mapAsset) return;
         if(!this._spriteBatch) {
             this._spriteBatch = renderContext.createSpriteBatch();
             this._spriteBatch.setRenderLayer(renderLayer);
             this._spriteBatch.setRenderOrder(renderOrder);
         }

         if(transformDirty) {
             this._spriteBatch.setMatrix(this.transform.worldMatrix);
             this._spriteBatch.reset();

             let viewport = this.stage.viewRectTransform;
             let mapUnitSize = MapRenderer.mapUnitSize;
             for(let i=0; i<this.mapImageCount; i++) {
                 let row = Math.floor(i / Math.ceil(this.col.get()));
                 let col = i % this.col.get();
                 let x = col * mapUnitSize, y = row * mapUnitSize;
                 this.transform.localToGlobal(x, y, helpPoint);
                 this.transform.localToGlobal(x+mapUnitSize, y+mapUnitSize, helpPoint2);
                 var isIns2 = rectIntersect2(helpPoint.x, helpPoint.y, helpPoint2.x-helpPoint.x, helpPoint2.y-helpPoint.y, 0, 0, viewport.width, viewport.height)


                 if(isIns2) {
                     this._spriteBatch.drawTexture3(this._mapAsset.mapImageAssets[i], x-i, y-i);
                     //this._spriteBatch.drawTexture3(this._mapAsset.mapImageAssets[i], x, y);
                 }
             }
         }

         this._spriteBatch.render(renderContext);
        }
  }

  class MapAsset extends WOZLLA.asset.Asset{
    public static CLASS = "TS.MapAsset";

    public mapImageAssets;

    constructor(mapDesc:MapAssetDescriptor, mapImageAssets:WOZLLA.asset.ImageAsset[]) {
        super(mapDesc);
        this.mapImageAssets = mapImageAssets;
    }
  }

  class MapAssetDescriptor extends WOZLLA.asset.AssetDescriptor {

      public get count():number { return this._count; }

      private _count:number;

      constructor(assetPath:string, count:number) {
          super(assetPath);
          this._count = count;
      }

      public getClass():string {
          return MapAsset.CLASS;
      }
  }

  class MapAssetLoader extends WOZLLA.asset.AssetLoader {

        protected doLoadAsync(decriptor:MapAssetDescriptor, callback:(error:any, asset:MapAsset) => void) {
            var imageDirPath = decriptor.assetPath;
            var count = decriptor.count;
            var loadedCount = 0;
            var doError = false;
            var mapImageAssets = [];

            for(let i=0; i<count; i++) {
                ((i) => {
                    let imageLoader = new WOZLLA.asset.ImageLoader(this.assetManager);
                    let imageDesc = new WOZLLA.asset.ImageDescriptor(imageDirPath + '/' + i + '.jpg');
                    imageLoader.loadAsync(imageDesc, (err:any, asset) => {
                        if(!doError && err) {
                            callback(err, null);
                            doError = true;
                            return;
                        }
                        loadedCount ++;
                        mapImageAssets[i] = asset;
                        if(loadedCount === count) {
                            callback(null, new MapAsset(decriptor, mapImageAssets));
                        }
                    });
                })(i);
            }
        }

    }

    WOZLLA.asset.LoaderManager.getInstance().register(MapAsset.CLASS, (assetManager) => {
       return new MapAssetLoader(assetManager);
    });

  var director = new WOZLLA.Director(document.getElementById('main'),{
      parallelLoad: true,
      monitorLowNetwork: false
  });
  director.renderContext.debug = true;
  RenderLayer.All.forEach((layer:any) => {
      director.renderContext.define(layer.NAME, layer.ORDER);
  });
  director.start();
  var toSceneId = 'city02';
  var cityCfg = AllCityData[toSceneId];

  let cityData = cityCfg;
  cityData.sceneId = toSceneId;
  cityData.map = {
      row: cityCfg.height,
      col: cityCfg.width,
      name: cityCfg.mapId,
      crop: cityData.crop
  };

  let cityModel = new CityModel(cityData);
  var scene = new City(director,cityModel);
  scene.loadAssets(()=>{
    scene.init();
    director.stage.addChild(scene);
  })


  App.director = director;

})();
