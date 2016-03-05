angular.module('gametools.directive', [])
.directive('sgGameTools', ['userService', 'gameService', function(userService, gameService) {
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
                return gameService.getUnitOwnerInRegion(province, null, code);
            };

            scope.getPowerList = function() {
                var currentUser = userService.getCurrentUserID(),
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
