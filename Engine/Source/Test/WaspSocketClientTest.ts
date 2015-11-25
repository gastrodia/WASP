var io = require('wasp-socket-client');
var socket = io('http://localhost:8080');
 socket.on('data', function (data) {
   console.log(data);

 });

 socket.emit('data', { type:'profile0',data:{a:1,b:2}});
 socket.emit('data', { type:'profile1',data:{a:1,b:2}});
 socket.emit('data', { type:'profile2',data:{a:1,b:2}});
