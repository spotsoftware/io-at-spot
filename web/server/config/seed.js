/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');
var Organization = require('../api/organization/organization.model');
var config = require('./environment');

User.findOne({
    email: config.admin.email
}, function (err, user) {
    if (err) {
        console.log(err);
    }
    if (!user) {
        //ADD superadmin
        User.create({
            provider: 'local',
            name: 'Admin',
            email: config.admin.email,
            password: config.admin.password
        }, function (err, newUser) {
            if (err) {
                console.log(err);
            }
        });
    }
});