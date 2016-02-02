describe('Game list item directive', function() {
    'use strict';

    var moment = require('moment'),
        el,
        compile,
        scope,
        mockService,
        sampleSeason = {
            season: 'Spring Movement',
            year: 1901,
            deadline: moment.utc().add({ days: 1, hours: 2, minutes: 3 })
        };
    require('sinon-stub-promise')(sinon);

    beforeEach(function() {
        angular.mock.module('templates');
        angular.mock.module('ui.router');
        angular.mock.module('gamelistitem.directive');

        mockService = {
            getMoveDataForCurrentUser: sinon.stub().returnsPromise()
        };
        mockService.getMoveDataForCurrentUser.resolves(sampleSeason);

        angular.mock.module('gameService', function($provide) {
            $provide.value('gameService', mockService);
        });
    });

    beforeEach(function() {
        inject(function($injector, $compile, $rootScope) {
            scope = $rootScope;
            compile = $compile;

            scope.game = {
                variant: 'Standard',
                movementClock: 24
            };
            scope.variant = { name: 'Standard' };
        });
    });

    it('displays the correct season and year', function() {
        el = compile('<sg-game-list-item game="game" variant="variant" joinable="false"></sg-game-list-item>')(scope);
        scope.$digest();
        expect(el.isolateScope().seasonDescription).to.equal('Spring Movement 1901');
    });

    it('displays the largest two units in deadline', function() {
        el = compile('<sg-game-list-item game="game" variant="variant" joinable="false"></sg-game-list-item>')(scope);
        scope.$digest();
        expect(el.isolateScope().readableTimer).to.equal('1 day, 2 hours');
    });

    it('rounds off seconds in deadline', function() {
        sampleSeason.deadline = moment.utc().add({ minutes: 3, seconds: 12, milliseconds: 144 });
        el = compile('<sg-game-list-item game="game" variant="variant" joinable="false"></sg-game-list-item>')(scope);
        scope.$digest();
        expect(el.isolateScope().readableTimer).to.equal('3 minutes, 12 seconds');
    });
});
