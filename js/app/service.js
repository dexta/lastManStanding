movieApp.factory('navView',function(){
  var nav = {
    headerShow: true,
    btnHamburger: false,
    searchBar: false,
    playerBar: false,
    serverBar: false,
    serverRow: false
  };

  return {
    set: function(value,to){
      nav[value] = to;
    },
    show: function(value){
      return nav[value];
    }
  };

});

movieApp.factory('getMovieData',function($http){
  var movies = {};

  movies.theName = '';
  movies.List = [];
  movies.Called = [];
  movies.showResulut = false;
  movies.count = 0;

  movies.getList = {
      async: function(name) {
        var promise = $http.get('get/movies/'+name).then(function(response) {
          return response.data;
        });
        return promise;
      }
    };

  movies.getByName = function(name) {
    movies.getList.async(name).then(function(d) {
      movies.List = d;
    });
    movies.theName = name;
  };

  movies.callMovie = function(movie) {
    for(var ml=0,mll=movies.List.length;ml<mll;ml++) {
      if(movies.List[ml].id===movie.id) {
        movies.Called.push({title:movies.List[ml].title});
        movies.List.splice(ml,1);
        break;
      }
    }
  }

  movies.setShowResulut = function(tof) {
    movies.showResulut = tof;
  }

  movies.reList = function() {
    // console.log("performence count "+movies.count++);
    return movies.List;
  }

  movies.reCalled = function() {
    return movies.Called;
  }

  movies.reShowResulut = function() {
    return movies.showResulut;
  }

  movies.reTheName = function() {
    return movies.theName;
  }
  return movies;
});

movieApp.factory('socket', function($rootScope) {
  var socket = io.connect();
  return {
    on: function(eventName, callback) {
      socket.on(eventName, function(){
        $rootScope.$apply(function(){
          callback.apply(socket, args);
        });
      });
    },
    emit: function(eventName, data, callback){
      socket.emit(eventName, data, function(){
        var args = arguments;
        $rootScope.$apply(function(){
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
});