describe('Map component controller', function() {
    var variant,
        season,
        game,
        svg,
        header,
        readonly,
        createController,
        scope;

    beforeEach(function() {
        angular.mock.module('diplomacy.constants');
        angular.mock.module('map.component');

        variant = { };
        season = { };
        svg = new DOMParser().parseFromString('<svg height="455" width="2"></svg>', 'image/svg+xml');
        inject(function($controller, $rootScope) {
            createController = function() {
                scope = $rootScope.$new();
                angular.extend(scope, {
                    variant: variant,
                    season: season,
                    svg: svg,
                    readonly: false,
                    header: true
                });

                return $controller('MapController', {
                    $scope: scope
                });
            };
        });
    });

    xit('gets SVG attributes', function() {
        createController(variant, game, season, svg, header, readonly);
        scope.$digest();
        expect(1).to.equal(2);
        // expect(controller.getSVGAttribute('height')).to.be('455');
    });
});
