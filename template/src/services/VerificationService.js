const BaseService = require('./BaseService'),
    Model = require('../models/Verification'),
    constants = require('../util/constants'),
    MailService = require('./MailService'),
    CryptoJS = require("crypto-js");

class VerificationService extends BaseService {

    constructor() {
        super(Model);
    }

    add(userId, userEmail) {
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let randomStr = "";
        for (let i = 0; i < 8; i++) {
            randomStr += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        let str = randomStr + userEmail
        let hash = CryptoJS.AES.encrypt(str, process.env.CRYPTO_SECRET);
        new Model({
            userId: userId,
            verificationType: constants.mailType.emailVerification,
            token: hash
        }).save()
        MailService.sendVerificationMail(userEmail, hash);
    }

}
module.exports = new VerificationService();