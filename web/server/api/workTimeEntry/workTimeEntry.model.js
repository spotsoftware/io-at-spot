'use strict';

var mongoose = require('mongoose'),
    BaseSchema = require('../base/model.js'),
    Schema = mongoose.Schema;

var WorkTimeEntrySchema = new BaseSchema({
    _user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    _organization: {
        type: Schema.ObjectId,
        ref: 'Organization',
        required: true
    },
    performedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    workTimeEntryType: {
        type: String,
        enum: ['in', 'out'],
        required: true
    },
    manual: {
        type: Boolean,
        default: false,
        required: true
    }
});

module.exports = mongoose.model('WorkTimeEntry', WorkTimeEntrySchema);