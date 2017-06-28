(function () {
  'use strict';
  angular
    .module('app', ['ngRoute', 'ngCookies'])
    .config(config)
    .run(run);

  config.$inject = ['$routeProvider', '$locationProvider'];
  function config($routeProvider, $locationProvider) {
    $routeProvider
      .when('/users/:userName', {
        controller: 'HomeController',
        templateUrl: 'javascripts/home/home.view.html',
        controllerAs: 'vm'
      })
      .when('/rooms/:roomName', {
        controller: 'RoomController',
        templateUrl: 'javascripts/rooms/room.view.html',
        controllerAs: 'vm'
      })
      .when('/login', {
        controller: 'LoginController',
        templateUrl: 'javascripts/login/login.view.html',
        controllerAs: 'vm'
      })
      .when('/register', {
        controller: 'RegisterController',
        templateUrl: 'javascripts/register/register.view.html',
        controllerAs: 'vm'
      })
      .otherwise({ redirectTo: '/login' });
  }

  run.$inject = ['$rootScope', '$location', '$cookies', '$http'];
  function run($rootScope, $location, $cookies, $http) {
    // keep user logged in after page refresh
    $rootScope.globals = $cookies.getObject('globals') || {};
    if ($rootScope.globals.currentUser) {
      $http.defaults.headers.common['Authorization'] = 'token ' + $rootScope.globals.currentUser.token;
    }

    $rootScope.$on('$locationChangeStart', function (event, next, current) {
      // redirect to login page if not logged in and trying to access a restricted page
      var restrictedPage = $.inArray($location.path(), ['/login', '/register']) === -1;
      var loggedIn = $rootScope.globals.currentUser;
      if (restrictedPage && !loggedIn) {
          $location.path('/login');
      }
    });
  }
})();