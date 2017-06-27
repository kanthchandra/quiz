(function () {
  'use strict';

  angular
    .module('app')
    .factory('AuthenticationService', AuthenticationService);

  AuthenticationService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', 'UserService'];
  function AuthenticationService($http, $cookies, $rootScope, $timeout, UserService) {
    var service = {};

    service.Login = Login;
    service.SetCredentials = SetCredentials;
    service.ClearCredentials = ClearCredentials;

    return service;

    function Login(username, password, callback) {
      $http.post('/users/authenticate', { username: username, password: password })
        .then(handleSuccess, handleError);

      function handleSuccess(res) {
        return callback({success: true, data: res.data});
      }

      function handleError(res) {
        return callback({ success: false, message: res.data.message });
      }
    }

    function SetCredentials(username, token) {
      $rootScope.globals = {
        currentUser: {
          username: username,
          token: token
        }
      };
      // set default auth header for http requests
      $http.defaults.headers.common['Authorization'] = 'token ' + token;
      // store user details in globals cookie that keeps user logged in for 1 week (or until they logout)
      var cookieExp = new Date();
      cookieExp.setDate(cookieExp.getDate() + 7);
      $cookies.putObject('globals', $rootScope.globals, { expires: cookieExp });
    }

    function ClearCredentials() {
      $rootScope.globals = {};
      $cookies.remove('globals');
      $http.defaults.headers.common.Authorization = '';
    }
  }
})();