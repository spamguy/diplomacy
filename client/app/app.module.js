'use strict';

angular.module('diplomacy', [
	'ui.router',
	'ui.bootstrap',
	'LocalStorageModule',
	'angular-jwt',
	'd3',
	'userService',
	'gameService',
	'games',
	'diplomacy.main',
	'profile',
	'map.directives'
])
.config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, jwtInterceptorProvider, localStorageServiceProvider) {
	localStorageServiceProvider.setPrefix('diplomacy');

	jwtInterceptorProvider.tokenGetter = function(jwtHelper, $http, userService) {
		var oldToken = userService.getToken();

		if (oldToken && jwtHelper.isTokenExpired(oldToken)) {
			return $http({
				url: '/auth/refresh',
				refresh_token: userService.getRefreshToken(),
				id: userService.getCurrentUser()
			})
			.then(function(newToken) {
				userService.setToken(newToken);
			});
		}
		else {
			return oldToken;	
		}
	};
	$httpProvider.interceptors.push('jwtInterceptor');
	
	$urlRouterProvider
		.otherwise('/');

	$locationProvider.html5Mode(true);
})
  .run(function ($rootScope, AUTH_EVENTS, userService) {
	  $rootScope.$on('$stateChangeStart', function (event, next) {
	  	var isRestricted = !!(next.data && next.data.restricted);
	  	// if page is restricted and auth is bad, block entry to route
	      if (isRestricted && !userService.isAuthenticated()) {
	      	event.preventDefault();
	        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
	      }
	  });
	})
.constant('AUTH_EVENTS', { // courtesy https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec
	loginSuccess: 'auth-login-success',
	loginFailed: 'auth-login-failed',
	logoutSuccess: 'auth-logout-success',
	sessionTimeout: 'auth-session-timeout',
	notAuthenticated: 'auth-not-authenticated',
	notAuthorized: 'auth-not-authorized'
});