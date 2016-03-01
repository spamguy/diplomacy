describe('Map directive', function() {
    'use strict';

    var scope,
        compile,
        el;

    beforeEach(function() {
        angular.mock.module('templates');
        angular.mock.module('diplomacy.constants');
        angular.mock.module('map.directive');
        angular.mock.module('SVGService', function($provide) {
            $provide.value('SVGService', {
                getStar: function() {
                    return new DOMParser().parseFromString('<svg height="1" width="1"></svg>', 'image/svg+xml');
                }
            });
        });
    });

    beforeEach(function() {
        inject(function($injector, $rootScope, $compile) {
            compile = $compile;
            scope = $rootScope;

            scope.variant = {
                name: 'Standard'
            };
            scope.season = {
                year: 1901,
                season: 'Spring Movement',
                regions: [{ r: 'A' }, { r: 'B' }]
            };
            scope.game = {
                name: 'That Game'
            };
            scope.readonly = true;
            scope.svg = new DOMParser().parseFromString('<svg height="1" width="1"><g id="mouseLayer"></g></svg>', 'image/svg+xml');
        });
    });

    describe('SVG element', function() {
        it('creates an SVG element with expected attributes', function() {
            el = compile('<sg-map game="game" variant="variant" season="season" readonly="readonly" svg="svg" />')(scope);
            scope.$digest();
            expect($('svg', el)).to.have.lengthOf(1);
            expect($('svg', el)).to.have.prop('viewBox');
            expect($('svg', el)).to.have.attr('opacity');
        });

        it('is slightly transparent when no season is passed in', function() {
            scope.season = null;

            el = compile('<sg-map game="game" variant="variant" season="season" readonly="readonly" svg="svg" />')(scope);
            scope.$digest();
            expect($('svg', el)).to.have.attr('opacity', '0.3');
        });

        it('is fully visible when a season is passed in', function() {
            el = compile('<sg-map game="game" variant="variant" season="season" readonly="readonly" svg="svg" />')(scope);
            scope.$digest();
            expect($('svg', el)).to.have.attr('opacity', '1');
        });
    });
});
