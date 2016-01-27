describe('Game list item directive', function() {
    'use strict';

    var sinon = require('sinon'),
        sinonStubPromise = require('sinon-stub-promise')(sinon),
        el,
        scope,
        mockService;

    beforeEach(function() {
        angular.mock.module('templates');
        angular.mock.module('ui.router');
        angular.mock.module('gameService', function($provide) {
            $provide.value('gameService', mockService);
        });
        angular.mock.module('gamelistitem.directive');

        mockService = {
            getMoveDataForCurrentUser: sinon.stub().returnsPromise()
        };
    });

    beforeEach(function() {
        inject(function($injector, $compile, $rootScope, $q) {
            scope = $rootScope;

            scope.game = {
                variant: 'Standard',
                movementClock: 24
            };
            scope.variant = { name: 'Standard' };
            el = $compile('<sg-game-list-item game="game" variant="variant" joinable="false"></sg-game-list-item>')(scope);

            scope.$digest();
        });
    });

    it.only('fetches recent season data', function() {
        mockService.getMoveDataForCurrentUser.resolves({ season: 'Spring Movement 1901' });
        expect(mockService.getMoveDataForCurrentUser()).to.be.fulfilled;
        //expect($('#seasonDescription')).to.have.text('Spring Movement 1901');
    });
});

// expect(mockService.getMoveDataForCurrentUser()).to.eventually.have.property('season');
