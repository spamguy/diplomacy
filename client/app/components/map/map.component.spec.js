describe('Map component', function() {
    'use strict';

    var scope,
        compile,
        el;

    beforeEach(function() {
        angular.mock.module('diplomacy');
        angular.mock.module('templates');
        angular.mock.module('diplomacy.constants');
        angular.mock.module('map.component');
    });

    beforeEach(function() {
        inject(function($injector, $rootScope, $compile) {
            compile = $compile;
            scope = $rootScope;

            scope.game = {
                name: 'That Game',
                variant: 'Standard',
                phases: [{
                    year: 1901,
                    season: 'Spring Movement',
                    deadline: '2020-10-10',
                    provinces: {
                        STP: {
                        }
                    }
                }]
            };
            scope.readonly = true;
            scope.svg = new DOMParser().parseFromString('<svg height="1" width="1"><g id="mouseLayer"></g></svg>', 'image/svg+xml');
        });
    });

    describe('Map header', function() {
        it('is invisible when \'header\' flag is false', function() {
            el = compile('<sg-map game="game" readonly="readonly" svg="svg" header="false" />')(scope);
            scope.$digest();
            expect($('#mapToolbar', el)).to.have.lengthOf(0);
        });

        it('is invisible when there is no phase data', function() {
            scope.game.phases = null;
            el = compile('<sg-map game="game" readonly="readonly" svg="svg" header="true" />')(scope);
            scope.$digest();
            expect($('#mapToolbar', el)).to.have.lengthOf(0);
        });

        it('is visible when \'header\' flag is true and phase data is present', function() {
            el = compile('<sg-map game="game" readonly="readonly" phase-index="0" svg="svg" header="true" />')(scope);
            scope.$digest();
            expect($('#mapToolbar', el)).to.have.lengthOf(1);
        });
    });

    describe('SVG element', function() {
        it('creates an SVG element with expected attributes', function() {
            el = compile('<sg-map game="game" readonly="readonly" svg="svg" />')(scope);
            scope.$digest();
            expect($('svg', el)).to.have.lengthOf(1);
            expect($('svg', el)).to.have.prop('viewBox');
        });

        it('is slightly transparent when no phase is passed in', function() {
            scope.game.phases = null;

            el = compile('<sg-map game="game" readonly="readonly" svg="svg" />')(scope);
            scope.$digest();
            expect($('div.mapContainer', el)).to.have.class('notStarted');
        });

        it('is fully visible when a phase is passed in', function() {
            el = compile('<sg-map game="game" phase-index="0" readonly="readonly" svg="svg" />')(scope);
            scope.$digest();
            expect($('svg', el)).to.not.have.css('notStarted');
        });
    });
});
