(function () {
  'use strict';

  angular
    .module('app')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$location', 'UserService', '$rootScope', 'FlashService'];
  function HomeController($location, UserService, $rootScope, FlashService) {
    var vm = this;

    vm.username = $rootScope.globals.currentUser.username;
    vm.createRoom = createRoom;
    vm.showCreateRoomForm = false;
    vm.showRooms = false;
    vm.room = {};
    vm.cancelRoomCreation = cancelRoomCreation;
    initController();

    function initController() {
      loadAllRooms();
    }
    function loadAllRooms() {
      UserService.GetAllRooms()
        .then(function (response) {
          vm.allRooms = response.data;
          if (response.data.length > 0)
            vm.showRooms = true;
        });
    }

    function createRoom (username) {
      vm.dataLoading = true;
      UserService.PostRoom(vm.room)
      .then(function (response) {
        if (response.success) {
          FlashService.Success('Room creation successful', true);
          vm.dataLoading = false;
          $location.path('/rooms/' + vm.room.name);
        } else {
          FlashService.Error(response.message);
          vm.dataLoading = false;
        }
      });
    }

    function cancelRoomCreation () {
      vm.showCreateRoomForm = false;
      vm.room = {};
      vm.dataLoading = false;
    }
  }
})();