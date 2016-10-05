'use strict';

describe('Service: timeOffs', function () {

    // load the service's module
    beforeEach(module('ioAtSpotApp'));

    // instantiate service
    var timeOffs;
    beforeEach(inject(function (_timeOffs_) {
        timeOffs = _timeOffs_;
    }));

    it('should do something', function () {
        expect(!!timeOffs).toBe(true);
    });

});