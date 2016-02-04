describe('Game list item directive', function() {
    'use strict';

    var moment = require('moment'),
        el,
        compile,
        scope,
        mockService,
        sampleSeason,
        sampleUser;

    beforeEach(function() {
        angular.mock.module('templates');
        angular.mock.module('ui.router');
        angular.mock.module('gamelistitem.directive');

        mockService = {
            getMoveDataForCurrentUser: sinon.stub().returnsPromise()
        };
        sampleSeason = {
            season: 'Spring Movement',
            year: 1901,
            deadline: moment.utc().add({ days: 1, hours: 2, minutes: 3 })
        };
        sampleUser = {
            _id: '123',
            points: 100
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
                movementClock: 24,
                minimumScoreToJoin: 1,
                gm_id: '666',
                players: [ ]
            };
            scope.variant = { name: 'Standard' };
            scope.user = sampleUser;
        });
    });

    it('displays the correct season and year', function() {
        el = compile('<sg-game-list-item game="game" variant="variant" joinable="false" user="user"></sg-game-list-item>')(scope);
        scope.$digest();
        expect(el.isolateScope().seasonDescription).to.equal('Spring Movement 1901');
    });

    it('displays the largest two units in deadline', function() {
        el = compile('<sg-game-list-item game="game" variant="variant" joinable="false" user="user"></sg-game-list-item>')(scope);
        scope.$digest();
        expect(el.isolateScope().readableTimer).to.equal('1 day, 2 hours');
    });

    it('rounds off seconds in deadline', function() {
        sampleSeason.deadline = moment.utc().add({ minutes: 3, seconds: 12, milliseconds: 144 });
        el = compile('<sg-game-list-item game="game" variant="variant" joinable="false" user="user"></sg-game-list-item>')(scope);
        scope.$digest();
        expect(el.isolateScope().readableTimer).to.equal('3 minutes, 12 seconds');
    });

    describe('\'Join\' button', function() {
        it('displays the button according to state of \'joinable\' flag', function() {
            // PART I: joinable = true.
            el = compile('<sg-game-list-item game="game" variant="variant" joinable="true" user="user"></sg-game-list-item>')(scope);
            scope.$digest();
            expect($('button', el)).to.have.length(1);

            // PART II: joinable = false.
            el = compile('<sg-game-list-item game="game" variant="variant" joinable="false" user="user"></sg-game-list-item>')(scope);
            scope.$digest();
            expect($('button', el)).to.have.length(0);
        });

        it('is disabled if player\'s score is too low', function() {
            // Part I: 100 points.
            el = compile('<sg-game-list-item game="game" variant="variant" joinable="true" user="user"></sg-game-list-item>')(scope);
            scope.$digest();
            expect($('button', el)).not.to.be.disabled;

            // PART II: -1 points.
            sampleUser.points = -1;
            el = compile('<sg-game-list-item game="game" variant="variant" joinable="true" user="user"></sg-game-list-item>')(scope);
            scope.$digest();
            expect($('button', el)).to.be.disabled;
        });

        it('is disabled if player is GM', function() {
            scope.game.gm_id = '123';
            el = compile('<sg-game-list-item game="game" variant="variant" joinable="true" user="user"></sg-game-list-item>')(scope);
            scope.$digest();
            expect($('button', el)).to.be.disabled;
        });

        it('is disabled if player is in game', function() {
            scope.game.players.push({ player_id: '123' });
            el = compile('<sg-game-list-item game="game" variant="variant" joinable="true" user="user"></sg-game-list-item>')(scope);
            scope.$digest();
            expect($('button', el)).to.be.disabled;
        });
    });
});
