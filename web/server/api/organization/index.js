'use strict';

var express = require('express');
var controller = require('./organization.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:organizationId', auth.isAuthenticated(), controller.detail);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:organizationId', auth.ensureOrganizationAdmin(), controller.update);
router.patch('/:organizationId', auth.ensureOrganizationAdmin(), controller.update);
router.delete('/:organizationId', auth.ensureOrganizationAdmin(), controller.destroy);

// TODO - imagine the UUID as a sub-resource of the organization's one,
// so that we can still be REST compliant.
// DONE - simply changed the name of the sub-resource. 'readuid' was more similar to a web service url.
router.get('/:organizationId/uid', auth.ensureOrganizationAdmin(), controller.readUid);

module.exports = router;
