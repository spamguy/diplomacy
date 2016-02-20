describe('Games module', function() {
    'use strict';

    var mockUserService,
        $state;

    beforeEach(function() {
        mockUserService = {
            getUser: sinon.stub().returnsPromise(),
            getCurrentUser: function() { return '123'; }
        };

        mockUserService.getUser.resolves({
            _id: '123'
        });

        angular.mock.module('games', function($provide) {
            $provide.value('userService', mockUserService);
        });

        inject(function(_$state_, _$injector_) {
            $state = _$state_;
        });
    });

    it('resolves URLs', function() {
        expect($state.href('games.list')).to.equal('#/games');
        expect($state.href('games.view', { id: '55d33430c9e0fa7a0c762b9a' })).to.equal('#/games/55d33430c9e0fa7a0c762b9a');
    });
});
