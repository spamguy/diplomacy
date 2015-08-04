'use strict';

angular.module('profile')
.controller('VerifyController', ['$scope', '$http', 'loginService', '$stateParams', '$state', 'jwtHelper', 'CONST',
function ($scope, $http, loginService, $stateParams, $state, jwtHelper, CONST) {
    var verifyToken = $stateParams.token;

    if (jwtHelper.isTokenExpired(verifyToken))
        $state.go('main.signup', { expired: 1 });

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
