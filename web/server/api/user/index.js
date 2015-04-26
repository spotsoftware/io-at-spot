'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

// RESTfully talking, we created a new sub-resource of /user for the currently logged user.
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/me', auth.isAuthenticated(), controller.update);
router.patch('/me', auth.isAuthenticated(), controller.update);
router.delete('/me', auth.isAuthenticated(), controller.delete);

router.get('/', auth.isAuthenticated(), controller.index);
// TODO - left blank, don't know if needed and if possible without modifications to the domain model.
router.get('/:id', auth.isAuthenticated(), controller.detail);
// TODO - shouln't we enforce the security on user creation?
router.post('/', controller.create);
// TODO - left blank, don't know if needed and if possible without modifications to the domain model
router.delete('/:id', controller.delete);

module.exports = router;