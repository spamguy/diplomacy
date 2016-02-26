xdescribe('Map directive', function() {
    'use strict';

    var scope,
        compile,
        el,
        httpBackend;

    beforeEach(function() {
        angular.mock.module('templates');
        angular.mock.module('diplomacy.constants');
        angular.mock.module('map.directive');
    });

    beforeEach(function() {
        inject(function($injector, $rootScope, $compile, $httpBackend) {
            compile = $compile;
            scope = $rootScope;
            httpBackend = $httpBackend;

            scope.variant = {
                name: 'Standard'
            };
            scope.season = {
                year: 1901,
                season: 'Spring Movement'
            };
            scope.readonly = true;
            scope.svg = new DOMParser().parseFromString('<svg height="1" width="1"><g id="mouseLayer"></g></svg>', 'image/svg+xml');
        });
    });

    describe('SVG element', function() {
        it('creates an SVG element', function() {
            el = compile('<sg-map variant="variant" season="season" readonly="readonly" svg="svg" />')(scope);
            scope.$digest();
            httpBackend.flush();
            expect($('svg', el)).to.have.lengthOf(1);
        });

        it('is slightly transparent when no season is passed in', function() {
            scope.season = null;

            el = compile('<sg-map variant="variant" season="season" readonly="readonly" svg="svg" />')(scope);
            scope.$digest();
            expect($('svg', el)).to.have.prop('opacity', '0.3');
        });

        it('is fully visible when a season is passed in', function() {
            el = compile('<sg-map variant="variant" season="season" readonly="readonly" svg="svg" />')(scope);
            scope.$digest();
            expect($('svg', el)[0]).to.have.prop('opacity', 1);
        });
    });
});
