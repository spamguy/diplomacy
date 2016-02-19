describe('Game tools directive', function() {
    'use strict';

    var scope,
        el,
        compile,
        mockUserService;

    beforeEach(function() {
        angular.mock.module('templates');
        angular.mock.module('gametools.directive');
        mockUserService = {
            getCurrentUser: function() {
                return {
                    _id: '12345'
                };
            }
        };
        angular.mock.module('userService', function($provide) {
            $provide.value('userService', mockUserService);
        });

        inject(function($injector, $compile, $rootScope) {
            compile = $compile;
            scope = $rootScope.$new();

            scope.variant = {
                powers: {
                    'A': {
                        name: 'Austria'
                    },
                    'E': {
                        name: 'England'
                    },
                    'F': {
                        name: 'France'
                    }
                }
            };
            scope.game = {
                players: []
            };
            scope.season = {
                moves: [{
                    r: 'BUD',
                    unit: {
                        power: 'A',
                        type: 1
                    }
                }]
            };
        });
    });

    it('lists all powers when viewing as a GM', function() {
        scope.game.gm_id = '12345';
        el = compile('<sg-game-tools variant="variant" game="game" season="season" />')(scope);
        scope.$digest();
        expect($('md-subheader', el)).to.have.length(3);
    });

    it('only lists assigned power when viewing as a player', function() {
        scope.game.players.push({
            player_id: '12345',
            power: 'F'
        });
        el = compile('<sg-game-tools variant="variant" game="game" season="season" />')(scope);
        scope.$digest();
        expect($('md-subheader', el)).to.have.length(1);
        expect($('md-subheader', el).html()).to.equal('France');
    });
});
