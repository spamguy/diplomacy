'use strict';

angular.module('diplomacy.main')
.controller('SignupController', ['CONST', '$scope', '$http', '$state', 'loginService', 'socketService', '$mdToast', function(CONST, $scope, $http, $state, loginService, socketService, $mdToast) {
    // Keep logged-in users out of this page.
    if (socketService.getAuthenticated())
        $state.go('profile.games');

    angular.extend($scope, {
        user: {
            email: null,
            save: function() {
                $scope.isDisabled = true;
                $http
                    .post(CONST.apiEndpoint + '/users', this)
                    .then(function(response) {
                        $mdToast.showSimple('A verification email has been sent.');
                    }, function(response) {
                        $mdToast.showSimple(response.data.error);
                    });
            }
        }
    });
}]);
