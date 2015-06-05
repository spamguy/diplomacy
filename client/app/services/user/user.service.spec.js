'use strict';

describe('userService', function () {
    var $scope,
        $httpBackend, // $http mock
        userService;

    beforeEach(module('userService'));
    beforeEach(module('socketService'));

    beforeEach(function() {
        inject(function ($injector, $rootScope, $compile, $q, $timeout) {
            $scope = $rootScope;
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.whenGET(/users\/.+?\/exists/).respond({ exists: true });
            userService = $injector.get('userService');
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
   });

   it('should return JSON with the property "exists"', function() {
        userService.userExists('sample_username').then(function(data) {
            expect(data.exists).toBeDefined();
        });
        $httpBackend.flush();
   });
});
