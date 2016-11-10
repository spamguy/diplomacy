'use strict';

angular.module('diplomacy.main')
.controller('LoginController', ['$http', '$localStorage', '$state', '$stateParams', 'CONST', 'Restangular', function($http, $localStorage, $state, $stateParams, CONST, Restangular) {
    if ($stateParams.token) {
        $http.get(CONST.diplicityEndpoint + '?token=' + $stateParams.token, {
            headers: { 'Accept': 'application/json' }
        })
        .then(function(payload) {
            if (payload.data.Properties.User) {
                $localStorage.token = $stateParams.token;
                $localStorage.theUser = payload.data.Properties.User;

                Restangular.setDefaultRequestParams({ token: $stateParams.token });
                $state.go('profile.games');
            }
            else {
                return $state.go('main.home');
            }
        })
        .then(function(games) {

        });
    }

}]);
