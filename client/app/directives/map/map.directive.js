angular.module('map.directives', ['d3'])
    .directive('sgMap', ['d3Service', function(d3Service) {
        'use strict';

        var regionClicked = function(d) {
            console.log(d);

            // TODO: Order input logic
        };

        return {
            replace: true,
            scope: {
                variant: '=variant',        // full variant data (JSON)
                moves: '=moves',            // movement data, full or partial (JSON)
                readonly: '=readonly',      // whether to allow user interaction (bool)
                arrows: '=arrows'           // whether to show movement arrows -- true implies 'moves' is defined (bool)
            },
            restrict: 'E',
            link: function(scope, element, attrs) {
                element = element[0];

                scope.variant.then(function(response) {
                    var variantData = response.data;
                    d3Service.xml('variants/' + variantData.name + '/' + variantData.name + '.svg', 'image/svg+xml', function(xml) {
                        var svg = d3Service.select(element)
                            .append('svg')
                            .attr("width", '100%')              // TODO: change?
                            .attr("viewBox", '0 0 1152 965');   // TODO: do not hardcode viewBox dimensions

                        svg.append('g')
                            .append('svg:image')
                            .attr('x', 0)
                            .attr('y', 0)
                            .attr('xlink:href', 'variants/' + variantData.name + '/' + 'std_bit.png')  // TODO: find better filename for map BG
                            .attr('width', 1152)                // TODO: do not hardcode width
                            .attr('height', 965);               // TODO: do not hardcode height

                        // if not readonly, apply UI events
                        if (scope.readonly && xml) {
                            svg.append(function() { return xml.documentElement.getElementById('MouseLayer'); })
                                .selectAll('path')
                                .attr('fill', 'transparent')
                                .on('click', regionClicked);
                        }

                        for (var p = 0; p < scope.moves.length; p++) {
                            var powerMoves = scope.moves[p];
                            var powerData = variantData.powers[powerMoves.power];

                            for (var unit in powerMoves.moves[0]) {
                                console.log('Processing ' + unit);
                            }
                        }
                    });
                });
            }
        };
    }]
);

//              d3.xml('assets/images/bitmap_std.svg', 'image/svg+xml', function(xml) {
//                  document.body.appendChild(xml.documentElement);
//              });
