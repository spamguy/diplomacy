angular.module('gamelistitem.directive', [])
.directive('sgGameListItem', [function() {
    'use strict';

    var renderClockDescription = function(clock) {
        return 'Every ' + humanizeDuration(clock * 60 * 1000);
    };

    var renderCalendarDescription = function() {
        return '';
    };

    return {
        replace: true,
        restrict: 'E',
        templateUrl: 'app/directives/gamelistitem/gamelistitem.tmpl.html',
        scope: {
            variantPromise: '=variant',
            game: '=game'
        },
        link: function(scope, element, attrs) {
            scope.expandState = scope.variants = { };

            scope.toggleGameDetails = function(id) {
                scope.expandState[id] = !scope.expandState[id];
            };

            scope.movementDescription = scope.game.movementClock ? renderClockDescription(scope.game.movementClock) : renderCalendarDescription();

            scope.$watch('variantPromise', function(variantPromise) {
                if (variantPromise) {
                    variantPromise.then(function(variant) {
                        variant = variant.data;

                        var statusMessageEl = angular.element(element[0].getElementsByClassName('statusMessage')[0]),
                            completeGamePlayers = _.keys(variant.powers).length,
                            foundPlayers = scope.game.playerCount;
                        if (foundPlayers < completeGamePlayers) {
                            var personPlural = completeGamePlayers - foundPlayers === 1 ? 'person' : 'people';
                            // TODO: differentiate between 'not yet started' and 'stalled'
                            statusMessageEl.text('Waiting on ' + (completeGamePlayers - foundPlayers) + ' more ' + personPlural);
                        }
                        else {
                            statusMessageEl.text('Next deadline in ');
                        }

                        // scope.generateStatusMessage = function(playerCount) {
                        //     return '';
                        // };
                    });
                }
            });
        }
    };
}]);
