(function () {
  'use strict';

  angular
    .module('app')
    .controller('RoomController', RoomController);

  RoomController.$inject = ['$location', '$routeParams', 'UserService', '$rootScope', 'FlashService', 'SocketService'];
  function RoomController($location, $routeParams, UserService, $rootScope, FlashService, SocketService) {
    var vm = this;
    vm.joinedUsers = [];
    vm.pendingRequests = [];
    vm.roomName = $routeParams.roomName;

    vm.username = $rootScope.globals.currentUser.username;
    initController();

    function initController() {
      getRoomByName();
    }

    function getRoomByName() {
      UserService.getRoomByName($routeParams.roomName)
        .then(function (response) {
          if (response.success) {
            vm.room = response.data;
            getUserByName();
          } else {
            FlashService.Error(response, false);
            $location.path('/login');
          }
        });
    }

    function getUserByName() {
      UserService.getUserByName(vm.username)
        .then(function (response) {
          if (response.success) {
            vm.user = response.data;
            joinToRoomSocket();
            getAllPendingRequests();
            getAllJoinedUsers();
            subscribeToRoomSocket();
            subscribeToErrorSocket();
            subscribeToUserSocket();
            subscribeToPermissionSocket();
          } else {
            FlashService.Error(response, false);
            $location.path('/login');
          }
        });
    }

    function getAllPendingRequests() {
      if (vm.user.id !== vm.room.ownerId)
        return;
      UserService.getAllPendingRequests(vm.room.id)
        .then(function (response) {
          if (response.success) {
            vm.pendingRequests = vm.pendingRequests.concat(response.data.map(function(user) {
              return  { userName: user.userName, joinRequestApproved: user.joinRequestApproved}
            }));
          } else {
            FlashService.Error(response, false);
            $location.path('/login');
          }
        });
    }


    function getAllJoinedUsers() {
      UserService.getAllJoinedUsers(vm.room.id)
        .then(function (response) {
          if (response.success) {
            vm.joinedUsers = vm.joinedUsers.concat(response.data.map(function(user) {
              return user.userName
            }));
          } else {
            FlashService.Error(response, false);
            $location.path('/login');
          }
        });
    }

    function joinToRoomSocket() {
      SocketService.emit('join:quiz', {
        roomUrl: '/rooms/' + $routeParams.roomName,
        roomName: $routeParams.roomName,
        username: $rootScope.globals.currentUser.username,
        token: $rootScope.globals.currentUser.token
      }, function (response) {
          
      });
    }

    function subscribeToRoomSocket() {
      SocketService.on('quiz:joined', function (response) {
        vm.joinedUsers.push(response.userName);
      });
    }

    function subscribeToErrorSocket() {
      SocketService.on('error:join', function (response) {
        FlashService.Error(response, false);
      });
    }

    function subscribeToUserSocket() {
      SocketService.on('user:joined', function (response) {
        FlashService.Success(response, false);
      });
    }

    function subscribeToPermissionSocket() {
      SocketService.on('user:permission', function (response) {
        FlashService.Success(response, false);
      });
    }
  }
})();