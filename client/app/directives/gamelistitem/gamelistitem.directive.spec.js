describe('Map directive', function() {
    'use strict';

    var el,
        scope,
        mockService,
        deferred,
        deferred2,
        q;

    beforeEach(function() {
        module('templates');
        module('ui.router');
        module('gamelistitem.directive');
    });

    beforeEach(function() {
        mockService = {
            getVariantData: function(name) {
                deferred = q.defer();
                deferred.resolve({
                    data: {
                        name: 'standard'
                    }
                });
                return deferred.promise;
            }
        };
        spyOn(mockService, 'getVariantData').and.callThrough();
    });

    beforeEach(function() {
        inject(function($injector, $compile, $rootScope, $q) {
            q = $q;
            scope = $rootScope;

            scope.game = {
                variant: 'Standard',
                movementClock: 1440
            };
            scope.variant = mockService.getVariantData();
            el = $compile('<sg-game-list-item game="game" variant="variant" joinable="false"></sg-game-list-item>')(scope);

            scope.$digest();
        });
    });

    it('loads variant info', function() {
        expect(mockService.getVariantData).toHaveBeenCalled();
    });

    it('lists the game\'s variant', function() {
        expect($('#variantDescription', $(el))).toContainText('Standard');
    });
});
