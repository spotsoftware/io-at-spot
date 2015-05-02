'use strict';

var _ = require('lodash');
var MemberSchema = require('./member.model.schema');
var User = require('../user/user.model');
var Organization = require('../organization/organization.model');
var device = require('../../device/device');
var errorBuilder = require('../../error-builder');
var mailer = require('../../mailer/mailer');


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
            if (organization.members[i].active) {
                members.push(organization.members[i]);
            }
        }

        return res.json(members);
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

        //Edit a member only if it's activated
        for (var i = 0; i < organization.members.length; i++) {
            if (organization.members[i]._id.equals(memberId) && organization.members[i].active) {
                organization.members[i].nfc_uid = req.body.nfc_uid;
                organization.members[i].role = req.body.role;
            } else {
                if (req.body.nfc_uid && req.body.nfc_uid !== '' && organization.members[i].nfc_uid === req.body.nfc_uid) {
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