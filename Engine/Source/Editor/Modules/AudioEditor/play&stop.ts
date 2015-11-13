(function(){
  var ctx = new AudioContext();
  var osc = null;

  function startOsc(bool?:boolean) {
      if(bool === undefined) bool = true;

      if(bool === true) {
  		osc = ctx.createOscillator();
          osc.frequency.value = 1000;

          osc.start(ctx.currentTime);
          osc.connect(ctx.destination);
      } else {
  		osc.stop(ctx.currentTime);
          osc.disconnect(ctx.destination);
          osc = null;
      }
  }

  $(document).ready(function() {
      $("#start").click(function() {
         startOsc();
      });
      $("#stop").click(function() {
         startOsc(false);
      });
  });
})();
