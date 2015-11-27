
var io = require('wasp-socket-client');
var socket = io('http://192.168.16.85:8080');





function doMorph(){
  var loops = 60
  var nx = 120
  var nz = 120

  function morph(a,f) {
      var PI2nx = Math.PI * 8/nx
      var sin = Math.sin
      var f30 = -(50 * sin(f*Math.PI*2))

      for (var i = 0; i < nz; ++i) {
          for (var j = 0; j < nx; ++j) {
              a[3*(i*nx+j)+1]    = sin((j-1) * PI2nx ) * -f30
          }
      }
  }
  var a = Array()
  for (var i=0; i < nx*nz*3; ++i) a[i] = 0


  for (var i = 0; i < loops; ++i) {
      morph(a, i/loops)
  }

}



  var t:number = window.performance.now();
  //console.log(t);
  // setInterval(function(){
  //   var nt = window.performance.now();
  //   console.log(nt - t);
  //   t = nt;
  // },1000)
  function frame(){
    doMorph();
    var nt = window.performance.now();
    var fps = Math.round(1000/(nt - t))
  //  console.log(fps);
    t = nt;
    socket.emit('data', { type:'renderStatus',data:{
                   fps:fps,
                   drawCall:100,
                   time:Date.now()
               }});
    requestAnimationFrame(frame);
  }

requestAnimationFrame(frame);
