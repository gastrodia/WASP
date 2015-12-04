(function(){
  var director = new WOZLLA.Director(document.getElementById('main'));
  director.start();

  // var gameObject = director.createGameObject();
  //
  // var textRenderer = new WOZLLA.component.TextRenderer();
  // textRenderer.align.set(WOZLLA.ALIGN_CENTER);
  // textRenderer.text.set('text中文');
  // textRenderer.canvasStyle.fill = true;
  // textRenderer.canvasStyle.fillColor = '#FFFFFF';
  // textRenderer.canvasStyle.stroke = true;
  // textRenderer.canvasStyle.strokeWidth = 3;
  // textRenderer.canvasStyle.strokeColor = '#FF0000';
  //
  // gameObject.addComponent(textRenderer);

  var content = director.createGameObject(true);
  content.name = 'content';
  content.rectTransform.anchorMode = WOZLLA.RectTransform.ANCHOR_MIDDLE | WOZLLA.RectTransform.ANCHOR_CENTER;

  var imageRenderer = new WOZLLA.component.ImageRenderer();
  imageRenderer.imageSrc.set('./resource/sanwu.jpg');
  imageRenderer.align.set(WOZLLA.ALIGN_CENTER);
  imageRenderer.valign.set(WOZLLA.VALIGN_MIDDLE);
  content.addComponent(imageRenderer);


  var gameObject:WOZLLA.GameObject = director.createGameObject(true);
  gameObject.rectTransform.anchorMode = WOZLLA.RectTransform.ANCHOR_TOP | WOZLLA.RectTransform.ANCHOR_CENTER;
  gameObject.rectTransform.py = -20;
           var spriteText = new WOZLLA.component.SpriteText();
           spriteText.spriteAtlas.set('./resource/battle.tt.json');
           spriteText.frame.set('crit1.png');
           spriteText.sample.set('上下-0123456789');
           spriteText.wordMargin.set(-14);
           spriteText.text.set('-3000');
           spriteText.align.set(WOZLLA.ALIGN_END);
           spriteText.valign.set(WOZLLA.VALIGN_MIDDLE);
           gameObject.addComponent(spriteText);

  content.addChild(gameObject)
  content.loadAssets(function() {
      content.init();
      director.stage.addChild(content);
  });

gameObject.transform.tween(true).to({
  y:-100
},200).call(()=>{
  gameObject.transform.tween(true).to({

  },50).call(()=>{
    setTimeout(()=>{
        gameObject.removeMe();
    },250);
  })

})


  director.scheduler.scheduleLoop(function() {
      //gameObject.transform.rotation ++;
  });
})();
