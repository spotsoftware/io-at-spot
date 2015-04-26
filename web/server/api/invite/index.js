'use strict';

var express = require('express');
var controller = require('./invite.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/api/organizations/:organizationId/invites', auth.ensureOrganizationAdmin(), controller.index);

router.get('/api/organizations/:organizationId/invites/:id', controller.details);
router.post('/api/organizations/:organizationId/invites', auth.ensureOrganizationAdmin(), controller.add);
router.put('/api/organizations/:organizationId/invites/:id', auth.isAuthenticated(), controller.accept);
router.delete('/api/organizations/:organizationId/invites/:id', auth.isAuthenticated(), controller.remove);

module.exports = router;