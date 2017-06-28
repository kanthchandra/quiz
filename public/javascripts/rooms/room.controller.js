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
          joinToRoomSocket();
          joinToUserSocket();
          subscribeToRoomSocket();
          subscribeToUserSocket();
        });
    }

    function joinToRoomSocket() {
      SocketService.emit('join:quiz', {
        room: '/rooms/' + $routeParams.roomName,
        roomName: $routeParams.roomName,
        type: 'room',
        username: null,
        token: $rootScope.globals.currentUser.token
      }, function (response) {
        console.log('subscribeToRoomSocket', response);
      });
    }

    function joinToUserSocket() {
      SocketService.emit('join:user', {
        room: '/users/' + vm.username,
        roomName: vm.username,
        type: 'user',
        username: $rootScope.globals.currentUser.username,
        token: $rootScope.globals.currentUser.token
      }, function (response) {
        console.log('subscribeToUserSocket', response);
      });
    }

    function subscribeToRoomSocket() {
      SocketService.on('quiz:joined', function (response) {
        console.log('subscribeToRoomSocket', response);
      });
    }

    function subscribeToUserSocket() {
      SocketService.on('user:joined', function (response) {
        console.log('subscribeToUserSocket', response);
      });
    }
  }
})();