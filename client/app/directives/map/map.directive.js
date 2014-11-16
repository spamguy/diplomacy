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
                variant: '=variant',
                positions: '=positions',
                readonly: '=readonly',
                arrows: '=arrows',
                width: '=width',
                height: '=height'
            },
            restrict: 'E',
            link: function(scope, element, attrs) {
                element = element[0];
                d3Service.xml('assets/variants/' + scope.variant.name + '/' + scope.variant.name + '.svg', 'image/svg+xml', function(xml) {
                    var svg = d3Service.select(element)
                        .append('svg')
                        .attr("width", '100%')
                        .attr("viewBox", '0 0 1152 965');

                    svg.append('g')
                        .append('svg:image')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('xlink:href', '/assets/variants/' + scope.variant.name + '/' + 'std_bit.png')
                        .attr('width', 1152)
                        .attr('height', 965);

                    if (scope.readonly && xml) {
                        svg.append(function() { return xml.documentElement.getElementById('MouseLayer'); })
                            .selectAll('path')
                            .attr('fill', 'transparent')
                            .on('click', regionClicked);
                    }
                });
            }
        };
    }]
);

//              d3.xml('assets/images/bitmap_std.svg', 'image/svg+xml', function(xml) {
//                  document.body.appendChild(xml.documentElement);
//              });
