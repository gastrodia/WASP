(function(){
  var url = '/resource/test_music.mp3';

  var context:AudioContext = new AudioContext();
  function playSound(buffer){
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
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

  init();

})();
