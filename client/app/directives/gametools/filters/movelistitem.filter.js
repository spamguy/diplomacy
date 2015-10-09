angular.module('gametools.directive')
.filter('variant', function() {
    'use strict';

    /**
     * Filters a list of moves by the power making them.
     * @param  {Array} moves  A list of provinces/moves.
     * @param  {[type]} power The one-letter power code by which to filter.
     * @return {Array}        The filtered list.
     */
    return function(moves, power) {
        var filtered = [];

        for (var m = 0; m < moves.length; m++) {
            if (moves[m].unit && moves[m].unit.power === power.toLowerCase())
                filtered.push(moves[m]);
        }

        return filtered;
    };
});
