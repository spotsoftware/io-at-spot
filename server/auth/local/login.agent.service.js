var superagent = require('superagent');
var agent = superagent.agent();

var account = {
    "email": "test@test.com",
    "password": "test"
};

exports.login = function (request, done) {
    request
        .post('/auth/local')
        .send(account)
        .end(function (err, res) {
            if (err) {
                throw err;
            }
            console.log(res);

            agent.saveCookies(res);

            done(agent);
        });
};