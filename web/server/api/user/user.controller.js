'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var Organization = require('../organization/organization.model');
var errorBuilder = require('../../error-builder');
var auth = require('../../auth/auth.service');
var mailer = require('../../mailer/mailer');

var validationError = function (next, err) {
    var error = new errorBuilder(err.message, 422);

    console.log('Error built.');

    error.validation = err.errors;
    return next(error);
};

/**
 * Get a list of users.
 * It's possible to filter the list.
 */
exports.index = function (req, res, next) {

    var filters = [];

    if (req.query.searchField && req.query.searchText) {
        var filter = {};

        filter[req.query.searchField] = new RegExp(req.query.searchText, "i");

        filters.push(filter);
    }

    if (req.query.excluded) {
        filters.push({
            _id: {
                $nin: (typeof req.query.excluded !== 'string') ? req.query.excluded : [req.query.excluded]
            }
        });
    }

    User.find({
            $and: filters
        }, '-salt -hashedPassword',
        function (err, users) {
            if (err) {
                return next(err);
            }
            res.json(200, users);
        });
};

exports.delete = function (req, res, next) {

    if (req.param.id) {
        // delete a given user
    } else {
        // delete current user
    }
};

/**
 * Creates a new user and assigns to it a token with 5 hours of validity.
 */
exports.create = function (req, res, next) {

    var email = req.body.email;
    var password = req.body.password;
    var name = req.body.name;

    //Mail is the same
    User.findOne({
        email: req.body.email
    }, function (err, user) {
        if (err) {
            return res.json(401, {
                message: err
            });
        }

        if (!user) {
            return res.json(401, {
                message: 'This user is not registered.'
            });
        }

        if (user.active) {
            return res.json(401, {
                message: 'User is already active.'
            });
        }

        //updates the password by calculating hash of the new one
        user.password = req.body.password;
        user.active = true;
        user.name = req.body.name;

        //save the user to db
        user.save(function (err) {
            if (err) {
                return res.json(500, {
                    message: err
                });
            }

            res.status(201);
            res.location('/api/users/' + user._id);
            return res.json({
                token: auth.signToken({
                    _id: user._id
                })
            });

        });
    });
};

/**
 * Get data about the user related to the passed '_id'.
 */
exports.detail = function (req, res, next) {
    var userId = req.params.id;

    User.findById(userId, function (err, user) {

        if (err) {
            return next(err);
        }

        if (!user) {
            return res.send(401);
        }

        res.status(200);

        return res.json(user.profile);
    });
};

/**
 * Updates the user related to the given '_id'.
 * Right now it's allowed for all the users to only edit themselves' data.
 */
exports.update = function (req, res, next) {
    var userId = req.user._id;

    User.findById(userId, function (err, user) {
        if (err) {
            return next(err);
        }
        user._lastOrganization = req.body._lastOrganization;

        user.save(function (err) {
            if (err) {
                return validationError(next, err);
            }
            res.send(200);
        });

    });
};

/**
 * Get data about the currently logged user.
 */
exports.me = function (req, res, next) {
    var userId = req.user._id;
    User.findOne({
        _id: userId
    }, '-salt -hashedPassword', function (err, user) { // don't ever give out the password or salt
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new errorBuilder("user is not on the system", 401));
        }

        if (!user._lastOrganization) {
            /*
             * Query organizations, to find which of them have user as member
             */
            Organization.find({
                members: {
                    $elemMatch: {
                        _user: userId
                    }
                },
                deleted: false
            }).exec(function (err, organizations) {
                if (err) {
                    return next(err);
                }

                user._lastOrganization = organizations[0]._id;

                user.save(function (err) {
                    if (err) {
                        return next(err);
                    }

                    res.json(user);
                });
            });
        } else {
            res.json(user);
        }
    });
};

/**
 * Authentication callback
 */
exports.authCallback = function (req, res, next) {
    res.redirect('/');
};
