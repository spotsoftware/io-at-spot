'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var User = require('../api/user/user.model');
var Organization = require('../api/organization/organization.model');
var validateJwt = expressJwt({
    secret: config.secrets.session
});

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticatedMiddleware() {
    return compose()
        // Validate jwt
        .use(function (req, res, next) {
            // allow access_token to be passed through query parameter as well
            if (req.query && req.query.hasOwnProperty('access_token')) {
                req.headers.authorization = 'Bearer ' + req.query.access_token;
            }

            validateJwt(req, res, next);
        })
        // Attach user to request
        .use(function (req, res, next) {
            User.findById(req.user._id, function (err, user) {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    return res.send(401);
                }
                req.user = user;
                next();
            });
        });
}

/**
 * Checks if the user is in organization
 */
function ensureOrganizationUserMiddleware() {

    return compose()
        .use(isAuthenticatedMiddleware())
        .use(function ensureOrganizationUser(req, res, next) {
            var userId = req.user._id;

            var organizationId = new mongoose.Types.ObjectId(req.params["organizationId"]);

            Organization.findById(organizationId, function (err, organization) {
                if (!err) {
                    var found = false;
                    organization.members.forEach(function (member) {
                        if (member._user.equals(userId) && member.active) {
                            found = true;
                            next();
                        }
                    });
                    if (!found) {
                        res.send(403);
                    }
                } else {
                    next(err);
                }
            });
        });
};

/**
 * Checks if the user is one of the organization's owners
 */
function ensureOrganizationAdminMiddleware() {


    return compose()
        .use(isAuthenticatedMiddleware())
        .use(function ensureOrganizationAdmin(req, res, next) {

            var userId = req.user._id;

            var organizationId = new mongoose.Types.ObjectId(req.params["organizationId"]);

            Organization.findById(organizationId, function (err, organization) {
                if (!err) {
                    var found = false;
                    organization.members.forEach(function (member) {
                        if (member._user.equals(userId) && member.active && member.role == "admin") {
                            found = true;
                            next();
                        }
                    });

                    if (!found) {
                        res.send(403);
                    }
                } else {
                    return next(err);
                }
            });
        });
};

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(data, expiration) {

    var signedToken = jwt.sign(data, config.secrets.session, {
        expiresInMinutes: expiration ? expiration : 60 * 5
    });

    return signedToken;
}

/**
 * Verify a jwt token signed by the app secret
 */
function verifyToken(token, callback, ignoreExpiration) {

    jwt.verify(token, config.secrets.session, {
        ignoreExpiration: ignoreExpiration ? ignoreExpiration : false
    }, function (err, decoded) {
        if (err) {
            console.log('error', err);
            return callback(err);
        }
        callback(undefined, decoded);
    });

}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
    if (!req.user) {
        return res.json(404, {
            message: 'Something went wrong, please try again.'
        });
    }
    var token = signToken({
        _id: req.user._id
    });
    res.cookie('token', JSON.stringify(token));
    //console.log(req);
    res.redirect('/');
    //res.send(200);
}

exports.ensureOrganizationUserMiddleware = ensureOrganizationUserMiddleware;
exports.ensureOrganizationAdminMiddleware = ensureOrganizationAdminMiddleware;
exports.isAuthenticatedMiddleware = isAuthenticatedMiddleware;
//exports.hasRole = hasRole;
exports.signToken = signToken;
exports.verifyToken = verifyToken;
exports.setTokenCookie = setTokenCookie;