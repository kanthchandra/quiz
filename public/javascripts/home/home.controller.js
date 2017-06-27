(function () {
  'use strict';

  angular
    .module('app')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['UserService', '$rootScope'];
  function HomeController(UserService, $rootScope) {
    var vm = this;

    vm.username = $rootScope.globals.currentUser.username;

    initController();

    function initController() {
      loadAllRooms();
    }
    function loadAllRooms() {
      UserService.GetAllRooms()
        .then(function (rooms) {
          vm.allRooms = rooms;
        });
    }
  }
})();