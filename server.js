//
// # Last Man Standing Game for Kino+ @ rocketbeans.tv
//
// A simple game server using Socket.IO, Express, and Async.
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
    socket.emit('connect',socket.id);

    socket.on('startServer',function(newServer){
      var toRun = {
        name: newServer.name,
        ownerId: socket.id,
        player: newServer.user,
        playerWon: '',
        nameList: newServer.nameList,
        maxCount: 20,
        timer: 20,
        plpos: 0,
        intervalID: 0,
        running: false,
        search: 'Last Man Standing',
        movies: [],
        called: []
      };
      gamesRunning[newServer.name] = toRun;

      console.log("Start Server "+toRun.name);
      console.dir(toRun.player);
      broadcastComrade(newServer.name);
    });

    socket.on('joinServer',function(newPlayer){
      if(!gamesRunning[newPlayer.server]) {
        return;
      }
      var ser = gamesRunning[newPlayer.server];
      var hit = false;
      for(var p in ser.player) {
        console.log("player "+ser.player[p].name);
        if(ser.player[p].name===newPlayer.name) {
          hit = true;
          ser.player[p].status = 'online';
          ser.player[p].socketID = socket.id;
          break;
        }
      }
      if(hit) {
        socket.emit("welcomPlayer",{name:newPlayer.name});
        var serSocket = sockets[newPlayer.server];
        serSocket.emit("updatePlayer",ser.player);
        console.log("new Player: "+newPlayer.name);
        broadcastComrade(newPlayer.server);
      }
    });

    socket.on('sendGameData',function(gameData){
      if(!(gamesRunning[gameData.server]||false)) return;
      var rG = gamesRunning[gameData.server];
      rG.called = gameData.called;
      rG.search = gameData.search;
      broadcastComrade(gameData.server);
    });

    socket.on('gameServerAction',function(action){
      if(!(gamesRunning[action.server]||false)) return;
      gameLogic(action);
      broadcastComrade(action.server);
    });

    socket.on('disconnect', function () {
      delete sockets[socket.id];
    });

  });

function gameLogic(action) {
  if(!(gamesRunning[action.server]||false)) return;
    var rS = gamesRunning[action.server];
    console.log("send button "+action.item);
    if(action.item==="play") {
      rS.running = true;
      rS.intervalID = setInterval(function(){gameTimer(action.server)},1000,action);
    } else if(action.item==="pause") {
      rS.running = !(rS.running);
    } else if(action.item==="stop") {
      clearInterval(rS.intervalID);
      rS.running = false;
    } else if(action.item==="next") {
      if(rS.plpos>=rS.nameList.length-1) {
        rS.plpos=0;
      } else {
        rS.plpos++;
      }
      if(rS.nameList[rS.plpos].score<=0) {
        gameLogic(action);
      } else {
        rS.timer=rS.maxCount;
      }
    } else if(action.item==="prev") {
      if(rS.plpos<=0) {
        rS.plpos = rS.nameList.length-1;
      } else {
        rS.plpos--;
      }
      if(rS.nameList[rS.plpos].score<=0) {
        gameLogic(action);
      } else {
        rS.timer=rS.maxCount;
      }
    } else if(action.item==="lose") {
      loseScore(action);
    }
}

function gameOver(action) {
  var rS = gamesRunning[action.server];
  for(l in rS.nameList) {
    if(rS.nameList[l].score>=1) {
      rS.playerWon = rS.nameList[l].name;
    }
  }
  action.item = "pause";
  gameLogic(action);
  broadcastComrade(action.server);
}


function loseScore(action) {
  var rS = gamesRunning[action.server];
  rS.nameList[rS.plpos].score--;
  var tO = 0;
  for(l in rS.nameList) {
    if(rS.nameList[l].score>=1) tO++;
  }
  if(tO<=1) {gameOver(action);return;}
  action.item = "next";
  gameLogic(action);
}

function gameTimer(serverId) {
  if(!(gamesRunning[serverId]||false) || gamesRunning[serverId].running === false) return;
  var gR = gamesRunning[serverId];
  if(gR.timer<=0) {
    gR.timer=gR.maxCount;
    loseScore({server:serverId});
  } else {
    gR.timer--;
  }
  broadcastComrade(serverId);
}

function broadcastComrade(gameId) {
  if(!(gamesRunning[gameId]||false)) return;
  var gR = gamesRunning[gameId];
  var gameData = {
    search: gR.search,
    called: gR.called,
    timer: gR.timer,
    nameList: gR.nameList,
    player: gR.nameList[gR.plpos].name,
    WON: gR.playerWon
  };
  for(var c in gR.player) {
    var soID = gR.player[c].socketID;
    if(sockets[soID]||false) {
      console.log("sendGameData ID "+soID);
      sockets[soID].emit('getGameData',gameData);
    }
  }
  sockets[gR.ownerId].emit('getGameData',gameData);
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
