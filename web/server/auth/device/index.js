'use strict';

var express = require('express');
var auth = require('../auth.service');
var Organization = require('../../api/organization/organization.model');

var router = express.Router();

router.post('/', function (req, res, next) {

    var organizationId = req.body.id;
    var password = req.body.password;

    Organization.findById(organizationId,
        function (err, organization) {
            if (err) {
                return handleError(err);
            }

            if (!organization) {
                return res.send(404);
            }

            if (!organization.authenticate(password)) {
                return res.send(403);
            }

            var token = auth.signToken(organization._id);

            res.json({
                token: token
            });
        });

});

function handleError(res, err) {
    return res.send(500, err);
}

module.exports = router;