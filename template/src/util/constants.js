module.exports = {
    mailType: Object.freeze({
        emailVerification: 0,
        phoneVerification: 1,
        forgotPassword: 2,
        generatePassword: 3,
    }),
    socialType: Object.freeze({
        facebook: 0,
        google: 1
    }),
};