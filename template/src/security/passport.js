const UserModel = require('../models/User'),
    LocalStrategy = require('passport-local').Strategy,
    config = require('../util/config');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(id, done) {
        UserModel.findById(id, null, { autopopulate: false }).lean()
            .then((resp) => done(null, resp))
            .catch((err) => done(err, null))
    })

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, username, password, done) {
            let query = { username: username }
            if (config.validation.loginField === 'username_email') {
                query = {
                    $or: [
                        { username: username },
                        { email: username }
                    ]
                }
            } else {
                query = {
                    [config.validation.loginField]: username
                }
            }
            UserModel.findOne(query, function(err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, req.flash('message', "User with these credentials does not exist"));
                }
                if (config.verification.emailVerification && !config.verification.loginWithoutVerification) {
                    if (!user.verified) {
                        return done(null, false, req.flash('message', "You must activate account first."));
                    }
                }
                return UserModel.comparePassword(password, user.password)
                    .then(isMatch => {
                        if (isMatch) return done(null, user);
                        else {
                            return done(null, false, req.flash('message', "Wrong Password"));
                        }
                    })
                    .catch(err => {
                        return done(null, false, req.flash('message', "Unknown error occurred"));
                    });
            });
        }
    ));

};