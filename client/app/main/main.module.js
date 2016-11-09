'use strict';

angular.module('diplomacy.main', [
    'ui.router',
    'ngMessages',
    'signupform.directives',
    'ngAnimate',
    'userService',
    'loginService',
    'gameService',
    'socketService'
    // 'angularTypewrite'
])
.config(['$stateProvider', function($stateProvider) {
    $stateProvider
    .state('main', {
        url: '/main',
        template: '<ui-view />',
        abstract: true
    })
    .state('main.home', {
        url: '/home',
        templateUrl: 'app/main/home/home.html',
        controller: 'HomeController'
    })
    .state('main.signup', {
        url: '/signup',
        templateUrl: 'app/main/signup/signup.html',
        controller: 'SignupController'
    });
}]);
