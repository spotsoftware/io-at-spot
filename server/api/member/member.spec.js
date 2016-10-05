'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var User = require('../user/user.model');
var Organization = require('../organization/organization.model');
var organizationBuilder = require('../organization/organization.default');

var user = new User({
    provider: 'local',
    name: 'Test User',
    email: 'test@email.com',
    password: 'password'
});

var organization = new Organization({

});

var sampleOrganization = null;
var accessToken = null;

describe('GET /api/organizations/:organizationId/members', function () {

    before(function (done) {

        Organization.remove().exec().then(function () {
            User.remove().exec().then(function () {
                user.save(function (err) {
                    if (err) {
                        console.log("user not saved");
                        return;
                    }

                    Organization.create(organizationBuilder(user), function (err, organization) {
                        if (err) {
                            console.log(err);
                            return;
                        }

                        sampleOrganization = organization;

                        request(app)
                            .post('/auth/local')
                            .send({
                                email: user.email,
                                password: user.password
                            })
                            .end(function (err, res) {
                                if (err) {
                                    throw err;
                                }

                                accessToken = res.body.token;

                                done();
                            });
                    });
                });
            });
        });
    });

    it('should respond with JSON array', function (done) {
        request(app)
            .get('/api/organizations/' + sampleOrganization._id + '/members?access_token=' + accessToken)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.be.instanceof(Array);
                done();
            });
    });
});
