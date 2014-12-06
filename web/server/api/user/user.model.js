'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var BaseSchema = require('../base/model.js');
var Organization = require('../organization/organization.model');
var authTypes = ['github', 'twitter', 'facebook', 'google'];


var UserSchema = new BaseSchema({
    name: String,
    email: {
        type: String,
        lowercase: true
    },
    hashedPassword: String,
    provider: String,
    salt: String,
    role: {
        default: 'user',
        type: String
    },
    //    googleId: String,
    _lastOrganization: {
        type: String,
        ref: 'Organization'
    }
});

/**
 * Virtuals
 */
UserSchema
    .virtual('password')
    .set(function (password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function () {
        return this._password;
    });

// Public profile information
UserSchema
    .virtual('profile')
    .get(function () {
        return {
            'name': this.name,
            //            'role': this.role
        };
    });

// Non-sensitive info we'll be putting in the token
UserSchema
    .virtual('token')
    .get(function () {
        return {
            '_id': this._id,
            //            'role': this.role
        };
    });

/**
 * Validations
 */

// Validate empty email
UserSchema
    .path('email')
    .validate(function (email) {
        return email.length;
    }, 'Email cannot be blank');

// Validate empty password
UserSchema
    .path('hashedPassword')
    .validate(function (hashedPassword) {
        return hashedPassword.length;
    }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
    .path('email')
    .validate(function (value, respond) {
        var self = this;
        this.constructor.findOne({
            email: value
        }, function (err, user) {
            if (err) throw err;
            if (user) {
                if (self.id === user.id) return respond(true);
                return respond(false);
            }
            respond(true);
        });
    }, 'The specified email address is already in use.');

var validatePresenceOf = function (value) {
    return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
    .pre('save', function (next) {
        this.wasNew = this.isNew;
        if (!this.isNew) {
            return next();
        } else {
            //this.active = false;
        }

        if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1) {
            next(new Error('Invalid password'));
        } else {
            next();
        }
    });

UserSchema
    .post('save', function () {


        if (this.wasNew) {

            var userAsMember = {
                _user: this,
                role: 'admin'
            };

            var workingDays = [];

            var workingStartTime = new Date();
            workingStartTime.setHours(8);
            workingStartTime.setMinutes(0);
            workingStartTime.setSeconds(0);
            workingStartTime.setMilliseconds(0);

            var workingEndTime = new Date();
            workingEndTime.setHours(20);
            workingEndTime.setMinutes(0);
            workingEndTime.setSeconds(0);
            workingEndTime.setMilliseconds(0);

            for (var i = 0; i < 7; i++) {
                workingDays.push({
                    active: true,
                    startOfficeTime: workingStartTime,
                    endOfficeTime: workingEndTime
                });
            }

            workingDays[5].active = false;
            workingDays[6].active = false;

            //Create Default Organization for new user
            var myOrganization = {
                name: this.name + ' - default Organization',
                members: [],
                settings: {
                    defaultTimeOffAmount: 8,
                    timeOffTypes: ['ferie', 'malattia'],
                    workingDays: workingDays
                }
            };

            myOrganization.members.push(userAsMember);

            //console.log(myOrganization);

            Organization.create(myOrganization, function (err, newOrganization) {
                if (err) {
                    console.log(err);
                }
            });
        }
    });

/**
 * Static Methods
 */
UserSchema.statics = {

};

/**
 * Instance Methods
 */
UserSchema.methods = {
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

module.exports = mongoose.model('User', UserSchema);