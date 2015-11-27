var app = require('http').createServer(handler)
var io = require('wasp-socket')(app);
var fs = require('fs');
import path = require('path');

var cachePath = path.join(__dirname,'../../../Cache');
var Datastore = require('nedb');
var db = {};

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.on('connection', function (socket) {
  socket.on('data',function(e){
    var type = e.type;
    if(type){
      if(!db[type]){
        var dbfile = path.join(cachePath,type);
        console.log('create db ' + dbfile);
        db[type] = new Datastore({
          filename: dbfile,
          autoload: true
        });
      }

      var store = db[type];
      store.insert(e.data,function(err){
        if(err){console.log(err)};
      });
    }
     if(type == 'renderStatus'){
       socket.broadcast.emit('data',e.data);
     }else if(type == 'consoleLog'){
       console.log(e.data);
     }

  });
});


app.listen(8080,function(){
  console.log('status server listen on 8080');
});
