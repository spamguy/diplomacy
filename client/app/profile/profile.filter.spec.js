describe('Profile games filter', function () {
    'use strict';

    var filter, mockService;

    beforeEach(function() {
        module('profile');

        inject(function($filter) {
            filter = $filter('gmStatus');
        });
    });

    it('has a filter for admin status', function() {
        expect(filter).not.toBeNull();
    });

    it('filters out admin games when flag is false', function() {
        expect(
            filter([{
                    players: [{
                            player_id: null,
                            power: '*'
                        }
                    ]
                }, {
                    players: [{
                            player_id: null,
                            power: '*'
                        }
                    ]
                }, {
                    players: [{
                            player_id: '666fff',
                            power: 'A'
                        }
                    ]
                }
            ], false).length)
        .toEqual(1);
    });

    it('filters out non-admin games when flag is true', function() {
        expect(
            filter([{
                    players: [{
                            player_id: null,
                            power: '*'
                        }
                    ]
                }, {
                    players: [{
                            player_id: '666fff',
                            power: 'A'
                        }
                    ]
                }, {
                    players: [{
                            player_id: '777aaa',
                            power: 'B'
                        }
                    ]
                }
            ], true).length)
        .toEqual(1);
    });
});
