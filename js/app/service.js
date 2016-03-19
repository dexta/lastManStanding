movieApp.factory('getMovieData',function($http){
  var getMovieData = {
    async: function(name) {
      var promise = $http.get('get/movies/'+name).then(function(response) {
        return response.data;
      });
      return promise;
    }
  };
  return getMovieData;
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