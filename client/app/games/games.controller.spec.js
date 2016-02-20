describe('Open game list controller', function() {
    'use strict';

    var scope,
        createController,
        mockUserService,
        mockGameService,
        games;

    beforeEach(function() {
        mockUserService = {
            getCurrentUser: function() { return '123'; }
        };
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

        angular.mock.module('games');
        angular.mock.module('userService', function($provide) {
            $provide.value('userService', mockUserService);
        });
        angular.mock.module('gameService', function($provide) {
            $provide.value('gameService', mockGameService);
        });

        inject(function($controller, $rootScope) {
            scope = $rootScope.$new();
            createController = function(theGames) {
                return $controller('GameListController', {
                    $scope: scope,
                    openGames: theGames
                });
            };
        });
    });

    it('lists the correct number of games', function() {
        createController(games);
        scope.$digest();
        expect(scope.games).to.have.lengthOf(4);
    });

    it('fetches each distinct variant only once', function() {
        createController(games);
        scope.$digest();
        expect(scope.variants).to.have.all.keys(['Standard', 'Chromatic']);
        expect(mockGameService.getVariant.calledTwice).to.be.true;
    });
});
