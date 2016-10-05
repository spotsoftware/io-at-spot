'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

// RESTfully talking, we created a new sub-resource of /user for the currently logged user.
router.get('/me', auth.isAuthenticatedMiddleware(), controller.me);
router.put('/me', auth.isAuthenticatedMiddleware(), controller.update);
router.patch('/me', auth.isAuthenticatedMiddleware(), controller.update);
router.delete('/me', auth.isAuthenticatedMiddleware(), controller.delete);

router.get('/', auth.isAuthenticatedMiddleware(), controller.index);
// TODO - left blank, don't know if needed and if possible without modifications to the domain model.
router.get('/:id', auth.isAuthenticatedMiddleware(), controller.detail);
// TODO - shouln't we enforce the security on user creation?
router.post('/', controller.create);
// TODO - left blank, don't know if needed and if possible without modifications to the domain model
router.delete('/:id', controller.delete);

module.exports = router;