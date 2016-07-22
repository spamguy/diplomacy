angular.module('diplomacy.main')
.controller('HomeController', ['$scope', '$http', 'CONST', 'loginService', '$mdToast', function($scope, $http, CONST, loginService, $mdToast) {
    'use strict';

    $http.get('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feednormalizer%20where%20url%3D%27https%3A%2F%2Fblog.dipl.io%2Frss%27%20and%20output%3D%27atom_1.0%27&format=json')
    .then(function(response) {
        $scope.blogEntries = response.data.query.results.feed.entry;
    });

    angular.extend($scope, {
        user: {
            email: null,
            password: null,

            login: function() {
                $http.post(CONST.apiEndpoint + '/login', this)
                .then(
                    loginService.validLoginCallback,
                    function(response) {
                        $scope.logOut();
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
