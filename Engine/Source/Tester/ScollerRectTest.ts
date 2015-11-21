(function(){

  const LISTVIEW_WIDTH = 580;
  const LISTVIEW_HEIGHT = 364;

  class ItemModel extends WOZLLA.data.Model{

  }
  class ListPanel extends WOZLLA.view.View{
    public listView:ListView;
    constructView(){
      this.name = 'content';
      this.listView = new ListView(this.director);
      this.addChild(this.listView);
    }
  }

   class ListView extends WOZLLA.view.SimpleListView<ItemModel>{
      constructListItemView(itemModel:ItemModel){
        var itemView = new ItemView(this.director);
          itemView.bindModel(itemModel);
          return itemView;
      }

      protected initLayoutManager():WOZLLA.view.LayoutManager {
          var layout:any = super.initLayoutManager();
          layout.columnCount = 10;
          layout.margin.top = 0;
          layout.margin.left = 0;
          layout.cellMargin.top = 0;
          layout.cellMargin.right = 200;

          return layout;
      }

   }

    class ItemView extends WOZLLA.view.SimpleView {
        constructView(){
           var content = director.createGameObject(true);
           var imageRenderer = new WOZLLA.component.ImageRenderer();
           imageRenderer.imageSrc.set('./resource/sanwu.jpg');
           content.addComponent(imageRenderer);
           var contentRectCollider = new WOZLLA.component.RectCollider();
          contentRectCollider.setRegion(0, 0, 200, 200);
          content.addComponent(contentRectCollider);
          content.touchable = true;
          content.addListener('tap',function(){
             alert('tap itemView');
          });
           this.addChild(content);
        }
    }



  var director = new WOZLLA.Director(document.getElementById('main'));
   director.start();

   var arrayStore:WOZLLA.data.ArrayStore<ItemModel> = new WOZLLA.data.ArrayStore<ItemModel>();
   for(let i=0;i<10;i++){
     arrayStore.add(new ItemModel({}));
   }
   var listPanel = new ListPanel(director);
   listPanel.listView.bindArrayStore(arrayStore);


   var scroll = director.createGameObject(true);
   scroll.rectTransform.anchorMode = WOZLLA.RectTransform.getMode('Left_Top');
   scroll.touchable = true;
   var scrollRect = new WOZLLA.component.ScrollRect();
   scrollRect.direction.set(WOZLLA.component.ScrollRect.HORIZONTAL);
   scrollRect.visibleRect.setRect(0, 0, 600, 200);
   scrollRect.contentRect.setRect(0, 0, 2000, 200);
   scrollRect.content.set('content');


   scroll.addComponent(scrollRect);
   var rectCollider = new WOZLLA.component.RectCollider();
   rectCollider.setRegion(0, 0, 600, 200);
   scroll.addComponent(rectCollider);
   var rectMask = new WOZLLA.component.NormalRectMask();
   rectMask.rect.setRect(0, 0, 600, 200);
   rectMask.endOrder.set(10);
   scroll.addComponent(rectMask);

   scroll.interactiveRect = new WOZLLA.math.Rectangle(0,0,600,200); 

   var content = director.createGameObject(true);
   content.name = 'content';
   var imageRenderer = new WOZLLA.component.ImageRenderer();
   imageRenderer.imageSrc.set('./resource/sanwu.jpg');
   content.addComponent(imageRenderer);


   var contentRectCollider = new WOZLLA.component.RectCollider();
  contentRectCollider.setRegion(0, 0, 600, 200);
  // content.addComponent(contentRectCollider);
  // content.touchable = true;
  // content.addListener('tap',function(){
  //    alert('tap content');
  // });
  listPanel.listView.addComponent(contentRectCollider);
  listPanel.listView.touchable = true;
  listPanel.addListener('tap',function(){
    alert('tap listView');
  });

   scroll.addChild(listPanel);
   scroll.loadAssets(function() {
       scroll.init();
       director.stage.addChild(scroll);
   });

})();
