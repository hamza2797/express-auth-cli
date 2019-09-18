const UserController = require('../controllers').UserController;

module.exports = function (app, passport) {
    app.post('/users/login', passport.authenticate('local-login', { failureRedirect: '/login/failure', failureFlash: true }), UserController.onLoginSuccess);
    app.get('/login/failure', UserController.failureRedirect);

    app.get('/google/url', UserController.socialLoginAllowed, UserController.onGoogleLogin);
    app.get('/google/return', UserController.socialLoginAllowed, UserController.afterSocialLogin);

    app.get('/facebook/url', UserController.socialLoginAllowed, UserController.onFacebookLogin);
    app.get('/facebook/return', UserController.socialLoginAllowed, UserController.afterSocialLogin);


    app.get('/', UserController.index);
    app.use('/users', require('./users'));
};