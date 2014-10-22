'use strict';

angular.module('diplomacy.main')
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('main.signup', {
                url: '/signup',
                templateUrl: 'app/main/signup/signup.html',
                controller: 'SignupController',
				abstract: true
            })
            .state('main.signup.username', {
                url: '',
                templateUrl: 'templates/username.tmpl.html'
            })
            .state('main.signup.password', {
                url: '/password',
                templateUrl: 'templates/password.tmpl.html'
             })
            .state('main.signup.email', {
                url: '/email',
                templateUrl: 'templates/email.tmpl.html'
            });

        $urlRouterProvider.otherwise('/signup');
});
