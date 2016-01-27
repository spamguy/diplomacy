'use strict';

describe('userService', function() {
    var $scope,
        userService;

    beforeEach(angular.mock.module('userService'));
    beforeEach(angular.mock.module('socketService'));

    beforeEach(function() {
        inject(function($injector, $rootScope, $compile, $q, $timeout) {
            $scope = $rootScope;
            userService = $injector.get('userService');
        });
    });
});
