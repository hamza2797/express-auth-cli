const nodemailer = require('nodemailer');
const roleId = require('../util/constants').roleId;
const UserModel = require('../models/User');

class MailService {

    constructor() { }

    sendVerificationMail(email, token) {

        const mailOptions = {
            from: process.env.FROM_MAIL,
            to: email,
            subject: 'Zazu LineSkipper Email Verification',
            text: 'Use this link to verify your account: ' + process.env.BASE_URL + '/users/verify-email?token=' + token
        };
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });
        transporter.sendMail(mailOptions, function (err, info) { });
    }

}
module.exports = new MailService();