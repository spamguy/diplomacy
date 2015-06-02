describe('ProfileController', function () {
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

    beforeEach(inject(function ($rootScope, $controller, $q) {
        //httpBackend = _$httpBackend_;

        // HACK: https://github.com/angular-ui/ui-router/issues/212
        //httpBackend.whenGET('app/profile/profile.html').respond(200, '');
        //httpBackend.whenGET('/api/users/games').respond(200, games);

        $scope = $rootScope.$new();
        $controller('ProfileController', { $scope: $scope, gameService: mockService, games: games });
    }));

    // afterEach(function() {
    //     httpBackend.flush();
    //     httpBackend.verifyNoOutstandingExpectation();
    //     httpBackend.verifyNoOutstandingRequest();
    // });

    it('resolves game data', function() {
        $state.go('profile');

        $rootScope.$digest();

        $injector.invoke($state.get('profile').resolve.games).then(function(result) {
            expect(result.length).toBe(games.length);
        });
    });

    // one call for 'standard', one for 'not-standard'
    it('fetches variant data once per distinct variant', function() {
        $state.go('profile');

        $rootScope.$digest();

        deferred3.promise.then(function(moves) {
            expect(mockService.getVariant.calls.count()).toEqual(2);
        });
    });
});
