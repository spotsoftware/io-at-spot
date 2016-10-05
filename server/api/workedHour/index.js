'use strict';

var express = require('express');
var controller = require('./workedHour.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/api/organizations/:organizationId/workedHours', auth.ensureOrganizationUserMiddleware(), controller.index);

module.exports = router;