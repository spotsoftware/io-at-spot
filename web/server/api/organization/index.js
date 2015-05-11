'use strict';

var express = require('express');
var controller = require('./organization.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticatedMiddleware(), controller.index);
router.get('/:organizationId', controller.detail);
router.post('/', auth.isAuthenticatedMiddleware(), controller.create);
router.put('/:organizationId', auth.ensureOrganizationAdminMiddleware(), controller.update);
router.patch('/:organizationId', auth.ensureOrganizationAdminMiddleware(), controller.update);
router.delete('/:organizationId', auth.ensureOrganizationAdminMiddleware(), controller.destroy);

// TODO - imagine the UUID as a sub-resource of the organization's one,
// so that we can still be REST compliant.
// DONE - simply changed the name of the sub-resource. 'readuid' was more similar to a web service url.
router.get('/:organizationId/uid', auth.ensureOrganizationAdminMiddleware(), controller.readUid);

module.exports = router;