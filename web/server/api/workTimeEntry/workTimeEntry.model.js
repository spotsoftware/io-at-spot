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

/**
 * Pre-save hook
 */
WorkTimeEntrySchema.pre('save', function (next) {
    //this.wasNew = this.isNew;

    if (!this.isNew) {
        return next();
    } else {
        if (!this.workTimeEntryType && !this.performedAt) {

            var start = new Date();
            start.setHours(0, 0, 0, 0);

            var end = new Date();
            end.setHours(23, 59, 59, 999);

            this.constructor.find({
                    _user: this._user,
                    _organization: this._organization,
                    deleted: false,
                    performedAt: {
                        $gte: start,
                        $lte: end
                    }
                })
                .sort('-performedAt')
                .exec(function (err, entries) {

                    if (err) return next(err);

                    this.workTimeEntryType = entries.length === 0 ? 'in' : (entries[0].workTimeEntryType === 'out' ? 'in' : 'out');

                    return next();
                });
        } else {
            return next();
        }
    }
});

module.exports = mongoose.model('WorkTimeEntry', WorkTimeEntrySchema);