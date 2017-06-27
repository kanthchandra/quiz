(function () {
  'use strict';

  angular
    .module('app')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$location', 'AuthenticationService', 'FlashService'];
  function LoginController($location, AuthenticationService, FlashService) {
    var vm = this;
    vm.login = login;
    (function initController() {
        // reset login status
        AuthenticationService.ClearCredentials();
    })();

    function login() {
      vm.dataLoading = true;
      AuthenticationService.Login(vm.username, vm.password,
        function (response) {
          if (response.success) {
            AuthenticationService.SetCredentials(response.data.name, response.data.token);
            $location.path('/users/' + response.data.name);
          } else {
            console.log('response', response)
            FlashService.Error(response.message);
            vm.dataLoading = false;
          }
        }
      );
    };
  }
})();
