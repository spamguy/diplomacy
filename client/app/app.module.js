'use strict';

angular.module('diplomacy', [
    'ui.router',
    'LocalStorageModule',
    'angular-jwt',
    'd3',
    'userService',
    'gameService',
    'games',
    'diplomacy.main',
    'profile',
    'map.directives',
    'ngMaterial'
])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', 'jwtInterceptorProvider', 'localStorageServiceProvider', '$mdThemingProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, jwtInterceptorProvider, localStorageServiceProvider, $mdThemingProvider) {
    // material design theme definitions
    $mdThemingProvider.theme('default')
        .primaryPalette('brown')
        .accentPalette('blue-grey');

    // local storage config
    localStorageServiceProvider.setPrefix('diplomacy');

    // JWT/auth setup
    jwtInterceptorProvider.tokenGetter = ['jwtHelper', '$state', '$http', 'userService', function(jwtHelper, $state, $http, userService) {
        var oldToken = userService.getToken();

        if (oldToken && jwtHelper.isTokenExpired(oldToken)) {
            console.log('Token is expired: ' + oldToken);
            userService.unsetToken();
            $state.go('main.home');
        }
        else {
            return oldToken;
        }
    }];
    $httpProvider.interceptors.push('jwtInterceptor');

    $urlRouterProvider
        .otherwise('/');

    $locationProvider.html5Mode(true);
}])
.run(['$rootScope', 'userService', function ($rootScope, userService) {
    $rootScope.$on('$stateChangeStart', function (event, next) {
        var isRestricted = !!(next.data && next.data.restricted);

        $rootScope.isAuthenticated = userService.isAuthenticated();

        // if page is restricted and auth is bad, block entry to route
        if (isRestricted && !userService.isAuthenticated()) {
            event.preventDefault();
            console.log('State change blocked');
        }
    });
}]);
