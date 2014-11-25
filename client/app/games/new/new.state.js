'use strict';

angular.module('games')
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('games.new', {
                url: '/new',
                //controller: 'NewGameController',
                templateUrl: 'app/games/new/new.html',
                abstract: true
            })
            .state('games.new.name', {
                url: '',
                templateUrl: 'templates/new/username.tmpl.html'
            });
            // .state('main.signup.password', {
            //     url: '/password',
            //     templateUrl: 'templates/password.tmpl.html'
            //  })
            // .state('main.signup.email', {
            //     url: '/email',
            //     templateUrl: 'templates/email.tmpl.html'
            // });

        $urlRouterProvider.otherwise('/new');
});
