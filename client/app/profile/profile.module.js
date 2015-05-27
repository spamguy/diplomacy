'use strict';

angular.module('profile', [
    'ui.router',
    'restangular',
    'gameService',
    'ngMaterial'
])
.config(['$stateProvider', '$urlRouterProvider', 'RestangularProvider', function ($stateProvider, $urlRouterProvider, RestangularProvider) {
    RestangularProvider.setBaseUrl('/api');

    //$urlRouterProvider.otherwise("/profile/playing");
    $stateProvider
    .state('profile', {
        url: '/profile',
        templateUrl: 'app/profile/profile.html',
        controller: 'ProfileController',
        data: {
            restricted: true
        },
        resolve: {
            gameService: 'gameService',

            games: function(gameService) {
                //socketService.emit('user:games');
                return gameService.getAllForCurrentUser();
            }
        }
    });
}]);
