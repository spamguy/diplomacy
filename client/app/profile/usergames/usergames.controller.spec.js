describe('User games controller', function() {
    'use strict';

    var scope,
        createController,
        mockGameService,
        games,
        currentUser,
        gmGames;

    beforeEach(function() {
        mockGameService = {
            getVariant: sinon.spy()
        };
        games = [{
            name: 'Game 1',
            variant: 'Standard'
        }, {
            name: 'Game 2',
            variant: 'Standard'
        }, {
            name: 'Game 3',
            variant: 'Standard'
        }, {
            name: 'Chromatic Game',
            variant: 'Chromatic'
        }];
        gmGames = [ ];
        currentUser = {
            _id: '123'
        };

        angular.mock.module('profile');
        angular.mock.module('gameService', function($provide) {
            $provide.value('gameService', mockGameService);
        });

        inject(function($controller, $rootScope) {
            scope = $rootScope.$new();
            createController = function(theGames, theGmGames, theCurrentUser) {
                return $controller('UserGamesController', {
                    $scope: scope,
                    games: theGames,
                    gmGames: theGmGames,
                    currentUser: theCurrentUser
                });
            };
        });
    });

    it('lists the correct number of games being played', function() {
        createController(games, gmGames, currentUser);
        scope.$digest();
        expect(scope.playing).to.have.lengthOf(4);
    });

    it('fetches each distinct variant only once', function() {
        createController(games, gmGames, currentUser);
        scope.$digest();
        expect(scope.variants).to.have.all.keys(['Standard', 'Chromatic']);
        expect(mockGameService.getVariant.calledTwice).to.be.true;
    });
});
