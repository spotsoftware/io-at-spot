'use strict';

var mongoose = require('mongoose');
var BaseSchema = require('../base/model.js');
var crypto = require('crypto');
var MemberSchema = require('../member/member.model.schema');
var Schema = mongoose.Schema;


var workingDaySchema = new Schema({
    active: Boolean,
    startOfficeTime: Date,
    endOfficeTime: Date
});

/**
 * Organization Schema
 */
var OrganizationSchema = new BaseSchema({
    name: String,
    members: [MemberSchema],
    settings: {
        defaultTimeOffAmount: {
            type: Number,
            default: 8
        },
        timeOffTypes: [String],
        workingDays: [workingDaySchema]
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
            members: this.members,
            settings: this.settings,
            hasPassword: this.hasPassword
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
    }
};

module.exports = mongoose.model('Organization', OrganizationSchema);