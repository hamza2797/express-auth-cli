const Model = require('../models/User'),
    Social = require('../models/Social'),
    BaseService = require('../services/BaseService'),
    CryptoJS = require("crypto-js"),
    VerificationModel = require('../models/Verification'),
    constants = require('../util/constants'),
    config = require('../util/config'),
    { getProfile } = require('../security/google'),
    { getFacebookProfile } = require('../security/facebook');

class UserService extends BaseService {

    constructor() {
        super(Model);
    }

    get(id) {
        return Model.find({ _id: id }, { "password": 0, "phoneNumber": 0 }).lean();
    }

    // //Overriding BaseService Method
    add(body) {
        let user = new Model(body);
        return user.validate()
            .then(function () {
                return Model.findOne({ email: body.email }).lean()
                    .then(resp => {
                        if (resp) {
                            return Promise.reject({ message: 'User with this email already exists' })
                        } else {
                            return Model.hashPassword(user.password)
                                .then(resp => {
                                    user.password = resp;
                                    return user.save();
                                })
                                .catch(err => console.log(err))
                        }
                    })
            })
            .catch(err => {
                return Promise.reject(err);
            })
    }

    // TO:DO Better way for this
    verifyEmail(token) {
        // token = token.replace(" ", "+");
        token = token.replace(/ /g, "+")
        let bytes = CryptoJS.AES.decrypt(token.toString(), process.env.CRYPTO_SECRET);
        let plaintext = bytes.toString(CryptoJS.enc.Utf8);
        let email = plaintext.substring(8, plaintext.length)

        return Model.findOne({ email: email })
            .then(user => {
                if (user) {
                    return VerificationModel.findOne({ userId: user._id, verificationType: constants.mailType.emailVerification }).lean()
                        .then(resp => {
                            if (resp) {
                                if (resp.updatedAt > (new Date() - 1000 * 60 * config.verification.emailExpireTime)) {
                                    return VerificationModel.deleteOne({ _id: resp._id })
                                        .then(resp => {
                                            return Model.updateOne({ email: email, verified: true }).lean()
                                                .then(resp => {
                                                    return "User verified"
                                                })
                                        })
                                } else {
                                    // generate new one here
                                    VerificationModel.deleteOne({ _id: resp._id })
                                        .then(deleted => { })
                                        .catch(err => console.log(err))
                                    return "token expired"
                                }
                            } else {
                                return "Invalid token"
                            }
                        })
                } else {
                    return "No user found";
                }
            })
    }

    addSocialAccount(path, code, accessToken) {
        let profile, source;
        if (path.includes('google')) {
            profile = getProfile(code)
            source = constants.socialType.google;
        } else if (path.includes('facebook')) {
            profile = getFacebookProfile(code, accessToken)
            source = constants.socialType.facebook;
        }
        return profile.then(resp => {
            let body;
            if (source === constants.socialType.google) {
                body = resp.data
            } else {
                body = resp;
            }
            return this.addUserSocial(body, source)
                .then(newUser => {
                    return this.get(newUser.userId)
                        .then(user => {
                            return user
                        })
                        .catch(err => console.log(err))
                })
                .catch(err => {
                    console.log(err)
                })
        })
    }

    addUserSocial(data, source) {
        return Social.find({ accountId: data.id, source: source }).lean()
            .then(resp => {
                if (resp.length === 0) {
                    return Model.find({ email: data.email }).lean()
                        .then(res => {
                            if (res.length === 0) {
                                let body = {
                                    name: data.name,
                                    email: data.email,
                                    socialAccounts: [data.id],
                                    verified: !config.verification.socialVerification
                                }
                                return new Model(body).save({ validateBeforeSave: false })
                                    .then(newUser => {
                                        return new Social({
                                            source: source,
                                            userId: newUser._id,
                                            accountId: data.id, //google/facebook id
                                        }).save()
                                    })
                            } else {
                                Model.updateOne({ _id: res[0]._id }, { $push: { socialAccounts: data.id } })
                                    .then(updated => { })
                                    .catch(err => console.log(err))
                                return new Social({
                                    source: source,
                                    userId: res[0]._id,
                                    accountId: data.id, //google/facebook id
                                }).save()
                            }
                        })
                } else {
                    return resp[0];
                }
            });
    }

}
module.exports = new UserService();