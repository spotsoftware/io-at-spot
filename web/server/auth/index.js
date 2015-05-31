'use strict';

var express = require('express');
var passport = require('passport');
var config = require('../config/environment');
var User = require('../api/user/user.model');
var Organization = require('../api/organization/organization.model');
var auth = require('./auth.service');

// Passport Configuration
require('./local/passport').setup(User, config);
require('./google/passport').setup(User, config);

var router = express.Router();

router.use('/local', require('./local'));
router.use('/google', require('./google'));
router.use('/device', require('./device'));

module.exports = router;