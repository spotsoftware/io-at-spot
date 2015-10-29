// config/passport.js

// load all the things we need
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load the auth variables
var config = require('../config/config');

module.exports = function(passport) {
    
	// =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    
    passport.use(new GoogleStrategy({

        clientID        : config.Google.clientId,
        clientSecret    : config.Google.clientSecret,
        callbackURL     : config.Google.callbackURL,
        passReqToCallback: true
    },
    function(req, token, refreshToken, profile, done) {
        req.google_token = token;
        return done(null, token, profile);
    }));

};

