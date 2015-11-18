'use strict';

describe('AppController', function() {
    var AppController,
        scope;

    beforeEach(module('diplomacy'));

    beforeEach(inject(function($controller, $rootScope) {
        scope = $rootScope.$new();
        AppController = $controller('AppController', {
            $scope: scope
        });

        scope.$digest();
    }));
});
