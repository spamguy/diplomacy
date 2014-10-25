'use strict';

describe('d3.service', function () {

  // load the service's module
  beforeEach(module('d3Service'));

  // instantiate service
  var d3Service;
  beforeEach(inject(function (_d3Service_) {
    d3Service = _d3Service_;
  }));

  it('should return d3', function () {
    expect(!!d3Service).toBe(true);
  });

});
