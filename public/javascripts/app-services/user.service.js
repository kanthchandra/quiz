(function () {
  'use strict';

  angular
    .module('app')
    .factory('UserService', UserService);

  UserService.$inject = ['$http'];
  function UserService($http) {
    var service = {};
    service.GetAllRooms = GetAllRooms;
    service.Create = Create;
    return service;

    function GetAllRooms() {
        return $http.get('/rooms').then(handleSuccess, handleError);
    }
    function Create(user) {
        return $http.post('/users', user).then(handleSuccess, handleError);
    }
    // private functions

    function handleSuccess(res) {
        return {success: true, data: res.data};
    }

    function handleError(res) {
        return { success: false, message: res.data.message };
    }
  }

})();
