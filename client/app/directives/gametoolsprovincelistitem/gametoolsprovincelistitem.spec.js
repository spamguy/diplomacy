describe('Province list item directive', function() {
    'use strict';

    var scope,
        el,
        compile;

    beforeEach(function() {
        angular.mock.module('diplomacy.constants');
        angular.mock.module('templates');
        angular.mock.module('ui.router');
        angular.mock.module('gametoolsprovincelistitem.directive');
        angular.mock.module('gameService');

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

    it('prints subregions', function() {
        scope.province = {
            r: 'STP',
            sr: [{
                r: 'NC',
                unit: {
                    type: 2,
                    power: 'R'
                }
            }, {
                r: 'SC'
            }]
        };
        el = compile('<sg-province-list-item province="province" />')(scope);
        scope.$digest();
        expect($('div span', el).html()).to.contain('STP/NC');
    });

    it('reports hold orders', function() {
        el = compile('<sg-province-list-item province="province" />')(scope);
        scope.$digest();
        expect($('div span', el).html()).to.equal('<strong>MOS</strong> holds');
    });

    it('reports move orders', function() {
        scope.province.unit.order = {
            action: 'move',
            target: 'STP'
        };
        el = compile('<sg-province-list-item province="province" />')(scope);
        scope.$digest();
        expect($('div span', el).html()).to.equal('<strong>MOS</strong> → <strong>STP</strong>');
    });

    it('reports orders supporting a holding target', function() {
        scope.province.unit.order = {
            action: 'support',
            source: 'STP'
        };
        el = compile('<sg-province-list-item province="province" />')(scope);
        scope.$digest();
        expect($('div span', el).html()).to.equal('<strong>MOS</strong> supports <strong>STP</strong> ');
    });

    it('reports orders supporting a moving target', function() {
        scope.province.unit.order = {
            action: 'support',
            source: 'STP',
            target: 'LVN'
        };
        el = compile('<sg-province-list-item province="province" />')(scope);
        scope.$digest();
        expect($('div span', el).html()).to.equal('<strong>MOS</strong> supports <strong>STP</strong> → <strong>LVN</strong>');
    });

    it('reports convoy orders', function() {
        scope.province.r = 'MOS';
        scope.province.unit.order = {
            action: 'convoy',
            source: 'HEL',
            target: 'NRG'
        };
        el = compile('<sg-province-list-item province="province" />')(scope);
        scope.$digest();
        expect($('div span', el).html()).to.equal('<strong>MOS</strong> ~ <strong>NRG</strong>');
    });

    it('reports disband orders', function() {
        scope.province.unit.order = {
            action: 'disband'
        };
        el = compile('<sg-province-list-item province="province" />')(scope);
        scope.$digest();
        expect($('div span', el).html()).to.equal('<strong>MOS</strong> disbands');
    });

    it('reports units still needing orders', function() {
        delete scope.province.unit.order;
        el = compile('<sg-province-list-item province="province" />')(scope);
        scope.$digest();
        expect($('div span', el).html()).to.equal('<strong>MOS</strong> <em>awaiting orders</em>');
    });
});
