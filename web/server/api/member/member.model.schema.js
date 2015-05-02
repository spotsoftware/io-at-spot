'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    BaseSchema = require('../base/model.js');
//WorkTimeEntrySchema = require('../workTimeEntry/workTimeEntry.model'),
//TimeOffSchema = require('../timeOff/timeOff.model');

/**
 * Organization's Member schema
 * it's not inheriting from base model, cause it's not a db entity
 */
var MemberSchema = new Schema({
    _user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    role: {
        type: String,
        enum: ['admin', 'user']
    },
    active: {
        type: Boolean,
        required: true,
        default: false
    },
    nfc_uid: String
});

module.exports = MemberSchema;