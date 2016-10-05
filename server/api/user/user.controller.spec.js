'use strict';

'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var User = require('./user.model');
var controller = require('./user.controller');

var user = null;

function setupMockedUser() {
  user = new User({
    provider: 'local',
    name: 'Fake User',
    email: 'test@test.com',
    password: 'password'
  });
}

describe('User Controller', function() {

  before(function (done) {
    setupMockedUser();

    User.remove().exec().then(function () {
      done();
    });
  });

  it('Should correctly create the given user', function (done) {
    request(app)
      .post('/api/users/new')
      .send(user)
      .end(function (err, res) {
        should.not.exist(err);
        done();
      });
  });

  describe('tests APIs that requires authentication', function () {

    var accessToken = '';

    it('should achieve login with the user previously created', function (done) {
      request(app)
        .post('/auth/local')
        .send({
          email: user.email,
          password: user.password
        })
        .end(function (err, res) {
          should.not.exist(err);
          accessToken = res.body.token;
          done();
        });
    });

    it('should retrieve the user previously create', function (done) {
      request(app)
        .get('/api/users/me?access_token=' + accessToken)
        .send()
        .end(function (err, res) {
          should.not.exist(err);
          var data = res.body;
          data.email.should.be.equal(user.email);
          done();
        });
    });

  });

});
