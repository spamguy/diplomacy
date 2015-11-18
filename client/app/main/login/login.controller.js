'use strict';

angular.module('diplomacy.main')
.controller('LoginController', ['$scope', '$http', 'userService', 'loginService', 'socketService', 'CONST', '$mdToast',
function($scope, $http, userService, loginService, socketService, CONST, $mdToast) {
    angular.extend($scope, {
        user: {
            email: null,
            password: null,

            login: function() {
                socketService.initialize();

                $http.post(CONST.apiEndpoint + '/login', this)
                .then(
                    loginService.validLoginCallback,
                    function(response) {
                        userService.unsetToken();
                        $mdToast.show(
                            $mdToast.simple()
                                .content(response.data.message)
                                .action('OK')
                                .hideDelay(false)
                        );
                    });
            }
        }
    });
}]);
