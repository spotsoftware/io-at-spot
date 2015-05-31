'use strict';

var mongoose = require('mongoose'),
    BaseSchema = require('../base/model.js'),
    Schema = mongoose.Schema;

var TimeOffSchema = new BaseSchema({
    _user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    _organization: {
        type: Schema.ObjectId,
        ref: 'Organization'
    },
    timeOffType: String,
    performedAt: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: String,
    externalId: {
        required: false,
        type: String,
        unique: true
    }
});

module.exports = mongoose.model('TimeOff', TimeOffSchema);