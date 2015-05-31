var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var errorBuilder = require('../../error-builder');

exports.setup = function (User, config) {
    passport.use(new GoogleStrategy({
            clientID: config.google.clientID,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.callbackURL
        },
        function (accessToken, refreshToken, profile, done) {

            //Search for a single user with the google email
            User.findOne({
                //'google.id': profile.id,
                'email': profile.emails[0].value
            }, function (err, user) {

                if (err) {
                    return done(err);
                }

                if (!user) {

                    return done(new errorBuilder(403, 'user not found'));
                    //                    //User is not found on db, create a new user
                    //                    user = new User({
                    //                        name: profile.displayName,
                    //                        email: profile.emails[0].value.toLowerCase(),
                    //                        role: 'user',
                    //                        username: profile.username,
                    //                        provider: 'google',
                    //                        google: profile._json,
                    //                        active: false
                    //                    });

                } else {
                    //user found, return this user
                    if (!user.active) {
                        user.active = true;
                        user.name = profile.displayName;
                        user.google = profile._json;
                    }

                    user.save(function (err) {
                        if (err) {
                            return done(err);
                        }

                        done(err, user);
                    });

                    return done(err, user);
                }
            });
        }));
};