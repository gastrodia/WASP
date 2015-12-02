(function(){
  var director = new WOZLLA.Director(document.getElementById('main'));
   director.start();

   var gameObject = director.createGameObject();
   gameObject.transform.setPosition(250, 250);
   var textRenderer = new WOZLLA.component.TextRenderer();
   textRenderer.align.set(WOZLLA.ALIGN_CENTER);
   textRenderer.text.set('text中文');
   textRenderer.canvasStyle.fill = true;
   textRenderer.canvasStyle.fillColor = '#FFFFFF';
   textRenderer.canvasStyle.stroke = true;
   textRenderer.canvasStyle.strokeWidth = 3;
   textRenderer.canvasStyle.strokeColor = '#FF0000';

   gameObject.addComponent(textRenderer);
   gameObject.loadAssets(function() {
       gameObject.init();
       director.stage.addChild(gameObject);
   });

   director.scheduler.scheduleLoop(function() {
       gameObject.transform.rotation ++;
   });
})();
