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
        .icon('menu', '/assets/icons/ic_more_vert_24px.svg', 24)
        .icon('addperson', '/assets/icons/ic_person_add_24px.svg', 24)
        .icon('play', '/assets/icons/ic_play_arrow_24px.svg', 24)
        .icon('eject', '/assets/icons/ic_eject_24px.svg', 24)
        .icon('join', '/assets/icons/ic_call_merge_24px.svg', 24)
        .icon('new', '/assets/icons/ic_add_24px.svg', 24)
        .icon('fold-out', '/assets/icons/ic_unfold_more_24px.svg', 24)
        .icon('fold-in', '/assets/icons/ic_unfold_less_24px.svg', 24)
        .icon('settings', '/assets/icons/ic_settings_48px.svg', 48);

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
        var isRestricted = !!(next.data && next.data.restricted);

        $rootScope.isAuthenticated = userService.isAuthenticated();

        // FIXME: this could probably go somewhere better
        if ($rootScope.isAuthenticated) {
            $rootScope.menuItems = [
                { sref: 'profile.gamelist', text: 'My games' },
                { sref: 'games.new', text: 'Start a new game' },
                { sref: 'games.list', text: 'Join a game' },
                { sref: 'main.logout', text: 'Log out' }
            ];
        }
        else {
            $rootScope.menuItems = [
                { sref: 'main.login', text: 'Log in' },
                { sref: 'main.signup', text: 'Register' }
            ];
        }

        // if page is restricted and auth is bad, block entry to route
        if (isRestricted && !userService.isAuthenticated()) {
            event.preventDefault();
            console.log('State change blocked');
        }
    });
}]);
