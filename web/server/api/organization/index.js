'use strict';

var express = require('express');
var controller = require('./organization.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:organizationId', auth.ensureOrganizationAdmin(), controller.update);
router.patch('/:organizationId', auth.ensureOrganizationAdmin(), controller.update);
router.delete('/:organizationId', auth.ensureOrganizationAdmin(), controller.destroy);
router.get('/:organizationId/readuid', auth.ensureOrganizationAdmin(), controller.readUid);

module.exports = router;
