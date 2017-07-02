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
    service.PostRoom = PostRoom;
    service.getUserByName = getUserByName;
    service.getRoomByName = getRoomByName;
    service.getAllPendingRequests = getAllPendingRequests;
    service.getAllJoinedUsers = getAllJoinedUsers;
    return service;

    function GetAllRooms() {
        return $http.get('/rooms').then(handleSuccess, handleError);
    }
    function Create(user) {
        return $http.post('/users', user).then(handleSuccess, handleError);
    }
    function PostRoom(room) {
      return $http.post('/rooms', room).then(handleSuccess, handleError);
    }
    function getUserByName(userName) {
      return $http.get('/users/' + userName).then(handleSuccess, handleError);
    }
    function getRoomByName(roomName) {
      return $http.get('/rooms/' + roomName).then(handleSuccess, handleError);
    }
    function getAllPendingRequests(roomId) {
      return $http.get('/rooms/' + roomId + '/requests').then(handleSuccess, handleError);
    }
    function getAllJoinedUsers(roomId) {
      return $http.get('/rooms/' + roomId + '/sessions').then(handleSuccess, handleError);
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
