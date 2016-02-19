describe('userService', function() {
    'use strict';

    var $rootScope,
        userService;

    beforeEach(function() {
        angular.mock.module('diplomacy.constants');
        angular.mock.module('userService');
        angular.mock.module('socketService');

        inject(function($injector, _$rootScope_, _userService_) {
            $rootScope = _$rootScope_;
            userService = _userService_;
        });
    });

    it('returns authentication status', function() {
        expect(userService.isAuthenticated()).to.be.false;

        $rootScope.currentUser = {
            _id: '12345'
        };

        expect(userService.isAuthenticated()).to.be.true;
    });
});
