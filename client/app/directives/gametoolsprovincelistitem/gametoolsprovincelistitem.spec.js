describe('Province list item directive', function() {
    'use strict';

    var scope,
        el,
        compile;

    beforeEach(function() {
        angular.mock.module('templates');
        angular.mock.module('ui.router');
        angular.mock.module('gametoolsprovincelistitem.directive');

        inject(function($injector, $compile, $rootScope) {
            scope = $rootScope;
            compile = $compile;

            scope.province = {
                r: 'MOS'
            };
        });
    });

    it('contains the associated unit', function() {
        el = compile('<sg-province-list-item province="province" />')(scope);
        scope.$digest();
        expect($('div span', el).html()).to.contain('MOS');
    });
});
