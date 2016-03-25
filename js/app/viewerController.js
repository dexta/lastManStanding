movieApp.controller('viewerController', function($scope, $location, getMovieData, navView, socket){

  $scope.searchTitle = "Last Man Standing";
  $scope.calledMovies = [];
  $scope.gamePlayerTime = 13;
  $scope.gamePlayerNameList = [];
  $scope.gameActivPlayer = "";
  
// debug mockup
      $scope.searchTitle = "Bruce Willis";
      $scope.gamePlayerName = "testPlayer 01";
      $scope.gameServerName = "Server 23 Rack 42";
      $scope.calledMovies = [
        {title:"Stirb Langsam"},
        {title:"Stirb Langsam 2"},
        {title:"Stirb Langsam 3"},
        {title:"Stirb Langsam 4"},
        {title:"last boyscout"}
        ];


  navView.set('headerShow',false);
  navView.set('searchBar',false);
  navView.set('playerBar',false);
  navView.set('serverBar',false);


// socket.io starts here

  var socket = io.connect();
  var serverConnect = false;
  var playerPara = $location.search();

// start connection
  socket.on('connect', function () {
    if(serverConnect) return;
    var newPlayer = {
      name: playerPara.name,
      server: playerPara.server
    };
    socket.emit('joinServer',newPlayer);
    // console.log("new Player "+JSON.stringify(newPlayer) );
    serverConnect = true;
  });

  socket.on('welcomePlayer',function(name){
    console.log("this name "+playerPara.name+" server means "+name);
  });

  socket.on('getGameData', function(gameData){
    console.log("getGameData "+JSON.stringify(gameData));
    $scope.$apply(function(){
      $scope.searchTitle = gameData.search;
      $scope.calledMovies = gameData.called;
      $scope.gamePlayerTime = gameData.timer;
      $scope.gameActivPlayer = gameData.player;
      $scope.gamePlayerNameList = gameData.nameList;
    });
  });



  socket.on('welcomeBackPlayer',function(playerData){
    $scope.gameServerStarted = true;
    $scope.gameServerName = serverData.name;
    $scope.gameServerPass = serverData.pass;
  });  

  socket.on("serverError", function(msgObj) {
    console.log("error from:"+msgObj.msg+"\nobj:"+JSON.stringify(msgObj.obj));
  });
 
});
