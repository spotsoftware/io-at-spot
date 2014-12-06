'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var loginService = require('../../auth/local/login.agent.service');
var Organization = require('../organization/organization.model');

var user = new User({
    provider: 'local',
    name: 'Test User',
    email: 'test@email.com',
    password: 'password'
});

var sampleOrganization = null;

describe('Testing work time entries API', function () {

    before(function (done) {
        Organization.remove().exec().then(function () {
            User.remove().exec().then(function () {
                user.save(function () {
                    Organization.find({}, function (err, org) {
                        org.should.have.length(0);
                        sampleOrganization = org;
                        done();
                    });
                });
            });
        });
    });

    describe('Testing work time entries API without authentication', function () {

        describe('GET /api/organizations/:organizationId/workTimeEntries', function () {

            it('should fail because user is not authenticated', function (done) {

            });

        });

    });


    describe('Testing work time entries API with authenticated agent', function () {
        var agent;

        before(function (done) {
            loginService.login(request, function (loginAgent) {
                agent = loginAgent;
                done();
            });
        });

        describe('GET /api/organizations/:organizationId/workTimeEntries', function () {

            it('should fail because user is not authenticated', function (done) {

            });

            it('should fail because user is not member of the organization', function (done) {

            });

            it('should fail because user is not admin of the organization', function (done) {

            });

            it('should allow access to admin when logged in', function (done) {
                var req = request.get('/api/organizations/:organizationId/workTimeEntries');
                agent.attachCookies(req);
                req.expect(200, done);
            });

            it('should respond with JSON array', function (done) {
                var req = request(app).get('/api/organizations/' + sampleOrganization + '/workTimeEntries');

                req.expect(200)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) return done(err);
                        res.body.should.be.instanceof(Array);
                        done();
                    });
            });

        });

    });
});