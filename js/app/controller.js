

var debug;
movieApp.controller('singleController', function($scope, $location, getMovieData, socket){
  $scope.headSearch = "";
  $scope.searchTitle = "Last Man Standing";
  $scope.showSearchResulut = false;
  $scope.movieList = [];
  $scope.movieCalled = [];
  $scope.sortValues = [
    {id: 'title-asc', name: 'Titel A -> Z'},
    {id: 'title-desc', name: 'Titel A <- Z'},
    {id: 'release_date-asc', name: 'Datum ->'},
    {id: 'release_date-desc', name: 'Datum <-'},
  ]

  $scope.nav = {
    headerShow: true,
    btnHamburger: false,
    searchBar: true,
    playerBar: false,
    serverBar: false    
  }

  console.log("options "+JSON.stringify($location.search()));

  function getMoviesByName(name) {
    getMovieData.async(name).then(function(d) {
      $scope.movieList = d;
    });
    $scope.searchTitle = name;
  }

  $scope.byName = function(name) {
    getMoviesByName(name);
    $scope.showSearchResulut = true;
  }

  $scope.setFilterCol = function(column,action) {
    $scope[column] = action;
  }
  $scope.setMovieCalled = function(movie) {
    // console.log("outside setMovieCalled "+movie.id);
    for(var ml=0,mll=$scope.movieList.length;ml<mll;ml++) {
      if($scope.movieList[ml].id===movie.id) {
        $scope.movieCalled.push($scope.movieList[ml]);
        $scope.movieList.splice(ml,1);

        break;
      }
    }
    debug = $scope.movieCalled;
  }

  $scope.col1Sort = {};
  $scope.col2Sort = {};
  $scope.col3Sort = {};

  $scope.setFilterCol('col1Sort',$scope.sortValues[1]);
  $scope.setFilterCol('col2Sort',$scope.sortValues[2]);
  $scope.setFilterCol('col3Sort',$scope.sortValues[0]);

  // getMoviesByName("Bruce Willis");

// socket.io starts here

  var socket = io.connect();

  var debPlayer = ["alice","bob","clara","dexter","elouise"];



  $scope.gamePlayerName = '';
  $scope.gameServerRunning = {};

  $scope.gameServerName = '';
  $scope.gameServerPass = '';
  $scope.gameServerJoined = false;
  $scope.gameServerStarted = false;
  $scope.gameServerAvailable = false;

  $scope.gameClients = [];

  $scope.formServerValues = {};

// start connection
  socket.on('connect', function () {
    $scope.gameServerRunning = {};
  });
  socket.on('runningGames', function(runGame){
    var gameName = runGame.name;
    $scope.gameServerRunning[gameName] = runGame;    
    $scope.gameServerAvailable = true;
    console.log("server names: "+gameName+" all "+Object.keys($scope.gameServerRunning));
  });
// connection done wait for user
// for debug mock all User Data inputs
$scope.formServer = {};
$scope.formServer.name = "test1";
$scope.formServer.pass = "geheim";
  $scope.startServer = function() {
    if($scope.gameServerJoined || $scope.gameServerStarted) return;
    $scope.gameServerName = $scope.formServer.name;
    $scope.gameServerPass = $scope.formServer.pass;
    console.log("starting quiz server "+$scope.gameServerName);
    socket.emit('startServer',{name:$scope.gameServerName,pass:$scope.gameServerPass});
    $scope.gameServerStarted = true;

    // $scope.gameServerRunning[$scope.gameServerName] = {name:$scope.gameServerName,player:[]};
  }

  $scope.joinServer = function(joinForm) {
    if($scope.gameServerJoined || $scope.gameServerStarted) return;
    var noPlayer = Object.keys($scope.gameServerRunning[joinForm].player).length;
    var name = debPlayer[noPlayer];
    var server = joinForm; // $scope.gameServerRunning[name].name;
    $scope.gameServerName = server;
    $scope.gameServerJoined = true;
    var joinObj = {server:server,name:name};
    console.log("join Object "+joinObj);
    socket.emit('joinServer',joinObj);
    console.log("name selected "+name);
  }

  socket.on('welcomeBackServer',function(serverData){
    $scope.gameServerStarted = true;
    $scope.gameServerName = serverData.name;
    $scope.gameServerPass = serverData.pass;
  });
  socket.on('welcomeBackPlayer',function(playerData){
    $scope.gameServerStarted = true;
    $scope.gameServerName = serverData.name;
    $scope.gameServerPass = serverData.pass;
  });  
// user choose one side and we split the socket functions
// 
// Game Master Side
// 

  socket.on('updatePlayer', function(playerName){
    $scope.gameClients.push({name:playerName});
    $scope.$evalAsync($scope.gameClients);
    console.log("update clients player "+playerName);
  });

// 
// Player Actions
// 

  $scope.seekServer = function() {
    socket.emit('seekRunningServer');
  };

  $scope.showSettingsRow = false;
  $scope.showJoinServerRow = false;
  $scope.showJoinServer = function() {
    $scope.showJoinServerRow = true;
  };
  $scope.getServerNames = function() {
    return Object.keys($scope.gameServerRunning);
  }
  $scope.showSettings = function() {
    $scope.showSettingsRow = true;
  }

  socket.on("serverError", function(msgObj) {
    console.log("error from:"+msgObj.msg+"\nobj:"+JSON.stringify(msgObj.obj));
  });

  
});
