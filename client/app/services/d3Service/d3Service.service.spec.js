'use strict';

describe('d3.service', function () {

  // load the service's module
  beforeEach(module('diplomacy'));

  // instantiate service
  var d3;
  beforeEach(inject(function (_d3_) {
    d3 = _d3_;
  }));

  it('should return d3', function () {
    expect(!!d3).toBe(true);
  });

});
