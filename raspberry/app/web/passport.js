// config/passport.js

// load all the things we need
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load the auth variables
var configAuth = require('./auth');

module.exports = function(passport) {
    
	// =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    
    passport.use(new GoogleStrategy({

        clientID        : configAuth.Google.clientId,
        clientSecret    : configAuth.Google.clientSecret,
        callbackURL     : configAuth.Google.callbackURL,
        passReqToCallback: true
    },
    function(req, token, refreshToken, profile, done) {
        req.google_token = token;
        return done(null, token, profile);
    }));

};

