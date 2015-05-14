'use strict';

angular.module('diplomacy.main')
.controller('LoginController', ['$scope', '$http', '$window', '$state', 'userService', 'CONST', 'socketService',
function ($scope, $http, $window, $state, userService, CONST, socketService) {
    angular.extend($scope, {
        user: {
            username: null,
            password: null,

            login: function() {
                $scope.loginForm.password.$setValidity('validLogin', true);
                $http.post(CONST.apiEndpoint + '/login', this)
                    .success(function(data, status) {
                        userService.setCurrentUser(data.id);
                        userService.setToken(data.token);

                        socketService.emit('login:success');

                        // redirect to profile
                        $state.go('profile');
                    })
                    .error(function(data, status) {
                        // clear token
                        delete $window.sessionStorage.token;

                        $scope.loginForm.password.$setValidity('validLogin', false);
                    });
            }
        }
    });
}]);
