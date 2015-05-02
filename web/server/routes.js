/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var apiErrorsHandler = require('./components/apiErrorsHandler');
var auth = require('./auth/auth.service');

module.exports = function (app) {

    // Insert routes below
    app.all('/api/organizations/:organizationId/workTimeEntries*', require('./api/workTimeEntry'));
    app.all('/api/organizations/:organizationId/timeOffs*', require('./api/timeOff'));
    app.all('/api/organizations/:organizationId/members*', require('./api/member'));
    app.all('/api/organizations/:organizationId/invites*', require('./api/invite'));
    app.use('/api/organizations', require('./api/organization'));

    app.use('/api/users', require('./api/user'));

    app.use('/auth', require('./auth'));

    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*').get(errors[404]);

    // All other routes should redirect to the index.html
    app.route('/*').get(function (req, res) {
        res.sendfile(app.get('appPath') + '/index.html');
    });

    //central error handler
    app.use(apiErrorsHandler);
};