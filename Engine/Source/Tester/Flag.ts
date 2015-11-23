(function(){
  var director = new WOZLLA.Director(document.getElementById('main'));
  director.start();

  var gameObject = director.createGameObject();
  var imageRenderer = new WOZLLA.component.ImageRenderer();
  imageRenderer.imageSrc.set('./resource/flag.jpg');

  gameObject.addComponent(imageRenderer);
  gameObject.transform.scaleX = 0.1;
  gameObject.transform.scaleY = 0.1;
  gameObject.loadAssets(function() {
  gameObject.init();
  director.stage.addChild(gameObject);
  });

})();
