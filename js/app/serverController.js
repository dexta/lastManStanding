

var debug;
movieApp.controller('serverController', function($scope, $location, $interval, getMovieData, navView, socket){
  $scope.headSearch = "";
  $scope.searchTitle = "Last Man Standing";
  $scope.showSearchResulut = getMovieData.reShowResulut;
  
  $scope.movieList = getMovieData.reList;
  $scope.movieCalled = getMovieData.reCalled;

  $scope.setMovieCalled = function(movie) {
    getMovieData.callMovie(movie);
    $scope.gameButton('next');
    $scope.sendGameData();
  };
  
  $scope.gamePlayerTime = 13;
  $scope.gamePlayerNameList = [];
  $scope.gameActivPlayer = "";

  $scope.searchName = getMovieData.reTheName;

  $scope.sortValues = [
    {id: 'title-asc', name: 'Titel A -> Z'},
    {id: 'title-desc', name: 'Titel A <- Z'},
    {id: 'release_date-asc', name: 'Datum ->'},
    {id: 'release_date-desc', name: 'Datum <-'},
  ]


  navView.set('headerShow',true);
  navView.set('searchBar',true);
  navView.set('playerBar',false);
  navView.set('serverBar',true);
  navView.set('serverRow',true);

  $scope.navShow = navView.show;

  console.log("options "+JSON.stringify($location.search()));

  $scope.setFilterCol = function(column,action) {
    $scope[column] = action;
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

  var php = $location.protocol()+"://"+$location.host();
  php += ($location.port())? ":"+$location.port() : "";
  // no no thats means P-rotocol H-ost P-ort not PersonalHomepageProcessor

  var debPlayer = ["alice","bob","clara","dexter","elouise"];
// new starts here
  $scope.userList = [];
  $scope.gameServerStarted = false;
  $scope.gameServerName = 'test1';

  function mockPlayer() {
    for(var d in debPlayer) {
      var role = (Math.random()<=.3)? "viewer" : "player";
      var tu = {};
      tu.name = debPlayer[d];
      tu.url = php+"/#/"+role+"?name="+debPlayer[d]+"&server="+$scope.gameServerName;
      tu.status = 'offline';
      tu.role = role;
      tu.socketID = '';
      tu.score = 3;
      $scope.userList.push(tu);
    }
  }

  $scope.addPlayer = function(name) {
    if(!name||name==="") return;
    var tu = {};
    tu.name = name;
    tu.url = php+"/#/player?name="+name+"&server="+$scope.gameServerName;
    tu.status = 'offline';
    tu.role = 'player';
    tu.socketID = '';
    $scope.userList.push(tu);
  };

  $scope.addViewer = function() {
    var tu = {};
    tu.name = "viewer";
    tu.url = php+"/#/viewer?type=board&server="+$scope.gameServerName;
    tu.status = 'offline';
    tu.role = 'viewer';
    tu.socketID = '';
    $scope.userList.push(tu);
  }

  $scope.startServer = function() {
    if($scope.gameServerStarted) return;
    if($scope.userList.length===0) return;
    var iData = {};
    iData.name = $scope.gameServerName;
    iData.user = $scope.userList;
    iData.nameList = genUserNameList();
    console.log("###### starting server "+$scope.gameServerName);
    socket.emit('startServer',iData);
    $scope.gameServerStarted = true;
  }

  $scope.stopServer = function() {
    console.log("****** stop server "+$scope.gameServerName);
    $scope.gameServerStarted = false;
  }
  socket.on('connect', function (socketID) {
    if(!socketID||socketID==="") return;
    console.log("connect "+socketID);
    $scope.gameServerName = socketID;
    if($scope.userList.length===0) mockPlayer();
  });

  function genUserNameList() {
    var nList = [];
    for(var i in $scope.userList) {
      if($scope.userList[i].role==="player") {
        var nUser = {
          name:$scope.userList[i].name,
          score: 3
        };
        nList.push(nUser);
      }
    }
    return nList;
  }

  updatePlayers = function(upPlayers) {
    var newList = [];
    for(var p in upPlayers) {
      var entry = {};
      var cl = ['name','url','status','role','socketID'];
      for(var k in cl) {
        if(upPlayers[p][cl[k]]||false) {
          entry[cl[k]] = upPlayers[p][cl[k]];
        }
      }
      newList.push(entry);
    }
    $scope.$apply(function(){
      $scope.userList = newList;
    });
  }

  socket.on('updatePlayer', updatePlayers);

  $scope.sendGameData = function() {
    socket.emit('sendGameData',{
      search: $scope.searchName(),
      server: $scope.gameServerName,
      called: $scope.movieCalled()
    });
  };
  
  socket.on('getGameData', function(gameData){
    // console.log("getGameData "+JSON.stringify(gameData));
    $scope.$apply(function(){
      $scope.searchTitle = gameData.search;
      $scope.calledMovies = gameData.called;
      $scope.gamePlayerTime = gameData.timer;
      $scope.gameActivPlayer = gameData.player;
      $scope.gamePlayerNameList = gameData.nameList;
    });
  });

  $scope.$watch('searchName()',function(){
    $scope.sendGameData();
  });

  // Game Logik and Tick(server later :)
  $scope.gamePlayerTime = 20;
  $scope.gamePlayerMaxTime = 20;
  $scope.gameServerPause = false;
  $scope.gamePlayerList = ['alice','bob','clara','dexta'];
  $scope.gamePlayerPos = 0;
  $scope.intervalID = 0;

  $scope.theTimer = function() {
    if(!$scope.gameServerPause) {
      if($scope.gamePlayerTime<=0) {
        $scope.gamePlayerTime = $scope.gamePlayerMaxTime;
        $scope.gameButton("next");
      } else {
        $scope.gamePlayerTime--;
      }
    }  
  }

  function gameTimer(action) {
    if(!action||true) {
      return $scope.gamePlayerTime;
    } else if(action==="pause") {
      $scope.gameServerPause = !$scope.gameServerPause||false;
    } else if(action==="stop"){
      $scope.gameServerRunning = false;
    } else if(action==="start"){
      $scope.gameServerRunning = true;
    } 
  }

  $scope.gameButton = function(action) {
    var gbAction = {server:$scope.gameServerName,item:action};    
    socket.emit('gameServerAction',gbAction);
  };

  socket.on('welcomeBackServer',function(serverData){
    $scope.gameServerStarted = true;
    $scope.gameServerName = serverData.name;
    $scope.gameServerPass = serverData.pass;
  });

// user choose one side and we split the socket functions
// 
// Game Master Side
// 

  socket.on("serverError", function(msgObj) {
    console.log("error from:"+msgObj.msg+"\nobj:"+JSON.stringify(msgObj.obj));
  });
  
});
