describe('Game tools component', function() {
    'use strict';

    var scope,
        el,
        compile,
        mockUserService;

    beforeEach(function() {
        angular.mock.module('ui.router');
        angular.mock.module('diplomacy.constants');
        angular.mock.module('templates');
        angular.mock.module('gametools.component');
        mockUserService = {
            getCurrentUserID: function() {
                return '12345';
            }
        };
        angular.mock.module('userService', function($provide) {
            $provide.value('userService', mockUserService);
        });
        angular.mock.module('gameService');

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
                    },
                    'I': {
                        name: 'Italy'
                    }
                }
            };
            scope.game = {
                players: []
            };
            scope.phase = {
                provinces: [{
                    r: 'BUD',
                    unit: {
                        power: 'A',
                        type: 1
                    }
                }, {
                    r: 'HUN',
                    unit: {
                        power: 'A',
                        type: 1
                    }
                }, {
                    r: 'ROM',
                    unit: {
                        power: 'I',
                        type: 1
                    }
                }, {
                    r: 'BUL',
                    sr: [{
                        r: 'EC',
                        unit: {
                            power: 'A',
                            type: 2
                        }
                    }]
                }]
            };
        });
    });

    it('lists all powers when viewing as a GM', function() {
        scope.game.gm_id = '12345';
        el = compile('<sg-game-tools variant="variant" game="game" phase="phase" />')(scope);
        scope.$digest();
        expect($('div.md-subheader', el)).to.have.lengthOf(4);
    });

    it('only lists assigned power when viewing as a player', function() {
        scope.game.players.push({
            player_id: '12345',
            power: 'F'
        });
        el = compile('<sg-game-tools variant="variant" game="game" phase="phase" />')(scope);
        scope.$digest();
        expect($('div.md-subheader', el)).to.have.lengthOf(1);
        expect($('div.md-subheader', el).html()).to.contain('France');
    });
});
