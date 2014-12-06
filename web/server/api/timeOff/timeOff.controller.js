'use strict';

var _ = require('lodash');
var TimeOff = require('./timeOff.model');
var mongoose = require('mongoose');
var auth = require('../../auth/auth.service');
var errorBuilder = require('../../error-builder');

// Get list of timeOffs
exports.index = function (req, res, next) {
    if (!req.body) {
        return next(new errorBuilder("request body can't be empty", 403));
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

    if (req.body.from && req.body.to) {

        filterConditions.push({
            performedAt: {
                $gte: new Date(req.body.from),
                $lte: new Date(req.body.to)
            }
        });

    } else if (req.body.from) {

        filterConditions.push({
            performedAt: {
                $gte: new Date(req.body.from)
            }
        });

    } else if (req.body.to) {

        filterConditions.push({
            performedAt: {
                $lte: new Date(req.body.to)
            }
        });
    }

    if (req.body.timeOffType) {

        filterConditions.push({
            timeOffType: req.body.timeOffType
        });
    }

    var membersFilter = [];

    console.log(req.user);
    membersFilter.push({
        _user: req.user._id
    });

    //Only if the user is the owner of the organization
    if (auth.ensureOrganizationAdmin() && req.body.members && req.body.members.length > 0) {
        array.forEach(req.body.members.length, function (el, i) {

            membersFilter.push({
                _user: el._user
            });
        });
    }

    filterConditions.push({
        $or: membersFilter
    });

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
        return res.json(201, savedTimeOff);
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
        timeOff.deleted = true;
        timeOff.save(function (err) {
            if (err) {
                return next(err);
            }
            return res.send(204);
        });
    });
};