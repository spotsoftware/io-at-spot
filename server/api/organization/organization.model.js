'use strict';

var mongoose = require('mongoose');
var BaseSchema = require('../base/model.js');
var crypto = require('crypto');
var MemberSchema = require('../member/member.model.schema');
var Schema = mongoose.Schema;


var workingDaySchema = new Schema({
    active: {
        type: Boolean,
        default: false
    },
    startOfficeTime: {
        type: Date,
        required: true
    },
    endOfficeTime: {
        type: Date,
        required: true
    }
});

/**
 * Organization Schema
 */
var OrganizationSchema = new BaseSchema({
    name: {
        type: String,
        required: true
    },
    members: [MemberSchema],
    settings: {
        defaultTimeOffAmount: {
            type: Number,
            default: 8,
            required: true
        },
        timeOffTypes: {
            type: [String],
            required: true
        },
        workingDays: {
            type: [workingDaySchema],
            required: true
        }
    },
    hashedPassword: String,
    salt: String
});

/**
 * Virtuals
 */
OrganizationSchema
    .virtual('password')
    .set(function (password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function () {
        return this._password;
    });


//Existing password util
OrganizationSchema
    .virtual('hasPassword')
    .get(function () {
        return !!(this.hashedPassword) && this.hashedPassword !== '';
    });

// Public profile information
OrganizationSchema
    .virtual('public')
    .get(function () {
        return {
            _id: this._id,
            name: this.name,
            //members: this.members,
            settings: this.settings,
            hasPassword: this.hasPassword
        }
    });


/**
 * Pre-save hook
 */
OrganizationSchema
    .pre('save', function (next) {
        if (!this.validateSettingsStructure()) {
            next(new Error('Invalid settings'));
        } else {
            next();
        }
    });

/**
 * Instance Methods
 */
OrganizationSchema.methods = {
    /** 
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashedPassword;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function () {
        return crypto.randomBytes(16).toString('base64');
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function (password) {
        if (!password || !this.salt) return '';
        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    },

    /*
     * Validate settings presence and workingDays size
     */
    validateSettingsStructure: function () {
        if (!this.settings) {
            return false;
        }
        if (this.settings.workingDays.length !== 7) {
            return false;
        }

        return true;
    }
};

module.exports = mongoose.model('Organization', OrganizationSchema);