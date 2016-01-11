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
    'map.directive',
    'gamelistitem.directive',
    'ngMaterial',
    'socketService'
])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', 'jwtInterceptorProvider', 'localStorageServiceProvider', '$mdThemingProvider', '$mdIconProvider',
function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, jwtInterceptorProvider, localStorageServiceProvider, $mdThemingProvider, $mdIconProvider) {
    // Material design theme definitions.
    $mdThemingProvider.theme('default')
        .primaryPalette('indigo', {
            default: '400'
        })
        .accentPalette('red', {
            default: '900'
        });

    // Icon definitions.
    $mdIconProvider
        .icon('menu', '/assets/icons/ic_more_vert_24px.svg', 24)
        .icon('addperson', '/assets/icons/ic_person_add_24px.svg', 24)
        .icon('play', '/assets/icons/ic_play_arrow_24px.svg', 24)
        .icon('eject', '/assets/icons/ic_eject_24px.svg', 24)
        .icon('join', '/assets/icons/ic_call_merge_24px.svg', 24)
        .icon('new', '/assets/icons/ic_add_24px.svg', 24)
        .icon('fold-out', '/assets/icons/ic_unfold_more_24px.svg', 24)
        .icon('fold-in', '/assets/icons/ic_unfold_less_24px.svg', 24)
        .icon('settings', '/assets/icons/ic_settings_48px.svg', 48)
        .icon('clock', '/assets/icons/ic_query_builder_black_48px.svg', 48)
        .icon('account', '/assets/icons/ic_account_circle_black_48px.svg', 48);

    // Local storage setup.
    localStorageServiceProvider.setPrefix('diplomacy');

    // JWT/auth setup.
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

    // Hide ugly # in URL.
    $locationProvider.html5Mode(true);
}])
.run(['$rootScope', 'userService', 'socketService', function($rootScope, userService, socketService) {
    $rootScope.$on('$stateChangeStart', function(event, next) {
        var isRestricted = !!(next.data && next.data.restricted);

        $rootScope.isAuthenticated = userService.isAuthenticated();

        // if page is restricted and auth is bad, block entry to route
        if (isRestricted && !userService.isAuthenticated()) {
            event.preventDefault();
            console.log('State change blocked');
        }
        else if (!socketService.socket) {
            // Initialize socket voodoo.
            socketService.initialize();
        }
    });
}]);
