describe('gameService', function() {
    'use strict';

    var gameService,
        mockUserService,
        socketFactory,
        socket,
        game;

    beforeEach(function() {
        mockUserService = {
            getCurrentUserID: function() { return '789'; }
        };
        angular.mock.module('userService', function($provide) {
            $provide.value('userService', mockUserService);
        });
        angular.mock.module('diplomacy.constants');
        angular.mock.module('gameService');

        game = {
            gm_id: '116',
            players: [{
                player_id: '123',
                power: 'Q'
            }, {
                player_id: '456',
                power: 'Z'
            }, {
                player_id: '789',
                power: 'N'
            }, {
                player_id: '666',
                power: 'B'
            }]
        };

        inject(function($rootScope, _socketFactory_, _socketService_, _gameService_) {
            socketFactory = _socketFactory_;
            gameService = _gameService_;
            socket = socketFactory();
            _socketService_.socket = socket;
        });
    });

    it('gets all games for the current user', function() {
        // var gameListPromise = sinon.stub().returnsPromise();
        // gameListPromise.resolves([{ name: 'Game 1' }, { name: 'Game 2' }]);
        // socket.setEmit('game:userlist', [1,2,3]);
        // // socket.receive('game:userlist', { playerID: 123 }, gameListPromise);
        // expect(gameService.getAllGamesForCurrentUser()).to.eventually.have.length(3);
    });

    it('normalises variant names as lowercase and without spaces', function() {
        expect(gameService.getNormalisedVariantName('Very lONG variant NAME')).to.equal('verylongvariantname');
    });

    it('creates new games', function() {
        gameService.createNewGame({ });

        expect(socket.emits).to.contain.keys('game:create');
    });

    it('gets the current player\'s power in a game', function() {
        expect(gameService.getPowerOfCurrentUserInGame(game)).to.equal('N');
    });

    it('identifies the user in the correct game role', function() {
        expect(gameService.isPlayer(game)).to.be.true;
        expect(gameService.isGM(game)).to.be.false;
    });

    it('identifies whether the current user participates in some way', function() {
        expect(gameService.isParticipant(game)).to.be.true;
    });

    describe('getUnitOwnerInRegion()', function() {
        var phase;
        beforeEach(function() {
            phase = {
                regions: [{
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

        it('finds units in occupied regions/subregions', function() {
            for (var i = 0; i < phase.regions.length; i++)
                expect(gameService.getUnitOwnerInRegion(phase.regions[i])).not.to.be.null;
        });

        it('returns null in unoccupied regions', function() {
            phase.regions.push({ r: 'TRI' });
            phase.regions.push({ r: 'SPA', sr: [{ r: 'NC' }, { r: 'SC' }] });
            for (var i = 0; i < phase.regions.length; i++) {
                if (i > 3)
                    expect(gameService.getUnitOwnerInRegion(phase.regions[i])).to.be.null;
            }
        });

        it('filters by type if supplied', function() {
            expect(gameService.getUnitOwnerInRegion(phase.regions[0], 1)).not.to.be.null;
            expect(gameService.getUnitOwnerInRegion(phase.regions[0], 2)).to.be.null;
        });

        it('filters by power if supplied', function() {
            expect(gameService.getUnitOwnerInRegion(phase.regions[1], null, 'A')).not.to.be.null;
            expect(gameService.getUnitOwnerInRegion(phase.regions[1], null, 'I')).to.be.null;
        });
    });
});
