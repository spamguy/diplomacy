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

    it('creates new games', function() {
        // TODO: Test reception of callback. Requires pull request to mock library.
        // socket.on('game:create', function(response) {
        //     console.log('Game created');
        //     socket.emit('game:create:success');
        // });

        gameService.createNewGame({ });

        expect(socket.emits).to.contain.keys('game:create');
    });
});
