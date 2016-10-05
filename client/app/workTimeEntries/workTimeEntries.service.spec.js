'use strict';

describe('Service: workTimeEntries', function () {

  // load the service's module
  beforeEach(module('ioAtSpotApp'));

  // instantiate service
  var workTimeEntries;
  beforeEach(inject(function (_workTimeEntries_) {
    workTimeEntries = _workTimeEntries_;
  }));

  it('should do something', function () {
    expect(!!workTimeEntries).toBe(true);
  });

});
