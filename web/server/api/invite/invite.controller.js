'use strict';
var auth = require('../../auth/auth.service');
var MemberSchema = require('../member/member.model.schema');
var mongoose = require('mongoose');
var User = require('../user/user.model');
var Organization = require('../organization/organization.model');
var device = require('../../device/device');
var errorBuilder = require('../../error-builder');
var mailer = require('../../mailer/mailer');

function addUserInviteToOrganization(organization, user, callback) {
    var member = {
        _user: user._id,
        active: false
    };

    var token = auth.signToken({
        _id: user._id,
        organizationId: organization._id
    });

    var found = false;
    for (var i = 0; i < organization.members.length; i++) {

        if (organization.members[i]._user.equals(member._user)) {
            found = true;
            member = organization.members[i];
        }
    }

    if (!found) {
        organization.members.push(member);
        organization.save(function (err, updatedOrganization) {
            if (err) {
                return callback(err);
            }

            for (var i = 0; i < updatedOrganization.members.length; i++) {
                if (updatedOrganization.members[i]._user.equals(user._id)) {
                    return callback(null, token, updatedOrganization.members[i]._id);
                }
            }

            callback(new errorBuilder('cannot add user', 500));
        });
    } else {
        callback(null, token, member._id);
    }
}

function sendEmail(to, organization, inviteId, host, needSignup, callback) {
    //Send email to member
    var mailText = '';
    if (!needSignup) {
        mailText = 'Hello,\n\n' +
            'You are invited to join' + organization.name + '.\n' +
            'You can accept the invite through organization menu.\n';
    } else {
        mailText = 'Hello,\n\n' +
            'You are invited to join io@spot community.\n' +
            'Click to the link below and complete your data to join ' + organization.name + ':\n' +
            'http://' + host + '/join/?inviteId=' + inviteId + '&organizationId=' + organization._id + '\n\n';
    }

    var mailOptions = {
        to: to,
        subject: 'io@spot - Invitation to ' + organization.name,
        text: mailText
    };

    mailer.sendMail(mailOptions, function (err) {
        if (err) {
            return callback(err);
        }

        //device.syncMembers(req.params.organizationId, organization.members);
        return callback();
    });
}

exports.details = function (req, res, next) {
    var inviteId = new mongoose.Types.ObjectId(req.params.id);

    Organization.findById(req.params.organizationId).populate('members._user').exec(function (err, organization) {
        if (err) {
            return next(err);
        }

        if (!organization) {
            return next(new errorBuilder("organization not found", 404));
        }

        for (var i = 0; i < organization.members.length; i++) {
            if (organization.members[i]._id.equals(inviteId)) {
                organization.members[i]._user = organization.members[i]._user.profile;
                return res.json(organization.members[i]);
            }
        }

        return next(new errorBuilder("invite not found", 404));

    });

}

// Get list of invites (members not active)
exports.index = function (req, res, next) {
    var organizationId = req.params.organizationId;

    Organization.findById(organizationId).populate('members._user').exec(function (err, organization) {
        if (err) {
            return next(err);
        }

        if (!organization) {
            return next(new errorBuilder("organization not found", 404));
        }

        var members = [];
        for (var i = 0; i < organization.members.length; i++) {
            if (!organization.members[i].active) {
                members.push(organization.members[i]);
            }
        }

        return res.json(members);
    });
};

// Adds a member to organization
exports.add = function (req, res, next) {

    Organization.findById(req.params.organizationId, function (err, organization) {
        if (err) {
            return next(err);
        }
        if (!organization) {
            return next(new errorBuilder("organization not found", 404));
        }

        if (req.body.userId) {
            //Already existing user

            User.findById(req.body.userId, function (err, user) {
                if (err) {
                    console.log('find user error');
                    return next(err);
                }
                if (!user) {
                    return next(new errorBuilder("user not found", 404));
                }

                addUserInviteToOrganization(organization, user, function (err, token, inviteId) {

                    if (err) {
                        return next(err);
                    }

                    sendEmail(user.email, organization, inviteId, req.headers.host, !user.active, function (err) {
                        if (err) {
                            return next(err);
                        }

                        //device.syncMembers(req.params.organizationId, organization.members);
                        return res.send(201);
                    });
                });
            });

        } else if (req.body.email !== null) {
            //New user    
            var newUser = new User({
                email: req.body.email,
                active: false
            });

            newUser.save(function (err, user) {

                if (err) {
                    return next(err);
                }

                addUserInviteToOrganization(organization, user, function (err, token, inviteId) {
                    //SEND MAIL
                    if (err) {
                        return next(err);
                    }

                    sendEmail(user.email, organization, inviteId, req.headers.host, true, function (err) {
                        if (err) {
                            return next(err);
                        }

                        //device.syncMembers(req.params.organizationId, organization.members);
                        return res.send(201);
                    });
                });

            });
        } else {
            return next(new errorBuilder("missing mandatory data", 412));
        }
    });
};

//Accept invitation, decode token and check if member id and organizationId matches
exports.accept = function (req, res, next) {

    var organizationId = req.params.organizationId;
    var inviteId = req.params.id;


    //    auth.verifyToken(req.body.token, function (err, decoded) {
    //        if (err) {
    //            return next(err);
    //        }

    //        if (organizationId !== decoded.organizationId ||
    //            req.user._id != decoded._id) {
    //            return next(new errorBuilder("token mismatch", 401));
    //        }

    Organization.findById(organizationId, function (err, organization) {
        if (err) {
            return next(err);
        }

        if (!organization) {
            return next(new errorBuilder("organization not found", 404));
        }

        var found = false;
        for (var i = 0; i < organization.members.length && !found; i++) {
            if (organization.members[i]._id.equals(inviteId)) {
                if (organization.members[i].active) {
                    return next(new errorBuilder("member is already active", 401));
                }
                if (!organization.members[i]._user.equals(req.user._id)) {
                    return next(new errorBuilder("cannot accept for a different user", 403));
                }
                organization.members[i].active = true;
                organization.members[i].role = 'user';
                found = true;
            }
        }

        if (!found) {
            return next(new errorBuilder("member not found in organization", 404));
        }

        organization.save(function (err, updatedOrganization) {
            if (err) {
                return next(err);
            }
            device.syncMembers(organizationId, organization.members);
            return res.send(200);
        });
        //        });
    });
};

exports.remove = function (req, res, next) {

    var organizationId = req.params.organizationId;
    var inviteId = req.params.id;

    Organization.findById(organizationId, function (err, organization) {
        if (err) {
            return next(err);
        }
        if (!organization) {
            return next(new errorBuilder("organization not found", 404));
        }

        var userIsOrganizationAdmin = false;
        for (var i = 0; i < organization.members.length; i++) {
            if (organization.members[i]._user.equals(req.user._id)) {
                userIsOrganizationAdmin = (organization.members[i].role === 'admin');
            }
        }

        var found = false;
        for (var i = 0; i < organization.members.length && !found; i++) {
            if (organization.members[i]._id.equals(inviteId) && (organization.members[i]._user.equals(req.user._id) || userIsOrganizationAdmin)) {
                organization.members.splice(i, 1);
                found = true;
            }
        }

        if (!found) {
            return next(new errorBuilder("invite not found", 404));
        }

        organization.save(function (err, updatedOrganization) {
            if (err) {
                return next(err);
            } //device.syncMembers(organizationId, organization.members);
            return res.send(200);
        });
    });
};