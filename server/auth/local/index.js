'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var User = require('../../api/user/user.model');
var mailer = require('../../mailer/mailer');
var errorBuilder = require('../../error-builder');
var crypto = require('crypto');
var router = express.Router();
var config = require('../../config/environment');

router.post('/', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {

        var error = null; // err || info;

        if (err) {
            error = new errorBuilder('Invalid authentication details provided.', 401);
        } else if (!user) {
            error = new errorBuilder(info.message, 404);
        }

        if (error) {
            next(error);

        } else {
            var token = auth.signToken({
                _id: user._id
            });
            res.json({
                token: token
            });
        }

    })(req, res, next)
});

router.post('/refresh', function (req, res, next) {

    auth.verifyToken(req.body.token, function (err, decode) {
        if (err) {
            return res.send(401, err);
        }
        User.findOne({
            _id: decode._id
        }, '-salt -hashedPassword', function (err, user) {
            if (err) {
                return res.json(401, err);
            }

            if (!user) {
                return res.json(401, {
                    message: 'This user is not registered.'
                });
            }

            //expires in 10 days
            var token = auth.signToken({
                _id: user._id
            }, 60 * 24 * 10);
            
            var hash = crypto.createHash('md5').update(token).digest('hex');
            
            user.deviceTokenHash = hash;
            
            user.save(function(err){
                if(err){
                    return res.json(401, err);
                }
                
                res.json({
                    token: token,
                    tokenHash: hash,
                    user: user,
                    type: 'local'
                });
            });
        });
    });
});

router.post('/forgot', function (req, res, next) {

    //search for a user with this email
    User.findOne({
        email: req.body.email
    }, '-salt -hashedPassword', function (err, user) {
        if (!user) {
            //if the user is not found, send back to forgot page
            return res.json(404, {
                message: 'This user is not registered.'
            });
        }

        //expires in 1 hour
        var token = auth.signToken({
            _id: user._id
        }, 60 * 1);

        var mailOptions = {
            to: user.email,
            subject: 'io@spot password reset',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };

        mailer.sendMail(mailOptions, function (err) {
            if (err) {
                return res.json(500, {
                    message: err
                });
            }

            res.json({
                message: 'An e-mail has been sent to ' + user.email + ' with further instructions.'
            });
        });
    });
});

router.post('/reset', function (req, res, next) {
    auth.verifyToken(req.body.token, function (err, decoded) {

        if (err) {
            res.json(401, {
                message: err
            });
        }

        User.findOne({
            _id: decoded._id
        }, '-salt -hashedPassword', function (err, user) {
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

            //updates the password by calculating hash of the new one
            user.password = req.body.password;
            //save the new password to db
            user.save(function (err) {
                if (err) {
                    return res.json(500, {
                        message: err
                    });
                }

                var mailOptions = {
                    to: user.email,
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };

                mailer.sendMail(mailOptions, function (err) {
                    if (err) {
                        return res.send(500, {
                            message: err
                        });
                    }

                    //send the client back to the login page
                    res.json({
                        message: 'Success! Your password has been changed.'
                    });
                });

            });
        });
    });
});

module.exports = router;
