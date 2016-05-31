describe('Game view controller', function() {
    'use strict';

    var scope,
        mockUserService,
        mockGameService,
        variant,
        game,
        phase,
        svg,
        createController;

    beforeEach(function() {
        variant = {

        };
        phase = {

        };
        game = {
            gm_id: '123'
        };
        svg = { data: new DOMParser().parseFromString('<svg><g id="mouseLayer"></g></svg>', 'image/svg+xml') };

        mockUserService = {
            getCurrentUserID: function() { return '123'; }
        };
        mockGameService = {

        };
        angular.mock.module('userService', function($provide) {
            $provide.value('userService', mockUserService);
        });
        angular.mock.module('gameService', function($provide) {
            $provide.value('gameService', mockGameService);
        });
        angular.mock.module('games');

        inject(function($controller, $rootScope) {
            scope = $rootScope.$new();
            createController = function(theVariant, theGame, thePhase, theSVG) {
                return $controller('ViewController', {
                    $scope: scope,
                    variant: theVariant,
                    phase: thePhase,
                    game: theGame,
                    svg: theSVG
                });
            };
        });
    });

    describe('Read-only status', function() {
        it('is read-only for GMs', function() {
            createController(variant, game, phase, svg);
            scope.$digest();
            expect(scope.readonly).to.be.true;
        });

        it('is not read-only for players', function() {
            game.gm_id = '666';
            createController(variant, game, phase, svg);
            scope.$digest();
            expect(scope.readonly).to.be.false;
        });
    });
});
