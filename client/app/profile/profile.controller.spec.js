describe('ProfileController', function () {
    'use strict';
    var $q,
        $rootScope,
        $scope,
        mockService,
        deferred,
        deferred2,
        deferred3,
        httpBackend;

    // Load the module that the controller you are testing is in
    beforeEach(module('profile'));

    beforeEach(inject(function(_$q_, _$rootScope_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
    }));

    beforeEach(inject(function($controller) {
        $scope = $rootScope.$new();
        mockService = {
            getAllForCurrentUser: function() {
                deferred = $q.defer();
                return deferred.promise;
                // Place the fake return object here
                // deferred.resolve([
                //     { name: 'Game 1', variant: 'standard' },
                //     { name: 'Game 2', variant: 'standard' },
                //     { name: 'Game 3', variant: 'not-standard'}
                // ]);
                // return deferred.promise;
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

    beforeEach(inject(function ($rootScope, $controller, $q, _$httpBackend_) {
        httpBackend = _$httpBackend_;

        // HACK: https://github.com/angular-ui/ui-router/issues/212
        httpBackend.whenGET('app/profile/profile.html').respond(200, '');
        httpBackend.whenGET('templates/profile/playing.tmpl.html').respond(200, '');
        httpBackend.whenGET('templates/profile/gming.tmpl.html').respond(200, '');

        $scope = $rootScope.$new();
        $controller('ProfileController', { $scope: $scope, gameService: mockService });
    }));

    afterEach(function() {
        httpBackend.flush();
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    it('should have an empty game list by default', function() {
        expect($scope.playing.length).toEqual(0);
    });

    it('fetches a list of games', function() {
        deferred.resolve([
            { name: 'Game 1', variant: 'standard' },
            { name: 'Game 2', variant: 'standard' },
            { name: 'Game 3', variant: 'not-standard'}
        ]);
        $rootScope.$apply();

        deferred.promise.then(function(games) {
            expect(games.length).toEqual(3);
        });
    });

    // one call for 'standard', one for 'not-standard'
    it('fetches variant data once per distinct variant', function() {
        deferred3.resolve();
        $rootScope.$apply();

        deferred3.promise.then(function(moves) {
            expect(mockService.getVariant.calls.count()).toEqual(2);
        });
    });
});
