'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var WorkTimeEntry = require('./workTimeEntry.model');
var auth = require('../../auth/auth.service');
var errorBuilder = require('../../error-builder');

// Get list of workTimeEntries
exports.index = function (req, res, next) {

    if (!req.query) {
        return next(new errorBuilder("request query string can't be empty", 403));
    }

    var organizationId = new mongoose.Types.ObjectId(req.params.organizationId);
    var page = req.query.page || 1;
    var itemsPerPage = req.query.itemsPerPage || 10;

    var filterConditions = [];
    var filter = {};

    //Filters of mapreduce to have aggregated data, and query
    var filterConditions = [{
            _organization: organizationId
        }, {
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

    var queryMembers = JSON.parse(req.query.members);
    queryMembers.forEach(function (member, i) {
        membersFilter.push({
            _user: member
        });
    });

    if (membersFilter.length > 0) {
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

    if (req.body.workTimeEntryType) {
        saveEntry(req, req.body.workTimeEntryType, res);

    } else {

        var start = new Date(req.body.performedAt);
        start.setHours(0, 0, 0, 0);

        var end = new Date(req.body.performedAt);
        end.setHours(23, 59, 59, 999);

        var wte = new WorkTimeEntry();
        wte._user = req.body.userId;
        wte._organization = req.params.organizationId;
        wte.manual = !!(req.body.workTimeEntryType); //If specified the type, user is inserting manually
        wte.performedAt = req.body.performedAt;
        wte.workTimeEntryType = req.body.workTimeEntryType;

        if (!wte.workTimeEntryType) {

            WorkTimeEntry
                .find({
                    _user: req.body.userId,
                    _organization: req.params.organizationId,
                    deleted: false,
                    performedAt: {
                        $gte: start,
                        $lte: end
                    }
                })
                .sort('-performedAt')
                .exec(function (err, entries) {

                    if (err) return next(err);

                    wte.workTimeEntryType = entries.length === 0 ? 'in' : (entries[0].workTimeEntryType === 'out' ? 'in' : 'out');

                    workTimeEntry.save(function (err, savedWorkTimeEntry) {
                        if (err) {
                            return next(err);
                        }

                        res.status(201);
                        res.location('/api/organizations/' + req.params.organizationId + '/workTimeEntries/' + savedWorkTimeEntry._id);

                        return res.json(savedWorkTimeEntry);
                    });
                });
        } else {
            workTimeEntry.save(function (err, savedWorkTimeEntry) {
                if (err) {
                    return next(err);
                }

                res.status(201);
                res.location('/api/organizations/' + req.params.organizationId + '/workTimeEntries/' + savedWorkTimeEntry._id);

                return res.json(savedWorkTimeEntry);
            });
        }
    }
};

exports.detail = function (req, res, next) {

    WorkTimeEntry.findById(req.params.id, function (err, workTimeEntry) {
        if (err) {
            return next(err);
        }

        if (!workTimeEntry) {
            return next(new errorBuilder("work time entry not found", 404));
        }

        res.status(200);

        return res.json(workTimeEntry);
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