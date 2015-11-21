import AllCityData = require('./CityData');
    declare var navmesh:any;
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
    constructor(director:WOZLLA.Director, sceneId:string) {
      super(director);
      this._sceneId = sceneId;
      this._mapLayer = new WOZLLA.GameObject(director);
      this._sceneObjLayer = new WOZLLA.GameObject(director);
    }
  }

  class City extends Scene{
    private _collision:CityCollision;
       private _cityModel:CityModel;
       private _map:Map;
       private _mapLayer:WOZLLA.GameObject;
       private _sceneObjLayer:WOZLLA.GameObject;
    constructor(director:WOZLLA.Director, cityModel:CityModel) {
      super(director,cityModel.cityId);
      this._cityModel = cityModel;

      this._map = new Map(director, cityModel.mapModel);
       this.addMap(this._map);

       this._collision = new CityCollision(this._cityModel.cityId);
       this.addComponent(this._collision);

    }

    addMap(map:WOZLLA.GameObject) {
           this._mapLayer.addChild(map);
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

    class NavMeshCollision extends WOZLLA.Component {
      private _paths;
            private _path;
            private _crossTriangulation;

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
            }

            private _buildCross(crosJson, callback:Function) {
                var navmesh:any = window['navmesh'];
                this._crossTriangulation =  new navmesh.Triangulation(crosJson, true);
                callback && callback();
            }

    }

    function getMapImagePathByName(mapName:string) {
        return 'res/map/images/' + mapName;
    }

    class Map extends WOZLLA.GameObject{
      constructor(director:WOZLLA.Director, mapModel:MapModel){
        super(director);
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
                   if(rectIntersect2(helpPoint.x, helpPoint.y, helpPoint2.x-helpPoint.x, helpPoint2.y-helpPoint.y, 0, 0, viewport.width, viewport.height)) {
                       this._spriteBatch.drawTexture3(this._mapAsset.mapImageAssets[i], x-i, y-i);
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


  var director = new WOZLLA.Director(document.getElementById('main'));
  director.start();
  var toSceneId = 'city01';
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




})();
