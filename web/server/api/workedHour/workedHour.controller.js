'use strict';

var async = require('async');
var _ = require('lodash');
var mongoose = require('mongoose');
var moment = require('moment-timezone');
var WorkTimeEntry = require('../workTimeEntry/workTimeEntry.model');
var Organization = require('../organization/organization.model');
var User = require('../user/user.model');
var auth = require('../../auth/auth.service');
var errorBuilder = require('../../error-builder');
var util = require('util');



// Get list of workTimeEntries
exports.index = function (req, res, next) {

  if (!req.query) {
    return next(new errorBuilder("request query string can't be empty", 403));
  }

  var organizationId = new mongoose.Types.ObjectId(req.params.organizationId);

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

  var o = {
    map: function () {

      var day = new Date(this.performedAt.getTime());
      day.setHours(0, 0, 0, 0);

      //The key is user-day 
      var key = {
        day: day,
        user: this._user
      };

      //value is type and performedAt

      emit(key, this.performedAt.getTime());
    },
    reduce: function (key, values) {

      var reducedValue = 0;

      if (values.length % 2 === 1) return reducedValue;

      for (var i = 0; i < values.length; i = i + 2) {

        reducedValue += (values[i] - values[i + 1]);

      }
      
      return reducedValue;
    },

    query: {
      $and: filterConditions
    },

    sort: {
      performedAt: -1
    }
  };

  WorkTimeEntry.mapReduce(o, function (err, items) {
    if (err) {
      return next(err);
    }

    res.json(items);
  });
};
