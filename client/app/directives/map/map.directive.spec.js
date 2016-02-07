describe('Map directive', function() {
    'use strict';

    var scope,
        el;

    beforeEach(function() {
        angular.mock.module('templates');
        angular.mock.module('diplomacy.constants');
        angular.mock.module('map.directive');
    });

    beforeEach(function() {
        inject(function($injector, $rootScope, $compile, $q) {
            scope = $rootScope;

            scope.variant = {
                data: {
                    name: 'Standard'
                }
            };
            scope.season = {
                year: 1901,
                season: 'Spring Movement'
            };
            scope.readonly = true;

            el = $compile('<sg-map variant="variant" season="season" readonly="readonly" />')(scope);

            scope.$digest();
        });
    });

    it('retains data passed in', function() {
        var isolated = el.isolateScope();
        expect(isolated.readonly).to.equal(true);
        expect(isolated.variant.data.name).to.equal('Standard');
    });
});
