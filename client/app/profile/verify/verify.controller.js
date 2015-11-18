'use strict';

angular.module('profile')
.controller('VerifyController', ['$scope', '$http', 'loginService', '$stateParams', '$state', 'jwtHelper', 'CONST', '$mdToast',
function($scope, $http, loginService, $stateParams, $state, jwtHelper, CONST, $mdToast) {
    var verifyToken = $stateParams.token;

    if (jwtHelper.isTokenExpired(verifyToken)) {
        $state.go('main.signup');
        $mdToast.show(
            $mdToast.simple()
                .content('The verification link is invalid or expired.')
                .action('OK')
                .hideDelay(false)
        );
    }

    angular.extend($scope, {
        user: {
            password: null,
            password2: null,
            token: verifyToken,
            save: function() {
                $http.post(CONST.apiEndpoint + '/verify', this)
                .then(loginService.validLoginCallback);
            }
        }
    });
}]);
