'use strict';

var _ = require('lodash');
var MemberSchema = require('./member.model.schema');
var User = require('../user/user.model');
var Organization = require('../organization/organization.model');
var device = require('../../device/device');
var errorBuilder = require('../../error-builder');

// Get list of members
exports.index = function (req, res, next) {
    var organizationId = req.params.organizationId;

    Organization.findById(organizationId).populate('members._user').exec(function (err, organization) {
        if (err) {
            return next(err);
        }

        if (!organization) {
            return next(new errorBuilder("organization not found", 404));
        }

        return res.json(organization.members);

    });
};

// Adds a member to organization
exports.add = function (req, res, next) {

    var member = {
        _user: req.body.userId,
        role: req.body.role,
        nfc_uid: req.body.nfc_uid
    };

    Organization.findById(req.params.organizationId, function (err, organization) {
        if (err) {
            return next(err);
        }
        if (!organization) {
            return next(new errorBuilder("organization not found", 404));
        }
        User.findById(req.body.userId, function (err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return next(new errorBuilder("user not found", 404));
            }
            if (req.body.nfc_uid && req.body.nfc_uid !== '') {
                for (var i = 0; i < organization.members.length; i++) {
                    if (organization.members[i].nfc_uid === req.body.nfc_uid) {
                        return next(new errorBuilder("duplicate uid found on this organization", 403));
                    }
                }
            }

            organization.members.push(member);
            organization.save(function (err, updatedOrganization) {
                if (err) {
                    return next(err);
                }

                device.syncMembers(req.params.organizationId, organization.members);
                return res.send(200);
            });
        });

    });
};

// Edit organization's member
exports.update = function (req, res, next) {

    var organizationId = req.params.organizationId;
    var memberId = req.params.id;

    Organization.findById(organizationId, function (err, organization) {
        if (err) {
            return next(err);
        }

        if (!organization) {
            return next(new errorBuilder("organization not found", 404));
        }

        for (var i = 0; i < organization.members.length; i++) {
            if (organization.members[i]._id.equals(memberId)) {
                organization.members[i].nfc_uid = req.body.nfc_uid;
                organization.members[i].role = req.body.role;
            } else {
                if (organization.members[i].nfc_uid === req.body.nfc_uid) {
                    return next(new errorBuilder("duplicate uid found on this organization", 403));
                }
            }
        }

        organization.save(function (err, updatedOrganization) {
            if (err) {
                return next(err);
            }
            device.syncMembers(organizationId, organization.members);
            return res.send(200);
        });

    });
};

// Deletes a member from the DB.
exports.remove = function (req, res, next) {

    var organizationId = req.params.organizationId;
    var memberId = req.params.id;

    Organization.findById(organizationId, function (err, organization) {
        if (err) {
            return next(err);
        }
        if (!organization) {
            return next(new errorBuilder("organization not found", 404));
        }

        for (var i = 0; i < organization.members.length; i++) {
            if (organization.members[i]._id.equals(memberId)) {
                organization.members.splice(i, 1);
                break;
            }
        }

        organization.save(function (err, updatedOrganization) {
            if (err) {
                return next(err);
            }
            device.syncMembers(organizationId, organization.members);
            return res.send(200);
        });
    });
};