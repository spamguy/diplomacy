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
    'socketService',
    'socketAuthService'
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
        .icon('menu', '/bower_components/material-design-icons/navigation/svg/production/ic_more_vert_24px.svg', 24)
        .icon('addperson', '/bower_components/material-design-icons/social/svg/production/ic_person_add_24px.svg', 24)
        .icon('play', '/bower_components/material-design-icons/av/svg/production/ic_play_arrow_24px.svg', 24)
        .icon('eject', '/bower_components/material-design-icons/action/svg/production/ic_eject_24px.svg', 24)
        .icon('join', '/bower_components/material-design-icons/communication/svg/production/ic_call_merge_24px.svg', 24)
        .icon('new', '/bower_components/material-design-icons/content/svg/production/ic_add_24px.svg', 24)
        .icon('fold-out', '/bower_components/material-design-icons/navigation/svg/production/ic_unfold_more_24px.svg', 24)
        .icon('fold-in', '/bower_components/material-design-icons/navigation/svg/production/ic_unfold_less_24px.svg', 24);

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
.run(['$rootScope', 'userService', 'socketService', function ($rootScope, userService, socketService) {
    $rootScope.$on('$stateChangeStart', function (event, next) {
        if (!socketService.socket)
            socketService.initialize();
            
        var isRestricted = !!(next.data && next.data.restricted);

        $rootScope.isAuthenticated = userService.isAuthenticated();

        // if page is restricted and auth is bad, block entry to route
        if (isRestricted && !userService.isAuthenticated()) {
            event.preventDefault();
            console.log('State change blocked');
        }
    });
}]);
