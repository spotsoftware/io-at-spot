'use strict';

var async = require('async');
var _ = require('lodash');
var mongoose = require('mongoose');
var WorkTimeEntry = require('./workTimeEntry.model');
var Organization = require('../organization/organization.model');
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

exports.batch = function (req, res, next) {

    Organization
        .findById(req.params.organizationId)
        .populate('members._user')
        .exec(function (err, organization) {

            if (err) {
                return next(err);
            }

            if (!organization) {
                return next(new errorBuilder("organization not found", 404));
            }

            var items = req.body.items;

            var newItems = [];

            async.each(items, function (item, callback) {
                if (item.externalId) {
                    WorkTimeEntry.findOne({
                        externalId: item.externalId
                    }, function (err, timeOff) {
                        if (err) {
                            callback(err);
                        } else {

                            if (!timeOff) {
                                //if timeOff is not existing
                                var memberFound = false;
                                for (var j = 0; j < organization.members.length && !memberFound; j++) {

                                    if (organization.members[j]._user.email === item.email) {
                                        memberFound = true;

                                        var newItem = {};

                                        newItem._user = organization.members[j]._user._id;
                                        newItem._organization = organization._id;
                                        newItem.workTimeEntryType = item.type;
                                        newItem.performedAt = new Date(item.date);
                                        newItem.externalId = item.externalId;
                                        newItem.deleted = false;
                                        newItem.active = true;

                                        newItems.push(newItem);
                                    }
                                }
                            }

                            callback();
                        }
                    });
                } else {
                    callback(new Error('ExternalId null for an item in date ' + item.date));
                }
            }, function (err) {
                if (err) {
                    return next(err);
                }
                if (newItems.length > 0) {
                    console.log(newItems);
                    WorkTimeEntry.collection.insert(newItems, {
                        continueOnError: 1
                    }, function (err, documents) {
                        if (err) {
                            return next(err);
                        }
                        return res.json(200);
                    });
                } else {
                    return res.json(200);
                }
            });
        });
};


// Creates a new workTimeEntry in the DB.
exports.create = function (req, res, next) {

    var wte = new WorkTimeEntry();
    wte._user = req.body.userId;
    wte._organization = req.params.organizationId;
    wte.manual = !!(req.body.workTimeEntryType); //If specified the type, user is inserting manually
    wte.performedAt = req.body.performedAt;
    wte.workTimeEntryType = req.body.workTimeEntryType;

    wte.save(function (err, savedWorkTimeEntry) {
        if (err) {
            return next(err);
        }

        res.status(201);
        res.location('/api/organizations/' + req.params.organizationId + '/workTimeEntries/' + savedWorkTimeEntry._id);

        return res.json(savedWorkTimeEntry);
    });

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
        if (!workTimeEntry.externalId) {
            workTimeEntry.deleted = true;
            workTimeEntry.save(function (err) {
                if (err) {
                    return next(err);
                }
                return res.send(204);
            });
        } else {
            workTimeEntry.remove(function (err) {
                if (err) {
                    return next(err);
                }
                return res.send(204);
            });
        }
    });
};