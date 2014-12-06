'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/', auth.isAuthenticated(), controller.index);
router.get('/me', auth.isAuthenticated(), controller.me);
// router.delete('/me', auth.isAuthenticated(), controller.destroy);
router.put('/me', auth.isAuthenticated(), controller.update);
router.post('/new', controller.create);

module.exports = router;
