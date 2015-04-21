'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var Organization = require('./organization.model');
var device = require('../../device/device');
var errorBuilder = require('../../error-builder');

// Get list of organizations
exports.index = function (req, res, next) {

    var userId = mongoose.Types.ObjectId(req.user._id);

    /*
     * Query organizations, to find which of them have user as member
     */
    Organization
        .find({
            members: {
                $elemMatch: {
                    _user: userId
                }
            },
            deleted: false
        })
        .populate('members._user')
        .exec(function (err, organizations) {

            if (err) {
                return next(err);
            }

            var organizationsToReturn = [];

            organizations.forEach(function (org) {
                for (var i = 0; i < org.members.length; i++) {
                    if (org.members[i]._user._id.equals(userId)) {

                        var organization = org.public;
                        organization.userRole = org.members[i].role;
                        organizationsToReturn.push(organization);
                    }
                }
            });

            return res.json(200, organizationsToReturn);
        });
};

// Get a single organization
exports.detail = function (req, res) {

   Organization.findById(req.params.organizationId, function (err, organization) {

       if (err) {
           return next(err);
       }

       if (!organization) {
           return next(new errorBuilder("No organization matching the given id was found.", 404));
       }

       return res.json(organization);
   });
};

// Creates a new organization in the DB.
exports.create = function (req, res, next) {

    var user = req.user;

    var newOrganization = new Organization(req.body);


    newOrganization.members = [{
        _user: user,
        role: "admin"
    }];


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
    newOrganization.settings.workingDays = workingDays;

    newOrganization.save(function (err, organization) {

        if (err) {
            return next(err);
        }

        newOrganization.populate('members._user', function (err, organization) {

            if (err) {
                return next(err);
            }

            res.status(201);
            res.location('/api/organizations/' + organization._id);

            return res.json(organization.public);
        });


    });
};

// Updates an existing organization in the DB.
exports.update = function (req, res, next) {

    Organization.findById(req.params.organizationId, function (err, organization) {
        if (err) {
            return next(err);
        }

        if (!organization) {
            return next(new errorBuilder("organization not found", 404));
        }

        if (req.body.name) {
            organization.name = req.body.name;
        }

        if (req.body.settings) {
            organization.settings = req.body.settings;
        }

        if (req.body.password) {
            organization.password = req.body.password;
        }

        organization.save(function (err) {

            if (err) {
                return next(err);
            }

            device.syncWorkingDays(organization._id, organization.settings.workingDays);

            return res.json(200, organization.public);
        });
    });
};

// Deletes a organization from the DB.
exports.destroy = function (req, res, next) {
    Organization.findById(req.params.organizationId, function (err, organization) {
        if (err) {
            return next(err);
        }
        if (!organization) {
            return next(new errorBuilder("organization not found", 404));
        }

        organization.deleted = true;

        organization.save(function (err) {
            if (err) {
                return next(err);
            }
            return res.send(204);
        });
    });
};

exports.readUid = function (req, res, next) {
    //call the socket
    var organizationId = req.params.organizationId;

    device.readUid(organizationId, function (uid) {
        res.json({
            uid: uid
        });
    });
};
