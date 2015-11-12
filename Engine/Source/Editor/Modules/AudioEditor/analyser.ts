(function(){
  var url = '/resource/test_music.mp3';

  var context:AudioContext = new AudioContext();
  var analyser =  context.createAnalyser();
  var canvas = <HTMLCanvasElement> document.getElementById('canvas1');
  var canvasContext = canvas.getContext('2d');
  function playSound(buffer){
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(analyser);
    analyser.connect(context.destination);
    source.start(0);
  }

  function init(){
    var request = new XMLHttpRequest();
    request.open('GET',url,true);
    request.responseType = 'arraybuffer';
    request.onload = function(){
      context.decodeAudioData(request.response,function(buffer){
        playSound(buffer);
      })
    }
    request.send();
  }

  function draw(){
    requestAnimationFrame(draw);
    render();
  }

  var separator=2;
  var height=canvas.height=500;
  var width=canvas.width=500;
  var spacer=2;

  function render(){
    //Get the Sound data
    var freqByteData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqByteData);     //analyser.getByteTimeDomainData(freqByteData);
    //we Clear the Canvas
    canvasContext.beginPath();
    canvasContext.clearRect(0, 0, width, height);
    canvasContext.fillStyle = '#000000';
    canvasContext.lineCap = 'round';
    canvasContext.fill();
    for(var i=0;i<analyser.frequencyBinCount;i++){
        canvasContext.fillRect(i*2,height,1,-freqByteData[i]);
    }

}

  init();
  draw();

})();
