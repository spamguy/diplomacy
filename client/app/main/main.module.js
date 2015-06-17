'use strict';

angular.module('diplomacy.main', [
    'ui.router',
    'ngMessages',
    'signupform.directives',
    'ngAnimate',
    'userService',
    'gameService',
    'mgo-angular-wizard',
    'socketService'
])
.config(['$stateProvider', function ($stateProvider) {
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
    })
    .state('main.login', {
        url: '/login',
        templateUrl: 'app/main/login/login.html',
        controller: 'LoginController'
    })
    .state('main.logout', {
        url: '/logout',
        controller: 'LogoutController'
    });
}]);
