'use strict';

angular.module('diplomacy')
.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
    .state('main.login', {
        url: '/login',
        templateUrl: 'app/main/login/login.html',
        controller: 'LoginController'
    });
}]);
