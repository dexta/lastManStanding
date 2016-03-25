movieApp.controller('playerController', function($scope, $location, getMovieData, navView, socket){

  $scope.searchTitle = "Last Man Standing";
  $scope.calledMovies = [];


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

  $scope.sortValues = [
    {id: 'title-asc', name: 'Titel A -> Z'},
    {id: 'title-desc', name: 'Titel A <- Z'},
    {id: 'release_date-asc', name: 'Datum ->'},
    {id: 'release_date-desc', name: 'Datum <-'},
  ]

  $scope.setFilterCol = function(column,action) {
    $scope[column] = action;
  }

  $scope.col1Sort = {};
  $scope.col2Sort = {};
  $scope.col3Sort = {};

  $scope.setFilterCol('col1Sort',$scope.sortValues[1]);
  $scope.setFilterCol('col2Sort',$scope.sortValues[2]);
  $scope.setFilterCol('col3Sort',$scope.sortValues[0]);


// socket.io starts here

  var socket = io.connect();
  var serverConnect = false;
  var playerPara = $location.search();

  console.log("options "+JSON.stringify($location.search()));


  // var debPlayer = ["alice","bob","clara","dexter","elouise"];

  // $scope.gamePlayerName = playerPara.name;
  // $scope.gameServerName = playerPara.server;

// start connection
  socket.on('connect', function () {
    if(serverConnect) return;
    var newPlayer = {
      name: playerPara.name,
      server: playerPara.server
    };
    socket.emit('joinServer',newPlayer);
    console.log("new Player "+JSON.stringify(newPlayer) );
    serverConnect = true;
  });

  socket.on('welcomePlayer',function(name){
    console.log("this name "+playerPara.name+" server means "+name);
  });

  socket.on('getGameData', function(gameData){
    // $scope.searchTitle = gameData.name;
    // $scope.calledMovies = gameData.called;
    console.log("getGameData "+JSON.stringify(gameData));

    $scope.$apply(function(){
      $scope.searchTitle = gameData.name;
      $scope.calledMovies = gameData.called;
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
