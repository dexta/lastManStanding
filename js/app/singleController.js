movieApp.controller('singleController', function($scope, $location, getMovieData, navView){
  $scope.headSearch = "";
  $scope.searchTitle = "Last Man Standing";
  $scope.showSearchResulut = getMovieData.reShowResulut;
  
  $scope.movieList = getMovieData.reList;
  $scope.movieCalled = getMovieData.reCalled;

  $scope.setMovieCalled = getMovieData.callMovie;

  $scope.sortValues = [
    {id: 'title-asc', name: 'Titel A -> Z'},
    {id: 'title-desc', name: 'Titel A <- Z'},
    {id: 'release_date-asc', name: 'Datum ->'},
    {id: 'release_date-desc', name: 'Datum <-'},
  ]

  navView.set('headerShow',true);
  navView.set('searchBar',true);
  navView.set('playerBar',false);
  navView.set('serverBar',false);

  $scope.setFilterCol = function(column,action) {
    $scope[column] = action;
  }

  $scope.col1Sort = {};
  $scope.col2Sort = {};
  $scope.col3Sort = {};

  $scope.setFilterCol('col1Sort',$scope.sortValues[1]);
  $scope.setFilterCol('col2Sort',$scope.sortValues[2]);
  $scope.setFilterCol('col3Sort',$scope.sortValues[0]);

});
