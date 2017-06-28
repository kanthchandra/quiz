(function () {
  'use strict';

  angular
    .module('app')
    .controller('RoomController', RoomController);

  RoomController.$inject = ['$location', '$routeParams', 'UserService', '$rootScope', 'FlashService', 'SocketService'];
  function RoomController($location, $routeParams, UserService, $rootScope, FlashService, SocketService) {
    var vm = this;

    vm.username = $rootScope.globals.currentUser.username;
    initController();

    function initController() {
      getRoomByName();
    }

    function getRoomByName() {
      UserService.getRoomByName($routeParams.roomName)
        .then(function (response) {
          vm.room = response.data;
          getUserByName();
        });
    }

    function getUserByName() {
      UserService.getUserByName(vm.username)
        .then(function (response) {
          vm.user = response.data;
          subscribeToRoomSocket();
          subscribeToUserSocket();
        });
    }

    function subscribeToRoomSocket() {
      SocketService.emit('join', {
        room: '/rooms/' + $routeParams.roomName,
        token: $rootScope.globals.currentUser.token
      }, function (response) {
        console.log('subscribeToRoomSocket');
      });
    }
    function subscribeToUserSocket() {
      SocketService.emit('join', {
        room: '/users/' + vm.username,
        token: $rootScope.globals.currentUser.token
      }, function (response) {
        console.log('subscribeToUserSocket');
      });
    }
  }
})();