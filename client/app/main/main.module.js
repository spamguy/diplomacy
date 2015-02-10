'use strict';

angular.module('diplomacy.main', [
    'ui.router',
    'directives.customvalidation.customValidationTypes',
    'signupform.directives',
    'ngAnimate',
    'userService',
    'gameService',
    'mgo-angular-wizard'
])
.config(function ($stateProvider) {
    $stateProvider
    .state('main', {
        url: '',
        template: '<ui-view />',
        abstract: true
    })
    .state('main.home', {
      url: '/',
      templateUrl: 'app/main/home/home.html',
      controller: 'HomeController'
    })
    .state('main.signup', {
        url: '/signup',
        templateUrl: 'app/main/signup/signup.html',
        controller: 'SignupController'
    });
});
