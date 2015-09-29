'use strict';

describe('Map directive', function () {
    var scope,
        el;

    beforeEach(function() {
        module('map.directive');
    });

    beforeEach(function() {
        inject(function ($injector, $rootScope, $compile, $q) {
            scope = $rootScope;

            scope.variant = {
                data: {
                    name: 'Standard'
                }
            };
            scope.season = [];
            scope.readonly = true;

            el = $compile('<sg-map variant="variant" season="season" readonly="readonly" />')(scope);

            scope.$digest();
        });
    });

    it('registers data passed in', function() {
        var isolated = el.isolateScope();
        expect(isolated.readonly).toBe(true);
        expect(isolated.variant.data.name).toBe('Standard');
    });
});
