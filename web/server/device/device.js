var WorkTimeEntry = require('../api/workTimeEntry/workTimeEntry.model');
var socketioJwt = require('socketio-jwt');
var config = require('../config/environment');
var io = require("socket.io").listen(config.device_port);
var devices = [];
var User = require('../api/user/user.model');
var Organization = require("../api/organization/organization.model");
var authService = require("../auth/auth.service");

function isWorkingTime(workingDays) {
    var now = new Date();

    var dayIndex = (now.getDay() - 1) >= 0 ? (now.getDay() - 1) : 6;

    var startTime = new Date(workingDays[dayIndex].startOfficeTime);
    startTime.setFullYear(now.getFullYear());
    startTime.setMonth(now.getMonth());
    startTime.setDate(now.getDate());

    var endTime = new Date(workingDays[dayIndex].endOfficeTime);
    endTime.setFullYear(now.getFullYear());
    endTime.setMonth(now.getMonth());
    endTime.setDate(now.getDate());

    return (workingDays[dayIndex].active &&
        startTime <= now &&
        endTime >= now);
}

function readUid(organizationId, callback) {
    var socket = devices[organizationId];
    if (!socket) {
        return callback(null);
    }

    socket.emit('read');
    socket.once('uid',
        function (response) {
            callback(response.uid);
        });
};

function syncMembers(organizationId, members) {
    var socket = devices[organizationId];
    if (!socket) {
        return;
    }

    socket.emit('members', {
        members: members
    });
};

function syncWorkingDays(organizationId, workingDays) {
    var socket = devices[organizationId];
    if (!socket) {
        return;
    }
    socket.emit('workingDays', {
        workingDays: workingDays
    });
};

function addWorkTimeEntry(data, callback) {
    var workTimeEntry = new WorkTimeEntry();

    workTimeEntry._user = data.userId;
    workTimeEntry._organization = data.organizationId;

    /*
    workTimeEntry.workTimeEntryType = 'in'; //AUTO-GUESS
    workTimeEntry.manual = false;
    if (data.performedAt) {
        workTimeEntry.performedAt = data.performedAt;
    }
    */

    workTimeEntry.save(function (err, savedWorkTimeEntry) {

        callback(err);

    });
}

io.use(socketioJwt.authorize({
    secret: config.secrets.session,
    handshake: true
}));

io.sockets.on('connection', function (socket) {

    var organizationId = socket.decoded_token._id;

    //save reference
    devices[organizationId] = socket;

    socket.on("tokenSubmitted", function (data, callback) {

        Organization.findById(organizationId, function (err, org) {
            if (err) {
                return callback({
                    responseCode: 403,
                    message: err.message
                });
            }

            if (!isWorkingTime(org.settings.workingDays)) {
                return callback({
                    responseCode: 403,
                    message: "organization is not active at this time"
                });
            }

            authService.verifyToken(data.token, function (err, decoded) {
                if (err) {
                    return callback({
                        responseCode: 403,
                        message: err.message
                    });
                }

                callback({
                    responseCode: 200,
                    message: 'successfully authenticated'
                });

                if (data.mark) {

                    addWorkTimeEntry({
                        userId: decoded._id,
                        organizationId: organizationId
                    }, function (err) {
                        if (err) {
                            console.log(err);
                        }

                    });

                }
            });
        });
    });

    socket.on("tokenHashSubmitted", function (data, callback) {
        
        Organization.findById(organizationId, function (err, org) {
            if (err) {
                return callback({
                    responseCode: 403,
                    message: err.message
                });
            }

            if (!isWorkingTime(org.settings.workingDays)) {
                return callback({
                    responseCode: 403,
                    message: "organization is not active at this time"
                });
            }

            User.findOne({
                'deviceTokenHash': data.tokenHash
            }, function (err, user) {
                if (err) {
                    return callback({
                        responseCode: 403,
                        message: err.message
                    });                    
                }
                
                if(!user){
                    return callback({
                        responseCode: 403,
                        message: 'user not found'
                    });
                }
                
                callback({
                    responseCode: 200,
                    message: 'successfully authenticated'
                });

                if (data.mark) {

                    addWorkTimeEntry({
                        userId: user._id,
                        organizationId: organizationId
                    }, function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        });
    });

    socket.on("nfcTagSubmitted", function (data, callback) {

        Organization.findById(organizationId, function (err, org) {

            if (err) {
                return callback({
                    responseCode: 401,
                    message: err.message
                });
            }

            if (!isWorkingTime(org.settings.workingDays)) {
                return callback({
                    responseCode: 403,
                    message: "organization is not active at this time"
                });
            }

            var userId;
            for (var i = 0; i < org.members.length && !userId; i++) {
                if (org.members[i].nfc_uid === data.uid) {
                    userId = org.members[i]._user;
                }
            }

            if (!userId) {
                return callback({
                    responseCode: 404,
                    message: "user not found"
                });
            }

            callback({
                responseCode: 200
            });

            //user found
            addWorkTimeEntry({
                userId: userId,
                organizationId: organizationId
            }, function (err) {
                if (err) {
                    console.log(err);
                }

            });
        });
    });

    socket.on("offlineData", function (data, callback) {

        Organization.findById(organizationId, function (err, org) {
            if (err) {
                return console.log(err);
            }

            data.data.forEach(function (wte) {
                var userId;
                for (var i = 0; i < org.members.length && !userId; i++) {
                    if (org.members[i].nfc_uid === wte.uid) {
                        userId = org.members[i]._user;
                    }
                }

                if (!userId) {
                    return console.log('user not found');
                }

                //user found
                addWorkTimeEntry({
                    userId: userId,
                    organizationId: organizationId,
                    performedAt: wte.performedAt
                }, function (err) {
                    console.log(err);
                });
            });

            callback();
        });
    });

    socket.on("disconnect", function (data) {
        delete devices[organizationId];
    });

    Organization.findById(organizationId, function (err, org) {

        if (err) {
            return console.log('cannot sync members');
        }

        socket.emit('members', {
            members: org.members
        });

        socket.emit('workingDays', {
            workingDays: org.settings.workingDays
        });
    });
});

/*
function handleError(socket, err) {
    socket.emit('submitResponse', {
        responseCode: 401,
        message: err
    });
}*/

exports.readUid = readUid;
exports.syncMembers = syncMembers;
exports.syncWorkingDays = syncWorkingDays;
