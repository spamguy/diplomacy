'use strict';

angular.module('diplomacy', [
    'diplomacy.constants',
    'ui.router',
    'LocalStorageModule',
    'angular-jwt',
    'userService',
    'gameService',
    'games',
    'diplomacy.main',
    'profile',
    'map.directives',
    'gamelistitem.directive',
    'ngMaterial',
    'ng-mfb',
    'socketService'
])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', 'jwtInterceptorProvider', 'localStorageServiceProvider', '$mdThemingProvider', '$mdIconProvider', 'RestangularProvider', 'CONST',
function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, jwtInterceptorProvider, localStorageServiceProvider, $mdThemingProvider, $mdIconProvider, RestangularProvider, CONST) {
    // material design theme definitions
    $mdThemingProvider.theme('default')
        .primaryPalette('blue-grey')
        .accentPalette('red', {
            default: '900'
        });

    // icon definitions
    $mdIconProvider
        .icon('menu', '../assets/images/menu48.svg', 24)
        .icon('power', '../assets/images/power.svg', 24)
        .icon('notes', '../assets/images/notes26.svg', 24);

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

    // set API base URL as declared by constants file
    RestangularProvider.setBaseUrl(CONST.apiEndpoint);

    // hide ugly # in URL
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
