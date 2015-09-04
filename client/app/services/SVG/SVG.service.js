'use strict';

/*
 * This service exists because it is not easy (or possible) to embed an external SVG within an existing SVG *and* format it with CSS.
 * Solution: fetch resources via Angular before handing them off to d3.
 *
 * Details here: http://stackoverflow.com/q/7215009/260460
 */
angular.module('SVGService', [])
.factory('SVGService', [function() {
    return {
        getStar: function(callback) {
            d3.xml('/assets/icons/plain14.svg', function(xml) {
                callback(xml.documentElement.firstElementChild);
            });
        }
    };
}]);
