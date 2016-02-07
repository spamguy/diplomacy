describe('UserGamesController', function() {
    'use strict';
    var $q,
        $rootScope,
        $scope,
        mockService,
        deferred,
        deferred2,
        deferred3,
        $state,
        $injector,
        games;

    games = [
        { name: 'Game 1', variant: 'standard' },
        { name: 'Game 2', variant: 'standard' },
        { name: 'Game 3', variant: 'not-standard' }
    ];

    beforeEach(function() {
        angular.mock.module('diplomacy.constants');
        angular.mock.module('templates');
        angular.mock.module('profile');

        inject(function(_$q_, _$rootScope_, _$state_, _$injector_) {
            $q = _$q_;
            $rootScope = _$rootScope_;
            $state = _$state_;
            $injector = _$injector_;
        });
    });

    beforeEach(inject(function($controller) {
        $scope = $rootScope.$new();
        mockService = {
            getAllGamesForCurrentUser: function() {
                deferred = $q.defer();
                return deferred.promise;
            },
            getMoveDataForCurrentUser: function() {
                deferred2 = $q.defer();
                return deferred2.promise;
            },
            getVariant: function() {
                deferred3 = $q.defer();
                return deferred3.promise;
            }
        };
    }));

    beforeEach(inject(function($rootScope, $controller, $q) {
        $scope = $rootScope.$new();
        $controller('UserGamesController', { $scope: $scope, gameService: mockService, games: games, gmGames: [ ], currentUser: { } });
    }));

    xit('resolves game data', function() {
        $state.go('profile.games');

        $rootScope.$digest();
        $injector.invoke($state.get('profile.games').resolve.games).then(function(result) {
            expect(result.length).to.equal(games.length);
        });
    });

    // one call for 'standard', one for 'not-standard'
    xit('fetches variant data once per distinct variant', function() {
        $state.go('profile.games');

        $rootScope.$digest();

        // deferred3.promise.then(function(moves) {
        //     expect(mockService.getVariant.calls.count()).to.equal(2);
        // });
    });
});
