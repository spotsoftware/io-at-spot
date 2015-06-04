'use strict';

var async = require('async');
var _ = require('lodash');
var TimeOff = require('./timeOff.model');
var Organization = require('../organization/organization.model');
var mongoose = require('mongoose');
var auth = require('../../auth/auth.service');
var errorBuilder = require('../../error-builder');

// Get list of timeOffs
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

    if (req.query.timeOffType) {

        filterConditions.push({
            timeOffType: req.query.timeOffType
        });
    }

    var membersFilter = [];

    membersFilter.push({
        _user: req.user._id
    });

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

    TimeOff.count({
        $and: filterConditions
    }, function (err, count) {
        TimeOff
            .find({
                $and: filterConditions
            })
            .populate('_user')
            .sort('-performedAt')
            .skip((page - 1) * itemsPerPage).limit(itemsPerPage)
            .exec(function (err, timeOffs) {
                if (err) {
                    return next(err);
                }

                var pagedResult = {
                    items: timeOffs,
                    total: count,
                    pages: Math.ceil(count / itemsPerPage),
                    currentPage: page,
                    itemsPerPage: itemsPerPage
                };

                return res.json(pagedResult);
            });

    });

    /*
        TimeOff.aggregate([
            {
                $match: {
                    $and: filterConditions
                }
            },
            {
                $group: {
                    _id: "$_user",
                    totalAmount: {
                        $sum: '$amount'
                    },
                    count: {
                        $sum: 1
                    }
                }
            }
        ], function (err, results) {
            if (err) {
                return next(err);
            }

            var aggregatedData = {
                userAggregatedData: [],
                totalCount: 0,
                totalAmount: 0
            };

            if (results.length > 0) {

                console.log(results);

                for (var i = 0; i < results.length; i++) {

                    var userAggregatedData = {};

                    userAggregatedData.user = results[i]._id;
                    userAggregatedData.count = results[i].count;
                    userAggregatedData.totalAmount = Math.round(results[i].totalAmount);

                    aggregatedData.userAggregatedData.push(userAggregatedData);
                    aggregatedData.totalCount += userAggregatedData.count;
                    aggregatedData.totalAmount += userAggregatedData.totalAmount;
                }
            }

            //non scala: http://stackoverflow.com/questions/5539955/how-to-paginate-with-mongoose-in-node-js/23640287#23640287
            TimeOff
                .find({
                    $and: filterConditions
                })
                .populate('_user')
                .sort('-performedAt')
                .skip((page - 1) * itemsPerPage).limit(itemsPerPage)
                .exec(function (err, timeOffs) {

                    if (err) {
                        return next(err);
                    }

                    var pagedResult = {
                        items: timeOffs,
                        total: aggregatedData.totalCount,
                        pages: Math.ceil(aggregatedData.totalCount / itemsPerPage),
                        currentPage: page,
                        itemsPerPage: itemsPerPage,
                        amountTime: aggregatedData.totalAmount
                    };

                    return res.json(pagedResult);

                });
        });*/
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

            var newTimeOffs = [];

            async.each(items, function (item, callback) {

                if (item.externalId) {
                    TimeOff.findOne({
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

                                        var newTimeOff = {};

                                        newTimeOff._user = organization.members[j]._user._id;
                                        newTimeOff._organization = organization._id;
                                        newTimeOff.amount = item.amount;
                                        newTimeOff.timeOffType = item.type;
                                        newTimeOff.performedAt = new Date(item.date);
                                        newTimeOff.externalId = item.externalId;
                                        newTimeOff.deleted = false;
                                        newTimeOff.active = true;

                                        newTimeOffs.push(newTimeOff);
                                    }
                                }
                            }

                            callback();
                        }
                    });
                } else {
                    callback(new Error('ExternalId null for item in date ' + item.date ));
                }


            }, function (err) {
                if (err) {
                    return next(err);
                }
                if (newTimeOffs.length > 0) {
                    TimeOff.collection.insert(newTimeOffs, {
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

exports.detail = function (req, res, next) {

    var organizationId = req.params.organizationId;

    TimeOff.findById(req.param.id, function (err, timeOff) {

        if (err) {
            return next(err);
        }

        if (!timeOff) {
            return next(new errorBuilder('No resource was found matching the given id.', 404));
        }

        return res.json(200, timeOff);
    });
};

// Creates a new timeOff in the DB.
exports.create = function (req, res, next) {

    var organizationId = req.params.organizationId;

    var timeOff = new TimeOff();

    timeOff.amount = req.body.amount;
    timeOff._user = req.body.userId;
    timeOff._organization = organizationId;
    timeOff.description = req.body.description;
    timeOff.timeOffType = req.body.timeOffType;
    timeOff.performedAt = req.body.performedAt;

    timeOff.save(function (err, savedTimeOff) {

        if (err) {
            return next(err);
        }

        res.status(201);
        res.location('/api/organizations/' + organizationId + '/timeOffs/' + savedTimeOff._id);

        return res.json(savedTimeOff);
    });
};

// Updates an existing timeOff in the DB.
exports.update = function (req, res, next) {
    console.log(req.body);
    TimeOff.findById(req.params.id, function (err, timeOff) {
        if (err) {
            return next(err);
        }
        if (!timeOff) {
            return next(new errorBuilder("time off not found", 404));
        }

        timeOff.amount = req.body.amount;
        timeOff.description = req.body.description;
        timeOff.timeOffType = req.body.timeOffType;
        timeOff.performedAt = req.body.performedAt;

        timeOff.save(function (err) {
            if (err) {
                return next(err);
            }
            return res.json(200, timeOff);
        });
    });

};

// Deletes a timeOff from the DB.
exports.destroy = function (req, res, next) {
    TimeOff.findById(req.params.id, function (err, timeOff) {
        if (err) {
            return next(err);
        }
        if (!timeOff) {
            return next(new errorBuilder("time off not found", 404));
        }
        if (!timeOff.externalId) {
            timeOff.deleted = true;
            timeOff.save(function (err) {
                if (err) {
                    return next(err);
                }
                return res.send(204);
            });
        } else {
            timeOff.remove(function (err) {
                if (err) {
                    return next(err);
                }
                return res.send(204);
            });
        }
    });
};