'use strict';

var express = require('express');
var controller = require('./workTimeEntry.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/api/organizations/:organizationId/workTimeEntries', auth.ensureOrganizationUserMiddleware(), controller.index);
router.get('/api/organizations/:organizationId/workTimeEntries/:id', auth.ensureOrganizationUserMiddleware(), controller.detail);
router.post('/api/organizations/:organizationId/workTimeEntries', auth.ensureOrganizationUserMiddleware(), controller.create);
router.put('/api/organizations/:organizationId/workTimeEntries/:id', auth.ensureOrganizationUserMiddleware(), controller.update);
router.patch('/api/organizations/:organizationId/workTimeEntries/:id', auth.ensureOrganizationUserMiddleware(), controller.update);
router.delete('/api/organizations/:organizationId/workTimeEntries/:id', auth.ensureOrganizationUserMiddleware(), controller.destroy);

router.post('/api/organizations/:organizationId/workTimeEntries/batch', auth.ensureOrganizationAdminMiddleware(), controller.batch);

module.exports = router;