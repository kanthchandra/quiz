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
    vm.permitUser = permitUser;
    vm.quizStarted = false;
    vm.startQuiz = startQuiz;
    vm.questions = [];
    vm.currentAnswerModel = {
       questionId : '',
       answerOption : ''
    };
    vm.submitAnswer = submitAnswer;

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
            subscribeToAnnouncementSocket();
            subscribeToQuestionSocket();
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

    function permitUser(user) {
      SocketService.emit('permission:approved', {
        roomUrl: '/rooms/' + $routeParams.roomName,
        roomName: $routeParams.roomName,
        username: user.userName,
        token: $rootScope.globals.currentUser.token
      }, function (response) {
          
      });
    }

    function startQuiz(user) {
      SocketService.emit('quiz:start', {
        roomUrl: '/rooms/' + $routeParams.roomName,
        roomName: $routeParams.roomName,
        username: $rootScope.globals.currentUser.username,
        token: $rootScope.globals.currentUser.token
      }, function (response) {
          
      });
    }

    function submitAnswer() {
      console.log(vm.currentAnswerModel);
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

    function subscribeToQuestionSocket() {
      SocketService.on('quiz:questions', function (response) {
        vm.quizStarted = true;
        vm.questions.push(response.message);
        vm.currentQuestion = response.message;
        vm.currentQuestion.options = {
          A: response.message.optionA,
          B: response.message.optionB,
          C: response.message.optionC,
          D: response.message.optionD
        }
        vm.currentAnswerModel = {
           questionId : vm.currentQuestion.id,
        };
        vm.currentAnswerModel[response.message.optionA] = false;
        vm.currentAnswerModel[response.message.optionB] = false;
        vm.currentAnswerModel[response.message.optionC] = false;
        vm.currentAnswerModel[response.message.optionD] = false;
      });
    }

    function subscribeToAnnouncementSocket() {
      SocketService.on('quiz:announcement', function (response) {
        FlashService.Success(response, false);

      });
    }

    function subscribeToPermissionSocket() {
      SocketService.on('user:permission', function (response) {
        vm.pendingRequests.push({ userName: response.userName, joinRequestApproved: false});
      });
    }
  }
})();