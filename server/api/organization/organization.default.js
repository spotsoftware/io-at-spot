'use strict';

module.exports = function (user) {
    var userAsMember = {
        _user: user,
        role: 'admin'
    };

    var workingDays = [];

    var workingStartTime = new Date();
    workingStartTime.setHours(8);
    workingStartTime.setMinutes(0);
    workingStartTime.setSeconds(0);
    workingStartTime.setMilliseconds(0);

    var workingEndTime = new Date();
    workingEndTime.setHours(20);
    workingEndTime.setMinutes(0);
    workingEndTime.setSeconds(0);
    workingEndTime.setMilliseconds(0);

    for (var i = 0; i < 7; i++) {
        workingDays.push({
            active: true,
            startOfficeTime: workingStartTime,
            endOfficeTime: workingEndTime
        });
    }

    workingDays[5].active = false;
    workingDays[6].active = false;

    //Create Default Organization for new user
    return {
        name: user.name + ' - default Organization',
        members: [userAsMember],
        settings: {
            defaultTimeOffAmount: 8,
            timeOffTypes: ['ferie', 'malattia'],
            workingDays: workingDays
        }
    };
}