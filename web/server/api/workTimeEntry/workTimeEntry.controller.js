'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var WorkTimeEntry = require('./workTimeEntry.model');
var auth = require('../../auth/auth.service');
var errorBuilder = require('../../error-builder');

// Get list of workTimeEntries
exports.index = function (req, res, next) {
    /*if (!req.body) {
    return next(new errorBuilder("request body can't be empty", 403));
}*/

console.log(req.query);

    var organizationId = new mongoose.Types.ObjectId(req.params.organizationId);
    var page = req.query.page || 1;
    var itemsPerPage = req.query.itemsPerPage || 10;

    var filterConditions = [];
    var filter = {};

    //Filters of mapreduce to have aggregated data, and query
    var filterConditions = [
        {
            _organization: organizationId
        },
        {
            deleted: false
        }
    ];

    if (req.query.from && req.query.to) {

        filterConditions.push({
            performedAt: {
                $gte: new Date(req.query.from),
                $lte: new Date(req.query.to)
            }
        });

    } else if (req.query.from) {

        filterConditions.push({
            performedAt: {
                $gte: new Date(req.query.from)
            }
        });

    } else if (req.query.to) {

        filterConditions.push({
            performedAt: {
                $lte: new Date(req.query.to)
            }
        });
    }

    if (req.query.type) {

        filterConditions.push({
            workTimeEntryType: req.query.type
        });
    }

    var membersFilter = [];

        if (auth.ensureOrganizationAdmin()) {
                var queryMembers = JSON.parse(req.query.members);
                queryMembers.forEach(function (member, i) {
                    membersFilter.push({
                        _user: member
                    });
                });

        } else {
            membersFilter.push({
                _user: req.user._id
            });
        }

    if(membersFilter.length > 0) {
        filterConditions.push({
            $or: membersFilter
        });
    }

    //    var util = require('util');
    //    console.log(util.inspect({
    //        $and: filterConditions
    //    }, false, null));

    WorkTimeEntry.count({
        $and: filterConditions
    }, function (err, count) {
        WorkTimeEntry
            .find({
                $and: filterConditions
            })
            .populate('_user')
            .sort('-performedAt')
            .skip((page - 1) * itemsPerPage).limit(itemsPerPage)
            .exec(function (err, workTimeEntries) {
                if (err) {
                    return next(err);
                }

                var pagedResult = {
                    items: workTimeEntries,
                    total: count,
                    pages: Math.ceil(count / itemsPerPage),
                    currentPage: page,
                    itemsPerPage: itemsPerPage
                };

                return res.json(pagedResult);
            });

    });
};

// Creates a new workTimeEntry in the DB.
exports.create = function (req, res, next) {

    var organizationId = req.params.organizationId;

    var workTimeEntry = new WorkTimeEntry();

    workTimeEntry._user = req.body.userId;
    workTimeEntry._organization = organizationId;
    workTimeEntry.workTimeEntryType = req.body.workTimeEntryType;
    workTimeEntry.manual = req.body.manual;
    workTimeEntry.performedAt = req.body.performedAt;

    workTimeEntry.save(function (err, savedWorkTimeEntry) {
        if (err) {
            return next(err);
        }
        return res.json(201, savedWorkTimeEntry);
    });
};

// Updates an existing workTimeEntry in the DB.
exports.update = function (req, res, next) {
    WorkTimeEntry.findById(req.params.id, function (err, workTimeEntry) {
        if (err) {
            return next(err);
        }
        if (!workTimeEntry) {
            return next(new errorBuilder("work time entry not found", 404));
        }

        workTimeEntry.performedAt = req.body.performedAt;
        console.log(req.body.workTimeEntryType);
        workTimeEntry.workTimeEntryType = req.body.workTimeEntryType;
        workTimeEntry.manual = true;

        workTimeEntry.save(function (err, updatedWorkTimeEntry) {
            if (err) {
                return next(err);
            }
            return res.json(200, updatedWorkTimeEntry);
        });
    });
};

// Deletes a workTimeEntry from the DB.
exports.destroy = function (req, res, next) {
    WorkTimeEntry.findById(req.params.id, function (err, workTimeEntry) {
        console.log(workTimeEntry);
        if (err) {
            return next(err);
        }
        if (!workTimeEntry) {
            return next(new errorBuilder("work time entry not found", 404));
        }
        workTimeEntry.deleted = true;
        workTimeEntry.save(function (err) {
            if (err) {
                return next(err);
            }
            return res.send(204);
        });
    });
};
