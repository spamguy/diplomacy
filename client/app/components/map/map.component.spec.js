describe('Map component', function() {
    'use strict';

    var scope,
        compile,
        el;

    beforeEach(function() {
        angular.mock.module('templates');
        angular.mock.module('diplomacy.constants');
        angular.mock.module('map.component');
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

    describe('Map header', function() {
        it('is invisible when \'header\' flag is false', function() {
            el = compile('<sg-map game="game" variant="variant" season="season" readonly="readonly" svg="svg" header="false" />')(scope);
            scope.$digest();
            expect($('#mapToolbar', el)).to.have.lengthOf(0);
        });

        it('is invisible when there is no season data', function() {
            scope.season = null;
            el = compile('<sg-map game="game" variant="variant" season="season" readonly="readonly" svg="svg" header="true" />')(scope);
            scope.$digest();
            expect($('#mapToolbar', el)).to.have.lengthOf(0);
        });

        it('is visible when \'header\' flag is true and season data is present', function() {
            el = compile('<sg-map game="game" variant="variant" season="season" readonly="readonly" svg="svg" header="true" />')(scope);
            scope.$digest();
            expect($('#mapToolbar', el)).to.have.lengthOf(1);
        });
    });

    describe('SVG element', function() {
        it('creates an SVG element with expected attributes', function() {
            el = compile('<sg-map game="game" variant="variant" season="season" readonly="readonly" svg="svg" />')(scope);
            scope.$digest();
            expect($('svg', el)).to.have.lengthOf(1);
            expect($('svg', el)).to.have.prop('viewBox');
        });

        it('is slightly transparent when no season is passed in', function() {
            scope.season = null;

            el = compile('<sg-map game="game" variant="variant" season="season" readonly="readonly" svg="svg" />')(scope);
            scope.$digest();
            expect($('div.mapContainer', el)).to.have.class('notStarted');
        });

        it('is fully visible when a season is passed in', function() {
            el = compile('<sg-map game="game" variant="variant" season="season" readonly="readonly" svg="svg" />')(scope);
            scope.$digest();
            expect($('svg', el)).to.not.have.css('notStarted');
        });
    });
});
