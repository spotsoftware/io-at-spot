'use strict';

var express = require('express');
var controller = require('./workTimeEntry.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/api/organizations/:organizationId/workTimeEntries', auth.ensureOrganizationUser(), controller.index);
router.get('/api/organizations/:organizationId/workTimeEntries/:id', auth.ensureOrganizationUser(), controller.detail);
router.post('/api/organizations/:organizationId/workTimeEntries', auth.ensureOrganizationUser(), controller.create);
router.put('/api/organizations/:organizationId/workTimeEntries/:id', auth.ensureOrganizationUser(), controller.update);
router.patch('/api/organizations/:organizationId/workTimeEntries/:id', auth.ensureOrganizationUser(), controller.update);
router.delete('/api/organizations/:organizationId/workTimeEntries/:id', auth.ensureOrganizationUser(), controller.destroy);

module.exports = router;
