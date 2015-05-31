'use strict';

var express = require('express');
var controller = require('./member.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/api/organizations/:organizationId/members', auth.ensureOrganizationUserMiddleware(), controller.index);
//router.post('/api/organizations/:organizationId/members', auth.ensureOrganizationAdmin(), controller.add);
router.put('/api/organizations/:organizationId/members/:id', auth.ensureOrganizationAdminMiddleware(), controller.update);
router.delete('/api/organizations/:organizationId/members/:id', auth.ensureOrganizationAdminMiddleware(), controller.remove);

module.exports = router;