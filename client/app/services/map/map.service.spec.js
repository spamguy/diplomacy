describe('Map directive', function() {
    'use strict';

    var location,
        MapService,
        service,
        variant,
        game,
        phase;

    beforeEach(function() {
        variant = {
            provinces: [],
            powers: {
                R: {
                    colour: '#141414'
                },
                A: {
                    colour: '#555555'
                }
            }
        };
        game = {
            phases: [{
                provinces: {
                    WAR: {
                        sc: 'R',
                        unit: {
                            power: 'R'
                        }
                    },
                    RUM: {
                        sc: null,
                        unit: {
                            power: 'A'
                        }
                    }
                }
            }]
        };
        angular.mock.module('diplomacy.constants');
        angular.mock.module('gameService');
        angular.mock.module('mapService');

        inject(function(_mapService_, $location) {
            location = $location;
            MapService = _mapService_;
        });

        service = new MapService(variant, game, 0);
    });

    it('selects a fill colour for a supply centre based on its owner', function() {
        expect(service.getSCFill('WAR')).to.equal('#141414');
        expect(service.getSCFill('RUM')).to.equal('#bbbbbb');
    });

    it('selects a fill colour for a unit based on its owner', function() {
        expect(service.getUnitFill('WAR')).to.equal('#141414');
        expect(service.getUnitFill('RUM')).to.equal('#555555');
    });

    it('generates the URL pointing to the supply centre SVG', function() {
        location.path('/games/1234');
        expect(service.getSCPath()).to.match(/\/games\/1234#sc$/);
    });
});
