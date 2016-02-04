describe('gameService', function() {
    'use strict';

    var gameService,
        socketFactory,
        socket;

    beforeEach(function() {
        angular.mock.module('diplomacy.constants');
        angular.mock.module('gameService');

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

    it('creates new games', function() {
        gameService.createNewGame({ });

        expect(socket.emits).to.contain.keys('game:create');
    });
});
