movieApp.directive('movieEntry', function(){
  return {
    restrict: 'A',
    scope: {
      movie: '=',
      called: '&called'
    },
    controller: function($scope) {
      $scope.readMore =function(){
        $scope.moviedetail = !$scope.moviedetail;
      }
    },
    link: function(scope, element, attrs) {
      scope.moviedetail = false;
      var setCalled = scope.called()
      scope.setCalled = function(movie){
        // console.log("inside directive "+movie.id);
        setCalled(movie);
      };
    },
    templateUrl: 'partials/movieEntry.html'
  };
});