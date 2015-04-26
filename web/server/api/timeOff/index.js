'use strict';

var express = require('express');
var controller = require('./timeOff.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/api/organizations/:organizationId/timeOffs', auth.ensureOrganizationUserMiddleware(), controller.index);
router.get('/api/organizations/:organizationId/timeOffs:id', auth.ensureOrganizationUserMiddleware(), controller.detail);
router.post('/api/organizations/:organizationId/timeOffs', auth.ensureOrganizationUserMiddleware(), controller.create);
router.put('/api/organizations/:organizationId/timeOffs/:id', auth.ensureOrganizationUserMiddleware(), controller.update);
router.patch('/api/organizations/:organizationId/timeOffs/:id', auth.ensureOrganizationUserMiddleware(), controller.update);
router.delete('/api/organizations/:organizationId/timeOffs/:id', auth.ensureOrganizationUserMiddleware(), controller.destroy);

module.exports = router;