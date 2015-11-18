describe('UserGamesController', function() {
    'use strict';
    var $q,
        $rootScope,
        $scope,
        mockService,
        deferred,
        deferred2,
        deferred3,
        //httpBackend,
        $state,
        $injector,
        games,
        variant;

    games = [
        { name: 'Game 1', variant: 'standard' },
        { name: 'Game 2', variant: 'standard' },
        { name: 'Game 3', variant: 'not-standard' }
    ];

    variant = { name: 'something' };

    beforeEach(module('templates'));
    beforeEach(module('profile'));

    beforeEach(inject(function(_$q_, _$rootScope_, _$state_, _$injector_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        $state = _$state_;
        $injector = _$injector_;
    }));

    beforeEach(inject(function($controller) {
        $scope = $rootScope.$new();
        mockService = {
            getAllForCurrentUser: function() {
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

        spyOn(mockService, 'getAllForCurrentUser').and.callThrough();
        spyOn(mockService, 'getMoveDataForCurrentUser').and.callThrough();
        spyOn(mockService, 'getVariant').and.callThrough();
    }));

    beforeEach(inject(function($rootScope, $controller, $q) {
        $scope = $rootScope.$new();
        $controller('UserGamesController', { $scope: $scope, gameService: mockService, games: games });
    }));

    xit('resolves game data', function() {
        $state.go('profile.games');

        $rootScope.$digest();
        $injector.invoke($state.get('profile.games').resolve.games).then(function(result) {
            expect(result.length).toBe(games.length);
        });
    });

    // one call for 'standard', one for 'not-standard'
    it('fetches variant data once per distinct variant', function() {
        $state.go('profile.games');

        $rootScope.$digest();

        deferred3.promise.then(function(moves) {
            expect(mockService.getVariant.calls.count()).toEqual(2);
        });
    });
});
