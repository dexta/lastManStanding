movieApp.controller('headController', function($scope, getMovieData, navView){
  $scope.headSearch = "";
  $scope.searchTitle = "Last Man Standing";

  $scope.navShow = navView.show;

  $scope.byName = function(name) {
    getMovieData.getByName(name);
    getMovieData.setShowResulut(true);
    $scope.searchTitle = name;
  }
  
  $scope.showSettings = function() {
    navView.set('serverRow', (!$scope.navShow('serverRow')) );
  }

  // $scope.byName("Bruce Willis");

});
