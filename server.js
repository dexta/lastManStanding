//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//


var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

var __base = __dirname+'/';
console.log("base path "+__base);
var config = require(__base+'nodeApp/config.js');

var cacheLib = require(__base+'nodeApp/cache.js');
var Cache = new cacheLib(__base+"/"+config.cache.filename);
// var Cache = {};

var tmdb = require('./nodeApp/themoviedb.js');

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

var util = require('util');


router.use(express.static(path.resolve(__dirname, '')));
router.get('/get/movies/:name', function(req, res){
  var name = req.params.name;
  if(Cache.isIn(name)) {
    console.log("name from Cache "+name);
    res.send(Cache.get(name));
    return;
  }
  console.log("new name "+name);  
  tmdb.get(req,res,name,Cache);
});

// var messages = [];

var sockets = {};

var clientsConnected = {};
var gamesRunning = {};


io.on('connection', function (socket) {
    sockets[socket.id] = socket;
    clientsConnected[socket.id] = socket;
    updateRunningGames(socket.id);

    socket.on('startServer',function(newServer){
      var toRun = {
        name: newServer.name,
        pass: newServer.pass,
        ownerId: socket.id,
        player: {}
      };
      gamesRunning[newServer.name] = toRun;
      delete clientsConnected[socket.id];
      updateRunningGames( Object.keys(clientsConnected) );
      console.log("Start Server "+toRun.name);
    });

    socket.on('joinServer',function(newPlayer){
      if(gamesRunning[newPlayer.server]||false){
        var newUser = {
          name: newPlayer.name,
          server: server,
          score: 3,
          userId: socket.id
        };
        gamesRunning[newPlayer.server].player[socket.id] = newUser;
        delete clientsConnected[socket.id];
        updateRunningGames( Object.keys(clientsConnected) );
        var serverSocket = sockets[gamesRunning[newPlayer.server].ownerId];
        serverSocket.emit('updatePlayer',newUser.name);
        console.log("player "+newPlayer.name+" joined");
      } else {
        socket.emit('serverError',{msg:'join server',obj:newPlayer});
      }
    });

    socket.on('seekRunningServer',function(){
      updateRunningGames(socket.id);
    });

    socket.on('disconnect', function () {
      delete sockets[socket.id];
      // sockets.splice(sockets.indexOf(socket), 1);
      // updateRoster();
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      socket.get('name', function (err, name) {
        var data = {
          name: name,
          text: text
        };

        broadcast('message', data);
        messages.push(data);
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        updateRoster();
      });
    });
  });

function listOfPlayerInGame(gameName) {
  var lop = []
  for(var p in gamesRunning[gameName].player) {
    var k = gamesRunning[gameName].player[p];
    lop.push(k.name);
  }
  return lop;
}

function updateRunningGames(soIDs) {
  if(typeof soIDs === "string") {
    if(!(sockets[soIDs]||false)) {
      console.log("faild update socket "+soIDs);
      return;
    }
    console.dir(gamesRunning);
    for(var name in gamesRunning) {
      var rS = {
        name: name,
        player: listOfPlayerInGame(name)
      }
      console.log("socketID "+soIDs);
      sockets[soIDs].emit('runningGames', rS);
    }
  } else if(typeof soIDs === "object" && (soIDs.length||false)) {
    for(var s in soIDs) {
      updateRunningGames(soIDs[s]);
    }
  }
}

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  for(var s in sockets) {
    sockets[s].emit(event, data);
  }
}

server.listen(config.server.port || 9423, config.server.ip || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
