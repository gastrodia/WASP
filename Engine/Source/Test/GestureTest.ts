(function(){
  var myElement = document.getElementById('hammerTarget');
  var mc = new Hammer.Manager(myElement, {});

  mc.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }) );
  mc.add( new Hammer.Tap({ event: 'quadrupletap', taps: 4 }) );
  mc.add( new Hammer.Press())
  mc.on("pan", function(){
    console.log('pan');
  });
  mc.on("quadrupletap", function(){
    console.log("quadrupletap")
  });

  mc.on('press',function(e:any){
    debugger;
    e.preventDefault()
    console.log('press')

  })
})();
