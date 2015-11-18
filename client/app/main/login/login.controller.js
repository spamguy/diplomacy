'use strict';

angular.module('diplomacy.main')
.controller('LoginController', ['$scope', '$http', 'userService', 'loginService', 'CONST',
function($scope, $http, userService, loginService, CONST) {
    angular.extend($scope, {
        user: {
            email: null,
            password: null,

            login: function() {
                $scope.loginForm.password.$setValidity('validLogin', true);
                $http.post(CONST.apiEndpoint + '/login', this)
                .error(function(data, status) {
                    // clear token
                    userService.unsetToken();

                    $scope.loginForm.password.$setValidity('validLogin', false);
                })
                .then(loginService.validLoginCallback);
            }
        }
    });
}]);
