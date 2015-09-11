'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var request = require('request-json');
var User = require('../../api/user/user.model');
var crypto = require('crypto');

var router = express.Router();

router
    .get('/',
        passport.authenticate('google', {
            failureRedirect: '/login',
            scope: [
              'https://www.googleapis.com/auth/userinfo.profile',
              'https://www.googleapis.com/auth/userinfo.email'
            ],
            session: false
        }))
    .get('/callback',
        passport.authenticate('google', {
            failureRedirect: '/login',
            session: false
        }),
        auth.setTokenCookie)
    .post('/getLocalUser', function (req, res) {
        //check google token
        var client = request.newClient('https://www.googleapis.com/');
        client.get('oauth2/v1/tokeninfo?access_token=' + req.body.token, function (err, apiRes, body) {
            if (err) {
                return res.send(err);
            }

            if (req.body.email === body.email) {

                User.findOne({
                    'email': body.email
                }, function (err, user) {

                    if (err) {
                        return res.send(401, err);
                    }

                    if (!user) {
                        return res.send(401, "User not registered.");
                    } else {
                        //user found, return this user
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
                    }
                });
            } else {
                return res.send(401, "Invalid token");
            }
        });

    });

module.exports = router;