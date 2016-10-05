var mongoose = require('mongoose');
var util = require('util');
var Schema = mongoose.Schema;

function BaseSchema() {
    Schema.apply(this, arguments);

    this.add({
        /*_id: Schema.ObjectId,
        _createdBy: {
            type: Schema.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        _updatedBy: {
            type: Schema.ObjectId,
            ref: 'User'
        },
        updatedAt: Date,
        */
        deleted: {
            type: Boolean,
            default: false
        },
        active: {
            type: Boolean,
            default: true
        }
    });
}

util.inherits(BaseSchema, Schema);

module.exports = BaseSchema;