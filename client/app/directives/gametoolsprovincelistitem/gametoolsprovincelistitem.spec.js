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
                r: 'MOS',
                unit: {
                    type: 1,
                    power: 'R',
                    order: {
                        action: 'hold'
                    }
                }
            };
        });
    });

    it('contains the associated unit', function() {
        el = compile('<sg-province-list-item province="province" />')(scope);
        scope.$digest();
        expect($('div span', el).html()).to.contain('MOS');
    });

    it('reports hold orders', function() {
        el = compile('<sg-province-list-item province="province" />')(scope);
        scope.$digest();
        expect($('div span', el).html()).to.equal('<strong>MOS</strong> holds');
    });

    it('reports move orders', function() {
        scope.province.unit.order = {
            action: 'move',
            y1: 'STP'
        };
        el = compile('<sg-province-list-item province="province" />')(scope);
        scope.$digest();
        expect($('div span', el).html()).to.equal('<strong>MOS</strong> → <strong>STP</strong>');
    });

    it('reports orders supporting a holding target', function() {
        scope.province.unit.order = {
            action: 'support',
            y1: 'STP'
        };
        el = compile('<sg-province-list-item province="province" />')(scope);
        scope.$digest();
        expect($('div span', el).html()).to.equal('<strong>MOS</strong> supports <strong>STP</strong> ');
    });

    it('reports orders supporting a moving target', function() {
        scope.province.unit.order = {
            action: 'support',
            y1: 'STP',
            y2: 'LVN'
        };
        el = compile('<sg-province-list-item province="province" />')(scope);
        scope.$digest();
        expect($('div span', el).html()).to.equal('<strong>MOS</strong> supports <strong>STP</strong> → <strong>LVN</strong>');
    });

    it('reports convoy orders', function() {
        scope.province.r = 'MOS';
        scope.province.unit.order = {
            action: 'convoy',
            y1: ['BAR', 'NRG', 'NTH', 'DEN']
        };
        el = compile('<sg-province-list-item province="province" />')(scope);
        scope.$digest();
        expect($('div span', el).html()).to.equal('<strong>MOS</strong> ~ <strong>DEN</strong>');
    });

    it('reports disband orders', function() {
        scope.province.unit.order = {
            action: 'disband'
        };
        el = compile('<sg-province-list-item province="province" />')(scope);
        scope.$digest();
        expect($('div span', el).html()).to.equal('<strong>MOS</strong> disbands');
    });
});
