'use strict';

angular.module('profile')
.controller('VerifyController', ['$scope', '$http', 'loginService', '$stateParams', '$state', 'jwtHelper', function ($scope, $http, loginService, $state, $stateParams, jwtHelper) {
    var verifyToken = $stateParams.token;

    if (jwtHelper.isTokenExpired(verifyToken))
        $state.go('main.signup', { expired: 1 });
        
    angular.extend($scope, {
        user: {
            password: null,
            password2: null,
            points: 0,
            timezone: 0,
            save: function() {
                $http.post('/api/users/verify', this);
            }
        }
    });
}]);
