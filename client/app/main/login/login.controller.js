'use strict';

angular.module('diplomacy.main')
.controller('LoginController', ['$scope', '$http', '$window', '$state', 'userService', 'CONST', 'socketService',
function ($scope, $http, $window, $state, userService, CONST, socketService) {
    socketService.on('connect', function() {
        socketService.emit('authenticate', { token: userService.getToken() });
    });

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

                        // redirect to profile
                        $state.go('profile');
                    })
                    .error(function(data, status) {
                        // clear token
                        userService.unsetToken();

                        $scope.loginForm.password.$setValidity('validLogin', false);
                    });
            }
        }
    });
}]);
