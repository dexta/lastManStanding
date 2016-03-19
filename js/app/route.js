
movieApp.config(function($routeProvider) {
  $routeProvider

    .when('/', {
      templateUrl : 'pages/home.html',
      controller  : 'singleController'
    })

    .when('/player', {
      templateUrl : 'pages/player.html',
      controller : 'playerController'
    })

    .when('/server', {
      templateUrl : 'pages/server.html',
      controller : 'serverController'
    })

    .when('/viewer', {
      templateUrl : 'pages/viewer.html',
      controller : 'viewerController'
    })
});