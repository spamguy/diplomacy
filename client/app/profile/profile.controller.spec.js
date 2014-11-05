describe('ProfileController', function () {
    'use strict';
    var scope, mockService, controller, q, deferred, httpBackend;

    // Load the module that the controller you are testing is in
    beforeEach(module('profile'));

    beforeEach(function() {
        mockService = {
            getAllForCurrentUser: function() {
                deferred = q.defer();
                // Place the fake return object here
                deferred.resolve([{ name: 'Game 1' }, { name: 'Game 2' }]);
                return deferred.promise;
            }
        };
        spyOn(mockService, 'getAllForCurrentUser').and.callThrough();
    });

    beforeEach(inject(function ($rootScope, $controller, $q, _$httpBackend_) {
        httpBackend = _$httpBackend_;

        // HACK: https://github.com/angular-ui/ui-router/issues/212
        httpBackend.whenGET('app/profile/profile.html').respond(200, '');
        httpBackend.whenGET('templates/profile/playing.tmpl.html').respond(200, '');
        httpBackend.whenGET('templates/profile/gming.tmpl.html').respond(200, '');

        scope = $rootScope.$new();
        q = $q;
        controller = $controller('ProfileController', { $scope: scope, gameService: mockService });
    }));

    afterEach(function() {
        httpBackend.flush(); // You'll want to add this to confirm things are working
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    it('should have an empty game list by default', function() {
        expect(scope.playing.length).toEqual(0);
    });

    it('fetches a list of games', function() {
        expect(mockService.getAllForCurrentUser).toHaveBeenCalled();

        deferred.promise.then(function(games) {
            expect(games).toEqual([{ name: 'Game 1' }, { name: 'Game 2' }]);
        });
    });
});