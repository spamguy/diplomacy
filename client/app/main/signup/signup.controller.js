'use strict';

angular.module('diplomacy.main')
.controller('SignupController', ['$scope', '$http', 'loginService', function ($scope, $http, loginService) {
    // TODO: force logged-in users out of this page

    angular.extend($scope, {
        user: {
            username: null,
            password: null,
            password2: null,
            email: null,
            points: 0,
            timezone: 0,
            save: function() {
                $http.post('/api/users', this);//.then(loginService.validLoginCallback);
            }
        }
    });
}]);
