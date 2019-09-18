const UserService = require('../services/UserService'),
    validation = require('../util/validation'),
    VerificationService = require('../services/VerificationService'),
    config = require('../util/config'),
    { getUrl } = require('../security/google'),
    { getFacebookUrl } = require('../security/facebook');

module.exports = {
    index(req, res) {
        res.status(200).json({ message: "Welcome" })
    },
    onSignUp(req, res) {
        UserService.add(req.body)
            .then(user => {
                if (config.verification.emailVerification) VerificationService.add(user._id, user.email)
                res.status(200).json({ data: user })
            })
            .catch(err => {
                if (err.errors) {
                    res.status(400).json({ error: validation(err.errors) })
                } else if (err.message) {
                    res.status(400).json({ error: err.message })
                } else { res.status(400); }
            })
    },
    onUpdate(req, res) {
        UserService.update(req.params.userId, req.body)
            .then(resp => {
                res.status(200).json({ data: resp })
            })
            .catch(err => console.log(err))
    },
    onLoginSuccess(req, res) {
        res.status(200).json({ data: req.user })
    },
    failureRedirect(req, res) {
        res.status(400).json({ message: req.flash('message')[0] });
    },
    onEmailVerification(req, res) {
        UserService.verifyEmail(req.query.token)
            .then(resp => {
                res.status(200).json({ message: resp })
            })
            .catch(err => console.log(err))
    },
    socialLoginAllowed(req, res, next) {
        if (config.routes.socialLogin === 'both') {
            next();
        } else if (config.routes.socialLogin === 'none') {
            res.status(401).send('Not allowed');
        } else {
            if (req.path.includes('google') && config.routes.socialLogin !== 'google') {
                res.status(401).send('Not allowed');
            } else if (req.path.includes('facebook') && config.routes.socialLogin !== 'facebook') {
                res.status(401).send('Not allowed');
            } else {
                next();
            }
        }
    },
    onGoogleLogin(req, res) {
        res.redirect(getUrl());
    },
    onFacebookLogin(req, res) {
        res.redirect(getFacebookUrl());
    },
    afterSocialLogin(req, res) {
        UserService.addSocialAccount(req.path, req.query.code, req.query.access_token)
            .then(resp => {
                if (config.verification.socialVerification && !resp[0].verified) VerificationService.add(resp[0]._id, resp[0].email)
                res.status(200).json({ data: resp })
            })
            .catch(err => console.log)
    },
}