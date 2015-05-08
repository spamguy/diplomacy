'use strict';

describe('gameService', function () {
    var scope,
        httpBackend, // $http mock
        gameService;

    // load the service's module
    beforeEach(module('gameService'));

    // TODO: Restangularise this
    beforeEach(function() {
        inject(function ($injector, $rootScope, $compile, $q, $timeout) {
            scope = $rootScope;
            httpBackend = $injector.get('$httpBackend');
            httpBackend.whenGET(/\/api\/games\/.+?\//).respond([{ name: 'game1' }, { name: 'game2' }, { name: 'game3' }]);
            gameService = $injector.get('gameService');
        });
    });

    it('should return gameService', function () {
        expect(!!gameService).toBe(true);
    });
});
