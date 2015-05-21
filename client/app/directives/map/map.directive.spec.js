'use strict';

describe('Map directive', function () {
    var scope,
        el,
        mockService,
        deferred,
        deferred2,
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
            },
            getSeasonData: function() {
                deferred2 = q.defer();
                deferred2.resolve([]);
                return deferred2.promise;
            }
        };
        spyOn(mockService, 'getVariantData').and.callThrough();
    });

    beforeEach(function() {
        inject(function ($injector, $rootScope, $compile, $q) {
            //httpBackend = _$httpBackend_;
            //httpBackend.whenGET(/variants\/.+?\.svg/).respond(200, '<svg></svg>');

            scope = $rootScope;
            q = $q;

            scope.variant = mockService.getVariantData('standard');
            scope.season = mockService.getSeasonData();
            scope.readonly = true;

            el = $compile('<sg-map variant="variant" season="season" readonly="readonly" />')(scope);

            scope.$digest();
        });
    });

    it('gets variant data', function() {
        expect(mockService.getVariantData).toHaveBeenCalled();

        deferred.promise.then(function(variant) {
            expect(variant.data.name).toBe('standard');
        });
    });

    it('picks up the readonly flag', function() {
        var isolated = el.isolateScope();
        expect(isolated.readonly).toBe(true);
    });

    /* fit('gets the SVG map', function() {
        scope.$digest();
        httpBackend.flush();
    }); */
});
