describe('Map directive', function() {
    'use strict';

    var el,
        scope,
        $state;

    beforeEach(function() {
        module('gamelistitem.directive');
    });

    beforeEach(function() {
        inject(function($injector, $compile, $rootScope, _$state_) {
            $state = _$state_;
            scope = $rootScope.$new();

            el = $compile('<sg-game-list-item></sg-game-list-item>')(scope);
        });
    });

    // fit('has a shaded container', function() {
    //     scope.$digest();
    //
    //     expect(el).toBe(1);
    // });
});
