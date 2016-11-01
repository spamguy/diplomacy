'use strict';

angular.module('diplomacy', [
    'diplomacy.constants',
    'ui.router',
    'angular-jwt',
    'userService',
    'gameService',
    'games',
    'diplomacy.main',
    'profile',
    'map.component',
    'gamelistitem.directive',
    'ngMaterial',
    'ngStorage',
    'socketService'
])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', 'jwtInterceptorProvider', '$localStorageProvider', '$mdThemingProvider', '$mdIconProvider',
function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, jwtInterceptorProvider, $localStorageProvider, $mdThemingProvider, $mdIconProvider) {
    $urlRouterProvider.otherwise('/main/home');

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
        .icon('account', '/assets/icons/ic_account_circle_black_48px.svg', 48)
        .icon('calendar', '/assets/icons/ic_date_range_black_48px.svg', 48)
        .icon('map', '/assets/icons/ic_map_black_48px.svg', 48)
        .icon('first', '/assets/icons/ic_first_page_black_48px.svg', 48)
        .icon('previous', '/assets/icons/ic_chevron_left_black_48px.svg', 48)
        .icon('next', '/assets/icons/ic_chevron_right_black_48px.svg', 48)
        .icon('last', '/assets/icons/ic_last_page_black_48px.svg', 48);

    // Local storage setup.
    $localStorageProvider.setKeyPrefix('diplomacy');

    // JWT/auth setup.
    jwtInterceptorProvider.tokenGetter = ['jwtHelper', '$rootScope', 'userService', function(jwtHelper, $rootScope, userService) {
        var oldToken = $rootScope.$storage.token;

        if (oldToken && jwtHelper.isTokenExpired(oldToken)) {
            console.log('Token is expired: ' + oldToken);
            $rootScope.logOut();
        }
        else {
            return oldToken;
        }
    }];
    $httpProvider.interceptors.push('jwtInterceptor');

    // Hide ugly # in URL.
    $locationProvider.html5Mode(true);
}])
.run(['socketService', function(socketService) {
    // Initialize socket voodoo if user is logged in but has refreshed page.
    if (!socketService.socket)
        socketService.initialize();
}]);
