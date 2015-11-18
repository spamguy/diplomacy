'use strict';

angular.module('diplomacy.main')
.controller('SignupController', ['$scope', '$http', '$state', 'loginService', 'socketService', '$mdToast', function($scope, $http, $state, loginService, socketService, $mdToast) {
    // Keep logged-in users out of this page.
    if (socketService.getAuthenticated())
        $state.go('profile.games');

    angular.extend($scope, {
        user: {
            password: null,
            password2: null,
            email: null,
            points: 0,
            timezone: 0,
            save: function() {
                $http
                    .post('/api/users', this)
                    .then(function(response) {
                        $mdToast.showSimple('A verification email has been sent.');
                    }, function(response) {

                    });
            }
        }
    });
}]);
