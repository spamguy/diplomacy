'use strict';

describe('map.directives', function () {
    var scope,
        el,
        mockService,
        deferred,
        q;

    beforeEach(function() {
        module('map.directives');
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
        inject(function ($injector, $rootScope, $compile, $q, _$timeout_) {
            scope = $rootScope.$new();
            q = $q;

            scope.variant = mockService.getVariantData('standard');
            scope.readonly = true;

            el = $compile('<sg-map variant="variant" readonly="readonly" />')(scope);
        });
    });

    it('gets variant data', function() {
        scope.readonly = true;
        scope.$digest();

        expect(mockService.getVariantData).toHaveBeenCalled();

        deferred.promise.then(function(variant) {
            expect(variant.name).toBe('standard');
        });
    });

    it('picks up the readonly flag', function() {
        scope.readonly = true;
        scope.$digest();

        var isolated = el.isolateScope();
        expect(isolated.readonly).toBe(true);
    });
});
