angular.module('gametools.directive', [])
.directive('sgGameTools', ['userService', function(userService) {
    'use strict';

    return {
        replace: false,
        restrict: 'E',
        templateUrl: 'app/directives/gametools/gametools.tmpl.html',
        scope: {
            game: '=',
            season: '=',
            variant: '='
        },
        link: function(scope, element, attrs) {
            scope.powerOwnsProvince = function(code, province) {
                return province.unit && province.unit.power === code;
            };

            scope.getPowerList = function() {
                var currentUser = userService.getCurrentUser(),
                    p;

                if (currentUser === scope.game.gm_id) {
                    // GMs see everyone.
                    return scope.variant.powers;
                }
                else {
                    for (p = 0; p < scope.game.players.length; p++) {
                        if (scope.game.players[p].player_id === currentUser)
                            return _.pick(scope.variant.powers, [scope.game.players[p].power]);
                    }
                }
            };
        }
    };
}]);
